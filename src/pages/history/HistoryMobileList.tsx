import { StatusBadge } from './HistoryTable'
import { Info } from 'lucide-react'

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '-'

export function HistoryMobileList({ data, onRowClick }: any) {
  return (
    <div className="flex flex-col divide-y divide-slate-100">
      {data.map((row: any) => (
        <div
          key={row.id}
          className="p-4 flex flex-col gap-2 hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100"
          onClick={() => onRowClick(row)}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-lg">{row.id_operacao}</span>
            <StatusBadge status={row.status_requisicao || 'Pendente'} />
          </div>
          <div className="flex justify-between items-center text-sm text-slate-500 mt-1">
            <span>
              {formatDate(row.created)} &bull; {row.ambiente}
            </span>
            <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
              {formatBRL(row.valor_frete)}
            </span>
          </div>
          {row.ciot_gerado && (
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs bg-emerald-50 border border-emerald-100 p-1.5 rounded font-mono text-emerald-700 inline-block w-fit">
                CIOT: {row.ciot_gerado}
              </div>
              <Info className="w-4 h-4 text-slate-300" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
