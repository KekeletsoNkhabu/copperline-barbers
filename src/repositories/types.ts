import type { BarberDto, BookingDetails, Interval, ServiceDto } from "@/types";

export interface NewBooking {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  newClient: boolean;
  barberId: string;
  serviceId: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  idempotencyKey: string;
}

export interface ServiceRepository {
  listActive(): Promise<ServiceDto[]>;
  findActiveById(id: string): Promise<ServiceDto | null>;
}

export interface BarberRepository {
  listActive(): Promise<BarberDto[]>;
  findActiveById(id: string): Promise<BarberDto | null>;
}

export interface BookingRepository {
  /** Confirmed appointments for a barber on a date */
  findBusyIntervals(barberId: string, date: string): Promise<Interval[]>;
  findByReference(reference: string): Promise<BookingDetails | null>;
  findByIdempotencyKey(key: string): Promise<BookingDetails | null>;
  /**
   * Atomically re-check the slot and create the booking. Implementations must
   * serialise concurrent attempts for the same barber and date, call
   * `validate` with the busy intervals seen inside the transaction, and throw
   * SlotUnavailableError if validation fails or the database rejects an overlap.
   */
  createIfAvailable(
    booking: NewBooking,
    validate: (busy: Interval[]) => void,
  ): Promise<BookingDetails>;
}
