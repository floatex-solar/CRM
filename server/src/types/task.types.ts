import { Types } from "mongoose";

/* ======================================================
   Enums
====================================================== */

export type TaskStatus = "Todo" | "In Progress" | "Done";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_completed";

/* ======================================================
   Attachment Sub-document
====================================================== */

export interface IAttachment {
  originalName: string;
  mimeType: string;
  size: number;
  driveUrl: string;
}

/* ======================================================
   Task Update Sub-document (timeline entry)
====================================================== */

export interface ITaskUpdate {
  status: TaskStatus;
  remarks?: string;
  attachments: IAttachment[];
  voiceNotes: IAttachment[];
  videoNotes: IAttachment[];
  updatedBy: Types.ObjectId;
  createdAt: Date;
}

/* ======================================================
   Task Document
====================================================== */

export interface ITask {
  lead?: Types.ObjectId;
  title: string;
  description?: string;
  dueDate: Date;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  watchers: Types.ObjectId[];
  assignedDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  attachments: IAttachment[];
  voiceNote?: IAttachment;
  videoNote?: IAttachment;
  updates: ITaskUpdate[];

  createdAt?: Date;
  updatedAt?: Date;
}

/* ======================================================
   Notification Document
====================================================== */

export interface INotification {
  recipient: Types.ObjectId;
  type: NotificationType;
  taskId: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
