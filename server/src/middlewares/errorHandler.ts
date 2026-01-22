import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { ErrorResponse } from "../types/error.types.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  console.error("ERROR 💥", err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = "Error interno del servidor";
  let detail: string | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    detail = err.detail;
  } else if (err instanceof Error) {
    detail = err.message;
  }

  res.status(statusCode).json({
    message,
    detail,
  });
};
