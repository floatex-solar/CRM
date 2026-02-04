// middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

// Type for the middleware factory
type ValidateOptions = {
  // Optional: allow partial validation (useful for PATCH/update routes)
  partial?: boolean;
};

/**
 * Reusable middleware factory that validates request body against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param options - Optional configuration
 */
export const validateBody = <T extends ZodObject>(
  schema: T,
  options: ValidateOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Choose between full or partial validation
      const validationSchema = options.partial ? schema.partial() : schema;

      // Parse and validate the request body
      const validatedData = await validationSchema.parseAsync(req.body);

      // Replace req.body with the validated (and transformed) data
      req.body = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors in a clean, frontend-friendly way
        const formattedErrors = (error as ZodError).issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      // If it's not a Zod error, pass it to error handler
      next(error);
    }
  };
};

// Optional: validate query params
export const validateQuery = <T extends ZodObject>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedQuery = (await schema.parseAsync(req.query)) as any;
      // In Express 5, `req.query` is a getter-only property, so we cannot reassign it.
      // Instead, we mutate the existing query object in place.
      Object.keys(req.query).forEach((key) => {
        delete (req.query as any)[key];
      });
      Object.assign(req.query as any, parsedQuery);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Invalid query parameters",
          errors: (error as ZodError).issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Optional: validate params (URL parameters like /users/:id)
export const validateParams = <T extends ZodObject>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = (await schema.parseAsync(req.params)) as any;
      // Same pattern as query: avoid reassigning `req.params` in case it's read-only.
      Object.keys(req.params).forEach((key) => {
        delete (req.params as any)[key];
      });
      Object.assign(req.params as any, parsedParams);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Invalid URL parameters",
          errors: (error as ZodError).issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
