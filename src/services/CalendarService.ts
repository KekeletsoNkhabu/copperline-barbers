import { shop, fullAddress } from "@/config/shop";
import { formatMinutes, formatDateLong, zonedTimeToUtc } from "@/lib/time";
import { formatPrice } from "@/lib/money";
import type { BookingDetails } from "@/types";

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  startUtc: Date;
  endUtc: Date;
}

const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

const icsText = (v: string) =>
  v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  let limit = 75;
  while (i < bytes.length) {
    let end = Math.min(i + limit, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(i, end).toString("utf8"));
    i = end;
    limit = 74;
  }
  return parts.join("\r\n ");
}

export class CalendarService {
  buildEvent(booking: BookingDetails): CalendarEvent {
    const startUtc = zonedTimeToUtc(
      booking.date,
      booking.startMinutes,
      shop.timezone,
    );
    const endUtc = zonedTimeToUtc(
      booking.date,
      booking.endMinutes,
      shop.timezone,
    );
    const description = [
      `${booking.service.name} with ${booking.barber.name}`,
      `${formatDateLong(booking.date)}, ${formatMinutes(booking.startMinutes)} to ${formatMinutes(booking.endMinutes)}`,
      `Price: ${formatPrice(booking.service.priceCents - booking.discountCents)}${booking.discountCents > 0 ? " (first-visit discount applied)" : ""} (pay in the shop)`,
      `Booking reference: ${booking.reference}`,
      `Please arrive a few minutes early. To change or cancel, call ${shop.phone} at least 24 hours before.`,
    ].join("\n");
    return {
      uid: `${booking.reference}@copperline.example`,
      title: `${booking.service.name} at ${shop.name}`,
      description,
      location: `${shop.name}, ${fullAddress()}`,
      startUtc,
      endUtc,
    };
  }

  googleUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${stamp(event.startUtc)}/${stamp(event.endUtc)}`,
      details: event.description,
      location: event.location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  ics(event: CalendarEvent, now: Date = new Date()): string {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Copperline Barbers//Booking//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(event.startUtc)}`,
      `DTEND:${stamp(event.endUtc)}`,
      `SUMMARY:${icsText(event.title)}`,
      `DESCRIPTION:${icsText(event.description)}`,
      `LOCATION:${icsText(event.location)}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT60M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText(`Reminder: ${event.title}`)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return lines.map(fold).join("\r\n") + "\r\n";
  }
}
