import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { DashboardStats } from '../types'

const DASHBOARD_KEY = ['dashboard-stats'] as const

interface DateRangeParams {
  tasksFrom?: string
  tasksTo?: string
  sitesFrom?: string
  sitesTo?: string
  leadsFrom?: string
  leadsTo?: string
  companiesFrom?: string
  companiesTo?: string
}

function buildQueryString(params: DateRangeParams): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value)
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

async function fetchDashboardStats(
  params: DateRangeParams
): Promise<DashboardStats> {
  const qs = buildQueryString(params)
  const { data } = await api.get<{ status: string; data: DashboardStats }>(
    `/dashboard/stats${qs}`
  )
  return data.data
}

export function useDashboardStatsQuery(params: DateRangeParams = {}) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, params] as const,
    queryFn: () => fetchDashboardStats(params),
    staleTime: 30_000,
  })
}
