import { format } from 'date-fns'
import { StatusBadge } from './StatusBadge'
import { formatCurrency } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  data: any[]
  onView: (req: any) => void
  loading: boolean
}

export function HistoryMobileCards({ data, onView, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="flex justify-between pt-3 border-t">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((req) => (
        <div
          key={req.id}
          className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">ID: {req.id_operacao}</span>
              <span className="font-medium text-sm text-slate-800">
                {req.data_declaracao
                  ? format(new Date(req.data_declaracao), 'dd/MM/yyyy HH:mm')
                  : '-'}
              </span>
            </div>
            <StatusBadge status={req.status_requisicao} />
          </div>
          <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 mb-0.5">Valor Frete</span>
              <span className="font-semibold text-slate-900">
                {req.valor_frete ? formatCurrency(String(req.valor_frete)) : '-'}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onView(req)}>
              <Eye className="w-4 h-4 mr-2" /> Detalhes
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
