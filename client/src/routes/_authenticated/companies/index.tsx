import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Companies } from '@/features/companies'
import { companiesQueryOptions } from '@/features/companies/hooks/use-companies-api'

const companySearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  leadStatus: z.array(z.string()).optional().catch([]),
  priority: z.array(z.string()).optional().catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/companies/')({
  validateSearch: companySearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) => {
    const search = deps.search as z.infer<typeof companySearchSchema>
    const opts = companiesQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      leadStatus: search.leadStatus?.length ? search.leadStatus : undefined,
      priority: search.priority?.length ? search.priority : undefined,
      filter: search.filter || undefined,
    })
    return context.queryClient.ensureQueryData({
      ...opts,
      queryKey: opts.queryKey!,
    })
  },
  component: Companies,
})
