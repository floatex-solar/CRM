import { z } from 'zod'

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'user']),
  photo: z.string().optional(),
  bio: z.string().optional(),
  urls: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional()
    .default([]),
  active: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type User = z.infer<typeof userSchema>

export const userInputSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Please provide a valid email.'),
    role: z.enum(['admin', 'user']).default('user'),
    photo: z.string().optional(),
    bio: z.string().max(300).optional(),
    urls: z
      .array(z.object({ label: z.string(), value: z.string().url() }))
      .optional()
      .default([]),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  })
export type UserInput = z.infer<typeof userInputSchema>

export const usersListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number(),
  totalCount: z.number(),
  data: z.object({
    users: z.array(userSchema),
  }),
})
export type UsersListResponse = z.infer<typeof usersListResponseSchema>

export const userResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    user: userSchema,
  }),
})
export type UserResponse = z.infer<typeof userResponseSchema>
