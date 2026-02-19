import { Request, Response, NextFunction } from "express";
import { SiteModel } from "../models/site.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { IReportFile } from "../types/site.types.js";

/* =========================================================
   SITE CRUD
========================================================= */

// ─────────────────────────────────────────
// Create Site
// ─────────────────────────────────────────
export const createSite = catchAsync(async (req: Request, res: Response) => {
  // Handle files
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const fileData: Partial<Record<string, IReportFile>> = {};

  if (files) {
    if (files.bathymetryFile?.[0]) {
      fileData.bathymetryFile = {
        originalName: files.bathymetryFile[0].originalname,
        encoding: files.bathymetryFile[0].encoding,
        mimetype: files.bathymetryFile[0].mimetype,
        filename: files.bathymetryFile[0].filename,
        path: files.bathymetryFile[0].path,
        size: files.bathymetryFile[0].size,
      };
    }
    if (files.geotechnicalFile?.[0]) {
      fileData.geotechnicalFile = {
        originalName: files.geotechnicalFile[0].originalname,
        encoding: files.geotechnicalFile[0].encoding,
        mimetype: files.geotechnicalFile[0].mimetype,
        filename: files.geotechnicalFile[0].filename,
        path: files.geotechnicalFile[0].path,
        size: files.geotechnicalFile[0].size,
      };
    }
    if (files.pfrFile?.[0]) {
      fileData.pfrFile = {
        originalName: files.pfrFile[0].originalname,
        encoding: files.pfrFile[0].encoding,
        mimetype: files.pfrFile[0].mimetype,
        filename: files.pfrFile[0].filename,
        path: files.pfrFile[0].path,
        size: files.pfrFile[0].size,
      };
    }
    if (files.dprFile?.[0]) {
      fileData.dprFile = {
        originalName: files.dprFile[0].originalname,
        encoding: files.dprFile[0].encoding,
        mimetype: files.dprFile[0].mimetype,
        filename: files.dprFile[0].filename,
        path: files.dprFile[0].path,
        size: files.dprFile[0].size,
      };
    }
  }

  const siteData = {
    ...req.body,
    ...fileData,
    // Ensure booleans are correctly parsed from form-data strings
    bathymetryAvailable: req.body.bathymetryAvailable === "true",
    geotechnicalReportAvailable:
      req.body.geotechnicalReportAvailable === "true",
    pfrAvailable: req.body.pfrAvailable === "true",
    dprAvailable: req.body.dprAvailable === "true",
    possibilityForPondGettingEmpty:
      req.body.possibilityForPondGettingEmpty === "true",
  };

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

  // Filter by Owner (Company ID)
  if (req.query.owner) {
    baseFilter.owner = req.query.owner;
  }

  // Filter by Country
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
    .populate("owner", "name") // Populate owner name
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
    // Handle files similar to create
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const fileData: Partial<Record<string, IReportFile>> = {};

    if (files) {
      if (files.bathymetryFile?.[0]) {
        fileData.bathymetryFile = {
          originalName: files.bathymetryFile[0].originalname,
          encoding: files.bathymetryFile[0].encoding,
          mimetype: files.bathymetryFile[0].mimetype,
          filename: files.bathymetryFile[0].filename,
          path: files.bathymetryFile[0].path,
          size: files.bathymetryFile[0].size,
        };
      }
      if (files.geotechnicalFile?.[0]) {
        fileData.geotechnicalFile = {
          originalName: files.geotechnicalFile[0].originalname,
          encoding: files.geotechnicalFile[0].encoding,
          mimetype: files.geotechnicalFile[0].mimetype,
          filename: files.geotechnicalFile[0].filename,
          path: files.geotechnicalFile[0].path,
          size: files.geotechnicalFile[0].size,
        };
      }
      if (files.pfrFile?.[0]) {
        fileData.pfrFile = {
          originalName: files.pfrFile[0].originalname,
          encoding: files.pfrFile[0].encoding,
          mimetype: files.pfrFile[0].mimetype,
          filename: files.pfrFile[0].filename,
          path: files.pfrFile[0].path,
          size: files.pfrFile[0].size,
        };
      }
      if (files.dprFile?.[0]) {
        fileData.dprFile = {
          originalName: files.dprFile[0].originalname,
          encoding: files.dprFile[0].encoding,
          mimetype: files.dprFile[0].mimetype,
          filename: files.dprFile[0].filename,
          path: files.dprFile[0].path,
          size: files.dprFile[0].size,
        };
      }
    }

    const updateData = {
      ...req.body,
      ...fileData,
    };

    // Handle boolean conversions if they are present in the body
    if (updateData.bathymetryAvailable !== undefined)
      updateData.bathymetryAvailable =
        updateData.bathymetryAvailable === "true";
    if (updateData.geotechnicalReportAvailable !== undefined)
      updateData.geotechnicalReportAvailable =
        updateData.geotechnicalReportAvailable === "true";
    if (updateData.pfrAvailable !== undefined)
      updateData.pfrAvailable = updateData.pfrAvailable === "true";
    if (updateData.dprAvailable !== undefined)
      updateData.dprAvailable = updateData.dprAvailable === "true";
    if (updateData.possibilityForPondGettingEmpty !== undefined)
      updateData.possibilityForPondGettingEmpty =
        updateData.possibilityForPondGettingEmpty === "true";

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
