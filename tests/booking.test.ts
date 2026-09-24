import { describe, expect, it } from "vitest";
import { generateReference } from "@/services/BookingService";
import { createBookingSchema } from "@/schemas/booking";
import { setup, input } from "./helpers";

describe("BookingService.createBooking", () => {
  it("stores the booking with correct end time and sends both emails", async () => {
    const { booking, bookingRepo, transport } = setup();
    const res = await booking.createBooking(input({ startTime: "15:00" }));
    expect(res.booking.startLabel).toBe("3:00 PM");
    expect(res.booking.endLabel).toBe("3:45 PM");
    expect(bookingRepo.rows).toHaveLength(1);
    expect(transport.sent.map((m) => m.to).sort()).toEqual(["nomsa@example.com", "shop@example.com"]);
    expect(res.emailSent).toBe(true);
  });

  it("rejects an overlapping appointment with a conflict", async () => {
    const { booking } = setup();
    await booking.createBooking(input({ startTime: "14:00" }));
    await expect(booking.createBooking(input({ startTime: "14:30" }))).rejects.toMatchObject({ code: "SLOT_UNAVAILABLE", status: 409 });
  });

  it("lets only one of two simultaneous requests win", async () => {
    const { booking, bookingRepo } = setup();
    const results = await Promise.allSettled([
      booking.createBooking(input({ startTime: "15:00", customerName: "Customer A" })),
      booking.createBooking(input({ startTime: "15:00", customerName: "Customer B" })),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const failed = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect(failed.reason.code).toBe("SLOT_UNAVAILABLE");
    expect(bookingRepo.rows).toHaveLength(1);
  });

  it("returns the original booking for a repeated submit and sends no second email", async () => {
    const { booking, bookingRepo, transport } = setup();
    const data = input({ startTime: "11:00" });
    const first = await booking.createBooking(data);
    const second = await booking.createBooking(data);
    expect(second.booking.reference).toBe(first.booking.reference);
    expect(bookingRepo.rows).toHaveLength(1);
    expect(transport.sent).toHaveLength(2);
  });

  it("still succeeds when email delivery fails", async () => {
    const { booking, bookingRepo } = setup({ failEmail: true });
    const res = await booking.createBooking(input({ startTime: "12:00" }));
    expect(res.emailSent).toBe(false);
    expect(bookingRepo.rows).toHaveLength(1);
  });

  it.each([
    ["inactive service", { serviceId: "svc-old" }],
    ["unknown barber", { barberId: "nope" }],
    ["inactive barber", { barberId: "bar-c" }],
  ])("rejects %s", async (_label, override) => {
    const { booking } = setup();
    await expect(booking.createBooking(input(override))).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it.each([
    ["Sunday (closed)", { date: "2026-09-27" }],
    ["a past date", { date: "2026-09-20" }],
    ["before opening", { startTime: "08:00" }],
    ["running past closing", { startTime: "17:30" }],
    ["a barber day off", { barberId: "bar-b", date: "2026-09-29" }], // Tuesday, Liam off
  ])("rejects %s", async (_label, override) => {
    const { booking } = setup();
    await expect(booking.createBooking(input(override))).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("generates readable unique-looking references", () => {
    const refs = new Set(Array.from({ length: 200 }, generateReference));
    expect(refs.size).toBe(200);
    for (const r of refs) expect(r).toMatch(/^CL-[A-Z2-9]{6}$/);
  });
});

describe("createBookingSchema", () => {
  const valid = input();
  it("accepts a valid request and normalises the email", () => {
    const r = createBookingSchema.safeParse({ ...valid, customerEmail: "  Nomsa@Example.COM " });
    expect(r.success && r.data.customerEmail).toBe("nomsa@example.com");
  });
  it("rejects bad email, phone, terms and honeypot", () => {
    const r = createBookingSchema.safeParse({ ...valid, customerEmail: "nope", customerPhone: "abc", acceptedTerms: false, website: "spam.com" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path[0]).sort()).toEqual(["acceptedTerms", "customerEmail", "customerPhone", "website"]);
  });
  it("strips control characters from names", () => {
    const r = createBookingSchema.safeParse({ ...valid, customerName: "Nomsa\u0000\n  Zulu" });
    expect(r.success && r.data.customerName).toBe("Nomsa Zulu");
  });
});
