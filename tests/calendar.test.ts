import { describe, expect, it } from "vitest";
import { CalendarService } from "@/services/CalendarService";
import { zonedTimeToUtc } from "@/lib/time";
import type { BookingDetails } from "@/types";

const calendar = new CalendarService();
const booking = (over: Partial<BookingDetails> = {}): BookingDetails => ({
  id: "1",
  reference: "CL-ABC234",
  customerName: "Nomsa Zulu",
  customerEmail: "n@example.com",
  customerPhone: "0825550100",
  newClient: false,
  discountCents: 0,
  date: "2026-09-25",
  startMinutes: 15 * 60,
  endMinutes: 15 * 60 + 45,
  service: {
    id: "s",
    name: "Skin Fade",
    priceCents: 22000,
    durationMinutes: 45,
  },
  barber: { id: "b", name: "Thabo Mokoena" },
  ...over,
});

describe("zonedTimeToUtc", () => {
  it("converts Durban local time (UTC+2) to UTC", () => {
    expect(
      zonedTimeToUtc(
        "2026-09-25",
        15 * 60,
        "Africa/Johannesburg",
      ).toISOString(),
    ).toBe("2026-09-25T13:00:00.000Z");
  });
  it("handles daylight saving zones", () => {
    expect(
      zonedTimeToUtc("2026-07-01", 15 * 60, "Europe/London").toISOString(),
    ).toBe("2026-07-01T14:00:00.000Z");
    expect(
      zonedTimeToUtc("2026-01-01", 15 * 60, "Europe/London").toISOString(),
    ).toBe("2026-01-01T15:00:00.000Z");
  });
});

describe("CalendarService", () => {
  it("builds the Google Calendar URL from the selected booking", () => {
    const url = new URL(calendar.googleUrl(calendar.buildEvent(booking())));
    expect(url.origin + url.pathname).toBe(
      "https://calendar.google.com/calendar/render",
    );
    expect(url.searchParams.get("text")).toBe(
      "Skin Fade at Copperline Barbers",
    );
    expect(url.searchParams.get("dates")).toBe(
      "20260925T130000Z/20260925T134500Z",
    );
    expect(url.searchParams.get("location")).toContain("18 Ridgeview Lane");
    expect(url.searchParams.get("details")).toContain("Thabo Mokoena");
    expect(url.searchParams.get("details")).toContain("CL-ABC234");
  });

  it("changes with the booking rather than being hard-coded", () => {
    const other = calendar.buildEvent(
      booking({
        date: "2026-10-03",
        startMinutes: 9 * 60,
        endMinutes: 9 * 60 + 30,
        service: {
          id: "x",
          name: "Haircut",
          priceCents: 18000,
          durationMinutes: 30,
        },
      }),
    );
    expect(other.startUtc.toISOString()).toBe("2026-10-03T07:00:00.000Z");
    expect(other.endUtc.toISOString()).toBe("2026-10-03T07:30:00.000Z");
    expect(other.title).toBe("Haircut at Copperline Barbers");
  });

  it("produces a valid .ics file", () => {
    const ics = calendar.ics(
      calendar.buildEvent(booking()),
      new Date("2026-09-24T08:00:00Z"),
    );
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART:20260925T130000Z");
    expect(ics).toContain("DTEND:20260925T134500Z");
    expect(ics).toContain("SUMMARY:Skin Fade at Copperline Barbers");
    expect(ics).toContain("UID:CL-ABC234@copperline.example");
    for (const line of ics.split("\r\n"))
      expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    expect(ics).not.toMatch(/[^\r]\n/); // CRLF only
  });
});
