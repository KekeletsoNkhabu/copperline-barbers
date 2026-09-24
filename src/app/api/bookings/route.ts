import { NextResponse } from "next/server";
import { bookingService } from "@/lib/container";
import { clientIp, errorResponse, tooManyRequests } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { ValidationError } from "@/lib/errors";
import { createBookingSchema, flattenZodErrors } from "@/schemas/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`book:${clientIp(request)}`, 8, 10 * 60_000)) return tooManyRequests();
    const body = await request.json().catch(() => null);
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Please check the highlighted details.", flattenZodErrors(parsed.error));
    const result = await bookingService.createBooking(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
