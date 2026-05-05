import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, Send, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { ciotSchema, defaultCiotValues, type CiotFormValues } from '@/lib/ciot-schema'
import { DadosGeraisTab } from '@/components/ciot/DadosGeraisTab'
import { LogisticaTab } from '@/components/ciot/LogisticaTab'
import { FinanceiroTab } from '@/components/ciot/FinanceiroTab'
import { createRequisicao, updateRequisicao, createLog } from '@/services/ciot'
import { getErrorMessage } from '@/lib/pocketbase/errors'

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
]

export default function Index() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('gerais')

  const form = useForm<CiotFormValues>({
    resolver: zodResolver(ciotSchema),
    defaultValues: defaultCiotValues,
    mode: 'onChange',
  })

  const {
    formState: { errors, isValid },
  } = form

  const hasErrors = (fields: string[]) => fields.some((f) => errors[f as keyof CiotFormValues])

  const onSubmit = async (data: CiotFormValues) => {
    if (!user) return
    setIsSubmitting(true)

    try {
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

      const req = await createRequisicao(formattedData)

      await createLog({
        user_id: user.id,
        requisicao_id: req.id,
        tipo_log: 'info',
        mensagem: 'Iniciando validação ANTT...',
        detalhes: { data: formattedData },
      })

      // Simula tempo de resposta da API ANTT
      await new Promise((r) => setTimeout(r, 1500))

      if (data.ambiente === 'Produção' && data.idOperacao === 'ERRO') {
        await updateRequisicao(req.id, {
          status_requisicao: 'erro',
          erro_detalhado: 'ID da Operação rejeitado pela ANTT.',
        })
        await createLog({
          user_id: user.id,
          requisicao_id: req.id,
          tipo_log: 'error',
          mensagem: 'Falha na validação ANTT.',
        })

        toast({
          title: 'Erro de Validação ANTT',
          description: 'O ID da Operação foi rejeitado pelo servidor da ANTT.',
          variant: 'destructive',
        })
        return
      }

      const ciotGerado = Math.floor(100000000000 + Math.random() * 900000000000).toString()
      await updateRequisicao(req.id, {
        status_requisicao: 'sucesso',
        ciot_gerado: ciotGerado,
        protocolo: `PROT-${Date.now()}`,
      })
      await createLog({
        user_id: user.id,
        requisicao_id: req.id,
        tipo_log: 'info',
        mensagem: `CIOT gerado com sucesso: ${ciotGerado}`,
      })

      toast({
        title: 'Formulário validado com sucesso',
        description: `CIOT ${ciotGerado} gerado em ambiente de ${data.ambiente}.`,
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      })

      form.reset(defaultCiotValues)
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
              <TabsContent value="financeiro" className="m-0 outline-none">
                <FinanceiroTab />
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
                disabled={!isValid || isSubmitting}
                className="w-full sm:w-auto min-w-[200px] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" /> Enviar para ANTT
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
