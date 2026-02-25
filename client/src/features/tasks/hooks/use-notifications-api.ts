import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Notification } from '../data/schema'

/* ─── Constants ─── */

const NOTIFICATIONS_KEY = ['notifications'] as const
const UNREAD_COUNT_KEY = ['notifications-unread-count'] as const
const POLL_INTERVAL = 30_000 // 30 seconds

/* ─── Types ─── */

interface NotificationsListResponse {
  status: string
  results: number
  totalCount: number
  data: {
    notifications: Notification[]
  }
}

interface UnreadCountResponse {
  status: string
  data: {
    count: number
  }
}

/* ─── Queries ─── */

/** Fetches notifications for the current user, polled every 30 seconds */
export function useNotificationsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, { page, limit }] as const,
    queryFn: async () => {
      const { data } = await api.get<NotificationsListResponse>(
        `/notifications?page=${page}&limit=${limit}`
      )
      return {
        notifications: data.data.notifications,
        totalCount: data.totalCount,
      }
    },
    refetchInterval: POLL_INTERVAL,
  })
}

/** Fetches unread notification count, polled every 30 seconds */
export function useUnreadCountQuery() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: async () => {
      const { data } = await api.get<UnreadCountResponse>(
        '/notifications/unread-count'
      )
      return data.data.count
    },
    refetchInterval: POLL_INTERVAL,
  })
}

/* ─── Mutations ─── */

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/notifications/${notificationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
    },
  })
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
    },
  })
}
