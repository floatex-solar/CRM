import { z } from 'zod'

// File schema for display/handling (matches backend IReportFile)
export const reportFileSchema = z.object({
  originalName: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number(),
})

// Input schema for the form
export const siteInputSchema = z.object({
  name: z.string().min(1, 'Site name is required.'),
  owner: z.string().min(1, 'Owner is required.'), // Company ID
  country: z.string().min(1, 'Country is required.'),

  locationLat: z.coerce.number().min(-90).max(90),
  locationLng: z.coerce.number().min(-180).max(180),

  typeOfWaterBody: z.string().min(1, 'Type of water body is required.'),
  useOfWater: z.string().min(1, 'Use of water is required.'),
  waterArea: z.coerce.number().min(0, 'Water area must be positive.'),
  windSpeed: z.coerce.number().min(0, 'Wind speed must be positive.'),

  maxWaterLevel: z.string().min(1, 'Max water level is required.'),
  minDrawDownLevel: z.string().min(1, 'Min draw down level is required.'),
  fullReservoirLevel: z.string().min(1, 'Full reservoir level is required.'),
  waveHeight: z.string().min(1, 'Wave height is required.'),
  waterCurrent: z.string().min(1, 'Water current is required.'),

  // Boolean flags
  bathymetryAvailable: z.boolean().default(false),
  geotechnicalReportAvailable: z.boolean().default(false),
  pfrAvailable: z.boolean().default(false),
  dprAvailable: z.boolean().default(false),
  possibilityForPondGettingEmpty: z.boolean().default(false),

  // File objects (for uploads, we'll store FileList or File locally before sending)
  // We use z.any() because React Hook Form uses FileList or similar which is hard to strict type with Zod client-side initially
  bathymetryFile: z.any().optional(),
  geotechnicalFile: z.any().optional(),
  pfrFile: z.any().optional(),
  dprFile: z.any().optional(),
})

export type SiteInput = z.infer<typeof siteInputSchema>

// Response schema
export const siteSchema = siteInputSchema.extend({
  _id: z.string(),
  owner: z
    .object({
      _id: z.string(),
      name: z.string(),
    })
    .or(z.string()), // Populated or ID

  // Files come back as objects
  bathymetryFile: reportFileSchema.optional(),
  geotechnicalFile: reportFileSchema.optional(),
  pfrFile: reportFileSchema.optional(),
  dprFile: reportFileSchema.optional(),

  createdAt: z.string().optional(), // Date string
  updatedAt: z.string().optional(),
})

export type Site = z.infer<typeof siteSchema>

export const sitesListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number(),
  totalCount: z.number(),
  data: z.object({
    sites: z.array(siteSchema),
  }),
})

export type SitesListResponse = z.infer<typeof sitesListResponseSchema>
