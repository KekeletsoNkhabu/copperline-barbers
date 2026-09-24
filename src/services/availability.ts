import { shop, type DayHours } from "@/config/shop";
import type { Interval, Slot } from "@/types";
import { addDays, formatMinutes, minutesToTime, nowInZone, weekdayOf } from "@/lib/time";

/** Two half-open ranges overlap when each starts before the other ends. */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function hoursFor(date: string): DayHours & { isOpen: boolean } {
  const day = shop.hours[weekdayOf(date)];
  return { ...day, isOpen: day.open !== null && day.close !== null };
}

export interface SlotRules {
  date: string;
  duration: number;
  /** Does the barber work on this weekday? */
  barberWorks: boolean;
  busy: Interval[];
  now?: Date;
}

/** Why a proposed appointment is not bookable, or null when it is fine. */
export type SlotProblem = "closed" | "past" | "too_far" | "outside_hours" | "misaligned" | "taken";

/** Single place that defines what a valid appointment start is. Used by both the slot list and the booking check. */
export function checkSlot(rules: SlotRules, startMinutes: number): SlotProblem | null {
  const { date, duration, barberWorks, busy } = rules;
  const now = nowInZone(shop.timezone, rules.now);
  const hours = hoursFor(date);

  if (!hours.isOpen || !barberWorks) return "closed";
  if (date < now.date) return "past";
  if (date > addDays(now.date, shop.maxAdvanceDays)) return "too_far";
  if (date === now.date && startMinutes < now.minutes + shop.minLeadMinutes) return "past";
  if (startMinutes % shop.slotIntervalMinutes !== 0) return "misaligned";

  const range = { start: startMinutes, end: startMinutes + duration };
  if (range.start < hours.open! || range.end > hours.close!) return "outside_hours";
  if (busy.some((b) => overlaps(range, b))) return "taken";
  return null;
}

/** Every start time the customer could pick, in order. */
export function generateSlots(rules: SlotRules): Slot[] {
  const hours = hoursFor(rules.date);
  if (!hours.isOpen || !rules.barberWorks) return [];
  const slots: Slot[] = [];
  for (let start = hours.open!; start + rules.duration <= hours.close!; start += shop.slotIntervalMinutes) {
    if (checkSlot(rules, start) === null) {
      slots.push({
        start: minutesToTime(start),
        end: minutesToTime(start + rules.duration),
        label: formatMinutes(start),
      });
    }
  }
  return slots;
}
