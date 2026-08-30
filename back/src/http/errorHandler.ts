import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { QueryFailedError } from "typeorm";
import { HttpError } from "./errors";

interface ErrorBody {
  error: string;
  details?: unknown;
}

const PG_UNIQUE_VIOLATION = "23505";
const PG_FK_VIOLATION = "23503";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" } satisfies ErrorBody);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let status = 500;
  let body: ErrorBody = { error: "Internal server error" };

  if (err instanceof ZodError) {
    status = 400;
    body = {
      error: "Validation failed",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  } else if (err instanceof HttpError) {
    status = err.status;
    body = { error: err.message };
  } else if (err instanceof QueryFailedError) {
    const code = (err as QueryFailedError & { code?: string }).code;
    if (code === PG_UNIQUE_VIOLATION) {
      status = 409;
      body = { error: "Resource already exists" };
    } else if (code === PG_FK_VIOLATION) {
      status = 400;
      body = { error: "Referenced resource does not exist" };
    }
  }

  if (status >= 500) {
    console.error("Unhandled request error:", err);
  }

  res.status(status).json(body);
}
