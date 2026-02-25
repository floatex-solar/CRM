import { z } from 'zod'

// Address subdocument
export const addressSchema = z.object({
  streetAddress: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  subRegion: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
})
export type Address = z.infer<typeof addressSchema>

// Contact subdocument
export const contactSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Contact name is required.'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  designation: z.string().optional(),
  role: z.enum(['primary', 'secondary', 'other']).optional().default('other'),
})
export type Contact = z.infer<typeof contactSchema>

// Company schema
export const companySchema = z.object({
  _id: z.string(),
  name: z.string(),
  typeOfCompany: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  address: addressSchema.optional(),
  contacts: z.array(contactSchema).default([]),
  ndaStatus: z.string().optional(),
  ndaSignedDate: z.coerce.date().optional(),
  ndaExpiryDate: z.coerce.date().optional(),
  ndaFileUrl: z.string().optional(),
  mouStatus: z.string().optional(),
  mouSignedDate: z.coerce.date().optional(),
  mouExpiryDate: z.coerce.date().optional(),
  mouFileUrl: z.string().optional(),
  emailSent: z.string().optional(),
  emailSentDate: z.coerce.date().optional(),
  leadStatus: z.string().optional(),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  whoBrought: z.string().optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
  lastContactedDate: z.coerce.date().optional(),
  nextFollowUpDate: z.coerce.date().optional(),
  notes: z.array(z.string()).default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type Company = z.infer<typeof companySchema>

// Preprocess helper: converts empty strings to undefined so optional date fields
// don't fail server-side z.coerce.date() validation.
const optionalDateString = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.string().optional()
)

// Form input types (for create/update)
export const companyInputSchema = z.object({
  name: z.string().min(1, 'Company name is required.'),
  typeOfCompany: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  address: addressSchema.optional(),
  contacts: z.array(contactSchema).min(1, 'At least one contact is required.'),
  leadStatus: z.string().optional(),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  whoBrought: z.string().optional(),
  assignedTo: z.string().optional(),
  ndaStatus: z.enum(['Not Sent', 'Sent', 'Signed', 'Expired']).optional(),
  ndaSignedDate: optionalDateString,
  ndaExpiryDate: optionalDateString,
  ndaFileUrl: z.string().optional(),
  ndaFile: z.any().optional(),
  mouStatus: z.enum(['Not Sent', 'Sent', 'Signed', 'Expired']).optional(),
  mouSignedDate: optionalDateString,
  mouExpiryDate: optionalDateString,
  mouFileUrl: z.string().optional(),
  mouFile: z.any().optional(),
  emailSent: z.enum(['Yes', 'No']).optional(),
  emailSentDate: optionalDateString,
  notes: z.array(z.string()).default([]),
})
export type CompanyInput = z.infer<typeof companyInputSchema>

// API response types
export const companiesListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number(),
  totalCount: z.number(),
  data: z.object({
    companies: z.array(companySchema),
  }),
})
export type CompaniesListResponse = z.infer<typeof companiesListResponseSchema>

export const companyResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    company: companySchema,
  }),
})
export type CompanyResponse = z.infer<typeof companyResponseSchema>
