import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILookup {
  type: string; // 'INDUSTRY', 'COMPANY_TYPE', 'DESIGNATION', 'LEAD_SOURCE', 'WHO_BROUGHT'
  label: string;
  value: string;
}

export interface ILookupDocument extends ILookup, Document {}

const LookupSchema = new Schema<ILookupDocument>(
  {
    type: { type: String, required: true, index: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { timestamps: true },
);

LookupSchema.index({ type: 1, value: 1 }, { unique: true });

export const LookupModel: Model<ILookupDocument> =
  mongoose.models.Lookup ||
  mongoose.model<ILookupDocument>("Lookup", LookupSchema);
