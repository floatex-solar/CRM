import {
  FileCheck,
  FileClock,
  FileWarning,
  Mail,
  MailX,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Star,
  Tag,
  type LucideIcon,
  UserPlus,
  Phone,
  MessageSquare,
  Send,
  Handshake,
  RefreshCw,
  XCircle,
  Pause,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { DateRange } from 'react-day-picker'
import type { CompanyStats } from '../types'
import { StatCard } from './stat-card'
import { DashboardSection } from './dashboard-section'
import { Separator } from '@/components/ui/separator'

interface CompaniesSectionProps {
  stats: CompanyStats
  dateRange?: DateRange | undefined
  onDateRangeChange?: (range: DateRange | undefined) => void
}

const LEAD_STATUS_ICONS: Record<string, LucideIcon> = {
  New: UserPlus,
  Contacted: Phone,
  'In Discussion': MessageSquare,
  'Proposal Sent': Send,
  Negotiation: Handshake,
  Converted: RefreshCw,
  Dropped: XCircle,
  'On Hold': Pause,
}

const PRIORITY_ICONS: Record<string, LucideIcon> = {
  High: ArrowUp,
  Medium: ArrowRight,
  Low: ArrowDown,
  Strategic: Star,
}

const LEAD_STATUS_COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b',
  '#f97316', '#10b981', '#ef4444', '#6b7280',
]

const NDA_MOU_COLORS = ['#10b981', '#f59e0b', '#ef4444']

export function CompaniesSection({
  stats,
  dateRange,
  onDateRangeChange,
}: CompaniesSectionProps) {
  const leadSourceEntries = Object.entries(stats.byLeadSource)

  const leadStatusData = Object.entries(LEAD_STATUS_ICONS)
    .map(([status]) => ({
      name: status,
      value: stats.byLeadStatus[status] ?? 0,
    }))
    .filter((d) => d.value > 0)

  const ndaData = [
    { name: 'Signed', value: stats.ndaSigned },
    { name: 'Pending', value: stats.ndaPending },
    { name: 'Expired', value: stats.ndaExpired },
  ].filter((d) => d.value > 0)

  const mouData = [
    { name: 'Signed', value: stats.mouSigned },
    { name: 'Pending', value: stats.mouPending },
    { name: 'Expired', value: stats.mouExpired },
  ].filter((d) => d.value > 0)

  return (
    <DashboardSection
      title='Companies Overview'
      badge={stats.total}
      showDatePicker
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className='space-y-6'>
        {/* Lead Status chart + cards */}
        {leadStatusData.length > 0 && (
          <div>
            <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
              Lead Status Distribution
            </h3>
            <ResponsiveContainer width='100%' height={280}>
              <BarChart data={leadStatusData}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='name'
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor='end'
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='value' radius={[4, 4, 0, 0]} barSize={36}>
                  {leadStatusData.map((_, index) => (
                    <Cell
                      key={`ls-${index}`}
                      fill={LEAD_STATUS_COLORS[index % LEAD_STATUS_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Object.entries(LEAD_STATUS_ICONS).map(([status, icon]) => (
            <StatCard
              key={status}
              title={status}
              value={stats.byLeadStatus[status] ?? 0}
              icon={icon}
              to='/companies'
              search={{ leadStatus: [status] }}
            />
          ))}
        </div>

        <Separator />

        {/* NDA & MOU side by side charts */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {ndaData.length > 0 && (
            <div>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                NDA Status
              </h3>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie
                    data={ndaData}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {ndaData.map((_, index) => (
                      <Cell
                        key={`nda-${index}`}
                        fill={NDA_MOU_COLORS[index % NDA_MOU_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {mouData.length > 0 && (
            <div>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                MOU Status
              </h3>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie
                    data={mouData}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {mouData.map((_, index) => (
                      <Cell
                        key={`mou-${index}`}
                        fill={NDA_MOU_COLORS[index % NDA_MOU_COLORS.length]}
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

        {/* NDA cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <StatCard
            title='NDA Signed'
            value={stats.ndaSigned}
            icon={FileCheck}
            to='/companies'
            search={{ ndaStatus: ['Signed'] }}
            color='green'
          />
          <StatCard
            title='NDA Pending'
            value={stats.ndaPending}
            icon={FileClock}
            to='/companies'
            search={{ ndaStatus: ['Not Sent', 'Sent'] }}
            description='Not Sent + Sent'
            color='amber'
          />
          <StatCard
            title='NDA Expired'
            value={stats.ndaExpired}
            icon={FileWarning}
            to='/companies'
            search={{ ndaStatus: ['Expired'] }}
            color='red'
          />
        </div>

        {/* MOU cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <StatCard
            title='MOU Signed'
            value={stats.mouSigned}
            icon={FileCheck}
            to='/companies'
            search={{ mouStatus: ['Signed'] }}
            color='green'
          />
          <StatCard
            title='MOU Pending'
            value={stats.mouPending}
            icon={FileClock}
            to='/companies'
            search={{ mouStatus: ['Not Sent', 'Sent'] }}
            description='Not Sent + Sent'
            color='amber'
          />
          <StatCard
            title='MOU Expired'
            value={stats.mouExpired}
            icon={FileWarning}
            to='/companies'
            search={{ mouStatus: ['Expired'] }}
            color='red'
          />
        </div>

        <Separator />

        {/* Email Status */}
        <div>
          <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
            Email Status
          </h3>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <StatCard
              title='Email Sent'
              value={stats.emailSent}
              icon={Mail}
              to='/companies'
              search={{ emailSent: 'Yes' }}
              color='green'
            />
            <StatCard
              title='Email Pending'
              value={stats.emailPending}
              icon={MailX}
              to='/companies'
              search={{ emailSent: 'No' }}
              color='red'
            />
          </div>
        </div>

        <Separator />

        {/* Priority */}
        <div>
          <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
            By Priority
          </h3>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {Object.entries(PRIORITY_ICONS).map(([priority, icon]) => {
              const colorMap: Record<string, StatCardColor> = {
                High: 'red',
                Medium: 'amber',
                Low: 'green',
                Strategic: 'purple',
              }
              return (
                <StatCard
                  key={priority}
                  title={priority}
                  value={stats.byPriority[priority] ?? 0}
                  icon={icon}
                  to='/companies'
                  search={{ priority: [priority] }}
                  color={colorMap[priority]}
                />
              )
            })}
          </div>
        </div>

        {/* Lead Source (dynamic) */}
        {leadSourceEntries.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                By Lead Source
              </h3>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {leadSourceEntries.map(([source, count]) => (
                  <StatCard
                    key={source}
                    title={source}
                    value={count}
                    icon={Tag}
                    to='/companies'
                    search={{ leadSource: source }}
                    color='purple'
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardSection>
  )
}

type StatCardColor = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple'
