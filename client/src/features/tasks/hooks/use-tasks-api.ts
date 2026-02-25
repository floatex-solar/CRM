import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
  type QueryOptions,
} from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Task, TasksListResponse, TaskResponse } from '../data/schema'

/* ─── Constants ─── */

const TASKS_KEY = ['tasks'] as const

/* ─── Search Params ─── */

type TasksSearch = {
  page?: number
  pageSize?: number
  status?: string[]
  priority?: string[]
  filter?: string
}

type TasksQueryKey = readonly [(typeof TASKS_KEY)[number], TasksSearch]

type TasksQueryResult = {
  tasks: Task[]
  totalCount: number
}

/* ─── Helpers ─── */

function buildTasksParams(search: TasksSearch) {
  const params = new URLSearchParams()
  if (search.page) params.set('page', String(search.page))
  if (search.pageSize) params.set('limit', String(search.pageSize))
  if (search.filter) params.set('search', search.filter)
  if (search.status?.length)
    search.status.forEach((s) => params.append('status', s))
  if (search.priority?.length)
    search.priority.forEach((p) => params.append('priority', p))
  return params.toString()
}

async function fetchTasks(search: TasksSearch): Promise<TasksQueryResult> {
  const query = buildTasksParams(search)
  const { data } = await api.get<TasksListResponse>(
    `/tasks${query ? `?${query}` : ''}`
  )
  return {
    tasks: data.data.tasks,
    totalCount: data.totalCount,
  }
}

/* ─── Query Options ─── */

export function tasksQueryOptions(search: TasksSearch): Omit<
  QueryOptions<TasksQueryResult, Error, TasksQueryResult, TasksQueryKey>,
  'queryKey'
> & {
  queryKey: TasksQueryKey
} {
  return queryOptions({
    queryKey: [...TASKS_KEY, search] as const,
    queryFn: ({ queryKey }: { queryKey: TasksQueryKey }) => {
      const [, params] = queryKey
      return fetchTasks(params)
    },
  })
}

export function useTasksQuery(search: TasksSearch) {
  return useQuery(tasksQueryOptions(search))
}

/* ─── Task Detail Query ─── */

export function useTaskDetailQuery(taskId: string | null) {
  return useQuery({
    queryKey: ['task-detail', taskId] as const,
    queryFn: async () => {
      if (!taskId) return null
      const { data } = await api.get<TaskResponse>(`/tasks/${taskId}`)
      return data.data.task
    },
    enabled: !!taskId,
  })
}

/* ─── Mutations ─── */

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<TaskResponse>('/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data.task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: FormData }) => {
      const { data } = await api.patch<TaskResponse>(`/tasks/${id}`, input, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data.task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useBulkDeleteTasksMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.post('/tasks/bulk-delete', { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useAddTaskUpdateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      taskId,
      formData,
    }: {
      taskId: string
      formData: FormData
    }) => {
      const { data } = await api.post<TaskResponse>(
        `/tasks/${taskId}/updates`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return data.data.task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
      queryClient.invalidateQueries({ queryKey: ['task-detail'] })
    },
  })
}

/* ─── Select Option Queries ─── */

interface LeadOption {
  label: string
  value: string
}

interface LeadListResponse {
  status: string
  totalCount: number
  data: {
    leads: Array<{ _id: string; jobCode: string; projectName: string }>
  }
}

/** Fetches all leads for the Lead select dropdown as "JobCode - ProjectName" */
export function useLeadSelectOptions() {
  return useQuery({
    queryKey: ['leads-select'],
    queryFn: async (): Promise<LeadOption[]> => {
      const { data } = await api.get<LeadListResponse>('/leads?limit=500')
      return data.data.leads.map((l) => ({
        label: `${l.jobCode} - ${l.projectName}`,
        value: l._id,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

interface UserOption {
  label: string
  value: string
}

interface UserListResponse {
  status: string
  totalCount: number
  data: {
    users: Array<{ _id: string; name: string; email: string }>
  }
}

/** Fetches all users for the Assigned To / Watchers select dropdowns */
export function useUserSelectOptions() {
  return useQuery({
    queryKey: ['users-select'],
    queryFn: async (): Promise<UserOption[]> => {
      const { data } = await api.get<UserListResponse>('/users?limit=500')
      return data.data.users.map((u) => ({
        label: u.name,
        value: u._id,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}
