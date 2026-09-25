import { shop, fullAddress } from "@/config/shop";
import { escapeHtml as e } from "@/lib/text";
import { formatDateLong, formatMinutes } from "@/lib/time";
import { formatPrice } from "@/lib/money";
import type { BookingDetails } from "@/types";

interface Row {
  label: string;
  value: string;
}

function layout(
  title: string,
  intro: string,
  rows: Row[],
  footer: string,
): string {
  const body = rows
    .map(
      (r) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#566171;font-size:14px;vertical-align:top;white-space:nowrap">${e(r.label)}</td><td style="padding:8px 0;font-size:15px;color:#15202B">${e(r.value)}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#F5F3EE;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-top:4px solid #A5342A">
<tr><td style="padding:28px 32px 8px"><div style="font-size:13px;letter-spacing:1px;color:#A5342A;font-weight:bold">${e(shop.name.toUpperCase())}</div>
<h1 style="margin:8px 0 12px;font-size:22px;color:#15202B">${e(title)}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#15202B">${e(intro)}</p></td></tr>
<tr><td style="padding:0 32px 8px"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #D3CDC0;border-bottom:1px solid #D3CDC0">${body}</table></td></tr>
<tr><td style="padding:16px 32px 28px;font-size:13px;line-height:1.5;color:#566171">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function appointmentRows(b: BookingDetails): Row[] {
  return [
    { label: "Service", value: b.service.name },
    { label: "Barber", value: b.barber.name },
    { label: "Date", value: formatDateLong(b.date) },
    { label: "Start time", value: formatMinutes(b.startMinutes) },
    { label: "End time", value: formatMinutes(b.endMinutes) },
  ];
}

export function customerConfirmation(b: BookingDetails): {
  subject: string;
  html: string;
  text: string;
} {
  const rows: Row[] = [
    { label: "Booking reference", value: b.reference },
    { label: "Name", value: b.customerName },
    ...appointmentRows(b),
    {
      label: "Price",
      value:
        b.discountCents > 0
          ? `${formatPrice(b.service.priceCents - b.discountCents)}, paid in the shop (R${b.discountCents / 100} first-visit discount applied)`
          : `${formatPrice(b.service.priceCents)}, paid in the shop`,
    },
    { label: "Location", value: `${shop.name}, ${fullAddress()}` },
    { label: "Contact", value: `${shop.phone}, ${shop.email}` },
  ];
  const intro = `Hi ${b.customerName}, your appointment is confirmed. We look forward to seeing you.`;
  const footer = `To change or cancel, call ${e(shop.phone)} at least 24 hours before your appointment. Quote your booking reference.<br>Copperline Barbers is a fictional business created for a practical assessment.`;
  return {
    subject: `Your booking is confirmed: ${b.reference}`,
    html: layout("Booking confirmed", intro, rows, footer),
    text: [
      intro,
      "",
      ...rows.map((r) => `${r.label}: ${r.value}`),
      "",
      footer.replace(/<br>/g, "\n"),
    ].join("\n"),
  };
}

export function shopNotification(b: BookingDetails): {
  subject: string;
  html: string;
  text: string;
} {
  const rows: Row[] = [
    { label: "Booking reference", value: b.reference },
    { label: "Customer", value: b.customerName },
    { label: "Email", value: b.customerEmail },
    { label: "Phone", value: b.customerPhone },
    ...appointmentRows(b),
    {
      label: "Price to charge",
      value:
        b.discountCents > 0
          ? `${formatPrice(b.service.priceCents - b.discountCents)} (R${b.discountCents / 100} first-visit discount applied and verified)`
          : formatPrice(b.service.priceCents),
    },
    ...(b.newClient && b.discountCents === 0
      ? [
          {
            label: "Note",
            value:
              "Customer ticked first visit, but our records show a prior booking, so no discount was applied.",
          },
        ]
      : []),
  ];
  const intro = `New booking for ${b.barber.name}.`;
  return {
    subject: `New booking: ${b.service.name} with ${b.barber.name}, ${b.date} ${formatMinutes(b.startMinutes)}`,
    html: layout(
      "New booking",
      intro,
      rows,
      "Sent automatically when a customer books online.",
    ),
    text: [intro, "", ...rows.map((r) => `${r.label}: ${r.value}`)].join("\n"),
  };
}
