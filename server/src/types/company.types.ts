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
  _id?: string;
}

export interface IAgreement {
  status: "Not Sent" | "Sent" | "Signed" | "Expired";
  signedDate?: Date;
  expiryDate?: Date;
  documentUrl?: string;
}

export interface ICompany {
  name: string;
  typeOfCompany?: string;
  industry?: string;
  website?: string;

  address: {
    country?: string;
    region?: string;
    subRegion?: string;
    state?: string;
    city?: string;
    streetAddress?: string;
    postalCode?: string;
  };

  contacts: IContact[];

  introMailSent?: boolean;
  introMailDate?: Date;

  nda?: IAgreement & { file?: any };
  mou?: IAgreement & { file?: any };

  ndaStatus?: string;
  ndaSignedDate?: Date;
  ndaExpiryDate?: Date;
  ndaFileUrl?: string;

  mouStatus?: string;
  mouSignedDate?: Date;
  mouExpiryDate?: Date;
  mouFileUrl?: string;

  emailSent?: string;
  emailSentDate?: Date;

  leadStatus?: LeadStatus;
  priority?: Priority;

  leadSource?: string;
  whoBrought?: string;
  assignedTo?: string;
  createdBy?: string;

  lastContactedDate?: Date;
  nextFollowUpDate?: Date;

  notes?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}
