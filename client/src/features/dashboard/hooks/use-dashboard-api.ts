import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { DashboardStats } from '../types'

const DASHBOARD_KEY = ['dashboard-stats'] as const

async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<{ status: string; data: DashboardStats }>(
    '/dashboard/stats'
  )
  return data.data
}

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: fetchDashboardStats,
    staleTime: 30_000,
  })
}
