import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, ArrowUp, ArrowUpDown, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '-'

export function StatusBadge({ status }: { status: string }) {
  if (status === 'Sucesso')
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm">Sucesso</Badge>
    )
  if (status === 'Erro')
    return (
      <Badge variant="destructive" className="shadow-sm">
        Erro
      </Badge>
    )
  return (
    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
      Pendente
    </Badge>
  )
}

export function HistoryTable({ data, sort, setSort, onRowClick }: any) {
  const toggleSort = (field: string) => {
    if (sort === field) setSort(`-${field}`)
    else if (sort === `-${field}`) setSort(field)
    else setSort(`-${field}`)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sort === field) return <ArrowUp className="w-3 h-3 ml-1 inline text-emerald-600" />
    if (sort === `-${field}`) return <ArrowDown className="w-3 h-3 ml-1 inline text-emerald-600" />
    return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-40 hover:opacity-100" />
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50/80">
        <TableRow>
          <TableHead>ID Operação</TableHead>
          <TableHead
            className="cursor-pointer hover:bg-slate-100/50 transition-colors"
            onClick={() => toggleSort('created')}
          >
            Data <SortIcon field="created" />
          </TableHead>
          <TableHead>Ambiente</TableHead>
          <TableHead
            className="cursor-pointer hover:bg-slate-100/50 transition-colors"
            onClick={() => toggleSort('status_requisicao')}
          >
            Status <SortIcon field="status_requisicao" />
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-slate-100/50 transition-colors text-right"
            onClick={() => toggleSort('valor_frete')}
          >
            Valor Frete <SortIcon field="valor_frete" />
          </TableHead>
          <TableHead>CIOT</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any) => (
          <TableRow
            key={row.id}
            className="cursor-pointer hover:bg-slate-50 transition-colors group"
            onClick={() => onRowClick(row)}
          >
            <TableCell className="font-medium text-slate-800">{row.id_operacao}</TableCell>
            <TableCell className="text-slate-600">{formatDate(row.created)}</TableCell>
            <TableCell className="text-slate-600">{row.ambiente}</TableCell>
            <TableCell>
              <StatusBadge status={row.status_requisicao || 'Pendente'} />
            </TableCell>
            <TableCell className="text-right font-medium text-slate-700">
              {formatBRL(row.valor_frete)}
            </TableCell>
            <TableCell className="font-mono text-xs text-slate-500">
              {row.ciot_gerado || '-'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Info className="w-4 h-4 text-emerald-600" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
