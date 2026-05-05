import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getOpTypeLabel } from '@/lib/reports'

export function ReportsCharts({ data }: { data: any[] }) {
  const lineData = useMemo(() => {
    const grouped = data.reduce(
      (acc, curr) => {
        const date = curr.created ? format(parseISO(curr.created), 'dd/MM') : 'N/A'
        if (!acc[date]) acc[date] = { date, Sucesso: 0, Erro: 0, Pendente: 0 }
        const status = curr.status_requisicao?.toLowerCase() || 'pendente'
        if (status === 'sucesso') acc[date].Sucesso++
        else if (status === 'erro') acc[date].Erro++
        else acc[date].Pendente++
        return acc
      },
      {} as Record<string, any>,
    )
    return Object.values(grouped).reverse()
  }, [data])

  const pieData = useMemo(() => {
    const grouped = data.reduce(
      (acc, curr) => {
        let env = curr.ambiente?.toLowerCase() || 'outro'
        if (env.includes('homolog')) env = 'Homologação'
        if (env.includes('prod')) env = 'Produção'
        if (!acc[env]) acc[env] = 0
        acc[env]++
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [data])

  const barData = useMemo(() => {
    const grouped = data.reduce(
      (acc, curr) => {
        const op = getOpTypeLabel(curr.tipo_operacao)
        if (!acc[op]) acc[op] = 0
        acc[op]++
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [data])

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Requisições por Dia</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{
              Sucesso: { color: 'hsl(var(--chart-2, 142.1 76.2% 36.3%))' },
              Erro: { color: 'hsl(var(--chart-1, 0 84.2% 60.2%))' },
              Pendente: { color: 'hsl(var(--chart-4, 43 74% 49%))' },
            }}
            className="h-full w-full"
          >
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="Sucesso"
                stroke="var(--color-Sucesso)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Erro"
                stroke="var(--color-Erro)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Pendente"
                stroke="var(--color-Pendente)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Distribuição por Ambiente</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Produção'
                        ? 'hsl(var(--chart-2, 142.1 76.2% 36.3%))'
                        : 'hsl(var(--chart-1, 221.2 83.2% 53.3%))'
                    }
                  />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Top 5 Tipos de Operação</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{ value: { color: 'hsl(var(--chart-1, 221.2 83.2% 53.3%))' } }}
            className="h-full w-full"
          >
            <BarChart data={barData} margin={{ bottom: 20, left: -20, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
