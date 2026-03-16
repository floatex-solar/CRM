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
import type { CompanyStats } from '../types'
import { StatCard } from './stat-card'

interface CompaniesSectionProps {
  stats: CompanyStats
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

export function CompaniesSection({ stats }: CompaniesSectionProps) {
  const leadSourceEntries = Object.entries(stats.byLeadSource)

  return (
    <section className='space-y-4'>
      <h2 className='text-lg font-semibold'>Companies Overview</h2>

      {/* NDA Status */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          NDA Status
        </h3>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <StatCard
            title='NDA Signed'
            value={stats.ndaSigned}
            icon={FileCheck}
            to='/companies'
            search={{ ndaStatus: ['Signed'] }}
          />
          <StatCard
            title='NDA Pending'
            value={stats.ndaPending}
            icon={FileClock}
            to='/companies'
            search={{ ndaStatus: ['Not Sent', 'Sent'] }}
            description='Not Sent + Sent'
          />
          <StatCard
            title='NDA Expired'
            value={stats.ndaExpired}
            icon={FileWarning}
            to='/companies'
            search={{ ndaStatus: ['Expired'] }}
          />
        </div>
      </div>

      {/* MOU Status */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          MOU Status
        </h3>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <StatCard
            title='MOU Signed'
            value={stats.mouSigned}
            icon={FileCheck}
            to='/companies'
            search={{ mouStatus: ['Signed'] }}
          />
          <StatCard
            title='MOU Pending'
            value={stats.mouPending}
            icon={FileClock}
            to='/companies'
            search={{ mouStatus: ['Not Sent', 'Sent'] }}
            description='Not Sent + Sent'
          />
          <StatCard
            title='MOU Expired'
            value={stats.mouExpired}
            icon={FileWarning}
            to='/companies'
            search={{ mouStatus: ['Expired'] }}
          />
        </div>
      </div>

      {/* Email Status */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          Email Status
        </h3>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <StatCard
            title='Email Sent'
            value={stats.emailSent}
            icon={Mail}
            to='/companies'
            search={{ emailSent: 'Yes' }}
          />
          <StatCard
            title='Email Pending'
            value={stats.emailPending}
            icon={MailX}
            to='/companies'
            search={{ emailSent: 'No' }}
          />
        </div>
      </div>

      {/* Lead Status */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          By Lead Status
        </h3>
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
      </div>

      {/* Priority */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          By Priority
        </h3>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Object.entries(PRIORITY_ICONS).map(([priority, icon]) => (
            <StatCard
              key={priority}
              title={priority}
              value={stats.byPriority[priority] ?? 0}
              icon={icon}
              to='/companies'
              search={{ priority: [priority] }}
            />
          ))}
        </div>
      </div>

      {/* Lead Source (dynamic) */}
      {leadSourceEntries.length > 0 && (
        <div className='space-y-2'>
          <h3 className='text-sm font-medium text-muted-foreground'>
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
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
