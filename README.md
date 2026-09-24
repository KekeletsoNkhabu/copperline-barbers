# Copperline Barbers

Booking website for a fictional Harrismith barber shop. Guests pick a service, barber, date and time, receive email confirmations, and add the appointment to Google Calendar or Apple Calendar (.ics).

## Stack
Next.js 15 (App Router, Route Handlers), TypeScript, Tailwind CSS 3, Lucide icons, PostgreSQL, Prisma, Zod, Resend, Vitest. Fonts are self-hosted through Fontsource.

## Structure
- `src/app` pages and API routes (`/api/availability`, `/api/bookings`, `/api/bookings/[reference]/calendar`)
- `src/services` business logic: `availability.ts` (pure overlap and slot rules), `AvailabilityService`, `BookingService`, `CalendarService`, `EmailService`
- `src/repositories` data access behind interfaces (`prisma.ts` for production, `memory.ts` for tests)
- `src/schemas` Zod validation, shared by browser and server
- `src/config` shop details, opening hours, catalogue; edit these to rebrand
- `prisma` schema, migration (includes the exclusion constraint) and seed

## Local setup
1. `npm install`
2. `cp .env.example .env` and fill in values
3. Start Postgres: `docker compose up -d` (or use any Postgres 13+ and set `DATABASE_URL`)
4. `npm run db:deploy` (applies the migration; use `npm run db:migrate` while developing schema changes)
5. `npm run db:seed`
6. `npm run dev` then open http://localhost:3000

## Environment variables
| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `RESEND_API_KEY` | Resend API key. If empty, emails are skipped and logged, bookings still work |
| `EMAIL_FROM` | Sender on a Resend-verified domain (`onboarding@resend.dev` works for testing, but only delivers to your own Resend account email) |
| `SHOP_NOTIFICATION_EMAIL` | Receives new-booking notifications |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for metadata and sitemap |

## Commands
`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm start`

## Double-booking protection
1. Availability is recomputed on the server at submit time.
2. Each booking runs in a transaction that takes a Postgres advisory lock for that barber and day, re-reads bookings and validates.
3. The `booking_no_overlap` exclusion constraint (needs `btree_gist`) makes overlapping confirmed bookings impossible even if the code is bypassed. Conflicts return HTTP 409 with a friendly message.
4. A client-generated idempotency key stops double-clicks and retries creating two bookings.

## Deployment (Vercel)
1. Create a hosted Postgres (Neon, Supabase or Vercel Postgres). Use a pooled connection string for `DATABASE_URL` if offered. `btree_gist` must be allowed; it is on Neon and Supabase.
2. Run migrations and seed once from your machine against the production URL: `DATABASE_URL=... npm run db:deploy && DATABASE_URL=... npm run db:seed`
3. Import the repo in Vercel, add the environment variables above, deploy. `npm run build` runs `prisma generate` first.
4. In Resend, verify a sending domain and set `EMAIL_FROM`.

## Notes
Barber portraits are illustrated placeholders in `public/barbers`; swap in real photos with the same filenames. The in-memory rate limiter is per serverless instance; use Upstash or similar for strict limits.
