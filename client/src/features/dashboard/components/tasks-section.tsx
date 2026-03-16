import {
  Circle,
  Timer,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { DateRange } from 'react-day-picker'
import type { TaskStats } from '../types'
import { StatCard } from './stat-card'
import { DashboardSection } from './dashboard-section'

interface TasksSectionProps {
  stats: TaskStats
  dateRange?: DateRange | undefined
  onDateRangeChange?: (range: DateRange | undefined) => void
}

const STATUS_COLORS = ['#6366f1', '#f59e0b', '#10b981']
const PRIORITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#6b7280']

export function TasksSection({
  stats,
  dateRange,
  onDateRangeChange,
}: TasksSectionProps) {
  const statusData = [
    { name: 'Todo', value: stats.byStatus['Todo'] ?? 0 },
    { name: 'In Progress', value: stats.byStatus['In Progress'] ?? 0 },
    { name: 'Done', value: stats.byStatus['Done'] ?? 0 },
  ].filter((d) => d.value > 0)

  const priorityData = [
    { name: 'Urgent', value: stats.byPriority['Urgent'] ?? 0 },
    { name: 'High', value: stats.byPriority['High'] ?? 0 },
    { name: 'Medium', value: stats.byPriority['Medium'] ?? 0 },
    { name: 'Low', value: stats.byPriority['Low'] ?? 0 },
  ].filter((d) => d.value > 0)

  return (
    <DashboardSection
      title='Tasks Overview'
      badge={stats.byStatus['Todo'] ?? 0 + (stats.byStatus['In Progress'] ?? 0) > 0
        ? `${(stats.byStatus['Todo'] ?? 0) + (stats.byStatus['In Progress'] ?? 0)} pending`
        : undefined}
      showDatePicker
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className='space-y-6'>
        {/* Charts row */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {statusData.length > 0 && (
            <div>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Status Distribution
              </h3>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`status-${index}`}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {priorityData.length > 0 && (
            <div>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Priority Distribution
              </h3>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {priorityData.map((_, index) => (
                      <Cell
                        key={`priority-${index}`}
                        fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status cards */}
        <div>
          <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
            By Status
          </h3>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <StatCard
              title='Todo'
              value={stats.byStatus['Todo'] ?? 0}
              icon={Circle}
              to='/tasks'
              search={{ status: ['Todo'] }}
              color='blue'
            />
            <StatCard
              title='In Progress'
              value={stats.byStatus['In Progress'] ?? 0}
              icon={Timer}
              to='/tasks'
              search={{ status: ['In Progress'] }}
              color='amber'
            />
            <StatCard
              title='Done'
              value={stats.byStatus['Done'] ?? 0}
              icon={CheckCircle2}
              to='/tasks'
              search={{ status: ['Done'] }}
              color='green'
            />
          </div>
        </div>

        {/* Priority cards */}
        <div>
          <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
            By Priority
          </h3>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              title='Urgent'
              value={stats.byPriority['Urgent'] ?? 0}
              icon={AlertTriangle}
              to='/tasks'
              search={{ priority: ['Urgent'] }}
              color='red'
            />
            <StatCard
              title='High'
              value={stats.byPriority['High'] ?? 0}
              icon={ArrowUp}
              to='/tasks'
              search={{ priority: ['High'] }}
              color='amber'
            />
            <StatCard
              title='Medium'
              value={stats.byPriority['Medium'] ?? 0}
              icon={ArrowRight}
              to='/tasks'
              search={{ priority: ['Medium'] }}
              color='blue'
            />
            <StatCard
              title='Low'
              value={stats.byPriority['Low'] ?? 0}
              icon={ArrowDown}
              to='/tasks'
              search={{ priority: ['Low'] }}
            />
          </div>
        </div>
      </div>
    </DashboardSection>
  )
}
