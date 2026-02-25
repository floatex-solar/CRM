import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/features/notifications/notification-bell'
import { SitesDialogs } from './components/sites-dialogs'
import { SitesPrimaryButtons } from './components/sites-primary-buttons'
import { SitesProvider } from './components/sites-provider'
import { SitesTable } from './components/sites-table'

function SitesContent() {
  return (
    <SitesProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <NotificationBell />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Sites</h2>
            <p className='text-muted-foreground'>
              Manage your project sites and technical characteristics.
            </p>
          </div>
          <SitesPrimaryButtons />
        </div>
        <SitesTable />
      </Main>

      <SitesDialogs />
    </SitesProvider>
  )
}

export function Sites() {
  return <SitesContent />
}
