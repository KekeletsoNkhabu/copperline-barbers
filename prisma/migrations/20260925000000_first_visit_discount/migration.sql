-- Track the actual discount applied, and store normalized contact details so we
-- can tell whether a "first visit" claim is genuine without exposing that logic
-- to the customer.

ALTER TABLE "Booking" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN "normalizedEmail" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Booking" ADD COLUMN "normalizedPhone" TEXT NOT NULL DEFAULT '';

-- Backfill existing rows so the index and future lookups are consistent.
-- (Simple lower-case copy; good enough for historical rows, which have no discount logic applied retroactively.)
UPDATE "Booking" SET "normalizedEmail" = lower("customerEmail") WHERE "normalizedEmail" = '';
UPDATE "Booking" SET "normalizedPhone" = regexp_replace("customerPhone", '[^0-9]', '', 'g') WHERE "normalizedPhone" = '';

ALTER TABLE "Booking" ALTER COLUMN "discountCents" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "normalizedEmail" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "normalizedPhone" DROP DEFAULT;

CREATE INDEX "Booking_normalizedEmail_normalizedPhone_idx" ON "Booking"("normalizedEmail", "normalizedPhone");