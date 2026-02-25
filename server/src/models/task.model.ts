import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import type { ITask } from "../types/task.types.js";

/* ======================================================
   Zod Schemas
====================================================== */

const optionalDate = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.coerce.date().optional(),
);

/** Schema for creating a new task */
export const taskSchemaZod = z.object({
  lead: z.string().optional(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  assignedTo: z.string().min(1, "Assigned To is required"),
  watchers: z.array(z.string()).optional().default([]),
  status: z.enum(["Todo", "In Progress", "Done"]).optional().default("Todo"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
});

/** For PATCH — partial() so every field is optional */
export const taskUpdateSchemaZod = taskSchemaZod.partial();

/** Schema for a doer's status update (timeline entry) */
export const taskStatusUpdateSchemaZod = z.object({
  status: z.enum(["Todo", "In Progress", "Done"]),
  remarks: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchemaZod>;

/* ======================================================
   Mongoose Sub-Schemas
====================================================== */

const AttachmentSchema = new Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    driveUrl: { type: String, required: true },
  },
  { _id: false },
);

const TaskUpdateSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Done"],
      required: true,
    },
    remarks: String,
    attachments: { type: [AttachmentSchema], default: [] },
    voiceNotes: { type: [AttachmentSchema], default: [] },
    videoNotes: { type: [AttachmentSchema], default: [] },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

/* ======================================================
   Task Document Interface
====================================================== */

export interface ITaskDocument extends ITask, Document {}

/* ======================================================
   Task Schema
====================================================== */

const TaskSchema = new Schema<ITaskDocument>(
  {
    lead: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      index: true,
    },
    description: String,
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned To is required"],
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned By is required"],
      index: true,
    },
    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Done"],
      default: "Todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },
    attachments: { type: [AttachmentSchema], default: [] },
    voiceNote: AttachmentSchema,
    videoNote: AttachmentSchema,
    updates: { type: [TaskUpdateSchema], default: [] },
  },
  { timestamps: true },
);

/* ======================================================
   Indexes
====================================================== */

TaskSchema.index({ title: "text" });

/* ======================================================
   Model
====================================================== */

export const TaskModel: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>("Task", TaskSchema);
