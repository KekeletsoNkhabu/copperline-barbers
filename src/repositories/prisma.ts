import { PrismaClient, Prisma } from "@prisma/client";
import { SlotUnavailableError } from "@/lib/errors";
import { toDateString } from "@/lib/time";
import type { BookingDetails, Interval } from "@/types";
import type { BarberRepository, BookingRepository, NewBooking, ServiceRepository } from "./types";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Prisma returns @db.Date as a UTC-midnight Date; convert to YYYY-MM-DD */
const dateToString = (d: Date) => toDateString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
const stringToDate = (s: string) => new Date(`${s}T00:00:00.000Z`);

export const serviceRepository: ServiceRepository = {
  async listActive() {
    return prisma.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  },
  async findActiveById(id) {
    return prisma.service.findFirst({ where: { id, active: true } });
  },
};

export const barberRepository: BarberRepository = {
  async listActive() {
    return prisma.barber.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  },
  async findActiveById(id) {
    return prisma.barber.findFirst({ where: { id, active: true } });
  },
};

const bookingInclude = {
  service: { select: { id: true, name: true, priceCents: true, durationMinutes: true } },
  barber: { select: { id: true, name: true } },
} satisfies Prisma.BookingInclude;

type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

function toDetails(row: BookingRow): BookingDetails {
  return {
    id: row.id,
    reference: row.reference,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    newClient: row.newClient,
    discountCents: (row as BookingRow & { discountCents: number }).discountCents,
    date: dateToString(row.bookingDate),
    startMinutes: row.startMinutes,
    endMinutes: row.endMinutes,
    service: row.service,
    barber: row.barber,
  };
}

/** Postgres exclusion violation (23P01) or our named constraint, however Prisma wraps it */
function isOverlapViolation(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string; meta?: { code?: string } })?.meta?.code;
  return text.includes("booking_no_overlap") || code === "23P01" || text.includes("23P01");
}

function isUniqueViolation(error: unknown, field: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    String(error.meta?.target ?? "").includes(field)
  );
}

export const bookingRepository: BookingRepository = {
  async findBusyIntervals(barberId, date) {
    const rows = await prisma.booking.findMany({
      where: { barberId, bookingDate: stringToDate(date), status: "CONFIRMED" },
      select: { startMinutes: true, endMinutes: true },
    });
    return rows.map((r: { startMinutes: number; endMinutes: number }): Interval => ({ start: r.startMinutes, end: r.endMinutes }));
  },

  async findByReference(reference) {
    const row = await prisma.booking.findUnique({ where: { reference }, include: bookingInclude });
    return row ? toDetails(row) : null;
  },

  async findByIdempotencyKey(key) {
    const row = await prisma.booking.findUnique({ where: { idempotencyKey: key }, include: bookingInclude });
    return row ? toDetails(row) : null;
  },

  async hasPriorBooking(normalizedEmail, normalizedPhone) {
    const existing = await prisma.booking.findFirst({
      where: {
        status: "CONFIRMED",
        OR: [{ customerEmail: normalizedEmail }, ...(normalizedPhone ? [{ customerPhone: normalizedPhone }] : [])],
      },
      select: { id: true },
    });
    return existing !== null;
  },

  async createIfAvailable(input: NewBooking, validate) {
    const bookingDate = stringToDate(input.date);
    try {
      const row = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${input.barberId}:${input.date}`}))`;

        const existing = await tx.booking.findMany({
          where: { barberId: input.barberId, bookingDate, status: "CONFIRMED" },
          select: { startMinutes: true, endMinutes: true },
        });
        validate(existing.map((r: { startMinutes: number; endMinutes: number }) => ({ start: r.startMinutes, end: r.endMinutes })));

        return tx.booking.create({
          data: {
            reference: input.reference,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            normalizedEmail: input.normalizedEmail,
            normalizedPhone: input.normalizedPhone,
            newClient: input.newClient,
            discountCents: input.discountCents,
            barberId: input.barberId,
            serviceId: input.serviceId,
            bookingDate,
            startMinutes: input.startMinutes,
            endMinutes: input.endMinutes,
            idempotencyKey: input.idempotencyKey,
          },
          include: bookingInclude,
        });
      }, {
        maxWait: 10_000,
        timeout: 20_000,
      });
      return toDetails(row);
    } catch (error) {
      if (isOverlapViolation(error)) throw new SlotUnavailableError();
      if (isUniqueViolation(error, "idempotencyKey")) {
        const existing = await bookingRepository.findByIdempotencyKey(input.idempotencyKey);
        if (existing) return existing;
      }
      throw error;
    }
  },
};