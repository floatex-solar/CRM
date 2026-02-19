import { Command } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

/** Displays the logged-in user's name and role in the sidebar header. */
export function TeamSwitcher() {
  const user = useAuthStore((s) => s.auth.user)
  const displayName = user?.name || 'Floatex CRM'
  const role = user?.role?.[0] ?? 'user'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <Command className='size-4' />
          </div>
          <div className='grid flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>{displayName}</span>
            <span className='truncate text-xs capitalize'>{role}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
