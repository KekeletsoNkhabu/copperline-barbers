import { describe, expect, it } from "vitest";
import { checkSlot, generateSlots, overlaps } from "@/services/availability";
import { FRIDAY, NOW, setup, input } from "./helpers";

describe("overlaps", () => {
  it("detects partial overlap", () => expect(overlaps({ start: 870, end: 915 }, { start: 840, end: 885 })).toBe(true));
  it("treats back-to-back ranges as free", () => expect(overlaps({ start: 840, end: 870 }, { start: 870, end: 900 })).toBe(false));
  it("detects containment both ways", () => {
    expect(overlaps({ start: 800, end: 900 }, { start: 820, end: 830 })).toBe(true);
    expect(overlaps({ start: 820, end: 830 }, { start: 800, end: 900 })).toBe(true);
  });
});

describe("checkSlot and generateSlots", () => {
  const base = { date: FRIDAY, duration: 45, barberWorks: true, busy: [{ start: 840, end: 885 }], now: NOW }; // 14:00-14:45

  it("rejects 14:30 for a 45 minute service when 14:00-14:45 is booked", () => {
    expect(checkSlot(base, 14 * 60 + 30)).toBe("taken");
  });
  it("allows 14:45 straight after the existing booking", () => {
    expect(checkSlot(base, 14 * 60 + 45)).toBeNull();
  });
  it("rejects a start that would finish before the booking but run into it", () => {
    expect(checkSlot(base, 13 * 60 + 30)).toBe("taken"); // 13:30-14:15
    expect(checkSlot(base, 13 * 60 + 15)).toBeNull(); // 13:15-14:00
  });
  it("never offers times that overlap or run past closing", () => {
    const slots = generateSlots(base).map((s) => s.start);
    expect(slots).not.toContain("14:00");
    expect(slots).not.toContain("14:30");
    expect(slots).toContain("14:45");
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("17:15"); // 17:15 + 45 = 18:00 closing
  });
  it("returns nothing on days the shop is closed", () => {
    expect(generateSlots({ ...base, date: "2026-09-27" })).toEqual([]); // Sunday
  });
  it("returns nothing when the barber does not work that day", () => {
    expect(generateSlots({ ...base, barberWorks: false })).toEqual([]);
  });
  it("rejects past dates and times inside the lead window today", () => {
    expect(checkSlot({ ...base, date: "2026-09-23", busy: [] }, 600)).toBe("past");
    // now is 10:00, one hour lead: 10:30 is too soon, 11:00 is fine
    expect(checkSlot({ ...base, date: "2026-09-24", busy: [] }, 10 * 60 + 30)).toBe("past");
    expect(checkSlot({ ...base, date: "2026-09-24", busy: [] }, 11 * 60)).toBeNull();
  });
  it("rejects dates too far ahead and off-grid start times", () => {
    expect(checkSlot({ ...base, date: "2026-12-01", busy: [] }, 600)).toBe("too_far");
    expect(checkSlot({ ...base, busy: [] }, 10 * 60 + 5)).toBe("misaligned");
  });
});

describe("AvailabilityService", () => {
  it("removes booked ranges from the slot list", async () => {
    const { booking, availability } = setup();
    await booking.createBooking(input({ startTime: "14:00" }));
    const slots = await availability.getSlots({ serviceId: "svc-fade", barberId: "bar-a", date: FRIDAY });
    expect(slots.map((s) => s.start)).not.toContain("14:30");
  });
  it("keeps other barbers unaffected", async () => {
    const { booking, availability } = setup();
    await booking.createBooking(input({ startTime: "14:00" }));
    const slots = await availability.getSlots({ serviceId: "svc-fade", barberId: "bar-b", date: FRIDAY });
    expect(slots.map((s) => s.start)).toContain("14:00");
  });
});
