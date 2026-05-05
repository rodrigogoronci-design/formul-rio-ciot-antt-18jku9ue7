import { CustomInput, CustomSelect } from './FormHelpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCpfCnpj, formatCurrency, formatNumberOnly } from '@/lib/formatters'

export function DadosGeraisTab() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-subtle">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-primary">1. Identificação da Operação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CustomInput
            name="idOperacao"
            label="ID da Operação"
            maxLength={12}
            placeholder="Ex: OPR123456789"
          />
          <CustomSelect
            name="tipoOperacao"
            label="Tipo de Operação"
            options={[
              { label: '1 - Carga Lotação', value: '1' },
              { label: '2 - Carga Fracionada', value: '2' },
              { label: '3 - TAC-Agregado', value: '3' },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-subtle">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-primary">2. Partes Envolvidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CustomInput
            name="contratado"
            label="Contratado (Transportador)"
            placeholder="CPF ou CNPJ"
            onChangeTransform={formatCpfCnpj}
            maxLength={18}
          />
          <CustomInput
            name="rntrcContratado"
            label="RNTRC Contratado"
            placeholder="9 dígitos"
            onChangeTransform={(v) => formatNumberOnly(v, 9)}
          />
          <CustomInput
            name="contratante"
            label="Contratante (Embarcador)"
            placeholder="CPF ou CNPJ"
            onChangeTransform={formatCpfCnpj}
            maxLength={18}
          />
          <CustomInput
            name="destinatario"
            label="Destinatário (Recebedor)"
            placeholder="CPF ou CNPJ"
            onChangeTransform={formatCpfCnpj}
            maxLength={18}
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-subtle">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-primary">3. Valores e Datas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <CustomInput
            name="valorFrete"
            label="Valor do Frete"
            placeholder="R$ 0,00"
            onChangeTransform={formatCurrency}
          />
          <CustomInput name="dataDeclaracao" label="Data da Declaração" type="datetime-local" />
          <CustomInput name="dataInicio" label="Data Início Viagem" type="date" />
          <CustomInput name="dataFim" label="Data Fim Viagem" type="date" />
        </CardContent>
      </Card>
    </div>
  )
}
