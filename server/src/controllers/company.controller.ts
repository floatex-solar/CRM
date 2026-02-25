import { Request, Response, NextFunction } from "express";
import { CompanyModel } from "../models/company.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";
import { uploadFileToDrive } from "../services/upload-to-drive.js";

function parseJsonField(body: any, field: string) {
  if (typeof body[field] === "string") {
    try {
      body[field] = JSON.parse(body[field]);
    } catch {
      body[field] = undefined;
    }
  }
}

/* =========================================================
   COMPANY CRUD
========================================================= */

// ─────────────────────────────────────────
// Create Company
// ─────────────────────────────────────────
export const createCompany = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (files?.ndaFile?.[0]) {
    req.body.ndaFileUrl = await uploadFileToDrive({
      fileBuffer: files.ndaFile[0].buffer,
      fileName: files.ndaFile[0].originalname,
      mimeType: files.ndaFile[0].mimetype,
    });
  }
  if (files?.mouFile?.[0]) {
    req.body.mouFileUrl = await uploadFileToDrive({
      fileBuffer: files.mouFile[0].buffer,
      fileName: files.mouFile[0].originalname,
      mimeType: files.mouFile[0].mimetype,
    });
  }

  parseJsonField(req.body, "address");
  parseJsonField(req.body, "contacts");
  parseJsonField(req.body, "notes");

  const company = await CompanyModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: { company },
  });
});

// ─────────────────────────────────────────
// Bulk delete companies
// ─────────────────────────────────────────
export const deleteMultipleCompanies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("Please provide an array of company IDs", 400));
    }

    await CompanyModel.deleteMany({ _id: { $in: ids } });

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// ─────────────────────────────────────────
// Get single company
// ─────────────────────────────────────────
export const getCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = await CompanyModel.findById(req.params.id);

    if (!company) {
      return next(new AppError("No company found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { company },
    });
  },
);

// ─────────────────────────────────────────
// Get all companies
// ─────────────────────────────────────────
export const getAllCompanies = catchAsync(
  async (req: Request, res: Response) => {
    // Build a base filter from query params (for counting before pagination)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseFilter: Record<string, any> = {};

    // Text search on name
    if (req.query.search && typeof req.query.search === "string") {
      baseFilter.name = { $regex: req.query.search, $options: "i" };
    }

    // Faceted filters
    if (req.query.leadStatus) {
      baseFilter.leadStatus = Array.isArray(req.query.leadStatus)
        ? { $in: req.query.leadStatus }
        : req.query.leadStatus;
    }
    if (req.query.priority) {
      baseFilter.priority = Array.isArray(req.query.priority)
        ? { $in: req.query.priority }
        : req.query.priority;
    }

    // Count total matching documents (before pagination)
    const totalCount = await CompanyModel.countDocuments(baseFilter);

    // Paginate
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sort
    const sortBy = req.query.sort
      ? String(req.query.sort).split(",").join(" ")
      : "-createdAt";

    const companies = await CompanyModel.find(baseFilter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    res.status(200).json({
      status: "success",
      results: companies.length,
      totalCount,
      data: { companies },
    });
  },
);

// ─────────────────────────────────────────
// Update company
// ─────────────────────────────────────────
export const updateCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.ndaFile?.[0]) {
      req.body.ndaFileUrl = await uploadFileToDrive({
        fileBuffer: files.ndaFile[0].buffer,
        fileName: files.ndaFile[0].originalname,
        mimeType: files.ndaFile[0].mimetype,
      });
    }
    if (files?.mouFile?.[0]) {
      req.body.mouFileUrl = await uploadFileToDrive({
        fileBuffer: files.mouFile[0].buffer,
        fileName: files.mouFile[0].originalname,
        mimeType: files.mouFile[0].mimetype,
      });
    }

    parseJsonField(req.body, "address");
    parseJsonField(req.body, "contacts");
    parseJsonField(req.body, "notes");

    const company = await CompanyModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!company) {
      return next(new AppError("No company found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { company },
    });
  },
);

// ─────────────────────────────────────────
// Delete company
// ─────────────────────────────────────────
export const deleteCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = await CompanyModel.findByIdAndDelete(req.params.id);

    if (!company) {
      return next(new AppError("No company found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export const addContact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = await CompanyModel.findById(req.params.companyId);

    if (!company) {
      return next(new AppError("Company not found", 404));
    }

    company.contacts.push(req.body);
    await company.save();

    res.status(201).json({
      status: "success",
      data: { company },
    });
  },
);

export const updateContact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { companyId, contactId } = req.params;

    const company = await CompanyModel.findById(companyId);
    if (!company) return next(new AppError("Company not found", 404));

    const contact = company.contacts.find(
      (c) => c._id?.toString() === contactId,
    );
    if (!contact) return next(new AppError("Contact not found", 404));

    Object.assign(contact, req.body);

    await company.save();

    res.status(200).json({
      status: "success",
      data: { company },
    });
  },
);

export const deleteContact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { companyId, contactId } = req.params;

    const company = await CompanyModel.findByIdAndUpdate(
      companyId,
      {
        $pull: { contacts: { _id: contactId } },
      },
      { new: true },
    );

    if (!company) return next(new AppError("Company not found", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
