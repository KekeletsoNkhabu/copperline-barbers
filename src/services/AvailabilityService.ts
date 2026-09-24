import { NotFoundError, ValidationError } from "@/lib/errors";
import type { BarberRepository, BookingRepository, ServiceRepository } from "@/repositories/types";
import type { Slot } from "@/types";
import { weekdayOf } from "@/lib/time";
import { generateSlots } from "./availability";

export interface AvailabilityDeps {
  services: ServiceRepository;
  barbers: BarberRepository;
  bookings: BookingRepository;
  clock?: () => Date;
}

/** Answers "which start times can this customer pick?" */
export class AvailabilityService {
  constructor(private readonly deps: AvailabilityDeps) {}

  async getSlots(input: { serviceId: string; barberId: string; date: string }): Promise<Slot[]> {
    const service = await this.deps.services.findActiveById(input.serviceId);
    if (!service) throw new NotFoundError("That service is no longer available.");
    const barber = await this.deps.barbers.findActiveById(input.barberId);
    if (!barber) throw new NotFoundError("That barber is no longer available.");
    if (service.durationMinutes <= 0) throw new ValidationError("This service cannot be booked online.");

    const busy = await this.deps.bookings.findBusyIntervals(barber.id, input.date);
    return generateSlots({
      date: input.date,
      duration: service.durationMinutes,
      barberWorks: barber.workingDays.includes(weekdayOf(input.date)),
      busy,
      now: this.deps.clock?.(),
    });
  }
}
