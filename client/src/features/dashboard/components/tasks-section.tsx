import {
  Circle,
  Timer,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from 'lucide-react'
import type { TaskStats } from '../types'
import { StatCard } from './stat-card'

interface TasksSectionProps {
  stats: TaskStats
}

export function TasksSection({ stats }: TasksSectionProps) {
  return (
    <section className='space-y-2'>
      <h2 className='text-lg font-semibold'>Tasks Overview</h2>

      <h3 className='text-sm font-medium text-muted-foreground'>By Status</h3>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          title='Todo'
          value={stats.byStatus['Todo'] ?? 0}
          icon={Circle}
          to='/tasks'
          search={{ status: ['Todo'] }}
        />
        <StatCard
          title='In Progress'
          value={stats.byStatus['In Progress'] ?? 0}
          icon={Timer}
          to='/tasks'
          search={{ status: ['In Progress'] }}
        />
        <StatCard
          title='Done'
          value={stats.byStatus['Done'] ?? 0}
          icon={CheckCircle2}
          to='/tasks'
          search={{ status: ['Done'] }}
        />
      </div>

      <h3 className='text-sm font-medium text-muted-foreground pt-2'>
        By Priority
      </h3>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Urgent'
          value={stats.byPriority['Urgent'] ?? 0}
          icon={AlertTriangle}
          to='/tasks'
          search={{ priority: ['Urgent'] }}
        />
        <StatCard
          title='High'
          value={stats.byPriority['High'] ?? 0}
          icon={ArrowUp}
          to='/tasks'
          search={{ priority: ['High'] }}
        />
        <StatCard
          title='Medium'
          value={stats.byPriority['Medium'] ?? 0}
          icon={ArrowRight}
          to='/tasks'
          search={{ priority: ['Medium'] }}
        />
        <StatCard
          title='Low'
          value={stats.byPriority['Low'] ?? 0}
          icon={ArrowDown}
          to='/tasks'
          search={{ priority: ['Low'] }}
        />
      </div>
    </section>
  )
}
