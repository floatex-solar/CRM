import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LeadsDialogs } from './components/leads-dialogs'
import { LeadsPrimaryButtons } from './components/leads-primary-buttons'
import { LeadsProvider } from './components/leads-provider'
import { LeadsTable } from './components/leads-table'

function LeadsContent() {
  return (
    <LeadsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Leads</h2>
            <p className='text-muted-foreground'>
              Manage your project leads here.
            </p>
          </div>
          <LeadsPrimaryButtons />
        </div>
        <LeadsTable />
      </Main>

      <LeadsDialogs />
    </LeadsProvider>
  )
}

export function Leads() {
  return <LeadsContent />
}
