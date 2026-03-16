import {
  Droplets,
  Waves,
  FileX,
  Mountain,
  ClipboardX,
} from 'lucide-react'
import type { SiteStats } from '../types'
import { StatCard } from './stat-card'

interface SitesSectionProps {
  stats: SiteStats
}

export function SitesSection({ stats }: SitesSectionProps) {
  return (
    <section className='space-y-2'>
      <h2 className='text-lg font-semibold'>Sites Overview</h2>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        <StatCard
          title='Pond Getting Empty'
          value={stats.pondGettingEmpty}
          icon={Droplets}
          to='/sites'
          search={{ possibilityForPondGettingEmpty: 'true' }}
          description='Possibility of pond getting empty'
        />
        <StatCard
          title='Bathymetry N/A'
          value={stats.bathymetryNotAvailable}
          icon={Waves}
          to='/sites'
          search={{ bathymetryAvailable: 'false' }}
          description='Bathymetry survey data not available'
        />
        <StatCard
          title='DPR N/A'
          value={stats.dprNotAvailable}
          icon={FileX}
          to='/sites'
          search={{ dprAvailable: 'false' }}
          description='DPR input data not available'
        />
        <StatCard
          title='Geotechnical N/A'
          value={stats.geotechnicalNotAvailable}
          icon={Mountain}
          to='/sites'
          search={{ geotechnicalReportAvailable: 'false' }}
          description='Geotechnical report not available'
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
    </section>
  )
}
