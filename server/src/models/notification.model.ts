import mongoose, { Schema, Document, Model } from "mongoose";
import type { INotification } from "../types/task.types.js";

/* ======================================================
   Notification Document Interface
====================================================== */

export interface INotificationDocument extends INotification, Document {}

/* ======================================================
   Notification Schema
====================================================== */

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["task_assigned", "task_updated", "task_completed"],
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task ID is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* ======================================================
   Indexes
====================================================== */

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

/* ======================================================
   Model
====================================================== */

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);
