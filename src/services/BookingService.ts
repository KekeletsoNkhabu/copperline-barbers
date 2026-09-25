import { randomBytes } from "node:crypto";
import { shop, fullAddress } from "@/config/shop";
import { AppError, NotFoundError, SlotUnavailableError, ValidationError } from "@/lib/errors";
import { formatDateLong, formatMinutes, timeToMinutes, weekdayOf } from "@/lib/time";
import { normalizeEmail, normalizePhone } from "@/lib/text";
import type { BarberRepository, BookingRepository, ServiceRepository } from "@/repositories/types";
import type { CreateBookingInput } from "@/schemas/booking";
import type { BookingDetails, BookingResponse } from "@/types";
import { checkSlot, type SlotProblem } from "./availability";
import type { CalendarService } from "./CalendarService";
import type { EmailService } from "./EmailService";

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 

export function generateReference(): string {
  const bytes = randomBytes(6);
  return "CL-" + Array.from(bytes, (b) => REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]).join("");
}

const PROBLEM_MESSAGES: Record<SlotProblem, string> = {
  closed: "The shop or this barber is not working on that day. Please choose another date.",
  past: "That time has already passed. Please choose a later time.",
  too_far: `Bookings open up to ${shop.maxAdvanceDays} days ahead. Please choose an earlier date.`,
  outside_hours: "That appointment would run outside opening hours. Please choose another time.",
  misaligned: "Please choose one of the times shown.",
  taken: "That time is no longer available. Please select another time.",
};

export interface BookingServiceDeps {
  services: ServiceRepository;
  barbers: BarberRepository;
  bookings: BookingRepository;
  email: EmailService;
  calendar: CalendarService;
  clock?: () => Date;
  logger?: Pick<Console, "error" | "warn">;
}

export class BookingService {
  constructor(private readonly deps: BookingServiceDeps) {}

  async createBooking(input: CreateBookingInput): Promise<BookingResponse> {
    const { services, barbers, bookings, clock } = this.deps;

    const previous = await bookings.findByIdempotencyKey(input.idempotencyKey);
    if (previous) return this.toResponse(previous, false);

    const service = await services.findActiveById(input.serviceId);
    if (!service) throw new NotFoundError("That service is no longer available. Please choose another.");
    const barber = await barbers.findActiveById(input.barberId);
    if (!barber) throw new NotFoundError("That barber is no longer available. Please choose another.");
    if (!Number.isInteger(service.durationMinutes) || service.durationMinutes <= 0) {
      throw new ValidationError("This service cannot be booked online.");
    }

    const startMinutes = timeToMinutes(input.startTime);
    const endMinutes = startMinutes + service.durationMinutes;
    const barberWorks = barber.workingDays.includes(weekdayOf(input.date));

    const validate = (busy: { start: number; end: number }[]) => {
      const problem = checkSlot(
        { date: input.date, duration: service.durationMinutes, barberWorks, busy, now: clock?.() },
        startMinutes,
      );
      if (problem === "taken") throw new SlotUnavailableError();
      if (problem) throw new ValidationError(PROBLEM_MESSAGES[problem], { startTime: PROBLEM_MESSAGES[problem] });
    };

    const normalizedEmail = normalizeEmail(input.customerEmail);
    const normalizedPhone = normalizePhone(input.customerPhone);
    let discountCents = 0;
    let notice: string | undefined;
    if (input.newClient) {
      const seenBefore = await bookings.hasPriorBooking(normalizedEmail, normalizedPhone);
      if (seenBefore) {
        notice = "The first-visit offer is for new customers only, so the full price applies to this booking.";
      } else {
        discountCents = Math.round(shop.newClientDiscountRand * 100);
      }
    }

    let booking: BookingDetails | null = null;
    for (let attempt = 0; attempt < 3 && !booking; attempt++) {
      try {
        booking = await bookings.createIfAvailable(
          {
            reference: generateReference(),
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            normalizedEmail,
            normalizedPhone,
            newClient: input.newClient,
            discountCents,
            barberId: barber.id,
            serviceId: service.id,
            date: input.date,
            startMinutes,
            endMinutes,
            idempotencyKey: input.idempotencyKey,
          },
          validate,
        );
      } catch (error) {
        if (error instanceof AppError) throw error;
        if (attempt < 2 && String((error as Error)?.message).includes("reference")) continue;
        throw error;
      }
    }
    if (!booking) throw new AppError("INTERNAL", "We couldn't complete your booking right now. Please try again.", 500);

    const emailSent = await this.deps.email.sendBookingEmails(booking);
    return this.toResponse(booking, emailSent, notice);
  }

  async getByReference(reference: string): Promise<BookingDetails> {
    const booking = await this.deps.bookings.findByReference(reference);
    if (!booking) throw new NotFoundError("We couldn't find that booking.");
    return booking;
  }

  toResponse(booking: BookingDetails, emailSent: boolean, notice?: string): BookingResponse {
    const event = this.deps.calendar.buildEvent(booking);
    return {
      booking: {
        reference: booking.reference,
        date: booking.date,
        dateLabel: formatDateLong(booking.date),
        startLabel: formatMinutes(booking.startMinutes),
        endLabel: formatMinutes(booking.endMinutes),
        serviceName: booking.service.name,
        barberName: booking.barber.name,
        priceCents: booking.service.priceCents,
        discountCents: booking.discountCents,
        finalPriceCents: booking.service.priceCents - booking.discountCents,
        location: fullAddress(),
      },
      calendar: {
        googleUrl: this.deps.calendar.googleUrl(event),
        icsUrl: `/api/bookings/${booking.reference}/calendar`,
      },
      emailSent,
      notice,
    };
  }
}