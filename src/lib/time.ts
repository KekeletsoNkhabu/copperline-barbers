/**
 * Time helpers. Booking dates are plain "YYYY-MM-DD" strings and times are
 * minutes after midnight, both in the shop's timezone. Only calendar export
 * needs real instants, which zonedTimeToUtc produces.
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateString(value: string): boolean {
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export function parseDateString(value: string): { year: number; month: number; day: number } {
  const m = DATE_RE.exec(value);
  if (!m) throw new Error(`Invalid date string: ${value}`);
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

export function toDateString(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 0 = Sunday ... 6 = Saturday, independent of the server timezone */
export function weekdayOf(dateString: string): number {
  const { year, month, day } = parseDateString(dateString);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDays(dateString: string, days: number): string {
  const { year, month, day } = parseDateString(dateString);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return toDateString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!m) throw new Error(`Invalid time: ${time}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** "3:00 PM" style label for a minutes-after-midnight value */
export function formatMinutes(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDateLong(dateString: string): string {
  const { year, month, day } = parseDateString(dateString);
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** Current date and minutes after midnight in a given IANA timezone */
export function nowInZone(timeZone: string, now: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { date: toDateString(get("year"), get("month"), get("day")), minutes: get("hour") * 60 + get("minute") };
}

function zoneOffsetMs(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Convert a local date and minutes-after-midnight in `timeZone` to a real instant */
export function zonedTimeToUtc(dateString: string, minutes: number, timeZone: string): Date {
  const { year, month, day } = parseDateString(dateString);
  const localAsUtc = Date.UTC(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
  let guess = localAsUtc - zoneOffsetMs(timeZone, new Date(localAsUtc));
  guess = localAsUtc - zoneOffsetMs(timeZone, new Date(guess));
  return new Date(guess);
}
