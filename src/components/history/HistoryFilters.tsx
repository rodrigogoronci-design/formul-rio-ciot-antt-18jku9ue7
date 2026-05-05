import { HistoryFiltersType } from '@/types/history'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  localFilters: HistoryFiltersType
  setLocalFilters: React.Dispatch<React.SetStateAction<HistoryFiltersType>>
  onApply: () => void
  onClear: () => void
  isMobile?: boolean
}

export function HistoryFilters({
  localFilters,
  setLocalFilters,
  onApply,
  onClear,
  isMobile,
}: Props) {
  return (
    <div
      className={cn(
        'grid gap-4 items-end',
        isMobile
          ? 'grid-cols-1'
          : 'grid-cols-1 md:grid-cols-6 mb-4 p-4 bg-white rounded-lg border shadow-sm',
      )}
    >
      <div className={cn(!isMobile && 'md:col-span-2')}>
        <Label className="text-xs text-slate-500 mb-1 block">ID Operação</Label>
        <Input
          placeholder="Buscar ID..."
          value={localFilters.search}
          onChange={(e) => setLocalFilters((f) => ({ ...f, search: e.target.value }))}
        />
      </div>
      <div>
        <Label className="text-xs text-slate-500 mb-1 block">Status</Label>
        <Select
          value={localFilters.status}
          onValueChange={(v) => setLocalFilters((f) => ({ ...f, status: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="sucesso">Sucesso</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-slate-500 mb-1 block">Ambiente</Label>
        <Select
          value={localFilters.env}
          onValueChange={(v) => setLocalFilters((f) => ({ ...f, env: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Homologação">Homologação</SelectItem>
            <SelectItem value="Produção">Produção</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-slate-500 mb-1 block">Data Inicial</Label>
        <Input
          type="date"
          value={localFilters.startDate}
          onChange={(e) => setLocalFilters((f) => ({ ...f, startDate: e.target.value }))}
        />
      </div>
      <div>
        <Label className="text-xs text-slate-500 mb-1 block">Data Final</Label>
        <Input
          type="date"
          value={localFilters.endDate}
          onChange={(e) => setLocalFilters((f) => ({ ...f, endDate: e.target.value }))}
        />
      </div>
      <div className={cn('flex justify-end gap-2', !isMobile && 'md:col-span-6 mt-2')}>
        <Button variant="outline" onClick={onClear} className="w-full sm:w-auto">
          Limpar Filtros
        </Button>
        <Button onClick={onApply} className="w-full sm:w-auto">
          Filtrar
        </Button>
      </div>
    </div>
  )
}
