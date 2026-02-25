import { Request, Response, NextFunction } from "express";
import { TaskModel } from "../models/task.model.js";
import { NotificationModel } from "../models/notification.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { uploadFileToDrive } from "../services/upload-to-drive.js";
import { sendTaskAssignmentEmail } from "../utils/email.js";
import type { IAttachment } from "../types/task.types.js";
import type { UserDocument } from "../models/user.model.js";
import User from "../models/user.model.js";

/* =========================================================
   Helpers
========================================================= */

type AuthenticatedRequest = Request & { user: UserDocument };

/**
 * Processes Multer files for a given field name and uploads them to Drive.
 * Returns an array of IAttachment objects.
 */
async function uploadFilesToDrive(
  files: Express.Multer.File[],
): Promise<IAttachment[]> {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const driveUrl = await uploadFileToDrive({
      fileBuffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      driveUrl,
    } satisfies IAttachment;
  });

  return Promise.all(uploadPromises);
}

/**
 * Extracts files from req.files by field name.
 */
function getFilesByField(
  files: { [fieldname: string]: Express.Multer.File[] } | undefined,
  fieldName: string,
): Express.Multer.File[] {
  if (!files) return [];
  return files[fieldName] ?? [];
}

/**
 * Creates notifications for a list of recipients.
 */
async function createNotifications(
  recipients: string[],
  type: "task_assigned" | "task_updated" | "task_completed",
  taskId: string,
  message: string,
): Promise<void> {
  if (recipients.length === 0) return;

  const notifications = recipients.map((recipientId) => ({
    recipient: recipientId,
    type,
    taskId,
    message,
  }));

  await NotificationModel.insertMany(notifications);
}

/* =========================================================
   TASK CRUD
========================================================= */

// ─────────────────────────────────────────
// Create Task
// ─────────────────────────────────────────
export const createTask = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Upload files to Drive
  const [attachments, voiceNotes, videoNotes] = await Promise.all([
    uploadFilesToDrive(getFilesByField(files, "attachments")),
    uploadFilesToDrive(getFilesByField(files, "voiceNote")),
    uploadFilesToDrive(getFilesByField(files, "videoNote")),
  ]);

  // Parse watchers from JSON string if sent as form-data
  let watchers = req.body.watchers;
  if (typeof watchers === "string") {
    try {
      watchers = JSON.parse(watchers);
    } catch {
      watchers = watchers ? [watchers] : [];
    }
  }

  const taskData = {
    ...req.body,
    watchers,
    assignedBy: authReq.user._id,
    assignedDate: new Date(),
    attachments,
    voiceNote: voiceNotes[0] || undefined,
    videoNote: videoNotes[0] || undefined,
  };

  const task = await TaskModel.create(taskData);

  // Create notifications for assignee
  const notifyRecipients: string[] = [];
  const assignedToId = String(task.assignedTo);
  const assignedById = String(authReq.user._id);

  if (assignedToId !== assignedById) {
    notifyRecipients.push(assignedToId);

    // Fetch assignee to send email
    const assignee = await User.findById(assignedToId).select("name email");
    if (assignee?.email) {
      await sendTaskAssignmentEmail({
        to: assignee.email,
        assigneeName: assignee.name,
        taskTitle: task.title,
        taskId: String(task._id),
      }).catch((err) => console.error("Failed to send task email:", err));
    }
  }

  // Notify watchers
  if (task.watchers && task.watchers.length > 0) {
    for (const watcherId of task.watchers) {
      const wId = String(watcherId);
      if (wId !== assignedById && !notifyRecipients.includes(wId)) {
        notifyRecipients.push(wId);
      }
    }
  }

  await createNotifications(
    notifyRecipients,
    "task_assigned",
    String(task._id),
    `${authReq.user.name} assigned you a new task: "${task.title}"`,
  );

  res.status(201).json({
    status: "success",
    data: { task },
  });
});

// ─────────────────────────────────────────
// Get all tasks
// ─────────────────────────────────────────
export const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFilter: Record<string, any> = {};

  // Text search on title
  if (req.query.search && typeof req.query.search === "string") {
    baseFilter.title = { $regex: req.query.search, $options: "i" };
  }

  // Faceted filters
  if (req.query.status) {
    baseFilter.status = Array.isArray(req.query.status)
      ? { $in: req.query.status }
      : req.query.status;
  }
  if (req.query.priority) {
    baseFilter.priority = Array.isArray(req.query.priority)
      ? { $in: req.query.priority }
      : req.query.priority;
  }
  if (req.query.assignedTo) {
    baseFilter.assignedTo = req.query.assignedTo;
  }
  if (req.query.assignedBy) {
    baseFilter.assignedBy = req.query.assignedBy;
  }

  // Count total matching documents (before pagination)
  const totalCount = await TaskModel.countDocuments(baseFilter);

  // Paginate
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sort
  const sortBy = req.query.sort
    ? String(req.query.sort).split(",").join(" ")
    : "-createdAt";

  const tasks = await TaskModel.find(baseFilter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate("lead", "jobCode projectName")
    .populate("assignedTo", "name email")
    .populate("assignedBy", "name email")
    .populate("watchers", "name email")
    .select("-__v -updates");

  res.status(200).json({
    status: "success",
    results: tasks.length,
    totalCount,
    data: { tasks },
  });
});

// ─────────────────────────────────────────
// Get single task (with full details)
// ─────────────────────────────────────────
export const getTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const task = await TaskModel.findById(req.params.id)
      .populate("lead", "jobCode projectName")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("watchers", "name email")
      .populate("updates.updatedBy", "name email");

    if (!task) {
      return next(new AppError("No task found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { task },
    });
  },
);

// ─────────────────────────────────────────
// Update task (general fields)
// ─────────────────────────────────────────
export const updateTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Parse watchers from JSON string if sent as form-data
    let watchers = req.body.watchers;
    if (typeof watchers === "string") {
      try {
        watchers = JSON.parse(watchers);
      } catch {
        watchers = watchers ? [watchers] : [];
      }
    }

    const updateData = { ...req.body };
    if (watchers !== undefined) {
      updateData.watchers = watchers;
    }

    const task = await TaskModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return next(new AppError("No task found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { task },
    });
  },
);

// ─────────────────────────────────────────
// Delete task
// ─────────────────────────────────────────
export const deleteTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const task = await TaskModel.findByIdAndDelete(req.params.id);

    if (!task) {
      return next(new AppError("No task found with that ID", 404));
    }

    // Clean up associated notifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await NotificationModel.deleteMany({ taskId: req.params.id } as any);

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// ─────────────────────────────────────────
// Bulk delete tasks
// ─────────────────────────────────────────
export const deleteMultipleTasks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("Please provide an array of task IDs", 400));
    }

    await TaskModel.deleteMany({ _id: { $in: ids } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await NotificationModel.deleteMany({ taskId: { $in: ids } } as any);

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// ─────────────────────────────────────────
// Add task update (doer updates status)
// ─────────────────────────────────────────
export const addTaskUpdate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const task = await TaskModel.findById(req.params.id);

    if (!task) {
      return next(new AppError("No task found with that ID", 404));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Upload files to Drive
    const [attachments, voiceNotes, videoNotes] = await Promise.all([
      uploadFilesToDrive(getFilesByField(files, "attachments")),
      uploadFilesToDrive(getFilesByField(files, "voiceNote")),
      uploadFilesToDrive(getFilesByField(files, "videoNote")),
    ]);

    const updateEntry = {
      status: req.body.status,
      remarks: req.body.remarks,
      attachments,
      voiceNotes,
      videoNotes,
      updatedBy: authReq.user._id,
    };

    // Push update to timeline and update task status
    task.updates.push(updateEntry as any);
    task.status = req.body.status;
    await task.save();

    // Create notifications for owner + watchers
    const notifyRecipients: string[] = [];
    const currentUserId = String(authReq.user._id);
    const ownerId = String(task.assignedBy);

    if (ownerId !== currentUserId) {
      notifyRecipients.push(ownerId);
    }

    if (task.watchers && task.watchers.length > 0) {
      for (const watcherId of task.watchers) {
        const wId = String(watcherId);
        if (wId !== currentUserId && !notifyRecipients.includes(wId)) {
          notifyRecipients.push(wId);
        }
      }
    }

    const notificationType =
      req.body.status === "Done" ? "task_completed" : "task_updated";
    const notificationMessage =
      req.body.status === "Done"
        ? `${authReq.user.name} completed the task: "${task.title}"`
        : `${authReq.user.name} updated the task "${task.title}" to "${req.body.status}"`;

    await createNotifications(
      notifyRecipients,
      notificationType,
      String(task._id),
      notificationMessage,
    );

    // Re-fetch with populated data
    const populatedTask = await TaskModel.findById(task._id)
      .populate("lead", "jobCode projectName")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("watchers", "name email")
      .populate("updates.updatedBy", "name email");

    res.status(200).json({
      status: "success",
      data: { task: populatedTask },
    });
  },
);
