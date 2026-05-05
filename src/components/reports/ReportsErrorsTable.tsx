import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ReportsErrorsTable({ data, logs }: { data: any[]; logs: any[] }) {
  const errorData = useMemo(() => {
    const map: Record<string, number> = {}
    let total = 0

    const errors = data.filter((d) => d.status_requisicao?.toLowerCase() === 'erro')
    errors.forEach((curr) => {
      const msg = curr.erro_detalhado || curr.mensagem_resposta || 'Erro na requisição'
      if (!map[msg]) map[msg] = 0
      map[msg]++
      total++
    })

    logs.forEach((curr) => {
      const msg = curr.mensagem || 'Erro de sistema'
      if (!map[msg]) map[msg] = 0
      map[msg]++
      total++
    })

    return Object.entries(map)
      .map(([mensagem, quantidade]) => ({
        mensagem,
        quantidade,
        percentual: total > 0 ? ((quantidade / total) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
  }, [data, logs])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Erros Mais Frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        {errorData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Nenhum erro registrado no período.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Erro</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Percentual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorData.map((err, idx) => (
                  <TableRow key={idx}>
                    <TableCell
                      className="font-medium max-w-[300px] lg:max-w-[500px] truncate"
                      title={err.mensagem}
                    >
                      {err.mensagem}
                    </TableCell>
                    <TableCell className="text-right">{err.quantidade}</TableCell>
                    <TableCell className="text-right">{err.percentual}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
