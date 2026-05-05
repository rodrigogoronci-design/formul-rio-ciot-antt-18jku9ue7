import { Construction } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto h-[60vh] flex flex-col items-center justify-center animate-fade-in-up">
      <div className="bg-slate-100 p-6 rounded-full mb-6 shadow-sm">
        <Construction className="w-12 h-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-slate-800">Em Desenvolvimento</h2>
      <p className="text-slate-500 text-center max-w-md">
        A funcionalidade de histórico de operações está sendo construída e estará disponível em
        breve para consulta.
      </p>
    </div>
  )
}
