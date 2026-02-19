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

  maxWaterLevel: z.string().min(1, "Max water level is required"),
  minDrawDownLevel: z.string().min(1, "Min draw down level is required"),
  fullReservoirLevel: z.string().min(1, "Full reservoir level is required"),
  waveHeight: z.string().min(1, "Wave height is required"),
  waterCurrent: z.string().min(1, "Water current is required"),

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

    maxWaterLevel: { type: String, required: true },
    minDrawDownLevel: { type: String, required: true },
    fullReservoirLevel: { type: String, required: true },
    waveHeight: { type: String, required: true },
    waterCurrent: { type: String, required: true },

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
