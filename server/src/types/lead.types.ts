import { Types } from "mongoose";

/* ======================================================
   Enums
====================================================== */

export type Anchoring =
  | "Bank Anchoring"
  | "Bottom Anchoring"
  | "Hybrid Anchoring";

export type TypeOfAnchoring = "Dead Weight" | "Screw Pile" | "Drive Pile";

export type TypeOfMooring = "Catenary" | "Taut" | "Elastic";

export type MethodOfMooring = "HMPE Rope" | "Steel Rope";

export type LeadPriority = "High" | "Medium" | "Low";

/* ======================================================
   Design Configuration Sub-document
====================================================== */

export interface IDesignConfiguration {
  version: number;
  moduleCapacity: string;
  moduleDimension: string;
  inverterCapacity: string;
  inverterMake: string;
  configuration: string;
  anchoring: Anchoring;
  typeOfAnchoring: TypeOfAnchoring;
}

/* ======================================================
   Offered Price Sub-document
====================================================== */

export interface IOfferedPrice {
  floatingSystem: number;
  anchoringMooringSystem: number;
  supervision: number;
  dcInstallation: number;
  total: number;
}

/* ======================================================
   Mooring Technique Sub-document
====================================================== */

export interface IMooringTechnique {
  typeOfMooring: TypeOfMooring;
  methodOfMooring: MethodOfMooring;
}

/* ======================================================
   Lead Document
====================================================== */

export interface ILead {
  jobCode: string;
  priority: LeadPriority;

  projectName: string;
  projectLocation: string;

  client: Types.ObjectId;
  capacity: string;
  developer: Types.ObjectId;
  consultant: Types.ObjectId;
  endCustomer: Types.ObjectId;
  country: string;

  designConfigurations: IDesignConfiguration[];

  mooringTechnique: IMooringTechnique;

  currency: string;
  offeredPrice: IOfferedPrice;

  responsiblePerson: string;

  createdAt?: Date;
  updatedAt?: Date;
}
