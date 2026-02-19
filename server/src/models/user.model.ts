// models/user.model.ts
import { Schema, model, HydratedDocument, Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

// ────────────────────────────────────────────────
// 1. Zod Schema (for input validation - API layer / controller)
// ────────────────────────────────────────────────
export const userSchemaZod = z
  .object({
    name: z.string().min(1, "Please provide your name").trim(),
    email: z
      .string()
      .email("Please provide a valid email")
      .transform((val) => val.toLowerCase()),
    role: z.enum(["admin", "user"]).default("user"),
    photo: z.string().url().optional().or(z.literal("")),
    bio: z.string().max(300).optional().default(""),
    urls: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .optional()
      .default([]),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z.string(),
    // Fields not required on input
    passwordChangedAt: z.date().optional(),
    passwordResetToken: z.string().optional(),
    passwordResetExpires: z.date().optional(),
    active: z.boolean().default(true),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

// Type for creating/updating user (input)
export type UserInput = z.infer<typeof userSchemaZod>;

// Raw user shape (fields + instance methods).
// For the actual Mongoose document type, use `UserDocument` below.
export interface IUser {
  name: string;
  email: string;
  role: "user" | "admin";
  photo?: string;
  bio?: string;
  urls?: { label: string; value: string }[];
  password: string;
  passwordConfirm?: string | undefined; // only exists temporarily
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;

  // instance methods
  correctPassword: (
    candidatePassword: string,
    userPassword: string,
  ) => Promise<boolean>;
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
}

export type UserDocument = HydratedDocument<IUser>;

interface UserModel extends Model<IUser> {
  // you can add static methods here if needed
}

// ────────────────────────────────────────────────
// 2. Mongoose Schema
// ────────────────────────────────────────────────
const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    photo: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    urls: {
      type: [{ label: String, value: String }],
      default: [],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true, // optional: adds createdAt & updatedAt
  },
);

// ────────────────────────────────────────────────
// Pre-save middleware - hash password
// ────────────────────────────────────────────────
userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  // Remove passwordConfirm field (not stored in DB)
  this.passwordConfirm = undefined;
});

// ────────────────────────────────────────────────
// Set passwordChangedAt only when password is changed (not on create)
// ────────────────────────────────────────────────
userSchema.pre("save", function (this: UserDocument) {
  if (!this.isModified("password") || this.isNew) return;

  // -1 second to make sure token is valid even with slight clock skew
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

// ────────────────────────────────────────────────
// Exclude inactive users from all find queries
// ────────────────────────────────────────────────
userSchema.pre(/^find/, function (this: any) {
  this.find({ active: { $ne: false } });
});

// ────────────────────────────────────────────────
// Instance methods
// ────────────────────────────────────────────────
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

// ────────────────────────────────────────────────
// Create & Export Model
// ────────────────────────────────────────────────
const User = model<IUser, UserModel>("User", userSchema);

export default User;
