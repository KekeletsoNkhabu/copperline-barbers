import type { BarberDto, BookingDetails, Interval, ServiceDto } from "@/types";

export interface NewBooking {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  normalizedEmail: string;
  normalizedPhone: string;
  newClient: boolean;
  discountCents: number;
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
  findBusyIntervals(barberId: string, date: string): Promise<Interval[]>;
  findByReference(reference: string): Promise<BookingDetails | null>;
  findByIdempotencyKey(key: string): Promise<BookingDetails | null>;
  hasPriorBooking(normalizedEmail: string, normalizedPhone: string): Promise<boolean>;
  createIfAvailable(
    booking: NewBooking,
    validate: (busy: Interval[]) => void,
  ): Promise<BookingDetails>;
}