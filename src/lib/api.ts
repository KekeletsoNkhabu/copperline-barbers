import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, fields: error.fieldErrors } },
      { status: error.status },
    );
  }
  // Log details on the server only; customers get a safe message
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "We couldn't complete your booking right now. Please try again." } },
    { status: 500 },
  );
}

export const tooManyRequests = () =>
  NextResponse.json(
    { error: { code: "RATE_LIMITED", message: "Too many requests. Please wait a moment and try again." } },
    { status: 429 },
  );
