import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  to: string
  search?: Record<string, unknown>
  description?: string
  color?: 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple'
}

const COLOR_MAP = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    border: 'hover:border-primary/20',
  },
  blue: {
    icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    border: 'hover:border-blue-500/30',
  },
  green: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-500/30',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-500/30',
  },
  red: {
    icon: 'bg-red-500/10 text-red-600 dark:text-red-400',
    border: 'hover:border-red-500/30',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    border: 'hover:border-purple-500/30',
  },
} as const

export function StatCard({
  title,
  value,
  icon: Icon,
  to,
  search,
  description,
  color = 'default',
}: StatCardProps) {
  const colors = COLOR_MAP[color]

  return (
    <Link to={to} search={search} className='block group'>
      <div
        className={cn(
          'rounded-lg border bg-card p-4 transition-all hover:shadow-md',
          colors.border
        )}
      >
        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <div className={cn('rounded-md p-1.5', colors.icon)}>
            <Icon className='h-4 w-4' />
          </div>
        </div>
        <div className='mt-2'>
          <span className='text-2xl font-bold tracking-tight'>{value}</span>
        </div>
        {description && (
          <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
        )}
      </div>
    </Link>
  )
}
