import { barberRepository, bookingRepository, serviceRepository } from "@/repositories/prisma";
import { AvailabilityService } from "@/services/AvailabilityService";
import { BookingService } from "@/services/BookingService";
import { CalendarService } from "@/services/CalendarService";
import { EmailService, ResendTransport } from "@/services/EmailService";

/** Composition root: the only place concrete implementations are wired together. */
const calendar = new CalendarService();
const email = new EmailService(new ResendTransport());

export const availabilityService = new AvailabilityService({
  services: serviceRepository,
  barbers: barberRepository,
  bookings: bookingRepository,
});

export const bookingService = new BookingService({
  services: serviceRepository,
  barbers: barberRepository,
  bookings: bookingRepository,
  email,
  calendar,
});

export { serviceRepository, barberRepository, calendar };
