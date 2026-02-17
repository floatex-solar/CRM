import { z } from 'zod'

// Address subdocument
export const addressSchema = z.object({
  country: z.string().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  addressLine: z.string().optional(),
  postalCode: z.string().optional(),
})
export type Address = z.infer<typeof addressSchema>

// Contact subdocument
export const contactSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  role: z.enum(['primary', 'secondary', 'other']).optional().default('other'),
})
export type Contact = z.infer<typeof contactSchema>

// Agreement subdocument
export const agreementStatusSchema = z.enum([
  'Not Sent',
  'Sent',
  'Signed',
  'Expired',
])
export const agreementSchema = z.object({
  status: agreementStatusSchema.optional().default('Not Sent'),
  signedDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  documentUrl: z.string().optional(),
})
export type Agreement = z.infer<typeof agreementSchema>

// Company schema
export const companySchema = z.object({
  _id: z.string(),
  name: z.string(),
  industry: z.string().optional(),
  categories: z.array(z.string()).default([]),
  website: z.string().optional(),
  address: addressSchema.optional(),
  contacts: z.array(contactSchema).default([]),
  introMailSent: z.boolean().optional(),
  introMailDate: z.coerce.date().optional(),
  nda: agreementSchema.optional(),
  mou: agreementSchema.optional(),
  leadStatus: z.string().optional(),
  relationshipType: z.string().optional(),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  reference: z.string().optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
  lastContactedDate: z.coerce.date().optional(),
  nextFollowUpDate: z.coerce.date().optional(),
  notes: z.array(z.string()).default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type Company = z.infer<typeof companySchema>

// API response types
export const companiesListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number(),
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

// Form input types (for create/update)
export const companyInputSchema = z.object({
  name: z.string().min(1, 'Company name is required.'),
  industry: z.string().optional(),
  categories: z.string().optional(),
  website: z.string().optional(),
  address: addressSchema.optional(),
  contacts: z
    .array(
      z.object({
        name: z.string().min(1, 'Contact name is required.'),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        designation: z.string().optional(),
        role: z
          .enum(['primary', 'secondary', 'other'])
          .optional()
          .default('other'),
      })
    )
    .default([]),
  leadStatus: z.string().optional(),
  relationshipType: z.string().optional(),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.array(z.string()).default([]),
})
export type CompanyInput = z.infer<typeof companyInputSchema>
