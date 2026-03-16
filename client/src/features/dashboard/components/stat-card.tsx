import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  to: string
  search?: Record<string, unknown>
  description?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  to,
  search,
  description,
}: StatCardProps) {
  return (
    <Link to={to} search={search} className='block'>
      <Card className='cursor-pointer transition-all hover:shadow-md hover:border-primary/20'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>{title}</CardTitle>
          <Icon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{value}</div>
          {description && (
            <p className='text-xs text-muted-foreground'>{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
