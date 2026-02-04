// controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "util";

import User, { IUser, UserDocument } from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import sendEmail from "../utils/email.js"; // adjust path
import appConfig from "../config/appConfig.js";

type AuthenticatedRequest = Request & { user: UserDocument };
type JwtExpiresIn = NonNullable<jwt.SignOptions["expiresIn"]>;

const { JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES_IN, NODE_ENV } =
  appConfig;

// ────────────────────────────────────────────────
// Token & Cookie Helpers
// ────────────────────────────────────────────────
const signToken = (id: string): string => {
  const jwtSecret = JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const expiresIn: JwtExpiresIn = (JWT_EXPIRES_IN ?? "90d") as JwtExpiresIn;

  return jwt.sign({ id }, jwtSecret as jwt.Secret, {
    expiresIn,
  });
};

const createSendToken = (
  user: UserDocument,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user._id.toString());

  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  const userObj = user.toObject();
  (userObj as any).password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user: userObj },
  });
};

// ────────────────────────────────────────────────
// Login
// ────────────────────────────────────────────────
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    createSendToken(user, 200, res);
  }
);

// ────────────────────────────────────────────────
// Forgot Password
// ────────────────────────────────────────────────
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(
        new AppError("There is no user with that email address.", 404)
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 minutes)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      delete (user as any).passwordResetToken;
      delete (user as any).passwordResetExpires;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later.",
          500
        )
      );
    }
  }
);

// ────────────────────────────────────────────────
// Reset Password
// ────────────────────────────────────────────────
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    if (!token || Array.isArray(token)) {
      return next(new AppError("Token is invalid or missing", 400));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    delete (user as any).passwordResetToken;
    delete (user as any).passwordResetExpires;

    await user.save();

    createSendToken(user, 200, res);
  }
);

// ────────────────────────────────────────────────
// Update My Password (logged-in user)
// ────────────────────────────────────────────────
export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    // 1) Get user from collection
    const user = await User.findById(authReq.user.id).select("+password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // 2) Check if current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    // 3) Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    // 4) Log user in → send new token
    createSendToken(user, 200, res);
  }
);

// ────────────────────────────────────────────────
// Protect Middleware
// ────────────────────────────────────────────────
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as
      | (jwt.JwtPayload & { id: string })
      | string;

    if (typeof decoded === "string" || !decoded.id) {
      return next(new AppError("Invalid token.", 401));
    }

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    if (decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    (req as AuthenticatedRequest).user = currentUser;
    next();
  }
);

// ────────────────────────────────────────────────
// Restrict to roles middleware
// ────────────────────────────────────────────────
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
