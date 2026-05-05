import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto h-[60vh] flex flex-col items-center justify-center animate-fade-in-up">
      <div className="bg-slate-100 p-6 rounded-full mb-6 shadow-sm">
        <Settings className="w-12 h-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-slate-800">Configurações do Sistema</h2>
      <p className="text-slate-500 text-center max-w-md">
        A página de configurações da integração com a ANTT e parametrização do ambiente estará
        disponível na próxima atualização.
      </p>
    </div>
  )
}
