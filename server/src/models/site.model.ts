import { Schema, model } from "mongoose";
import { z } from "zod";
import { ISite } from "../types/site.types.js";

/* ======================================================
   Zod Schemas
====================================================== */

const reportFileSchemaZod = z.object({
  originalName: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number(),
});

export const siteSchemaZod = z.object({
  name: z.string().min(1, "Site name is required"),
  owner: z.string().min(1, "Owner is required"), // ObjectId as string
  country: z.string().min(1, "Country is required"),

  locationLat: z.coerce.number(),
  locationLng: z.coerce.number(),

  typeOfWaterBody: z.string().min(1, "Type of water body is required"),
  useOfWater: z.string().min(1, "Use of water is required"),
  waterArea: z.coerce.number().min(0, "Water area must be positive"),
  windSpeed: z.coerce.number().min(0, "Wind speed must be positive"),

  maxWaterLevel: z.string().optional().default(""),
  minDrawDownLevel: z.string().optional().default(""),
  fullReservoirLevel: z.string().optional().default(""),
  waterLevelVariation: z.string().optional().default(""),
  fetchOfReservoir: z.string().optional().default(""),
  waveHeight: z.string().optional().default(""),
  waterCurrent: z.string().optional().default(""),

  bathymetryAvailable: z.coerce.boolean(),
  // Files are handled separately via Multer, but we can validate structure if passed json
  bathymetryFile: reportFileSchemaZod.optional(),

  geotechnicalReportAvailable: z.coerce.boolean(),
  geotechnicalFile: reportFileSchemaZod.optional(),

  pfrAvailable: z.coerce.boolean(),
  pfrFile: reportFileSchemaZod.optional(),

  dprAvailable: z.coerce.boolean(),
  dprFile: reportFileSchemaZod.optional(),

  possibilityForPondGettingEmpty: z.coerce.boolean(),
});

/* ======================================================
   Mongoose Schema
====================================================== */

const reportFileSchema = new Schema(
  {
    originalName: String,
    encoding: String,
    mimetype: String,
    filename: String,
    path: String,
    size: Number,
  },
  { _id: false },
);

const SiteSchema = new Schema<ISite>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    country: { type: String, required: true },

    locationLat: { type: Number, required: true },
    locationLng: { type: Number, required: true },

    typeOfWaterBody: { type: String, required: true },
    useOfWater: { type: String, required: true },
    waterArea: { type: Number, required: true },
    windSpeed: { type: Number, required: true },

    maxWaterLevel: { type: String, default: "" },
    minDrawDownLevel: { type: String, default: "" },
    fullReservoirLevel: { type: String, default: "" },
    waterLevelVariation: { type: String, default: "" },
    fetchOfReservoir: { type: String, default: "" },
    waveHeight: { type: String, default: "" },
    waterCurrent: { type: String, default: "" },

    bathymetryAvailable: { type: Boolean, default: false },
    bathymetryFile: { type: reportFileSchema },

    geotechnicalReportAvailable: { type: Boolean, default: false },
    geotechnicalFile: { type: reportFileSchema },

    pfrAvailable: { type: Boolean, default: false },
    pfrFile: { type: reportFileSchema },

    dprAvailable: { type: Boolean, default: false },
    dprFile: { type: reportFileSchema },

    possibilityForPondGettingEmpty: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SiteModel = model<ISite>("Site", SiteSchema);
