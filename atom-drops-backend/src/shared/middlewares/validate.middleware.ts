import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

/**
 * Validation middleware for Zod schemas
 * Validates request body, query params, and route params
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error during validation",
      });
    }
  };
};
