import Link from "next/link";
import { CalendarPlus, Check, Download, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/money";
import type { BookingResponse } from "@/types";

export function Confirmation({ result, email, headingRef }: { result: BookingResponse; email: string; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const { booking, calendar } = result;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex h-12 w-12 items-center justify-center bg-ink text-paper" aria-hidden="true"><Check size={26} /></div>
      <h1 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-h2 font-bold outline-none">Your appointment is booked</h1>
      <p className="mt-3 text-steel" role="status">
        {result.emailSent
          ? `We have sent a confirmation to ${email}.`
          : "We could not send your confirmation email. Please keep your booking reference below."}
      </p>

      <dl className="mt-8 divide-y divide-line border-y border-line">
        {[
          ["Booking reference", booking.reference],
          ["Service", booking.serviceName],
          ["Barber", booking.barberName],
          ["Date", booking.dateLabel],
          ["Time", `${booking.startLabel} to ${booking.endLabel}`],
          ["Price", `${formatPrice(booking.priceCents)}, paid in the shop`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-3.5">
            <dt className="text-steel">{k}</dt>
            <dd className={`text-right font-medium ${k === "Booking reference" ? "font-display text-lg font-bold tracking-wide" : ""}`}>{v}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-6 py-3.5">
          <dt className="flex items-center gap-2 text-steel"><MapPin size={16} aria-hidden="true" /> Location</dt>
          <dd className="text-right font-medium">Copperline Barbers<br />{booking.location}</dd>
        </div>
      </dl>

      <h2 className="mt-10 font-display text-h3 font-bold">Add it to your calendar</h2>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a href={calendar.googleUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <CalendarPlus size={18} aria-hidden="true" /> Add to Google Calendar
        </a>
        <a href={calendar.icsUrl} download className="btn btn-dark">
          <Download size={18} aria-hidden="true" /> Add to Apple Calendar
        </a>
      </div>
      <p className="mt-3 text-sm text-steel">The Apple Calendar option downloads an .ics file that also opens in Outlook and most other calendar apps.</p>

      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[0.9375rem]">
        <Link href="/" className="font-semibold underline underline-offset-4 hover:text-pole">Back to home</Link>
        <Link href="/book" className="font-semibold underline underline-offset-4 hover:text-pole" onClick={() => window.location.assign("/book")}>Book another appointment</Link>
      </div>
    </div>
  );
}
