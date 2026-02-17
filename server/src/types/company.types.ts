export type CompanyCategory =
  | "Developer"
  | "EPC"
  | "Consultant"
  | "Offtaker"
  | "End Customer"
  | "Subvendor"
  | "Supplier"
  | "Media"
  | "Partner"
  | "Distributor";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "In Discussion"
  | "Proposal Sent"
  | "Negotiation"
  | "Converted"
  | "Dropped"
  | "On Hold";

export type Priority = "High" | "Medium" | "Low" | "Strategic";

export type RelationshipType =
  | "Cold"
  | "Warm"
  | "Hot"
  | "Existing Client"
  | "Partner"
  | "Vendor";

/* ======================================================
   NEW: Contact Role
====================================================== */
export type ContactRole = "primary" | "secondary" | "other";

export interface IContact {
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
  role?: ContactRole; // 👈 replaces isPrimary
}

export interface IAgreement {
  status: "Not Sent" | "Sent" | "Signed" | "Expired";
  signedDate?: Date;
  expiryDate?: Date;
  documentUrl?: string;
}

export interface ICompany {
  name: string;
  industry?: string;
  categories: CompanyCategory[];
  website?: string;

  address: {
    country?: string;
    region?: string;
    state?: string;
    city?: string;
    addressLine?: string;
    postalCode?: string;
  };

  contacts: IContact[];

  introMailSent?: boolean;
  introMailDate?: Date;
  nda?: IAgreement;
  mou?: IAgreement;

  leadStatus?: LeadStatus;
  relationshipType?: RelationshipType;
  priority?: Priority;

  leadSource?: string;
  reference?: string;
  assignedTo?: string;
  createdBy?: string;

  lastContactedDate?: Date;
  nextFollowUpDate?: Date;

  notes?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}
