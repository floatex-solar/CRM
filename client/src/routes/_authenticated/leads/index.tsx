import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Leads } from '@/features/leads'
import { leadsQueryOptions } from '@/features/leads/hooks/use-leads-api'

const leadSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  priority: z.array(z.string()).optional().catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/leads/')({
  validateSearch: leadSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) => {
    const search = deps.search as z.infer<typeof leadSearchSchema>
    const opts = leadsQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      priority: search.priority?.length ? search.priority : undefined,
      filter: search.filter || undefined,
    })
    return context.queryClient.ensureQueryData({
      ...opts,
      queryKey: opts.queryKey!,
    })
  },
  component: Leads,
})
