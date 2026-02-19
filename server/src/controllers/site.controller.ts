import { Request, Response, NextFunction } from "express";
import { SiteModel } from "../models/site.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { uploadFileToDrive } from "../services/upload-to-drive.js";
import { IReportFile } from "../types/site.types.js";

/* =========================================================
   Helpers
========================================================= */

const FILE_FIELD_NAMES = [
  "bathymetryFile",
  "geotechnicalFile",
  "pfrFile",
  "dprFile",
] as const;

type FileFieldName = (typeof FILE_FIELD_NAMES)[number];

/**
 * Uploads all provided Multer files to Google Drive and returns
 * a partial record mapping field names to their IReportFile data.
 */
async function processFileUploads(
  files: { [fieldname: string]: Express.Multer.File[] } | undefined,
): Promise<Partial<Record<FileFieldName, IReportFile>>> {
  if (!files) return {};

  const fileData: Partial<Record<FileFieldName, IReportFile>> = {};

  const uploadPromises = FILE_FIELD_NAMES.filter(
    (name) => files[name]?.[0],
  ).map(async (name) => {
    const file = files[name]![0]!;

    const driveUrl = await uploadFileToDrive({
      fileBuffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    fileData[name] = {
      originalName: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      filename: file.originalname,
      path: driveUrl, // Store Drive URL in the path field
      size: file.size,
    };
  });

  await Promise.all(uploadPromises);
  return fileData;
}

/** Coerces form-data string booleans to actual booleans. */
function parseBooleans(body: Record<string, unknown>): void {
  const booleanFields = [
    "bathymetryAvailable",
    "geotechnicalReportAvailable",
    "pfrAvailable",
    "dprAvailable",
    "possibilityForPondGettingEmpty",
  ];

  for (const field of booleanFields) {
    if (body[field] !== undefined) {
      body[field] = body[field] === "true";
    }
  }
}

/* =========================================================
   SITE CRUD
========================================================= */

// ─────────────────────────────────────────
// Create Site
// ─────────────────────────────────────────
export const createSite = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const fileData = await processFileUploads(files);

  const siteData = { ...req.body, ...fileData };
  parseBooleans(siteData);

  const site = await SiteModel.create(siteData);

  res.status(201).json({
    status: "success",
    data: { site },
  });
});

// ─────────────────────────────────────────
// Get all sites
// ─────────────────────────────────────────
export const getAllSites = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFilter: Record<string, any> = {};

  if (req.query.search && typeof req.query.search === "string") {
    baseFilter.name = { $regex: req.query.search, $options: "i" };
  }

  if (req.query.owner) {
    baseFilter.owner = req.query.owner;
  }

  if (req.query.country) {
    baseFilter.country = req.query.country;
  }

  const totalCount = await SiteModel.countDocuments(baseFilter);

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy = req.query.sort
    ? String(req.query.sort).split(",").join(" ")
    : "-createdAt";

  const sites = await SiteModel.find(baseFilter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate("owner", "name")
    .select("-__v");

  res.status(200).json({
    status: "success",
    results: sites.length,
    totalCount,
    data: { sites },
  });
});

// ─────────────────────────────────────────
// Get single site
// ─────────────────────────────────────────
export const getSite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const site = await SiteModel.findById(req.params.id).populate(
      "owner",
      "name",
    );

    if (!site) {
      return next(new AppError("No site found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { site },
    });
  },
);

// ─────────────────────────────────────────
// Update site
// ─────────────────────────────────────────
export const updateSite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const fileData = await processFileUploads(files);

    const updateData = { ...req.body, ...fileData };
    parseBooleans(updateData);

    const site = await SiteModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!site) {
      return next(new AppError("No site found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { site },
    });
  },
);

// ─────────────────────────────────────────
// Delete site
// ─────────────────────────────────────────
export const deleteSite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const site = await SiteModel.findByIdAndDelete(req.params.id);

    if (!site) {
      return next(new AppError("No site found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
