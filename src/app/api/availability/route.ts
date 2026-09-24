import { NextResponse } from "next/server";
import { availabilityService } from "@/lib/container";
import { clientIp, errorResponse, tooManyRequests } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { ValidationError } from "@/lib/errors";
import { availabilityQuerySchema, flattenZodErrors } from "@/schemas/booking";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!rateLimit(`avail:${clientIp(request)}`, 60, 60_000)) return tooManyRequests();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = availabilityQuerySchema.safeParse(params);
    if (!parsed.success) throw new ValidationError("Please check your selection.", flattenZodErrors(parsed.error));
    const slots = await availabilityService.getSlots(parsed.data);
    return NextResponse.json({ slots });
  } catch (error) {
    return errorResponse(error);
  }
}
