import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
  type QueryOptions,
} from '@tanstack/react-query'
import api from '@/lib/axios'
import type {
  Company,
  CompanyInput,
  CompaniesListResponse,
} from '../data/schema'

const COMPANIES_KEY = ['companies'] as const

type CompaniesSearch = {
  page?: number
  pageSize?: number
  leadStatus?: string[]
  priority?: string[]
  filter?: string
}

type CompaniesQueryKey = readonly [
  (typeof COMPANIES_KEY)[number],
  CompaniesSearch,
]

type CompaniesQueryResult = {
  companies: Company[]
  totalCount: number
}

function buildCompaniesParams(search: CompaniesSearch) {
  const params = new URLSearchParams()
  if (search.page) params.set('page', String(search.page))
  if (search.pageSize) params.set('limit', String(search.pageSize))
  if (search.filter) params.set('search', search.filter)
  if (search.leadStatus?.length)
    search.leadStatus.forEach((s) => params.append('leadStatus', s))
  if (search.priority?.length)
    search.priority.forEach((p) => params.append('priority', p))
  return params.toString()
}

async function fetchCompanies(
  search: CompaniesSearch
): Promise<CompaniesQueryResult> {
  const query = buildCompaniesParams(search)
  const { data } = await api.get<CompaniesListResponse>(
    `/companies${query ? `?${query}` : ''}`
  )
  return {
    companies: data.data.companies,
    totalCount: data.totalCount,
  }
}

export function companiesQueryOptions(search: CompaniesSearch): Omit<
  QueryOptions<
    CompaniesQueryResult,
    Error,
    CompaniesQueryResult,
    CompaniesQueryKey
  >,
  'queryKey'
> & {
  queryKey: CompaniesQueryKey
} {
  return queryOptions({
    queryKey: [...COMPANIES_KEY, search] as const,
    queryFn: ({ queryKey }: { queryKey: CompaniesQueryKey }) => {
      const [, params] = queryKey
      return fetchCompanies(params)
    },
  })
}

export function useCompaniesQuery(search: CompaniesSearch) {
  return useQuery(companiesQueryOptions(search))
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CompanyInput) => {
      const { data } = await api.post<{
        status: string
        data: { company: Company }
      }>('/companies', input)
      return data.data.company
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY })
    },
  })
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Partial<CompanyInput>
    }) => {
      const { data } = await api.patch<{
        status: string
        data: { company: Company }
      }>(`/companies/${id}`, input)
      return data.data.company
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY })
    },
  })
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY })
    },
  })
}

export function useBulkDeleteCompaniesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.post('/companies/bulk-delete', { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY })
    },
  })
}
