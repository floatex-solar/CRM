import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DateRangePicker } from './date-range-picker'

interface DashboardSectionProps {
  title: string
  badge?: string | number
  children: React.ReactNode
  showDatePicker?: boolean
  dateRange?: DateRange | undefined
  onDateRangeChange?: (range: DateRange | undefined) => void
  defaultOpen?: boolean
}

export function DashboardSection({
  title,
  badge,
  children,
  showDatePicker = false,
  dateRange,
  onDateRangeChange,
  defaultOpen = true,
}: DashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CollapsibleTrigger className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  !isOpen && '-rotate-90'
                )}
              />
              <CardTitle className='text-base font-semibold'>
                {title}
              </CardTitle>
              {badge !== undefined && (
                <Badge variant='secondary' className='text-xs'>
                  {badge}
                </Badge>
              )}
            </CollapsibleTrigger>
            {showDatePicker && onDateRangeChange && (
              <DateRangePicker
                value={dateRange}
                onChange={onDateRangeChange}
                className='h-8 text-xs'
              />
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className='pt-0'>{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
