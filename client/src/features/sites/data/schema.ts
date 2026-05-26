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

  locationLat: z.coerce.number(),
  locationLng: z.coerce.number(),

  typeOfWaterBody: z.string().min(1, 'Type of water body is required.'),
  useOfWater: z.string().min(1, 'Use of water is required.'),
  waterArea: z.coerce.number().min(0, 'Water area must be positive.'),
  windSpeed: z.coerce.number().min(0, 'Wind speed must be positive.'),

  maxWaterLevel: z.string().optional().default(''),
  minDrawDownLevel: z.string().optional().default(''),
  fullReservoirLevel: z.string().optional().default(''),
  waterLevelVariation: z.string().optional().default(''),
  fetchOfReservoir: z.string().optional().default(''),
  waveHeight: z.string().optional().default(''),
  waterCurrent: z.string().optional().default(''),

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
