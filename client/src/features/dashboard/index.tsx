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

export function Dashboard() {
  const { data, isLoading } = useDashboardStatsQuery()

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
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Overview of your CRM application
          </p>
        </div>

        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <div className='space-y-8'>
            <SummarySection stats={data} />
            <TasksSection stats={data.tasks} />
            <SitesSection stats={data.sites} />
            <LeadsSection stats={data.leads} />
            <CompaniesSection stats={data.companies} />
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
