import { SlotUnavailableError } from "@/lib/errors";
import { overlaps } from "@/services/availability";
import type { BarberDto, BookingDetails, Interval, ServiceDto } from "@/types";
import type { BarberRepository, BookingRepository, NewBooking, ServiceRepository } from "./types";

/** In-memory implementations used by unit tests. They mirror the database's guarantees. */
export class MemoryServiceRepository implements ServiceRepository {
  constructor(private items: (ServiceDto & { active?: boolean })[]) {}
  async listActive() { return this.items.filter((i) => i.active !== false); }
  async findActiveById(id: string) { return (await this.listActive()).find((i) => i.id === id) ?? null; }
}

export class MemoryBarberRepository implements BarberRepository {
  constructor(private items: (BarberDto & { active?: boolean })[]) {}
  async listActive() { return this.items.filter((i) => i.active !== false); }
  async findActiveById(id: string) { return (await this.listActive()).find((i) => i.id === id) ?? null; }
}

export class MemoryBookingRepository implements BookingRepository {
  readonly rows: BookingDetails[] = [];
  private keys = new Map<string, BookingDetails>();

  constructor(
    private services: Map<string, BookingDetails["service"]>,
    private barbers: Map<string, BookingDetails["barber"]>,
  ) {}

  async findBusyIntervals(barberId: string, date: string): Promise<Interval[]> {
    return this.rows
      .filter((r) => r.barber.id === barberId && r.date === date)
      .map((r) => ({ start: r.startMinutes, end: r.endMinutes }));
  }
  async findByReference(reference: string) { return this.rows.find((r) => r.reference === reference) ?? null; }
  async findByIdempotencyKey(key: string) { return this.keys.get(key) ?? null; }

  async createIfAvailable(input: NewBooking, validate: (busy: Interval[]) => void) {
    const existing = this.keys.get(input.idempotencyKey);
    if (existing) return existing;
    // No await between the check and the insert, so concurrent calls cannot interleave
    const busy = this.rows
      .filter((r) => r.barber.id === input.barberId && r.date === input.date)
      .map((r) => ({ start: r.startMinutes, end: r.endMinutes }));
    validate(busy);
    // Same guarantee as the database exclusion constraint
    if (busy.some((b) => overlaps({ start: input.startMinutes, end: input.endMinutes }, b))) {
      throw new SlotUnavailableError();
    }
    const booking: BookingDetails = {
      id: `mem-${this.rows.length + 1}`,
      reference: input.reference,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      newClient: input.newClient,
      date: input.date,
      startMinutes: input.startMinutes,
      endMinutes: input.endMinutes,
      service: this.services.get(input.serviceId)!,
      barber: this.barbers.get(input.barberId)!,
    };
    this.rows.push(booking);
    this.keys.set(input.idempotencyKey, booking);
    return booking;
  }
}
