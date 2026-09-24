import { z } from "zod";
import { isValidDateString } from "@/lib/time";
import { sanitizeText } from "@/lib/text";

const cleaned = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `Please enter ${label}.` })
    .transform(sanitizeText)
    .pipe(z.string().min(min, `Please enter ${label}.`).max(max, `That is too long for ${label}.`));

export const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1, "Choose a service."),
  barberId: z.string().min(1, "Choose a barber."),
  date: z.string().refine(isValidDateString, "Choose a valid date."),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, "Choose a service."),
  barberId: z.string().min(1, "Choose a barber."),
  date: z.string().refine(isValidDateString, "Choose a valid date."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Choose a valid time."),
  customerName: cleaned(2, 80, "your name"),
  customerEmail: z
    .string({ required_error: "Please enter a valid email address." })
    .trim()
    .toLowerCase()
    .max(254, "Please enter a valid email address.")
    .email("Please enter a valid email address."),
  customerPhone: z
    .string({ required_error: "Please enter a valid phone number." })
    .transform(sanitizeText)
    .pipe(
      z.string().regex(/^\+?[0-9 ()-]{7,20}$/, "Please enter a valid phone number, for example 082 555 0100."),
    ),
  newClient: z.boolean().default(false),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the booking terms to continue." }) }),
  idempotencyKey: z.string().min(16).max(64),
  /** Honeypot: real people never fill this in */
  website: z.string().max(0).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
