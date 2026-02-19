import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'
import { usersQueryOptions } from '@/features/users/hooks/use-users-api'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  role: z.array(z.string()).optional().catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) => {
    const search = deps.search as z.infer<typeof usersSearchSchema>
    const opts = usersQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      filter: search.filter || undefined,
    })
    return context.queryClient.ensureQueryData({
      ...opts,
      queryKey: opts.queryKey!,
    })
  },
  component: Users,
})
