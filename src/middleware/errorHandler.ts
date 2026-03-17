import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.code,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
