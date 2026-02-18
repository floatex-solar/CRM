import { Request, Response, NextFunction } from "express";
import { LookupModel } from "../models/lookup.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

/* =========================================================
   LOOKUP CRUD
========================================================= */

// Create Lookup
export const createLookup = catchAsync(async (req: Request, res: Response) => {
  if (req.body && req.body.type) {
    req.body.type = req.body.type.toUpperCase();
  }
  const lookup = await LookupModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: { lookup },
  });
});

// Get all lookups by type
export const getLookupsByType = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.params;
  const lookups = await LookupModel.find({ type: type.toUpperCase() }).sort("label");

  res.status(200).json({
    status: "success",
    results: lookups.length,
    data: { lookups },
  });
});

// Update lookup
export const updateLookup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.type) req.body.type = req.body.type.toUpperCase();
    const lookup = await LookupModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lookup) {
      return next(new AppError("No lookup found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { lookup },
    });
  }
);

// Delete lookup
export const deleteLookup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lookup = await LookupModel.findByIdAndDelete(req.params.id);

    if (!lookup) {
      return next(new AppError("No lookup found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
