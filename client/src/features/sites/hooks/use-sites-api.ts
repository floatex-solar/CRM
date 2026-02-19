import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
  type QueryOptions,
} from '@tanstack/react-query'
import api from '@/lib/axios'
import {
  type Site,
  type SiteInput,
  type SitesListResponse,
} from '../data/schema'

const SITES_KEY = ['sites'] as const

type SitesSearch = {
  page?: number
  pageSize?: number
  filter?: string
  owner?: string
  country?: string
}

type SitesQueryKey = readonly [(typeof SITES_KEY)[number], SitesSearch]

type SitesQueryResult = {
  sites: Site[]
  totalCount: number
}

function buildSitesParams(search: SitesSearch) {
  const params = new URLSearchParams()
  if (search.page) params.set('page', String(search.page))
  if (search.pageSize) params.set('limit', String(search.pageSize))
  if (search.filter) params.set('search', search.filter)
  if (search.owner) params.set('owner', search.owner)
  if (search.country) params.set('country', search.country)
  return params.toString()
}

async function fetchSites(search: SitesSearch): Promise<SitesQueryResult> {
  const query = buildSitesParams(search)
  const { data } = await api.get<SitesListResponse>(
    `/sites${query ? `?${query}` : ''}`
  )
  return {
    sites: data.data.sites,
    totalCount: data.totalCount,
  }
}

export function sitesQueryOptions(search: SitesSearch): Omit<
  QueryOptions<SitesQueryResult, Error, SitesQueryResult, SitesQueryKey>,
  'queryKey'
> & {
  queryKey: SitesQueryKey
} {
  return queryOptions({
    queryKey: [...SITES_KEY, search] as const,
    queryFn: ({ queryKey }: { queryKey: SitesQueryKey }) => {
      const [, params] = queryKey
      return fetchSites(params)
    },
  })
}

export function useSitesQuery(search: SitesSearch) {
  return useQuery(sitesQueryOptions(search))
}

const createFormData = (input: SiteInput) => {
  const formData = new FormData()

  // Append standard fields
  Object.entries(input).forEach(([key, value]) => {
    if (key.includes('File')) return // Skip files for now, handle separately
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })

  // Append Files
  if (input.bathymetryFile?.[0])
    formData.append('bathymetryFile', input.bathymetryFile[0])
  if (input.geotechnicalFile?.[0])
    formData.append('geotechnicalFile', input.geotechnicalFile[0])
  if (input.pfrFile?.[0]) formData.append('pfrFile', input.pfrFile[0])
  if (input.dprFile?.[0]) formData.append('dprFile', input.dprFile[0])

  return formData
}

export function useCreateSiteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SiteInput) => {
      const formData = createFormData(input)
      const { data } = await api.post<{
        status: string
        data: { site: Site }
      }>('/sites', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data.data.site
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITES_KEY })
    },
  })
}

export function useUpdateSiteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Partial<SiteInput>
    }) => {
      // Note: Partial updates with FormData can be tricky if we don't send everything.
      // For now assuming we send what we have.
      const formData = new FormData()

      Object.entries(input).forEach(([key, value]) => {
        if (key.includes('File')) return
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Handle files if they are being updated (if they are FileList/Array)
      // If it's the existing file (object from backend), we shouldn't append it as file
      if (input.bathymetryFile?.[0] instanceof File)
        formData.append('bathymetryFile', input.bathymetryFile[0])
      if (input.geotechnicalFile?.[0] instanceof File)
        formData.append('geotechnicalFile', input.geotechnicalFile[0])
      if (input.pfrFile?.[0] instanceof File)
        formData.append('pfrFile', input.pfrFile[0])
      if (input.dprFile?.[0] instanceof File)
        formData.append('dprFile', input.dprFile[0])

      const { data } = await api.patch<{
        status: string
        data: { site: Site }
      }>(`/sites/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data.data.site
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITES_KEY })
    },
  })
}

export function useDeleteSiteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sites/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITES_KEY })
    },
  })
}
