import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Sites } from '@/features/sites'
import { sitesQueryOptions } from '@/features/sites/hooks/use-sites-api'

const siteSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/sites/')({
  validateSearch: siteSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) => {
    const search = deps.search as z.infer<typeof siteSearchSchema>
    const opts = sitesQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      filter: search.filter || undefined,
    })
    return context.queryClient.ensureQueryData({
      ...opts,
      queryKey: opts.queryKey!,
    })
  },
  component: Sites,
})
