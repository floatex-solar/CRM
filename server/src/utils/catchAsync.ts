import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler and passes errors to next().
 */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
