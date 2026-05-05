import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { getLogsRequisicao, declararOperacao } from '@/services/ciot'
import { Button } from '@/components/ui/button'
import { Copy, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/formatters'
import { StatusBadge } from './StatusBadge'

interface Props {
  request: any
  isOpen: boolean
  onClose: () => void
}

export function RequestDetailsModal({ request, isOpen, onClose }: Props) {
  const { toast } = useToast()
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (isOpen && request?.id) {
      setLoadingLogs(true)
      getLogsRequisicao(request.id)
        .then(setLogs)
        .catch(() => toast({ variant: 'destructive', description: 'Erro ao carregar logs.' }))
        .finally(() => setLoadingLogs(false))
    }
  }, [isOpen, request?.id, toast])

  const handleCopy = () => {
    if (request?.ciot_gerado) {
      navigator.clipboard.writeText(request.ciot_gerado)
      toast({ description: 'CIOT copiado para a área de transferência.' })
    }
  }

  const handleReenviar = async () => {
    setIsRetrying(true)
    try {
      const payload = {
        idOperacao: request.id_operacao,
        tipoOperacao: String(request.tipo_operacao),
        contratado: request.cpf_cnpj_contratado,
        rntrcContratado: request.rntrc_contratado,
        contratante: request.cpf_cnpj_contratante,
        destinatario: request.cpf_cnpj_destinatario,
        valorFrete: String(request.valor_frete),
        dataDeclaracao: request.data_declaracao?.split(' ')[0],
        ambiente: request.ambiente,
        veiculos: request.veiculos_json || [],
      }
      await declararOperacao(payload)
      toast({ description: 'Requisição reenviada com sucesso.' })
      onClose()
    } catch (e) {
      toast({ variant: 'destructive', description: 'Falha ao reenviar requisição.' })
    } finally {
      setIsRetrying(false)
    }
  }

  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes da Operação #{request.id_operacao}
            <StatusBadge status={request.status_requisicao} />
          </DialogTitle>
          <DialogDescription>
            Ambiente: {request.ambiente} | Data:{' '}
            {request.data_declaracao
              ? format(new Date(request.data_declaracao), 'dd/MM/yyyy HH:mm')
              : '-'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="req" className="flex-1 overflow-hidden flex flex-col mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="req">Requisição</TabsTrigger>
            <TabsTrigger value="res">Resposta</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4 border rounded-md p-4 bg-slate-50/50">
            <TabsContent value="req" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Tipo de Operação</span>
                  <span className="font-medium">{request.tipo_operacao}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Valor Frete</span>
                  <span className="font-medium">
                    {request.valor_frete ? formatCurrency(String(request.valor_frete)) : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contratado (CPF/CNPJ)</span>
                  <span className="font-medium">{request.cpf_cnpj_contratado || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RNTRC</span>
                  <span className="font-medium">{request.rntrc_contratado || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contratante</span>
                  <span className="font-medium">{request.cpf_cnpj_contratante || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Destinatário</span>
                  <span className="font-medium">{request.cpf_cnpj_destinatario || '-'}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="res" className="m-0 space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-white border rounded-md shadow-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">CIOT Gerado</span>
                    <span className="font-mono text-lg font-semibold">
                      {request.ciot_gerado || '-'}
                    </span>
                  </div>
                  {request.status_requisicao === 'sucesso' && (
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" /> Copiar
                    </Button>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Protocolo</span>
                  <span className="font-mono">{request.protocolo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Código Verificador</span>
                  <span className="font-mono">{request.codigo_verificador || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Mensagem</span>
                  <span className="font-medium text-slate-700">
                    {request.mensagem_resposta || '-'}
                  </span>
                </div>
                {request.erro_detalhado && (
                  <div>
                    <span className="text-slate-500 block text-xs">Erro Detalhado</span>
                    <p className="font-mono text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 mt-1">
                      {request.erro_detalhado}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="m-0 h-full">
              <ScrollArea className="h-[300px] w-full pr-4">
                {loadingLogs ? (
                  <div className="text-sm text-slate-500 text-center py-8">Carregando logs...</div>
                ) : logs.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8">
                    Nenhum log encontrado.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="text-sm border-l-2 border-slate-300 pl-3 py-1">
                        <span className="text-xs text-slate-400 block">
                          {format(new Date(log.created), 'dd/MM/yyyy HH:mm:ss')}
                        </span>
                        <span className="font-medium text-slate-700">{log.tipo_log}</span>
                        <p className="text-slate-600 mt-1">{log.mensagem}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {request.status_requisicao === 'erro' && (
            <Button onClick={handleReenviar} disabled={isRetrying}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Reenviando...' : 'Reenviar'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
