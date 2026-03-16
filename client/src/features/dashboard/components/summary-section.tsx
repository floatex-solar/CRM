import {
  Building2,
  FileText,
  MapPin,
  ListTodo,
} from 'lucide-react'
import type { DashboardStats } from '../types'
import { StatCard } from './stat-card'

interface SummarySectionProps {
  stats: DashboardStats
}

export function SummarySection({ stats }: SummarySectionProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard
        title='Total Companies'
        value={stats.companies.total}
        icon={Building2}
        to='/companies'
        color='blue'
      />
      <StatCard
        title='Total Leads'
        value={stats.leads.total}
        icon={FileText}
        to='/leads'
        color='purple'
      />
      <StatCard
        title='Total Sites'
        value={stats.sites.total}
        icon={MapPin}
        to='/sites'
        color='green'
      />
      <StatCard
        title='Total Tasks'
        value={stats.tasks.total}
        icon={ListTodo}
        to='/tasks'
        color='amber'
      />
    </div>
  )
}
