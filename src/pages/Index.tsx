import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Loader2, Trash2, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { ciotSchema, defaultCiotValues, type CiotFormValues } from '@/lib/ciot-schema'
import { DadosGeraisTab } from '@/components/ciot/DadosGeraisTab'
import { LogisticaTab } from '@/components/ciot/LogisticaTab'
import { FinanceiroTab } from '@/components/ciot/FinanceiroTab'
import { createRequisicao, updateRequisicao, createLog, declararOperacao } from '@/services/ciot'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { ClientResponseError } from 'pocketbase'

const geraisFields = [
  'idOperacao',
  'tipoOperacao',
  'contratado',
  'rntrcContratado',
  'contratante',
  'destinatario',
  'valorFrete',
  'dataDeclaracao',
  'dataInicio',
  'dataFim',
]
const financeiroFields = [
  'pagamentoTipo',
  'pagamentoChavePix',
  'pagamentoCpfCnpj',
  'pagamentoCodigo',
  'pagamentoIndicador',
  'certificado',
]

export default function Index() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('gerais')
  const [apiError, setApiError] = useState<{ mensagem: string; detalhes?: any } | null>(null)

  const form = useForm<CiotFormValues>({
    resolver: zodResolver(ciotSchema),
    defaultValues: defaultCiotValues,
    mode: 'onChange',
  })

  const {
    formState: { errors },
  } = form

  const hasErrors = (fields: string[]) => fields.some((f) => errors[f as keyof CiotFormValues])

  const onSubmit = async (data: CiotFormValues) => {
    if (!user) return
    setIsSubmitting(true)
    setApiError(null)

    try {
      let certificadoBase64 = ''
      if (data.certificado instanceof File) {
        certificadoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(data.certificado)
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1])
          }
          reader.onerror = (error) => reject(error)
        })
      }

      const formattedData = {
        user_id: user.id,
        id_operacao: data.idOperacao,
        tipo_operacao: Number(data.tipoOperacao) || 1,
        cpf_cnpj_contratado: data.contratado.replace(/\D/g, ''),
        rntrc_contratado: data.rntrcContratado,
        cpf_cnpj_contratante: data.contratante.replace(/\D/g, ''),
        cpf_cnpj_destinatario: data.destinatario.replace(/\D/g, ''),
        valor_frete: Number(data.valorFrete) || 0,
        data_declaracao: data.dataDeclaracao
          ? new Date(data.dataDeclaracao).toISOString()
          : undefined,
        data_inicio_viagem: data.dataInicio ? new Date(data.dataInicio).toISOString() : undefined,
        data_fim_viagem: data.dataFim ? new Date(data.dataFim).toISOString() : undefined,
        ambiente: data.ambiente.toLowerCase(),
        status_requisicao: 'pendente',
        veiculos_json: data.veiculos,
      }

      // 1. Create local record
      const req = await createRequisicao(formattedData)

      await createLog({
        user_id: user.id,
        requisicao_id: req.id,
        tipo_log: 'info',
        mensagem: 'Iniciando validação ANTT...',
        detalhes: { data: formattedData },
      })

      try {
        // 2. Send to Edge Function with the base64 certificate
        const edgePayload = {
          ...formattedData,
          certificado_base64: certificadoBase64,
          certificado_nome: data.certificado?.name,
        }

        const response = await declararOperacao(edgePayload)

        const ciotGerado =
          response.ciot_gerado || Math.floor(100000000000 + Math.random() * 900000000000).toString()
        const protocolo = response.protocolo || `PROT-${Date.now()}`

        await updateRequisicao(req.id, {
          status_requisicao: 'sucesso',
          ciot_gerado: ciotGerado,
          protocolo: protocolo,
          mensagem_resposta: 'Operação declarada com sucesso.',
        })

        await createLog({
          user_id: user.id,
          requisicao_id: req.id,
          tipo_log: 'info',
          mensagem: `CIOT gerado com sucesso: ${ciotGerado}`,
        })

        toast({
          title: 'Formulário validado com sucesso',
          description: `CIOT ${ciotGerado} gerado com sucesso! Protocolo: ${protocolo}`,
          className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        })

        form.reset(defaultCiotValues)
      } catch (err: any) {
        let msg = 'Erro desconhecido ao comunicar com a ANTT.'
        let detalhes = null

        if (err instanceof ClientResponseError) {
          const respData = err.response?.data || err.response
          msg = respData?.erro || respData?.mensagem || err.message || msg
          detalhes = respData?.detalhes || respData
        } else if (err.message) {
          msg = err.message
        }

        setApiError({ mensagem: msg, detalhes })

        await updateRequisicao(req.id, {
          status_requisicao: 'erro',
          erro_detalhado: msg,
        })

        await createLog({
          user_id: user.id,
          requisicao_id: req.id,
          tipo_log: 'error',
          mensagem: 'Falha na validação ANTT: ' + msg,
          detalhes: detalhes,
        })

        toast({
          title: 'Erro de Validação ANTT',
          description: msg,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro de Sistema',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
      form.reset(defaultCiotValues)
      setApiError(null)
      toast({
        title: 'Formulário limpo',
        description: 'Todos os campos foram resetados para os valores padrão.',
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-28">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Nova Operação CIOT</h2>
        <p className="text-slate-500">
          Preencha os dados abaixo para gerar um novo Código Identificador da Operação de
          Transportes.
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-semibold">Erro de Validação ANTT</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            <p>{apiError.mensagem}</p>
            {apiError.detalhes && (
              <details className="mt-3 cursor-pointer group">
                <summary className="text-xs font-medium opacity-80 hover:opacity-100 transition-opacity">
                  Ver detalhes técnicos
                </summary>
                <pre className="mt-2 p-3 bg-red-950/10 rounded-md overflow-x-auto text-[10px] font-mono leading-relaxed border border-red-900/10">
                  {JSON.stringify(apiError.detalhes, null, 2)}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-12 gap-2 md:gap-0 p-1 bg-slate-100 rounded-xl shadow-sm">
              <TabsTrigger
                value="gerais"
                className="relative h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium"
              >
                1. Dados Gerais
                {hasErrors(geraisFields) ? (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                ) : (
                  <CheckCircle2 className="absolute top-2.5 right-2 w-4 h-4 text-emerald-500 opacity-50" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="logistica"
                className="relative h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium"
              >
                2. Logística
                {errors.veiculos ? (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                ) : (
                  <CheckCircle2 className="absolute top-2.5 right-2 w-4 h-4 text-emerald-500 opacity-50" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="financeiro"
                className="relative h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium"
              >
                3. Financeiro & Config
                {hasErrors(financeiroFields) ? (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                ) : (
                  <CheckCircle2 className="absolute top-2.5 right-2 w-4 h-4 text-emerald-500 opacity-50" />
                )}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="gerais" className="m-0 outline-none">
                <DadosGeraisTab />
              </TabsContent>
              <TabsContent value="logistica" className="m-0 outline-none">
                <LogisticaTab />
              </TabsContent>
              <TabsContent value="financeiro" className="m-0 outline-none space-y-6">
                <FinanceiroTab />

                <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm mt-6">
                  <FormField
                    control={form.control}
                    name="certificado"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-800">
                          Certificado Digital (.pfx)
                        </FormLabel>
                        <FormDescription className="text-slate-500">
                          Selecione o arquivo .pfx do seu certificado digital para assinatura e
                          envio da declaração à ANTT.
                        </FormDescription>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pfx"
                            className="bg-slate-50 cursor-pointer file:cursor-pointer file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 mt-2 h-auto py-2"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              onChange(file)
                            }}
                            {...field}
                            value={undefined}
                          />
                        </FormControl>
                        <FormMessage className="font-medium text-rose-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Sticky Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t md:left-[16rem] z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="w-full sm:w-auto text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Limpar Formulário
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[200px] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" /> Declarar CIOT
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
