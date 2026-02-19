import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { UsersListResponse, UserResponse } from '../data/schema'

/* ─── Query Options ─── */

interface UsersQueryParams {
  page?: number
  pageSize?: number
  filter?: string
}

export function usersQueryOptions(params: UsersQueryParams = {}) {
  const { page = 1, pageSize = 10, filter } = params
  return {
    queryKey: ['users', { page, pageSize, filter }] as const,
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('page', String(page))
      searchParams.set('limit', String(pageSize))
      if (filter) searchParams.set('search', filter)

      const { data } = await api.get<UsersListResponse>(
        `/users?${searchParams.toString()}`
      )
      return {
        users: data.data.users,
        totalCount: data.totalCount,
      }
    },
  }
}

/* ─── Mutations ─── */

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const { data } = await api.post<UserResponse>('/users', input)
      return data.data.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Record<string, unknown>
    }) => {
      const { data } = await api.patch<UserResponse>(`/users/${id}`, input)
      return data.data.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
