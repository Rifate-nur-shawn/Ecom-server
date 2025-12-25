import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";

/**
 * Global error handling middleware
 * Catches all unhandled errors and returns appropriate responses
 * Note: All 4 parameters are required for Express to recognize this as error handler
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error for debugging (in production, use proper logging service)
  if (env.NODE_ENV === "development") {
    console.error("Error:", err);
  } else {
    // In production, log to file/service but hide details from user
    console.error({
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
    });
  }

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: env.NODE_ENV === "development" ? message : "An error occurred",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
