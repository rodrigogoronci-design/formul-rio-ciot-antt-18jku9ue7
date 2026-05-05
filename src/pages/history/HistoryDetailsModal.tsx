import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, RefreshCw, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLogs, declararOperacao } from '@/services/ciot'
import { useToast } from '@/hooks/use-toast'
import { StatusBadge } from './HistoryTable'

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

export function HistoryDetailsModal({ record, open, onOpenChange }: any) {
  const [logs, setLogs] = useState<any[]>([])
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (open && record) {
      getLogs(record.id).then(setLogs).catch(console.error)
    }
  }, [open, record])

  if (!record) return null

  const handleCopy = () => {
    if (record.ciot_gerado) {
      navigator.clipboard.writeText(record.ciot_gerado)
      toast({ title: 'Copiado!', description: 'CIOT copiado para a área de transferência.' })
    }
  }

  const handleResend = async () => {
    try {
      setIsResending(true)
      const payload = {
        idOperacao: record.id_operacao,
        tipoOperacao: record.tipo_operacao?.toString(),
        contratado: record.cpf_cnpj_contratado,
        rntrcContratado: record.rntrc_contratado,
        contratante: record.cpf_cnpj_contratante,
        destinatario: record.cpf_cnpj_destinatario,
        valorFrete: record.valor_frete?.toString(),
        dataDeclaracao: record.data_declaracao?.split(' ')[0],
        dataInicio: record.data_inicio_viagem?.split(' ')[0],
        dataFim: record.data_fim_viagem?.split(' ')[0],
        ambiente: record.ambiente,
        veiculos: record.veiculos_json || [],
      }
      await declararOperacao(payload)
      toast({ title: 'Reenviado', description: 'A requisição foi reenviada com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reenviar',
        description: e.message || 'Falha na comunicação.',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50">
        <DialogHeader className="p-6 pb-4 border-b bg-white shadow-sm z-20">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl text-slate-800">
              Operação {record.id_operacao}
            </DialogTitle>
            <StatusBadge status={record.status_requisicao || 'Pendente'} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          <Tabs defaultValue="req" className="flex-1 flex flex-col h-full">
            <div className="px-6 pt-2 border-b bg-white shadow-sm z-10 sticky top-0">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
                <TabsTrigger
                  value="req"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none py-3 px-1"
                >
                  Requisição
                </TabsTrigger>
                <TabsTrigger
                  value="res"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none py-3 px-1"
                >
                  Resposta ANTT
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none py-3 px-1"
                >
                  Logs do Sistema
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <TabsContent value="req" className="m-0 space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-5 rounded-xl border shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contratado (CPF/CNPJ)
                    </p>
                    <p className="font-medium text-slate-800">
                      {record.cpf_cnpj_contratado || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      RNTRC Contratado
                    </p>
                    <p className="font-medium text-slate-800">{record.rntrc_contratado || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contratante (CPF/CNPJ)
                    </p>
                    <p className="font-medium text-slate-800">
                      {record.cpf_cnpj_contratante || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Destinatário (CPF/CNPJ)
                    </p>
                    <p className="font-medium text-slate-800">
                      {record.cpf_cnpj_destinatario || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Valor do Frete
                    </p>
                    <p className="font-bold text-emerald-600">{formatBRL(record.valor_frete)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ambiente
                    </p>
                    <p className="font-medium text-slate-800">{record.ambiente || '-'}</p>
                  </div>
                </div>

                {record.veiculos_json && record.veiculos_json.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">Veículos Declarados</h4>
                    <div className="flex flex-wrap gap-2">
                      {record.veiculos_json.map((v: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white border shadow-sm rounded-md px-3 py-2 flex items-center gap-2"
                        >
                          <span className="font-bold font-mono text-slate-800">{v.placa}</span>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                            {v.eixos} eixos
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="res" className="m-0 space-y-6 animate-fade-in-up">
                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        CIOT Gerado
                      </p>
                      <p className="font-mono text-xl font-bold text-emerald-600">
                        {record.ciot_gerado || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Protocolo
                      </p>
                      <p className="font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded w-fit">
                        {record.protocolo || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Código Verificador
                      </p>
                      <p className="font-mono text-slate-700 break-all bg-slate-50 px-3 py-2 rounded">
                        {record.codigo_verificador || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {(record.mensagem_resposta || record.erro_detalhado) && (
                    <div className="pt-5 border-t">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Mensagem da API
                      </p>
                      <div className="bg-slate-50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap text-slate-700 border border-slate-200 shadow-inner">
                        {record.mensagem_resposta}
                        {record.erro_detalhado && `\n\nDetalhe: ${record.erro_detalhado}`}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="m-0 animate-fade-in-up">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-dashed shadow-sm">
                    <Clock className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">
                      Nenhum log registrado para esta operação.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 relative">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-white p-4 rounded-xl border shadow-sm flex gap-4 transition-all hover:shadow-md"
                      >
                        <div className="mt-1 bg-slate-50 border p-2 rounded-full h-fit shrink-0">
                          <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1.5 gap-1">
                            <span className="font-bold text-sm text-slate-800">{log.tipo_log}</span>
                            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border font-medium">
                              {new Date(log.created).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{log.mensagem}</p>
                          {log.detalhes && Object.keys(log.detalhes).length > 0 && (
                            <pre className="text-xs bg-slate-900 text-slate-50 p-3 rounded-md overflow-x-auto shadow-inner">
                              {JSON.stringify(log.detalhes, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20">
          {record.status_requisicao === 'Sucesso' && record.ciot_gerado && (
            <Button
              onClick={handleCopy}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900"
            >
              <Copy className="w-4 h-4 mr-2" /> Copiar CIOT
            </Button>
          )}
          {record.status_requisicao === 'Erro' && (
            <Button
              variant="destructive"
              onClick={handleResend}
              disabled={isResending}
              className="w-full sm:w-auto shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Reenviando...' : 'Reenviar Requisição'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
