export interface CompanyStats {
  total: number
  byLeadStatus: Record<string, number>
  byPriority: Record<string, number>
  byLeadSource: Record<string, number>
  ndaSigned: number
  ndaPending: number
  ndaExpired: number
  mouSigned: number
  mouPending: number
  mouExpired: number
  emailSent: number
  emailPending: number
}

export interface LeadStats {
  total: number
  byPriority: Record<string, number>
}

export interface SiteStats {
  total: number
  pondGettingEmpty: number
  bathymetryNotAvailable: number
  dprNotAvailable: number
  geotechnicalNotAvailable: number
  pfrNotAvailable: number
}

export interface TaskStats {
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
}

export interface DashboardStats {
  companies: CompanyStats
  leads: LeadStats
  sites: SiteStats
  tasks: TaskStats
}
