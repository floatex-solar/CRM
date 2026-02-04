import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";

import appConfig from "./config/appConfig.js";
import { AppError } from "./utils/appError.js"; // Adjust path as needed
import routes from "./routes/index.js";

const app: Application = express();

const { PORT, NODE_ENV, FRONTEND_URL } = appConfig;

// ======================
// GLOBAL MIDDLEWARE
// ======================

// 1. Security HTTP headers
app.use(helmet());

// 2. Request logging
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// 3. Rate limiting (especially on API routes)
const apiLimiter = rateLimit({
  max: 100, // max 100 requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// 4. Body parser with size limit (prevents large payload attacks)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. Cookie parser (useful if you plan to use cookies / sessions / JWT in cookies)
app.use(cookieParser());

// 6. CORS – be more restrictive in production!
app.use(
  cors({
    origin: FRONTEND_URL ? FRONTEND_URL.split(",") : "http://localhost:5173", // or your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 7. Data sanitization against NoSQL query injection
// NOTE:
// `express-mongo-sanitize` tries to reassign `req.query`, which is read-only in Express 5,
// causing: "TypeError: Cannot set property query of #<IncomingMessage> which has only a getter".
// We work around this by using its `sanitize` helper directly and **not** touching `req.query`.
app.use((req: Request, res: Response, next: NextFunction) => {
  const sanitize = (mongoSanitize as any).sanitize;

  if (typeof sanitize === "function") {
    if (req.body) {
      req.body = sanitize(req.body);
    }
    if (req.params) {
      req.params = sanitize(req.params);
    }
    if (req.headers) {
      req.headers = sanitize(req.headers);
    }
    // Intentionally skip req.query to avoid Express 5 getter-only property issues
  }

  next();
});

// 9. Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: [
      "sort",
      "page",
      "limit",
      "fields",
      // add your own fields that should allow multiple values
    ],
  })
);

// ======================
// Custom middleware examples
// ======================
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).requestTime = new Date().toISOString();
  // console.log("Headers:", req.headers);
  // console.log("Cookies:", req.cookies);
  next();
});

// ======================
// HEALTH CHECK
// ======================
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ======================
// ROUTES
// ======================
app.use("/api", routes);

// ======================
// 404 - Not Found
// ======================
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // In development → show full error
  if (NODE_ENV === "development") {
    console.error("ERROR 💥", err);

    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // In production → send clean message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Unknown error → don't leak details
  console.error("ERROR 💥", err);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
});

export default app;
