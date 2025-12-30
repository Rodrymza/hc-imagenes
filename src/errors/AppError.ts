export class AppError extends Error {
  statusCode: number;
  detail?: string;

  constructor(message: string, statusCode = 500, detail?: string) {
    super(message);

    this.statusCode = statusCode;
    this.detail = detail;

    Error.captureStackTrace(this, this.constructor);
  }
}
