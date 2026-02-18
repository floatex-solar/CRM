import { z } from 'zod'

// Design Configuration sub-document
export const designConfigurationSchema = z.object({
  _id: z.string().optional(),
  version: z.number().optional(),
  moduleCapacity: z.string().min(1, 'Module capacity is required.'),
  moduleDimension: z.string().min(1, 'Module dimension is required.'),
  inverterCapacity: z.string().min(1, 'Inverter capacity is required.'),
  inverterMake: z.string().min(1, 'Inverter make is required.'),
  configuration: z.string().min(1, 'Configuration is required.'),
  anchoring: z.enum(['Bank Anchoring', 'Bottom Anchoring', 'Hybrid Anchoring']),
  typeOfAnchoring: z.enum(['Dead Weight', 'Screw Pile', 'Drive Pile']),
})
export type DesignConfiguration = z.infer<typeof designConfigurationSchema>

// Mooring Technique sub-document
export const mooringTechniqueSchema = z.object({
  typeOfMooring: z.enum(['Catenary', 'Taut', 'Elastic']),
  methodOfMooring: z.enum(['HMPE Rope', 'Steel Rope']),
})
export type MooringTechnique = z.infer<typeof mooringTechniqueSchema>

// Offered Price sub-document
export const offeredPriceSchema = z.object({
  floatingSystem: z.coerce.number().min(0, 'Required'),
  anchoringMooringSystem: z.coerce.number().min(0, 'Required'),
  supervision: z.coerce.number().min(0, 'Required'),
  dcInstallation: z.coerce.number().min(0, 'Required'),
  total: z.coerce.number().optional(), // Auto-calculated
})
export type OfferedPrice = z.infer<typeof offeredPriceSchema>

// Populated company ref
const populatedCompanyRef = z
  .union([
    z.string(),
    z.object({
      _id: z.string(),
      name: z.string(),
    }),
  ])
  .optional()
  .nullable()

// Lead schema (for data received from API)
export const leadSchema = z.object({
  _id: z.string(),
  jobCode: z.string().optional(),
  priority: z.string().optional(),

  projectName: z.string(),
  projectLocation: z.string().optional(),

  client: populatedCompanyRef,
  capacity: z.string().optional(),
  developer: populatedCompanyRef,
  consultant: populatedCompanyRef,
  endCustomer: populatedCompanyRef,
  country: z.string().optional(),

  designConfigurations: z.array(designConfigurationSchema).default([]),

  mooringTechnique: mooringTechniqueSchema.optional(),

  currency: z.string().optional(),
  offeredPrice: offeredPriceSchema.optional(),

  responsiblePerson: z.string().optional(),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type Lead = z.infer<typeof leadSchema>

// Form input types (for create/update)
export const leadInputSchema = z.object({
  jobCode: z.string().min(1, 'Job code is required.'),
  priority: z.enum(['High', 'Medium', 'Low']),

  projectName: z.string().min(1, 'Project name is required.'),
  projectLocation: z.string().min(1, 'Project location is required.'),

  client: z.string().min(1, 'Client is required.'),
  capacity: z.string().min(1, 'Capacity is required.'),
  developer: z.string().min(1, 'Developer is required.'),
  consultant: z.string().min(1, 'Consultant is required.'),
  endCustomer: z.string().min(1, 'End customer is required.'),
  country: z.string().min(1, 'Country is required.'),

  designConfigurations: z.array(designConfigurationSchema).default([]),

  mooringTechnique: mooringTechniqueSchema,

  currency: z.string().min(1, 'Currency is required.'),
  offeredPrice: offeredPriceSchema,

  responsiblePerson: z.string().min(1, 'Responsible person is required.'),
})
export type LeadInput = z.infer<typeof leadInputSchema>

// API response types
export const leadsListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number(),
  totalCount: z.number(),
  data: z.object({
    leads: z.array(leadSchema),
  }),
})
export type LeadsListResponse = z.infer<typeof leadsListResponseSchema>

export const leadResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    lead: leadSchema,
  }),
})
export type LeadResponse = z.infer<typeof leadResponseSchema>
