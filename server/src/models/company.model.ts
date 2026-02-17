import mongoose, { Schema, Document, Model } from "mongoose";
import { ICompany, IContact, IAgreement } from "../types/company.types.js";
import { z } from "zod";

/* ======================================================
   Contact Role Enum
====================================================== */

const contactRoleEnum = z.enum(["primary", "secondary", "other"]);

/* ======================================================
   Contact Schema
====================================================== */

export const contactSchemaZod = z.object({
  name: z.string().min(1, "Contact name required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  role: contactRoleEnum.optional().default("other"),
});

/* ======================================================
   Agreement Schema
====================================================== */

const agreementSchemaZod = z.object({
  status: z.enum(["Not Sent", "Sent", "Signed", "Expired"]).default("Not Sent"),
  signedDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  documentUrl: z.string().optional(),
});

/* ======================================================
   Address Schema
====================================================== */

const addressSchemaZod = z.object({
  country: z.string().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  addressLine: z.string().optional(),
  postalCode: z.string().optional(),
});

/* ======================================================
   Company Schema
   Note: Base schema has no refinements so .partial() works (Zod v4)
====================================================== */

const baseCompanySchemaZod = z.object({
  name: z.string().min(1, "Company name required"),
  industry: z.string().optional(),
  categories: z.array(z.string()).default([]),
  website: z.string().optional(),

  address: addressSchemaZod.optional(),

  contacts: z.array(contactSchemaZod).default([]),

  introMailSent: z.boolean().optional(),
  introMailDate: z.coerce.date().optional(),

  nda: agreementSchemaZod.optional(),
  mou: agreementSchemaZod.optional(),

  leadStatus: z.string().optional(),
  relationshipType: z.string().optional(),
  priority: z.string().optional(),

  leadSource: z.string().optional(),
  reference: z.string().optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),

  lastContactedDate: z.coerce.date().optional(),
  nextFollowUpDate: z.coerce.date().optional(),

  notes: z.array(z.string()).optional(),
});

const contactsRefinement = (
  data: { contacts?: Array<{ role?: string }> },
  ctx: {
    addIssue: (issue: {
      code: "custom";
      message: string;
      path: (string | number)[];
    }) => void;
  }
) => {
  let primary = 0;
  let secondary = 0;
  data.contacts?.forEach((c, index) => {
    if (c.role === "primary") primary++;
    if (c.role === "secondary") secondary++;
    if (primary > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Only one primary contact allowed",
        path: ["contacts", index, "role"],
      });
    }
    if (secondary > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Only one secondary contact allowed",
        path: ["contacts", index, "role"],
      });
    }
  });
};

export const companySchemaZod =
  baseCompanySchemaZod.superRefine(contactsRefinement);

/** For PATCH - partial() must be applied before superRefine (Zod v4) */
export const companyUpdateSchemaZod = baseCompanySchemaZod
  .partial()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .superRefine(contactsRefinement as any);

export type CompanyInput = z.infer<typeof companySchemaZod>;

/* ======================================================
   Contact Sub Schema
====================================================== */

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: String,
  phone: String,
  designation: String,

  role: {
    type: String,
    enum: ["primary", "secondary", "other"],
    default: "other",
  },
});

/* ======================================================
   Agreement Sub Schema
====================================================== */

const AgreementSchema = new Schema<IAgreement>(
  {
    status: {
      type: String,
      enum: ["Not Sent", "Sent", "Signed", "Expired"],
      default: "Not Sent",
    },
    signedDate: Date,
    expiryDate: Date,
    documentUrl: String,
  },
  { _id: false }
);

/* ======================================================
   Address Schema
====================================================== */

const AddressSchema = new Schema(
  {
    country: String,
    region: String,
    state: String,
    city: String,
    addressLine: String,
    postalCode: String,
  },
  { _id: false }
);

export interface ICompanyDocument extends ICompany, Document {}

/* ======================================================
   Company Schema
====================================================== */

const CompanySchema = new Schema<ICompanyDocument>(
  {
    name: {
      type: String,
      required: [true, "Company name required"],
      trim: true,
      index: true,
    },

    industry: String,

    categories: [
      {
        type: String,
        enum: [
          "Developer",
          "EPC",
          "Consultant",
          "Offtaker",
          "End Customer",
          "Subvendor",
          "Supplier",
          "Media",
          "Partner",
          "Distributor",
        ],
      },
    ],

    website: String,
    address: AddressSchema,

    contacts: {
      type: [ContactSchema],
      default: [],
    },

    introMailSent: { type: Boolean, default: false },
    introMailDate: Date,

    nda: AgreementSchema,
    mou: AgreementSchema,

    leadStatus: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "In Discussion",
        "Proposal Sent",
        "Negotiation",
        "Converted",
        "Dropped",
        "On Hold",
      ],
      default: "New",
      index: true,
    },

    relationshipType: {
      type: String,
      enum: ["Cold", "Warm", "Hot", "Existing Client", "Partner", "Vendor"],
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low", "Strategic"],
      default: "Medium",
      index: true,
    },

    leadSource: String,
    reference: String,
    assignedTo: { type: String, index: true },
    createdBy: String,

    lastContactedDate: Date,
    nextFollowUpDate: { type: Date, index: true },

    notes: [String],
  },
  { timestamps: true }
);

/* ======================================================
   VALIDATION: Only 1 primary & 1 secondary
====================================================== */

CompanySchema.pre("save", async function () {
  const company = this as ICompanyDocument;

  let primaryCount = 0;
  let secondaryCount = 0;

  company.contacts?.forEach((c) => {
    if (c.role === "primary") primaryCount++;
    if (c.role === "secondary") secondaryCount++;
  });

  if (primaryCount > 1) {
    throw new Error("Only one primary contact allowed");
  }

  if (secondaryCount > 1) {
    throw new Error("Only one secondary contact allowed");
  }
});

/* ======================================================
   Indexes
====================================================== */

CompanySchema.index({ name: "text" });
CompanySchema.index({ "contacts.name": "text" });

/* ======================================================
   Model
====================================================== */

export const CompanyModel: Model<ICompanyDocument> =
  mongoose.models.Company ||
  mongoose.model<ICompanyDocument>("Company", CompanySchema);
