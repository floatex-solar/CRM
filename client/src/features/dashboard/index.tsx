import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/features/notifications/notification-bell'
import { useDashboardStatsQuery } from './hooks/use-dashboard-api'
import { SummarySection } from './components/summary-section'
import { TasksSection } from './components/tasks-section'
import { SitesSection } from './components/sites-section'
import { LeadsSection } from './components/leads-section'
import { CompaniesSection } from './components/companies-section'
import { DashboardSkeleton } from './components/dashboard-skeleton'

function formatDate(date: Date | undefined): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined
}

export function Dashboard() {
  const [tasksDateRange, setTasksDateRange] = useState<DateRange | undefined>()
  const [sitesDateRange, setSitesDateRange] = useState<DateRange | undefined>()
  const [leadsDateRange, setLeadsDateRange] = useState<DateRange | undefined>()
  const [companiesDateRange, setCompaniesDateRange] = useState<
    DateRange | undefined
  >()

  const queryParams = useMemo(
    () => ({
      tasksFrom: formatDate(tasksDateRange?.from),
      tasksTo: formatDate(tasksDateRange?.to),
      sitesFrom: formatDate(sitesDateRange?.from),
      sitesTo: formatDate(sitesDateRange?.to),
      leadsFrom: formatDate(leadsDateRange?.from),
      leadsTo: formatDate(leadsDateRange?.to),
      companiesFrom: formatDate(companiesDateRange?.from),
      companiesTo: formatDate(companiesDateRange?.to),
    }),
    [tasksDateRange, sitesDateRange, leadsDateRange, companiesDateRange]
  )

  const { data, isLoading } = useDashboardStatsQuery(queryParams)

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <NotificationBell />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Overview of your CRM application
          </p>
        </div>

        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <div className='space-y-6'>
            <SummarySection stats={data} />
            <TasksSection
              stats={data.tasks}
              dateRange={tasksDateRange}
              onDateRangeChange={setTasksDateRange}
            />
            <SitesSection
              stats={data.sites}
              dateRange={sitesDateRange}
              onDateRangeChange={setSitesDateRange}
            />
            <LeadsSection
              stats={data.leads}
              dateRange={leadsDateRange}
              onDateRangeChange={setLeadsDateRange}
            />
            <CompaniesSection
              stats={data.companies}
              dateRange={companiesDateRange}
              onDateRangeChange={setCompaniesDateRange}
            />
          </div>
        )}
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
]
