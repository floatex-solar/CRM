import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react'
import type { LeadStats } from '../types'
import { StatCard } from './stat-card'

interface LeadsSectionProps {
  stats: LeadStats
}

export function LeadsSection({ stats }: LeadsSectionProps) {
  return (
    <section className='space-y-2'>
      <h2 className='text-lg font-semibold'>Leads Overview</h2>

      <h3 className='text-sm font-medium text-muted-foreground'>By Priority</h3>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          title='High Priority'
          value={stats.byPriority['High'] ?? 0}
          icon={ArrowUp}
          to='/leads'
          search={{ priority: ['High'] }}
        />
        <StatCard
          title='Medium Priority'
          value={stats.byPriority['Medium'] ?? 0}
          icon={ArrowRight}
          to='/leads'
          search={{ priority: ['Medium'] }}
        />
        <StatCard
          title='Low Priority'
          value={stats.byPriority['Low'] ?? 0}
          icon={ArrowDown}
          to='/leads'
          search={{ priority: ['Low'] }}
        />
      </div>
    </section>
  )
}
