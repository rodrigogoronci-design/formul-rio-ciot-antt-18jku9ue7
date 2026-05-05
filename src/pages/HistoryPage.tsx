import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRealtime } from '@/hooks/use-realtime'
import { useDebounce } from '@/hooks/use-debounce'
import { getRequisicoesFiltered } from '@/services/ciot'
import { HistoryFiltersType, SortConfig } from '@/types/history'

import { HistoryFilters } from '@/components/history/HistoryFilters'
import { HistoryTable } from '@/components/history/HistoryTable'
import { HistoryMobileCards } from '@/components/history/HistoryMobileCards'
import { RequestDetailsModal } from '@/components/history/RequestDetailsModal'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Filter, FileX } from 'lucide-react'

const DEFAULT_FILTERS: HistoryFiltersType = {
  search: '',
  status: 'all',
  env: 'all',
  startDate: '',
  endDate: '',
}

export default function HistoryPage() {
  const isMobile = useIsMobile()
  const [localFilters, setLocalFilters] = useState<HistoryFiltersType>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<HistoryFiltersType>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortConfig>({ field: 'created', dir: 'desc' })
  const [page, setPage] = useState(1)

  const [data, setData] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedReq, setSelectedReq] = useState<any | null>(null)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  const debouncedSearch = useDebounce(localFilters.search, 300)

  // Auto-apply debounced search
  useEffect(() => {
    if (debouncedSearch !== appliedFilters.search) {
      setAppliedFilters((prev) => ({ ...prev, search: debouncedSearch }))
      setPage(1)
    }
  }, [debouncedSearch, appliedFilters.search])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const parts = []
      if (appliedFilters.search) parts.push(`id_operacao ~ "${appliedFilters.search}"`)
      if (appliedFilters.status !== 'all')
        parts.push(`status_requisicao = "${appliedFilters.status}"`)
      if (appliedFilters.env !== 'all') parts.push(`ambiente = "${appliedFilters.env}"`)
      if (appliedFilters.startDate)
        parts.push(`data_declaracao >= "${appliedFilters.startDate} 00:00:00.000Z"`)
      if (appliedFilters.endDate)
        parts.push(`data_declaracao <= "${appliedFilters.endDate} 23:59:59.999Z"`)

      const filterStr = parts.join(' && ')
      const sortStr = sort.dir === 'desc' ? `-${sort.field}` : sort.field

      const res = await getRequisicoesFiltered(page, 20, filterStr, sortStr)
      setData(res.items)
      setTotalPages(res.totalPages)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [page, appliedFilters, sort])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('requisicoes_ciot', loadData)

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters)
    setPage(1)
    setIsFilterSheetOpen(false)
  }

  const handleClearFilters = () => {
    setLocalFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
    setIsFilterSheetOpen(false)
  }

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

  const renderEmptyState = () => {
    if (loading || error || data.length > 0) return null
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-slate-300 mt-4 shadow-sm animate-fade-in-up">
        <FileX className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma requisição encontrada</h3>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
          Não encontramos operações com os filtros atuais. Ajuste sua busca ou inicie uma nova
          declaração.
        </p>
        <Button asChild>
          <Link to="/">Criar nova</Link>
        </Button>
      </div>
    )
  }

  const renderErrorState = () => {
    if (!error) return null
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-rose-50 rounded-lg border border-rose-100 mt-4 animate-fade-in-up">
        <h3 className="text-lg font-medium text-rose-900 mb-2">Erro ao carregar dados</h3>
        <p className="text-sm text-rose-700 mb-6 text-center">
          Ocorreu um problema ao buscar o histórico de operações.
        </p>
        <Button variant="outline" onClick={loadData} className="bg-white">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto pb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Histórico de Requisições
          </h1>
          <p className="text-sm text-slate-500 mt-1 hidden sm:block">
            Acompanhe e gerencie as declarações CIOT realizadas.
          </p>
        </div>

        {isMobile && (
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white">
                <Filter className="w-4 h-4 mr-2" /> Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
              <SheetHeader>
                <SheetTitle>Filtros de Busca</SheetTitle>
              </SheetHeader>
              <div className="py-4 mt-2">
                <HistoryFilters
                  localFilters={localFilters}
                  setLocalFilters={setLocalFilters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  isMobile={true}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {!isMobile && (
        <HistoryFilters
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {renderErrorState()}
      {renderEmptyState()}

      {!error && (data.length > 0 || loading) && (
        <div className="animate-fade-in">
          {isMobile ? (
            <HistoryMobileCards data={data} onView={setSelectedReq} loading={loading} />
          ) : (
            <HistoryTable
              data={data}
              sort={sort}
              onSort={handleSort}
              onView={setSelectedReq}
              loading={loading}
            />
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-slate-600 font-medium mx-4">
                      Página {page} de {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={
                        page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      <RequestDetailsModal
        request={selectedReq}
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
      />
    </div>
  )
}
