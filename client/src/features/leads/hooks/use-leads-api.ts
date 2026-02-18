import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
  type QueryOptions,
} from '@tanstack/react-query'
import api from '@/lib/axios'
import type {
  Lead,
  LeadInput,
  LeadsListResponse,
  DesignConfiguration,
} from '../data/schema'

const LEADS_KEY = ['leads'] as const

type LeadsSearch = {
  page?: number
  pageSize?: number
  priority?: string[]
  filter?: string
}

type LeadsQueryKey = readonly [(typeof LEADS_KEY)[number], LeadsSearch]

type LeadsQueryResult = {
  leads: Lead[]
  totalCount: number
}

function buildLeadsParams(search: LeadsSearch) {
  const params = new URLSearchParams()
  if (search.page) params.set('page', String(search.page))
  if (search.pageSize) params.set('limit', String(search.pageSize))
  if (search.filter) params.set('search', search.filter)
  if (search.priority?.length)
    search.priority.forEach((p) => params.append('priority', p))
  return params.toString()
}

async function fetchLeads(search: LeadsSearch): Promise<LeadsQueryResult> {
  const query = buildLeadsParams(search)
  const { data } = await api.get<LeadsListResponse>(
    `/leads${query ? `?${query}` : ''}`
  )
  return {
    leads: data.data.leads,
    totalCount: data.totalCount,
  }
}

export function leadsQueryOptions(search: LeadsSearch): Omit<
  QueryOptions<LeadsQueryResult, Error, LeadsQueryResult, LeadsQueryKey>,
  'queryKey'
> & {
  queryKey: LeadsQueryKey
} {
  return queryOptions({
    queryKey: [...LEADS_KEY, search] as const,
    queryFn: ({ queryKey }: { queryKey: LeadsQueryKey }) => {
      const [, params] = queryKey
      return fetchLeads(params)
    },
  })
}

export function useLeadsQuery(search: LeadsSearch) {
  return useQuery(leadsQueryOptions(search))
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: LeadInput) => {
      const { data } = await api.post<{
        status: string
        data: { lead: Lead }
      }>('/leads', input)
      return data.data.lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY })
    },
  })
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Partial<LeadInput>
    }) => {
      const { data } = await api.patch<{
        status: string
        data: { lead: Lead }
      }>(`/leads/${id}`, input)
      return data.data.lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY })
    },
  })
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/leads/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY })
    },
  })
}

export function useBulkDeleteLeadsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.post('/leads/bulk-delete', { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY })
    },
  })
}

export function useAddDesignVersionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      leadId,
      config,
    }: {
      leadId: string
      config: Omit<DesignConfiguration, '_id' | 'version'>
    }) => {
      const { data } = await api.post<{
        status: string
        data: { lead: Lead }
      }>(`/leads/${leadId}/design-versions`, config)
      return data.data.lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY })
    },
  })
}

/* ─────────────────────────────────────────
   Company select options (for Client/Developer/Consultant/EndCustomer)
   ───────────────────────────────────────── */

interface CompanyOption {
  label: string
  value: string
}

interface CompanyListResponse {
  status: string
  totalCount: number
  data: {
    companies: Array<{ _id: string; name: string; typeOfCompany?: string }>
  }
}

export function useCompanySelectOptions(typeOfCompany?: string) {
  return useQuery({
    queryKey: ['companies-select', typeOfCompany ?? 'all'],
    queryFn: async (): Promise<CompanyOption[]> => {
      // fetch a large page to get all companies
      const { data } = await api.get<CompanyListResponse>(
        '/companies?limit=500'
      )
      let companies = data.data.companies
      if (typeOfCompany) {
        companies = companies.filter((c) => c.typeOfCompany === typeOfCompany)
      }
      return companies.map((c) => ({ label: c.name, value: c._id }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
