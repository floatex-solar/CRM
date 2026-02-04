// controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import User, { IUser, UserDocument } from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

type AuthenticatedRequest = Request & { user: UserDocument };

// ────────────────────────────────────────────────
// Get current logged-in user
// ────────────────────────────────────────────────
export const getMe = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  req.params.id = authReq.user.id;
  next();
};

// ────────────────────────────────────────────────
// Get single user (by ID)
// ────────────────────────────────────────────────
export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  }
);

// ────────────────────────────────────────────────
// Get all users (admin only)
// ────────────────────────────────────────────────
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const features = new APIFeatures(User.find(), req.query as any)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

// ────────────────────────────────────────────────
// Create new user (admin only)
// ────────────────────────────────────────────────
export const createUser = catchAsync(async (req: Request, res: Response) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
});

// ────────────────────────────────────────────────
// Update user (admin only)
// ────────────────────────────────────────────────
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  }
);

// ────────────────────────────────────────────────
// Delete user (admin only)
// ────────────────────────────────────────────────
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

// ────────────────────────────────────────────────
// Update own profile (logged-in user)
// ────────────────────────────────────────────────
export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updateMyPassword",
          400
        )
      );
    }

    // 2) Filter allowed fields
    const allowedUpdates = ["name", "email", "photo"] as const;
    const filteredBody: Partial<Pick<IUser, (typeof allowedUpdates)[number]>> =
      {};

    allowedUpdates.forEach((field) => {
      const value = (req.body as Partial<IUser>)[field];
      if (value !== undefined) {
        filteredBody[field] = value;
      }
    });

    // 3) Update user
    const authReq = req as AuthenticatedRequest;

    const updatedUser = await User.findByIdAndUpdate(
      authReq.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  }
);

// ────────────────────────────────────────────────
// Delete own account (soft delete)
// ────────────────────────────────────────────────
export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await User.findByIdAndUpdate(authReq.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
