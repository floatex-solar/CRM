import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { DateRange } from 'react-day-picker'
import type { LeadStats } from '../types'
import { StatCard } from './stat-card'
import { DashboardSection } from './dashboard-section'

interface LeadsSectionProps {
  stats: LeadStats
  dateRange?: DateRange | undefined
  onDateRangeChange?: (range: DateRange | undefined) => void
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981']

export function LeadsSection({
  stats,
  dateRange,
  onDateRangeChange,
}: LeadsSectionProps) {
  const chartData = [
    { name: 'High', value: stats.byPriority['High'] ?? 0 },
    { name: 'Medium', value: stats.byPriority['Medium'] ?? 0 },
    { name: 'Low', value: stats.byPriority['Low'] ?? 0 },
  ].filter((d) => d.value > 0)

  return (
    <DashboardSection
      title='Leads Overview'
      badge={stats.total}
      showDatePicker
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className='space-y-6'>
        <div className='grid gap-6 lg:grid-cols-[1fr_2fr]'>
          {chartData.length > 0 && (
            <div>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Priority Distribution
              </h3>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div>
            <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
              By Priority
            </h3>
            <div className='grid gap-4 sm:grid-cols-3'>
              <StatCard
                title='High Priority'
                value={stats.byPriority['High'] ?? 0}
                icon={ArrowUp}
                to='/leads'
                search={{ priority: ['High'] }}
                color='red'
              />
              <StatCard
                title='Medium Priority'
                value={stats.byPriority['Medium'] ?? 0}
                icon={ArrowRight}
                to='/leads'
                search={{ priority: ['Medium'] }}
                color='amber'
              />
              <StatCard
                title='Low Priority'
                value={stats.byPriority['Low'] ?? 0}
                icon={ArrowDown}
                to='/leads'
                search={{ priority: ['Low'] }}
                color='green'
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardSection>
  )
}
