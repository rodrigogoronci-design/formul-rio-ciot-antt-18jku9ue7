import { useState, useEffect } from 'react'
import { Download, FilterX, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { buildPbFilter, buildDateFilter, exportToCSV, Period, DateRange } from '@/lib/reports'
import { ReportsStats } from '@/components/reports/ReportsStats'
import { ReportsCharts } from '@/components/reports/ReportsCharts'
import { ReportsErrorsTable } from '@/components/reports/ReportsErrorsTable'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [envs, setEnvs] = useState<string[]>(['Produção', 'Homologação'])
  const [statuses, setStatuses] = useState<string[]>(['sucesso', 'erro', 'pendente'])
  const [appliedFilters, setAppliedFilters] = useState({
    period: '30d' as Period,
    dateRange: undefined as DateRange | undefined,
    envs: ['Produção', 'Homologação'],
    statuses: ['sucesso', 'erro', 'pendente'],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]

  const handleClearFilters = () => {
    setPeriod('30d')
    setDateRange(undefined)
    setEnvs(['Produção', 'Homologação'])
    setStatuses(['sucesso', 'erro', 'pendente'])
    setAppliedFilters({
      period: '30d',
      dateRange: undefined,
      envs: ['Produção', 'Homologação'],
      statuses: ['sucesso', 'erro', 'pendente'],
    })
  }

  const fetchData = async () => {
    setLoading(true)
    setError(false)
    try {
      const filterStr = buildPbFilter(
        appliedFilters.period,
        appliedFilters.dateRange,
        appliedFilters.envs,
        appliedFilters.statuses,
      )
      const reqsPromise = pb
        .collection('requisicoes_ciot')
        .getFullList({ filter: filterStr, sort: '-created' })
      const dateFilter = buildDateFilter(appliedFilters.period, appliedFilters.dateRange)
      const logFilter = dateFilter ? `(${dateFilter}) && tipo_log ~ 'erro'` : `tipo_log ~ 'erro'`
      const logsPromise = pb
        .collection('logs_requisicoes')
        .getFullList({ filter: logFilter, sort: '-created' })
      const [records, logRecords] = await Promise.all([reqsPromise, logsPromise])
      setData(records)
      setLogs(logRecords)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [appliedFilters])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Relatórios e Validação</h1>
        <Button
          variant="outline"
          onClick={() => exportToCSV(data)}
          disabled={loading || data.length === 0}
        >
          <Download className="mr-2 h-4 w-4" /> Exportar (CSV)
        </Button>
      </div>

      <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4">
        <div className="flex flex-wrap items-end gap-5">
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {period === 'custom' && (
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    {dateRange?.from
                      ? dateRange.to
                        ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                        : format(dateRange.from, 'dd/MM/yyyy')
                      : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange as any}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          <div className="space-y-2">
            <Label>Ambiente</Label>
            <div className="flex space-x-4 h-9 items-center">
              {['Produção', 'Homologação'].map((e) => (
                <div key={e} className="flex items-center space-x-2">
                  <Checkbox
                    id={`e-${e}`}
                    checked={envs.includes(e)}
                    onCheckedChange={() => setEnvs((p) => toggleArrayItem(p, e))}
                  />
                  <Label htmlFor={`e-${e}`} className="font-normal cursor-pointer">
                    {e}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex space-x-4 h-9 items-center">
              {['sucesso', 'erro', 'pendente'].map((s) => (
                <div key={s} className="flex items-center space-x-2">
                  <Checkbox
                    id={`s-${s}`}
                    checked={statuses.includes(s)}
                    onCheckedChange={() => setStatuses((p) => toggleArrayItem(p, s))}
                  />
                  <Label htmlFor={`s-${s}`} className="font-normal cursor-pointer capitalize">
                    {s}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 ml-auto w-full md:w-auto">
            <Button
              variant="secondary"
              onClick={handleClearFilters}
              className="flex-1 md:flex-none"
            >
              <FilterX className="w-4 h-4 mr-2" /> Limpar
            </Button>
            <Button
              onClick={() => setAppliedFilters({ period, dateRange, envs, statuses })}
              className="flex-1 md:flex-none"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[400px]" />
        </div>
      )}
      {!loading && error && (
        <div className="text-center py-12 text-rose-500 bg-rose-50 rounded-lg border border-rose-100">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>Erro ao carregar dados</p>
          <Button variant="outline" className="mt-4" onClick={fetchData}>
            Tentar novamente
          </Button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border">
          <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>Nenhum dado disponível para o período selecionado</p>
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="space-y-6">
          <ReportsStats data={data} />
          <ReportsCharts data={data} />
          <ReportsErrorsTable data={data} logs={logs} />
        </div>
      )}
    </div>
  )
}
