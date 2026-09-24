import { BookingService } from "@/services/BookingService";
import { AvailabilityService } from "@/services/AvailabilityService";
import { CalendarService } from "@/services/CalendarService";
import { EmailService, type EmailMessage, type EmailTransport } from "@/services/EmailService";
import { MemoryBarberRepository, MemoryBookingRepository, MemoryServiceRepository } from "@/repositories/memory";
import type { BarberDto, ServiceDto } from "@/types";
import type { CreateBookingInput } from "@/schemas/booking";

/** Thursday 24 Sep 2026, 10:00 in Harrismith (08:00 UTC) */
export const NOW = new Date("2026-09-24T08:00:00Z");
export const FRIDAY = "2026-09-25";

export const services: (ServiceDto & { active?: boolean })[] = [
  { id: "svc-cut", slug: "haircut", name: "Haircut", description: "", category: "Hair", priceCents: 18000, durationMinutes: 30 },
  { id: "svc-fade", slug: "skin-fade", name: "Skin Fade", description: "", category: "Hair", priceCents: 22000, durationMinutes: 45 },
  { id: "svc-old", slug: "old", name: "Retired", description: "", category: "Hair", priceCents: 10000, durationMinutes: 30, active: false },
];

export const barbers: (BarberDto & { active?: boolean })[] = [
  { id: "bar-a", slug: "thabo", name: "Thabo Mokoena", title: "", bio: "", image: "", workingDays: [2, 3, 4, 5, 6] },
  { id: "bar-b", slug: "liam", name: "Liam Fourie", title: "", bio: "", image: "", workingDays: [3, 4, 5, 6] },
  { id: "bar-c", slug: "gone", name: "Left the shop", title: "", bio: "", image: "", workingDays: [5], active: false },
];

export class RecordingTransport implements EmailTransport {
  sent: EmailMessage[] = [];
  constructor(private fail = false) {}
  async send(message: EmailMessage) {
    if (this.fail) throw new Error("boom");
    this.sent.push(message);
  }
}

export function setup(opts: { failEmail?: boolean } = {}) {
  const serviceRepo = new MemoryServiceRepository(services);
  const barberRepo = new MemoryBarberRepository(barbers);
  const bookingRepo = new MemoryBookingRepository(
    new Map(services.map((s) => [s.id, { id: s.id, name: s.name, priceCents: s.priceCents, durationMinutes: s.durationMinutes }])),
    new Map(barbers.map((b) => [b.id, { id: b.id, name: b.name }])),
  );
  const transport = new RecordingTransport(opts.failEmail);
  const logger = { error: () => {}, warn: () => {} };
  const email = new EmailService(transport, "shop@example.com", logger);
  const calendar = new CalendarService();
  const clock = () => NOW;
  const booking = new BookingService({ services: serviceRepo, barbers: barberRepo, bookings: bookingRepo, email, calendar, clock, logger });
  const availability = new AvailabilityService({ services: serviceRepo, barbers: barberRepo, bookings: bookingRepo, clock });
  return { booking, availability, bookingRepo, transport, calendar };
}

let counter = 0;
export function input(overrides: Partial<CreateBookingInput> = {}): CreateBookingInput {
  counter += 1;
  return {
    serviceId: "svc-fade",
    barberId: "bar-a",
    date: FRIDAY,
    startTime: "14:00",
    customerName: "Nomsa Zulu",
    customerEmail: "nomsa@example.com",
    customerPhone: "082 555 0100",
    newClient: false,
    acceptedTerms: true,
    idempotencyKey: `test-key-${counter}-abcdefghijklmnop`,
    ...overrides,
  };
}
