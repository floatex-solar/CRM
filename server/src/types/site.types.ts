import { Document, Types } from "mongoose";

export interface IReportFile {
  originalName: string;
  encoding: string;
  mimetype: string;
  filename: string;
  path: string;
  size: number;
}

export interface ISite extends Document {
  name: string;
  owner: Types.ObjectId; // Reference to Company
  country: string;

  // Location
  locationLat: number;
  locationLng: number;

  // Technical Characteristics
  typeOfWaterBody: string;
  useOfWater: string;
  waterArea: number; // sqmt
  windSpeed: number; // m/s
  maxWaterLevel: string;
  minDrawDownLevel: string;
  fullReservoirLevel: string;
  waterLevelVariation: string;
  fetchOfReservoir: string;
  waveHeight: string;
  waterCurrent: string;

  // Input Data Available (Files)
  bathymetryAvailable: boolean;
  bathymetryFile?: IReportFile;

  geotechnicalReportAvailable: boolean;
  geotechnicalFile?: IReportFile;

  pfrAvailable: boolean;
  pfrFile?: IReportFile;

  dprAvailable: boolean;
  dprFile?: IReportFile;

  possibilityForPondGettingEmpty: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
