import { useFormContext, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Truck } from 'lucide-react'
import { CustomInput, CustomSelect } from './FormHelpers'
import { formatPlaca, formatCEP, formatNumberOnly } from '@/lib/formatters'

export function LogisticaTab() {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'veiculos' })

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-subtle">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg text-primary">4. Veículos</CardTitle>
            <CardDescription>Cadastre os veículos que realizarão o transporte.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ placa: '', eixos: 0 })}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Veículo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 group transition-all hover:border-slate-200"
            >
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-500 mb-1">
                <Truck className="w-5 h-5" />
              </div>
              <CustomInput
                name={`veiculos.${index}.placa`}
                label="Placa"
                placeholder="AAA-0000"
                className="flex-1"
                onChangeTransform={formatPlaca}
                maxLength={8}
              />
              <CustomInput
                name={`veiculos.${index}.eixos`}
                label="Eixos"
                type="number"
                className="w-24"
                onChangeTransform={(v) => formatNumberOnly(v, 2)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mb-1 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-subtle">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-primary">5. Origem e Destino (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                Dados de Origem
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  name="origemMunicipio"
                  label="Cód. Município"
                  placeholder="7 dígitos"
                  onChangeTransform={(v) => formatNumberOnly(v, 7)}
                />
                <CustomInput
                  name="origemCep"
                  label="CEP"
                  placeholder="00000-000"
                  onChangeTransform={formatCEP}
                  maxLength={9}
                />
                <CustomInput name="origemLat" label="Latitude" placeholder="-00.00000" />
                <CustomInput name="origemLng" label="Longitude" placeholder="-00.00000" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                Dados de Destino
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  name="destinoMunicipio"
                  label="Cód. Município"
                  placeholder="7 dígitos"
                  onChangeTransform={(v) => formatNumberOnly(v, 7)}
                />
                <CustomInput
                  name="destinoCep"
                  label="CEP"
                  placeholder="00000-000"
                  onChangeTransform={formatCEP}
                  maxLength={9}
                />
              </div>
            </div>
            <CustomInput name="distancia" label="Distância (Km)" type="number" />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-subtle h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-primary">6. Dados da Carga (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomInput
              name="cargaNatureza"
              label="Natureza da Carga"
              placeholder="Cód. 4 dígitos"
              onChangeTransform={(v) => formatNumberOnly(v, 4)}
            />
            <CustomInput name="cargaPeso" label="Peso da Carga (Kg)" type="number" />
            <CustomInput
              name="cargaTipo"
              label="Tipo da Carga"
              placeholder="Cód. 2 dígitos"
              onChangeTransform={(v) => formatNumberOnly(v, 2)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
