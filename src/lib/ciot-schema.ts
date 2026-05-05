import { z } from 'zod'

export const ciotSchema = z
  .object({
    // Section 1: Identificação
    idOperacao: z
      .string()
      .min(1, 'Obrigatório')
      .max(12, 'Máx 12 caracteres')
      .regex(/^[a-zA-Z0-9]+$/, 'Apenas alfanuméricos'),
    tipoOperacao: z.string().min(1, 'Selecione um tipo'),

    // Section 2: Partes Envolvidas
    contratado: z.string().min(14, 'CPF/CNPJ inválido'),
    rntrcContratado: z.string().length(9, 'Deve conter exatos 9 dígitos'),
    contratante: z.string().min(14, 'CPF/CNPJ inválido'),
    destinatario: z.string().min(14, 'CPF/CNPJ inválido'),

    // Section 3: Valores e Datas
    valorFrete: z.string().min(1, 'Obrigatório'),
    dataDeclaracao: z.string().min(1, 'Obrigatório'),
    dataInicio: z.string().min(1, 'Obrigatório'),
    dataFim: z.string().min(1, 'Obrigatório'),

    // Section 4: Veículos
    veiculos: z
      .array(
        z.object({
          placa: z.string().length(7, 'Placa inválida (7 caracteres)'),
          eixos: z.coerce.number().min(1, 'Mínimo 1').max(99, 'Máx 2 dígitos'),
        }),
      )
      .min(1, 'Adicione pelo menos um veículo'),

    // Section 5: Origem e Destino
    origemMunicipio: z.string().optional(),
    origemCep: z.string().optional(),
    origemLat: z.string().optional(),
    origemLng: z.string().optional(),
    destinoMunicipio: z.string().optional(),
    destinoCep: z.string().optional(),
    destinoLat: z.string().optional(),
    destinoLng: z.string().optional(),
    distancia: z.string().optional(),

    // Section 6: Carga
    cargaNatureza: z.string().optional(),
    cargaPeso: z.string().optional(),
    cargaTipo: z.string().optional(),

    // Section 7: Pagamento
    pagamentoTipo: z.string().min(1, 'Obrigatório'),
    pagamentoChavePix: z.string().optional(),
    pagamentoCpfCnpj: z.string().min(14, 'CPF/CNPJ inválido'),
    pagamentoCodigo: z.string().max(50, 'Máx 50 caracteres'),
    pagamentoIndicador: z.string().min(1, 'Obrigatório'),

    // Section 8: Indicadores
    indAltoDesempenho: z.boolean().default(false),
    indRetornoVazio: z.boolean().default(false),
    indComposicaoVeicular: z.boolean().default(false),

    // Section 9: Ambiente
    ambiente: z.enum(['Homologação', 'Produção']).default('Homologação'),
  })
  .superRefine((data, ctx) => {
    if (
      data.pagamentoTipo === 'Pix' &&
      (!data.pagamentoChavePix || data.pagamentoChavePix.trim() === '')
    ) {
      ctx.addIssue({
        path: ['pagamentoChavePix'],
        code: 'custom',
        message: 'Chave Pix é obrigatória para este tipo',
      })
    }
    if (data.dataFim && data.dataInicio && new Date(data.dataFim) < new Date(data.dataInicio)) {
      ctx.addIssue({
        path: ['dataFim'],
        code: 'custom',
        message: 'Data Fim deve ser posterior ao Início',
      })
    }
  })

export type CiotFormValues = z.infer<typeof ciotSchema>

export const defaultCiotValues: Partial<CiotFormValues> = {
  idOperacao: '',
  tipoOperacao: '',
  contratado: '',
  rntrcContratado: '',
  contratante: '',
  destinatario: '',
  valorFrete: '',
  dataDeclaracao: '',
  dataInicio: '',
  dataFim: '',
  veiculos: [{ placa: '', eixos: 0 }],
  pagamentoTipo: '',
  pagamentoCpfCnpj: '',
  pagamentoCodigo: '',
  pagamentoIndicador: '',
  ambiente: 'Homologação',
  indAltoDesempenho: false,
  indRetornoVazio: false,
  indComposicaoVeicular: false,
}
