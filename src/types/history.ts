export interface HistoryFiltersType {
  search: string
  status: string
  env: string
  startDate: string
  endDate: string
}

export interface SortConfig {
  field: string
  dir: 'asc' | 'desc'
}
