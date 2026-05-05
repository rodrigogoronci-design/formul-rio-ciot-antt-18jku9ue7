import { format, subDays, startOfMonth, parseISO, isValid } from 'date-fns'

export type Period = '7d' | '30d' | 'month' | 'custom'
export type DateRange = { from?: Date; to?: Date }

export const getOpTypeLabel = (type: number | string) => {
  const map: Record<string, string> = {
    '1': 'TAC-Agregado',
    '2': 'TAC-Independente',
    '3': 'ETC',
    '4': 'CTC',
  }
  return map[String(type)] || `Tipo ${type}`
}

export const buildDateFilter = (period: Period, dateRange: DateRange | undefined) => {
  const conditions: string[] = []
  let start: Date | null = null
  let end: Date = new Date()

  if (period === '7d') start = subDays(end, 7)
  else if (period === '30d') start = subDays(end, 30)
  else if (period === 'month') start = startOfMonth(end)
  else if (period === 'custom' && dateRange?.from) {
    start = dateRange.from
    if (dateRange.to) end = dateRange.to
  }

  if (start) {
    conditions.push(`created >= '${format(start, 'yyyy-MM-dd')} 00:00:00'`)
    conditions.push(`created <= '${format(end, 'yyyy-MM-dd')} 23:59:59'`)
  }
  return conditions.join(' && ')
}

export const buildPbFilter = (
  period: Period,
  dateRange: DateRange | undefined,
  envs: string[],
  statuses: string[],
) => {
  const conditions = []
  const dateFilter = buildDateFilter(period, dateRange)
  if (dateFilter) conditions.push(dateFilter)

  if (envs.length > 0) {
    const envStr = envs
      .map((e) => `ambiente ~ '${e === 'Produção' ? 'produ' : 'homolog'}'`)
      .join(' || ')
    conditions.push(`(${envStr})`)
  }

  if (statuses.length > 0) {
    const statusStr = statuses.map((s) => `status_requisicao ~ '${s}'`).join(' || ')
    conditions.push(`(${statusStr})`)
  }

  return conditions.join(' && ')
}

export const exportToCSV = (data: any[]) => {
  const headers = [
    'Data',
    'ID Operação',
    'Tipo Operação',
    'Ambiente',
    'Status',
    'Valor Frete',
    'CIOT',
    'Protocolo',
    'Mensagem',
  ]
  const rows = data.map((r) => {
    const date = isValid(parseISO(r.created))
      ? format(parseISO(r.created), 'dd/MM/yyyy HH:mm')
      : r.created
    return [
      date,
      r.id_operacao,
      getOpTypeLabel(r.tipo_operacao),
      r.ambiente,
      r.status_requisicao,
      r.valor_frete || 0,
      r.ciot_gerado,
      r.protocolo,
      (r.erro_detalhado || r.mensagem_resposta || '').replace(/;/g, ',').replace(/\n/g, ' '),
    ]
      .map((col) => `"${col}"`)
      .join(';')
  })

  const csvContent = [headers.join(';'), ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `relatorio_ciot_${format(new Date(), 'yyyyMMdd')}.csv`
  link.click()
}
