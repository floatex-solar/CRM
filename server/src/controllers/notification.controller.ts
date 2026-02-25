import { Request, Response, NextFunction } from "express";
import { NotificationModel } from "../models/notification.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import type { UserDocument } from "../models/user.model.js";

type AuthenticatedRequest = Request & { user: UserDocument };

/* =========================================================
   NOTIFICATION ENDPOINTS
========================================================= */

// ─────────────────────────────────────────
// Get my notifications (paginated, newest first)
// ─────────────────────────────────────────
export const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalCount = await NotificationModel.countDocuments({
      recipient: userId,
    });

    const notifications = await NotificationModel.find({ recipient: userId })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("taskId", "title status priority");

    res.status(200).json({
      status: "success",
      results: notifications.length,
      totalCount,
      data: { notifications },
    });
  },
);

// ─────────────────────────────────────────
// Get unread count
// ─────────────────────────────────────────
export const getUnreadCount = catchAsync(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const count = await NotificationModel.countDocuments({
      recipient: authReq.user._id,
      isRead: false,
    });

    res.status(200).json({
      status: "success",
      data: { count },
    });
  },
);

// ─────────────────────────────────────────
// Mark single notification as read
// ─────────────────────────────────────────
export const markAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, recipient: authReq.user._id } as any,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { notification },
    });
  },
);

// ─────────────────────────────────────────
// Mark all notifications as read
// ─────────────────────────────────────────
export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  await NotificationModel.updateMany(
    { recipient: authReq.user._id, isRead: false },
    { isRead: true },
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});
