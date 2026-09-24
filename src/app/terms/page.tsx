import type { Metadata } from "next";
import { shop } from "@/config/shop";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Booking, cancellation, late arrival and privacy terms for Copperline Barbers.",
};

const sections: { title: string; body: string[] }[] = [
  { title: "1. About these terms", body: [
    `These terms apply to appointments booked through this website with ${shop.name}. By completing a booking you agree to them.`,
    "Copperline Barbers is a fictional business created for a practical assessment. No real appointments are made and no payments are taken.",
  ]},
  { title: "2. Appointments", body: [
    "Appointments are for the service, barber, date and time shown on your confirmation. The time reserved is the service duration listed on our services page.",
    "Prices are shown in South African rand and are paid in the shop after your service. We accept cash and card.",
    `New client offer: customers who have not visited before receive R${shop.newClientDiscountRand} off one service when they select the first-visit option while booking. It can be used once and cannot be combined with other offers.`,
  ]},
  { title: "3. Changes and cancellations", body: [
    `Please give at least 24 hours notice if you need to change or cancel. Call ${shop.phone} and quote your booking reference.`,
    "Cancellations with less than 24 hours notice may be recorded, and repeated late cancellations may affect your ability to book online.",
  ]},
  { title: "4. Late arrivals", body: [
    "Please arrive a few minutes early. We hold your chair for 10 minutes after your start time.",
    "If you arrive later than that, we will do our best to fit you in, but we may need to shorten the service or rebook you so we do not delay the next customer.",
  ]},
  { title: "5. No-shows", body: [
    "If you do not arrive and have not contacted us, the appointment is treated as a no-show. After two no-shows we may ask you to call to book in future.",
  ]},
  { title: "6. Your information", body: [
    "When you book we collect your name, email address and phone number. We use them only to manage your appointment, send your confirmation and contact you about it if something changes.",
    "We do not sell your information or use it for marketing without asking. Booking records are kept for as long as needed to run the shop and meet legal obligations, and you can ask us to delete your details at any time by emailing us.",
  ]},
  { title: "7. Use of this website", body: [
    "You agree to provide accurate details and not to misuse the booking system, including by making false or repeated bookings. We may cancel bookings that appear fraudulent or abusive.",
    "We work to keep the website available and accurate, but we cannot promise it will always be free of errors or interruptions.",
  ]},
  { title: "8. Contact", body: [
    `${shop.name}, ${shop.address.street}, ${shop.address.suburb}, ${shop.address.city} ${shop.address.postcode}. Phone ${shop.phone}. Email ${shop.email}.`,
  ]},
];

export default function TermsPage() {
  return (
    <div className="container-page section">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-hero font-extrabold">Terms and conditions</h1>
        <p className="mt-4 text-steel">Last updated 24 September 2026</p>
        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-h3 font-bold">{s.title}</h2>
              <div className="mt-3 space-y-3 text-[1.0625rem] leading-7 text-ink/90">{s.body.map((p) => <p key={p}>{p}</p>)}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
