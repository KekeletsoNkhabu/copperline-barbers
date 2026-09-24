-- Needed so the exclusion constraint below can compare text and date columns with "="
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barber" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "workingDays" INTEGER[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "newClient" BOOLEAN NOT NULL DEFAULT false,
    "barberId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "bookingDate" DATE NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE INDEX "Service_active_sortOrder_idx" ON "Service"("active", "sortOrder");
CREATE UNIQUE INDEX "Barber_slug_key" ON "Barber"("slug");
CREATE INDEX "Barber_active_sortOrder_idx" ON "Barber"("active", "sortOrder");
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");
CREATE UNIQUE INDEX "Booking_idempotencyKey_key" ON "Booking"("idempotencyKey");
CREATE INDEX "Booking_barberId_bookingDate_status_idx" ON "Booking"("barberId", "bookingDate", "status");
CREATE INDEX "Booking_customerEmail_idx" ON "Booking"("customerEmail");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Database-level double-booking protection.
-- Two confirmed bookings for the same barber on the same day may never have overlapping
-- time ranges. int4range is half-open, so 14:00-14:45 and 14:45-15:30 do not conflict.
ALTER TABLE "Booking" ADD CONSTRAINT "booking_time_range_valid" CHECK ("startMinutes" >= 0 AND "endMinutes" > "startMinutes" AND "endMinutes" <= 1440);
ALTER TABLE "Booking" ADD CONSTRAINT "booking_no_overlap"
  EXCLUDE USING gist (
    "barberId" WITH =,
    "bookingDate" WITH =,
    int4range("startMinutes", "endMinutes") WITH &&
  ) WHERE ("status" = 'CONFIRMED');
