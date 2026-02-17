import { Request, Response, NextFunction } from "express";
import { CompanyModel } from "../models/company.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

/* =========================================================
   COMPANY CRUD
========================================================= */

// ─────────────────────────────────────────
// Create Company
// ─────────────────────────────────────────
export const createCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await CompanyModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: { company },
  });
});

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
  }
);

// ─────────────────────────────────────────
// Get all companies
// ─────────────────────────────────────────
export const getAllCompanies = catchAsync(
  async (req: Request, res: Response) => {
    const features = new APIFeatures(CompanyModel.find(), req.query as any)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const companies = await features.query;

    res.status(200).json({
      status: "success",
      results: companies.length,
      data: { companies },
    });
  }
);

// ─────────────────────────────────────────
// Update company
// ─────────────────────────────────────────
export const updateCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = await CompanyModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return next(new AppError("No company found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { company },
    });
  }
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
  }
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
  }
);

export const updateContact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { companyId, contactId } = req.params;

    const company = await CompanyModel.findById(companyId);
    if (!company) return next(new AppError("Company not found", 404));

    const contact = company.contacts.id(contactId);
    if (!contact) return next(new AppError("Contact not found", 404));

    Object.assign(contact, req.body);

    await company.save();

    res.status(200).json({
      status: "success",
      data: { company },
    });
  }
);

export const deleteContact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { companyId, contactId } = req.params;

    const company = await CompanyModel.findById(companyId);
    if (!company) return next(new AppError("Company not found", 404));

    const contact = company.contacts.id(contactId);
    if (!contact) return next(new AppError("Contact not found", 404));

    contact.deleteOne();

    await company.save();

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
