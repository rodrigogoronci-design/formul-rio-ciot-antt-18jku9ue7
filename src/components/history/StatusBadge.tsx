import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() || 'pendente'
  if (s === 'sucesso') {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
        Sucesso
      </Badge>
    )
  }
  if (s === 'erro') {
    return (
      <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200">Erro</Badge>
    )
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
      Pendente
    </Badge>
  )
}
