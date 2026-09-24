export type ErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "SLOT_UNAVAILABLE"
  | "RATE_LIMITED"
  | "INTERNAL";

/** Errors that are safe to show to customers */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super("VALIDATION", message, 400, fieldErrors);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "We couldn't find that.") {
    super("NOT_FOUND", message, 404);
  }
}

export class SlotUnavailableError extends AppError {
  constructor(
    message = "That appointment was just booked by another customer. Please choose another available time.",
  ) {
    super("SLOT_UNAVAILABLE", message, 409);
  }
}
