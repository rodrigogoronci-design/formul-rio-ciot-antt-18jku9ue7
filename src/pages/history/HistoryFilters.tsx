import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FilterX } from 'lucide-react'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { useEffect } from 'react'

const filterSchema = z
  .object({
    search: z.string().optional(),
    status: z.string().optional(),
    ambiente: z.string().optional(),
    dataInicio: z.string().optional(),
    dataFim: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.dataInicio && data.dataFim && data.dataInicio !== '' && data.dataFim !== '') {
        return new Date(data.dataFim) >= new Date(data.dataInicio)
      }
      return true
    },
    { message: 'Deve ser posterior', path: ['dataFim'] },
  )

type FilterValues = z.infer<typeof filterSchema>

export function HistoryFilters({
  onFilter,
  onClear,
  initialValues,
}: {
  onFilter: (values: FilterValues) => void
  onClear: () => void
  initialValues: any
}) {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialValues,
  })

  const searchValue = form.watch('search')

  useEffect(() => {
    const t = setTimeout(() => {
      form.handleSubmit(onFilter)()
    }, 300)
    return () => clearTimeout(t)
  }, [searchValue])

  const handleClear = () => {
    form.reset({ search: '', status: 'Todos', ambiente: 'Todos', dataInicio: '', dataFim: '' })
    onClear()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFilter)}
        className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full"
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex-1 w-full space-y-1">
              <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                Busca (ID Operação)
              </FormLabel>
              <FormControl>
                <Input placeholder="Buscar..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="w-full md:w-36 space-y-1">
              <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                Status
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Sucesso">Sucesso</SelectItem>
                  <SelectItem value="Erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ambiente"
          render={({ field }) => (
            <FormItem className="w-full md:w-40 space-y-1">
              <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                Ambiente
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Homologação">Homologação</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataInicio"
          render={({ field }) => (
            <FormItem className="w-full md:w-36 space-y-1">
              <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                Data Inicial
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataFim"
          render={({ field }) => (
            <FormItem className="w-full md:w-36 space-y-1">
              <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                Data Final
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
          <Button
            type="submit"
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Filtrar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            title="Limpar Filtros"
          >
            <FilterX className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
