import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { CustomInput, CustomSelect } from './FormHelpers'
import { formatCpfCnpj } from '@/lib/formatters'

export function FinanceiroTab() {
  const { control, watch } = useFormContext()
  const ambiente = watch('ambiente')
  const pagamentoTipo = watch('pagamentoTipo')

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-subtle">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-primary">7. Informações de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CustomSelect
            name="pagamentoTipo"
            label="Tipo de Pagamento"
            options={[
              { label: 'Dinheiro', value: 'Dinheiro' },
              { label: 'Transferência Bancária', value: 'Transferencia' },
              { label: 'Pix', value: 'Pix' },
              { label: 'Cheque', value: 'Cheque' },
            ]}
          />
          {pagamentoTipo === 'Pix' && (
            <CustomInput
              name="pagamentoChavePix"
              label="Chave Pix"
              placeholder="Telefone, e-mail, CPF..."
              className="animate-in fade-in zoom-in-95 duration-200"
            />
          )}
          <CustomInput
            name="pagamentoCpfCnpj"
            label="CPF/CNPJ Creditado"
            placeholder="CPF ou CNPJ"
            onChangeTransform={formatCpfCnpj}
            maxLength={18}
          />
          <CustomInput
            name="pagamentoCodigo"
            label="Cód. de Pagamento (NSU)"
            placeholder="Autenticação"
            maxLength={50}
          />
          <CustomSelect
            name="pagamentoIndicador"
            label="Indicador de Pagamento"
            options={[
              { label: '0 - Não pago', value: '0' },
              { label: '1 - Pago', value: '1' },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-subtle">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-primary">8. Indicadores Operacionais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="indAltoDesempenho"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Alto Desempenho</FormLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Classificada como alto desempenho.
                  </p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="indRetornoVazio"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Retorno Vazio</FormLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Operação com retorno vazio do veículo.
                  </p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="indComposicaoVeicular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Composição Veicular</FormLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilização de frota complexa.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card
        className={`shadow-subtle transition-colors duration-300 ${ambiente === 'Produção' ? 'border-destructive/40 bg-destructive/5' : 'border-border/50'}`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg text-primary">9. Ambiente de Envio</CardTitle>
            <CardDescription>Selecione o ambiente da ANTT para emissão.</CardDescription>
          </div>
          {ambiente === 'Produção' && (
            <Badge variant="destructive" className="animate-in fade-in zoom-in duration-300">
              <AlertTriangle className="w-3 h-3 mr-1" /> Produção Ativa
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="ambiente"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 border p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <FormControl>
                        <RadioGroupItem value="Homologação" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-1">
                        Homologação (Ambiente de Testes)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <FormControl>
                        <RadioGroupItem value="Produção" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-1 text-destructive font-medium">
                        Produção (Validade Jurídica Real)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
