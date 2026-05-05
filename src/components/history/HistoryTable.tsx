import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from './StatusBadge'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Eye, ChevronUp, ChevronDown } from 'lucide-react'
import { SortConfig } from '@/types/history'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  data: any[]
  sort: SortConfig
  onSort: (field: string) => void
  onView: (req: any) => void
  loading: boolean
}

export function HistoryTable({ data, sort, onSort, onView, loading }: Props) {
  const renderSortIcon = (field: string) => {
    if (sort.field !== field) return null
    return sort.dir === 'asc' ? (
      <ChevronUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline w-4 h-4 ml-1" />
    )
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>ID Operação</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => onSort('data_declaracao')}
            >
              Data {renderSortIcon('data_declaracao')}
            </TableHead>
            <TableHead>Ambiente</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => onSort('status_requisicao')}
            >
              Status {renderSortIcon('status_requisicao')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => onSort('valor_frete')}
            >
              Valor Frete {renderSortIcon('valor_frete')}
            </TableHead>
            <TableHead>CIOT</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : data.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-slate-700">{req.id_operacao}</TableCell>
                  <TableCell className="text-slate-600">
                    {req.data_declaracao
                      ? format(new Date(req.data_declaracao), 'dd/MM/yyyy HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">{req.ambiente || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={req.status_requisicao} />
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium">
                    {req.valor_frete ? formatCurrency(String(req.valor_frete)) : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600">
                    {req.ciot_gerado || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(req)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
