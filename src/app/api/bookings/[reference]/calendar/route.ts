import { bookingService, calendar } from "@/lib/container";
import { errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Downloads an .ics file built from the stored booking, for Apple Calendar, Outlook and others. */
export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const { reference } = await params;
    if (!/^CL-[A-Z0-9]{6}$/.test(reference)) return new Response("Not found", { status: 404 });
    const booking = await bookingService.getByReference(reference);
    const ics = calendar.ics(calendar.buildEvent(booking));
    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="copperline-${reference}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
