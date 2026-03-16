import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Companies } from '@/features/companies'
import { companiesQueryOptions } from '@/features/companies/hooks/use-companies-api'

const companySearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  leadStatus: z.array(z.string()).optional().catch([]),
  priority: z.array(z.string()).optional().catch([]),
  ndaStatus: z.array(z.string()).optional().catch([]),
  mouStatus: z.array(z.string()).optional().catch([]),
  emailSent: z.string().optional().catch(''),
  leadSource: z.string().optional().catch(''),
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
      ndaStatus: search.ndaStatus?.length ? search.ndaStatus : undefined,
      mouStatus: search.mouStatus?.length ? search.mouStatus : undefined,
      emailSent: search.emailSent || undefined,
      leadSource: search.leadSource || undefined,
      filter: search.filter || undefined,
    })
    return context.queryClient.ensureQueryData({
      ...opts,
      queryKey: opts.queryKey!,
    })
  },
  component: Companies,
})
