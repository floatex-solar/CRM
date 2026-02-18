export const priorities = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
] as const

export const anchoringOptions = [
  { value: 'Bank Anchoring', label: 'Bank Anchoring' },
  { value: 'Bottom Anchoring', label: 'Bottom Anchoring' },
  { value: 'Hybrid Anchoring', label: 'Hybrid Anchoring' },
] as const

export const typeOfAnchoringOptions = [
  { value: 'Dead Weight', label: 'Dead Weight' },
  { value: 'Screw Pile', label: 'Screw Pile' },
  { value: 'Drive Pile', label: 'Drive Pile' },
] as const

export const typeOfMooringOptions = [
  { value: 'Catenary', label: 'Catenary' },
  { value: 'Taut', label: 'Taut' },
  { value: 'Elastic', label: 'Elastic' },
] as const

export const methodOfMooringOptions = [
  { value: 'HMPE Rope', label: 'HMPE Rope' },
  { value: 'Steel Rope', label: 'Steel Rope' },
] as const
