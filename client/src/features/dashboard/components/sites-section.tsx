import {
  Droplets,
  Waves,
  FileX,
  Mountain,
  ClipboardX,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { DateRange } from 'react-day-picker'
import type { SiteStats } from '../types'
import { StatCard } from './stat-card'
import { DashboardSection } from './dashboard-section'

interface SitesSectionProps {
  stats: SiteStats
  dateRange?: DateRange | undefined
  onDateRangeChange?: (range: DateRange | undefined) => void
}

const BAR_COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#6b7280']

export function SitesSection({
  stats,
  dateRange,
  onDateRangeChange,
}: SitesSectionProps) {
  const chartData = [
    { name: 'Pond Empty', value: stats.pondGettingEmpty },
    { name: 'Bathymetry N/A', value: stats.bathymetryNotAvailable },
    { name: 'DPR N/A', value: stats.dprNotAvailable },
    { name: 'Geotech N/A', value: stats.geotechnicalNotAvailable },
    { name: 'PFR N/A', value: stats.pfrNotAvailable },
  ]

  const hasChartData = chartData.some((d) => d.value > 0)

  return (
    <DashboardSection
      title='Sites Overview'
      badge={stats.total}
      showDatePicker
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className='space-y-6'>
        {hasChartData && (
          <div>
            <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
              Data Availability Issues
            </h3>
            <ResponsiveContainer width='100%' height={250}>
              <BarChart data={chartData} layout='vertical'>
                <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                <XAxis type='number' allowDecimals={false} />
                <YAxis
                  type='category'
                  dataKey='name'
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey='value' radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          <StatCard
            title='Pond Getting Empty'
            value={stats.pondGettingEmpty}
            icon={Droplets}
            to='/sites'
            search={{ possibilityForPondGettingEmpty: 'true' }}
            description='Possibility of pond getting empty'
            color='amber'
          />
          <StatCard
            title='Bathymetry N/A'
            value={stats.bathymetryNotAvailable}
            icon={Waves}
            to='/sites'
            search={{ bathymetryAvailable: 'false' }}
            description='Bathymetry survey data not available'
            color='blue'
          />
          <StatCard
            title='DPR N/A'
            value={stats.dprNotAvailable}
            icon={FileX}
            to='/sites'
            search={{ dprAvailable: 'false' }}
            description='DPR input data not available'
            color='red'
          />
          <StatCard
            title='Geotechnical N/A'
            value={stats.geotechnicalNotAvailable}
            icon={Mountain}
            to='/sites'
            search={{ geotechnicalReportAvailable: 'false' }}
            description='Geotechnical report not available'
            color='purple'
          />
          <StatCard
            title='PFR N/A'
            value={stats.pfrNotAvailable}
            icon={ClipboardX}
            to='/sites'
            search={{ pfrAvailable: 'false' }}
            description='PFR not available'
          />
        </div>
      </div>
    </DashboardSection>
  )
}
