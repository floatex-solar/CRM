export const categories = [
  { value: 'Developer', label: 'Developer' },
  { value: 'EPC', label: 'EPC' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'Offtaker', label: 'Offtaker' },
  { value: 'End Customer', label: 'End Customer' },
  { value: 'Subvendor', label: 'Subvendor' },
  { value: 'Supplier', label: 'Supplier' },
  { value: 'Media', label: 'Media' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Distributor', label: 'Distributor' },
] as const

export const leadStatuses = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'In Discussion', label: 'In Discussion' },
  { value: 'Proposal Sent', label: 'Proposal Sent' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Converted', label: 'Converted' },
  { value: 'Dropped', label: 'Dropped' },
  { value: 'On Hold', label: 'On Hold' },
] as const

export const priorities = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'Strategic', label: 'Strategic' },
] as const

export const relationshipTypes = [
  { value: 'Cold', label: 'Cold' },
  { value: 'Warm', label: 'Warm' },
  { value: 'Hot', label: 'Hot' },
  { value: 'Existing Client', label: 'Existing Client' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Vendor', label: 'Vendor' },
] as const

export const contactRoles = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'other', label: 'Other' },
] as const

export const industries = [{ value: 'IT', label: 'IT' }] as const

export const countries = ['India'] as const

export const states = ['Delhi', 'Uttar Pradesh'] as const

export const cities = ['New Delhi', 'Noida'] as const

export const regions = ['Asia', 'Europe'] as const

// ndaStatuses,
// mouStatuses,
// whoBroughtOptions,

export const ndaStatuses = [{ value: 'Signed', label: 'Signed' }] as const
export const mouStatuses = [{ value: 'Signed', label: 'Signed' }] as const
export const whoBroughtOptions = [{ value: 'Rahul', label: 'Rahul' }] as const
