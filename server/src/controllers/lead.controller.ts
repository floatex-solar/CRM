import { Request, Response, NextFunction } from "express";
import { LeadModel } from "../models/lead.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

/* =========================================================
   LEAD CRUD
========================================================= */

/** Strip empty strings from ObjectId ref fields so Mongoose doesn't choke */
const REF_FIELDS = [
  "client",
  "developer",
  "consultant",
  "endCustomer",
] as const;
function sanitizeRefFields(body: Record<string, unknown>) {
  for (const field of REF_FIELDS) {
    if (body[field] === "" || body[field] === null) {
      delete body[field];
    }
  }
  return body;
}

// ─────────────────────────────────────────
// Create Lead
// ─────────────────────────────────────────
export const createLead = catchAsync(async (req: Request, res: Response) => {
  sanitizeRefFields(req.body);
  const lead = await LeadModel.create(req.body);

  // Populate company refs before returning
  await lead.populate([
    { path: "client", select: "name" },
    { path: "developer", select: "name" },
    { path: "consultant", select: "name" },
    { path: "endCustomer", select: "name" },
  ]);

  res.status(201).json({
    status: "success",
    data: { lead },
  });
});

// ─────────────────────────────────────────
// Get all leads
// ─────────────────────────────────────────
export const getAllLeads = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFilter: Record<string, any> = {};

  // Text search on projectName
  if (req.query.search && typeof req.query.search === "string") {
    baseFilter.projectName = { $regex: req.query.search, $options: "i" };
  }

  // Faceted filters
  if (req.query.priority) {
    baseFilter.priority = Array.isArray(req.query.priority)
      ? { $in: req.query.priority }
      : req.query.priority;
  }

  // Count total matching documents (before pagination)
  const totalCount = await LeadModel.countDocuments(baseFilter);

  // Paginate
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sort
  const sortBy = req.query.sort
    ? String(req.query.sort).split(",").join(" ")
    : "-createdAt";

  const leads = await LeadModel.find(baseFilter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .populate("client", "name")
    .populate("developer", "name")
    .populate("consultant", "name")
    .populate("endCustomer", "name");

  res.status(200).json({
    status: "success",
    results: leads.length,
    totalCount,
    data: { leads },
  });
});

// ─────────────────────────────────────────
// Get single lead
// ─────────────────────────────────────────
export const getLead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lead = await LeadModel.findById(req.params.id)
      .populate("client", "name")
      .populate("developer", "name")
      .populate("consultant", "name")
      .populate("endCustomer", "name");

    if (!lead) {
      return next(new AppError("No lead found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { lead },
    });
  },
);

// ─────────────────────────────────────────
// Update lead
// ─────────────────────────────────────────
export const updateLead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    sanitizeRefFields(req.body);
    const lead = await LeadModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return next(new AppError("No lead found with that ID", 404));
    }

    await lead.populate([
      { path: "client", select: "name" },
      { path: "developer", select: "name" },
      { path: "consultant", select: "name" },
      { path: "endCustomer", select: "name" },
    ]);

    res.status(200).json({
      status: "success",
      data: { lead },
    });
  },
);

// ─────────────────────────────────────────
// Delete lead
// ─────────────────────────────────────────
export const deleteLead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lead = await LeadModel.findByIdAndDelete(req.params.id);

    if (!lead) {
      return next(new AppError("No lead found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// ─────────────────────────────────────────
// Bulk delete leads
// ─────────────────────────────────────────
export const deleteMultipleLeads = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("Please provide an array of lead IDs", 400));
    }

    await LeadModel.deleteMany({ _id: { $in: ids } });

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// ─────────────────────────────────────────
// Add design configuration version
// ─────────────────────────────────────────
export const addDesignVersion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lead = await LeadModel.findById(req.params.id);

    if (!lead) {
      return next(new AppError("No lead found with that ID", 404));
    }

    const nextVersion = lead.designConfigurations.length + 1;
    lead.designConfigurations.push({
      ...req.body,
      version: nextVersion,
    });

    await lead.save();

    await lead.populate([
      { path: "client", select: "name" },
      { path: "developer", select: "name" },
      { path: "consultant", select: "name" },
      { path: "endCustomer", select: "name" },
    ]);

    res.status(201).json({
      status: "success",
      data: { lead },
    });
  },
);
