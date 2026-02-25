import { z } from 'zod'

/* ======================================================
   Attachment
====================================================== */

export const attachmentSchema = z.object({
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  driveUrl: z.string(),
})
export type Attachment = z.infer<typeof attachmentSchema>

/* ======================================================
   Populated User Reference
====================================================== */

export const populatedUserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
})
export type PopulatedUser = z.infer<typeof populatedUserSchema>

/* ======================================================
   Populated Lead Reference
====================================================== */

export const populatedLeadSchema = z.object({
  _id: z.string(),
  jobCode: z.string(),
  projectName: z.string(),
})
export type PopulatedLead = z.infer<typeof populatedLeadSchema>

/* ======================================================
   Task Update (timeline entry)
====================================================== */

export const taskUpdateSchema = z.object({
  _id: z.string().optional(),
  status: z.enum(['Todo', 'In Progress', 'Done']),
  remarks: z.string().optional(),
  attachments: z.array(attachmentSchema).default([]),
  voiceNotes: z.array(attachmentSchema).default([]),
  videoNotes: z.array(attachmentSchema).default([]),
  updatedBy: populatedUserSchema,
  createdAt: z.coerce.date(),
})
export type TaskUpdate = z.infer<typeof taskUpdateSchema>

/* ======================================================
   Task (from API — populated refs)
====================================================== */

export const taskSchema = z.object({
  _id: z.string(),
  lead: populatedLeadSchema.optional().nullable(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  assignedTo: populatedUserSchema,
  assignedBy: populatedUserSchema,
  watchers: z.array(populatedUserSchema).default([]),
  assignedDate: z.coerce.date(),
  status: z.enum(['Todo', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  attachments: z.array(attachmentSchema).default([]),
  voiceNote: attachmentSchema.optional().nullable(),
  videoNote: attachmentSchema.optional().nullable(),
  updates: z.array(taskUpdateSchema).optional().default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type Task = z.infer<typeof taskSchema>

/* ======================================================
   Task Input (for create / edit forms)
====================================================== */

export const taskInputSchema = z.object({
  lead: z.string().optional(),
  title: z.string().min(1, 'Task title is required.'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required.'),
  assignedTo: z.string().min(1, 'Please select an assignee.'),
  watchers: z.array(z.string()).optional().default([]),
  status: z.enum(['Todo', 'In Progress', 'Done']).optional().default('Todo'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
})
export type TaskInput = z.infer<typeof taskInputSchema>

/* ======================================================
   Task Status Update Input (for doer's status update form)
====================================================== */

export const taskStatusUpdateInputSchema = z.object({
  status: z.enum(['Todo', 'In Progress', 'Done']),
  remarks: z.string().optional(),
})
export type TaskStatusUpdateInput = z.infer<typeof taskStatusUpdateInputSchema>

/* ======================================================
   API Response Types
====================================================== */

export const tasksListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number(),
  totalCount: z.number(),
  data: z.object({
    tasks: z.array(taskSchema),
  }),
})
export type TasksListResponse = z.infer<typeof tasksListResponseSchema>

export const taskResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    task: taskSchema,
  }),
})
export type TaskResponse = z.infer<typeof taskResponseSchema>

/* ======================================================
   Notification
====================================================== */

export const notificationSchema = z.object({
  _id: z.string(),
  recipient: z.string(),
  type: z.enum(['task_assigned', 'task_updated', 'task_completed']),
  taskId: z
    .union([
      z.string(),
      z.object({
        _id: z.string(),
        title: z.string(),
        status: z.string(),
        priority: z.string(),
      }),
    ])
    .optional(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.coerce.date(),
})
export type Notification = z.infer<typeof notificationSchema>
