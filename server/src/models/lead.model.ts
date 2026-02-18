import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import type { ILead } from "../types/lead.types.js";

/* ======================================================
   Zod Schemas
====================================================== */

const optionalDate = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.coerce.date().optional(),
);

const designConfigurationSchemaZod = z.object({
  version: z.number().int().positive().optional(),
  moduleCapacity: z.string().min(1, "Module capacity is required"),
  moduleDimension: z.string().min(1, "Module dimension is required"),
  inverterCapacity: z.string().min(1, "Inverter capacity is required"),
  inverterMake: z.string().min(1, "Inverter make is required"),
  configuration: z.string().min(1, "Configuration is required"),
  anchoring: z.enum(["Bank Anchoring", "Bottom Anchoring", "Hybrid Anchoring"]),
  typeOfAnchoring: z.enum(["Dead Weight", "Screw Pile", "Drive Pile"]),
});

const mooringTechniqueSchemaZod = z.object({
  typeOfMooring: z.enum(["Catenary", "Taut", "Elastic"]),
  methodOfMooring: z.enum(["HMPE Rope", "Steel Rope"]),
});

const offeredPriceSchemaZod = z.object({
  floatingSystem: z.coerce.number().min(0, "Required"),
  anchoringMooringSystem: z.coerce.number().min(0, "Required"),
  supervision: z.coerce.number().min(0, "Required"),
  dcInstallation: z.coerce.number().min(0, "Required"),
  total: z.coerce.number().optional(),
});

const baseLeadSchemaZod = z.object({
  jobCode: z.string().min(1, "Job code is required"),
  priority: z.enum(["High", "Medium", "Low"]),

  projectName: z.string().min(1, "Project name is required"),
  projectLocation: z.string().min(1, "Project location is required"),

  client: z.string().min(1, "Client is required"),
  capacity: z.string().min(1, "Capacity is required"),
  developer: z.string().min(1, "Developer is required"),
  consultant: z.string().min(1, "Consultant is required"),
  endCustomer: z.string().min(1, "End customer is required"),
  country: z.string().min(1, "Country is required"),

  designConfigurations: z.array(designConfigurationSchemaZod).default([]),

  mooringTechnique: mooringTechniqueSchemaZod,

  currency: z.string().min(1, "Currency is required"),
  offeredPrice: offeredPriceSchemaZod,

  responsiblePerson: z.string().min(1, "Responsible person is required"),
});

export const leadSchemaZod = baseLeadSchemaZod;

/** For PATCH — partial() so every field is optional */
export const leadUpdateSchemaZod = baseLeadSchemaZod.partial();

/** For adding a design version to an existing lead */
export const designConfigurationInputSchemaZod = designConfigurationSchemaZod;

export type LeadInput = z.infer<typeof leadSchemaZod>;

/* ======================================================
   Mongoose Sub-Schemas
====================================================== */

const DesignConfigurationSchema = new Schema(
  {
    version: { type: Number, required: true },
    moduleCapacity: { type: String, required: true },
    moduleDimension: { type: String, required: true },
    inverterCapacity: { type: String, required: true },
    inverterMake: { type: String, required: true },
    configuration: { type: String, required: true },
    anchoring: {
      type: String,
      enum: ["Bank Anchoring", "Bottom Anchoring", "Hybrid Anchoring"],
      required: true,
    },
    typeOfAnchoring: {
      type: String,
      enum: ["Dead Weight", "Screw Pile", "Drive Pile"],
      required: true,
    },
  },
  { _id: true },
);

const MooringTechniqueSchema = new Schema(
  {
    typeOfMooring: {
      type: String,
      enum: ["Catenary", "Taut", "Elastic"],
      required: true,
    },
    methodOfMooring: {
      type: String,
      enum: ["HMPE Rope", "Steel Rope"],
      required: true,
    },
  },
  { _id: false },
);

const OfferedPriceSchema = new Schema(
  {
    floatingSystem: { type: Number, required: true },
    anchoringMooringSystem: { type: Number, required: true },
    supervision: { type: Number, required: true },
    dcInstallation: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

/* ======================================================
   Lead Document Interface
====================================================== */

export interface ILeadDocument extends ILead, Document {}

/* ======================================================
   Lead Schema
====================================================== */

const LeadSchema = new Schema<ILeadDocument>(
  {
    jobCode: { type: String, trim: true, index: true, required: true },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
      index: true,
      required: true,
    },

    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      index: true,
    },
    projectLocation: { type: String, required: true },

    client: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    capacity: { type: String, required: true },
    developer: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    consultant: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    endCustomer: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    country: { type: String, required: true },

    designConfigurations: {
      type: [DesignConfigurationSchema],
      default: [],
    },

    mooringTechnique: { type: MooringTechniqueSchema, required: true },

    currency: { type: String, required: true },
    offeredPrice: { type: OfferedPriceSchema, required: true },

    responsiblePerson: { type: String, required: true },
  },
  { timestamps: true },
);

/* ======================================================
   Pre-save: auto-compute offered price total
====================================================== */

LeadSchema.pre("save", function () {
  if (this.offeredPrice) {
    const p = this.offeredPrice;
    p.total =
      (p.floatingSystem ?? 0) +
      (p.anchoringMooringSystem ?? 0) +
      (p.supervision ?? 0) +
      (p.dcInstallation ?? 0);
  }
});

/* ======================================================
   Pre-save: auto-set version for new design configurations
====================================================== */

LeadSchema.pre("save", function () {
  if (this.designConfigurations && this.designConfigurations.length > 0) {
    this.designConfigurations.forEach((dc, idx) => {
      if (!dc.version) {
        dc.version = idx + 1;
      }
    });
  }
});

/* ======================================================
   Indexes
====================================================== */

LeadSchema.index({ projectName: "text" });

/* ======================================================
   Model
====================================================== */

export const LeadModel: Model<ILeadDocument> =
  mongoose.models.Lead || mongoose.model<ILeadDocument>("Lead", LeadSchema);
