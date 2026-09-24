import { Resend } from "resend";
import { customerConfirmation, shopNotification } from "@/emails/templates";
import type { BookingDetails } from "@/types";

export interface EmailMessage { to: string; subject: string; html: string; text: string }

/** Anything that can deliver a message. Lets tests replace Resend. */
export interface EmailTransport {
  send(message: EmailMessage): Promise<void>;
}

export class ResendTransport implements EmailTransport {
  private client: Resend | null;
  constructor(
    apiKey = process.env.RESEND_API_KEY,
    private readonly from = process.env.EMAIL_FROM ?? "Copperline Barbers <onboarding@resend.dev>",
  ) {
    this.client = apiKey ? new Resend(apiKey) : null;
  }
  async send(message: EmailMessage): Promise<void> {
    if (!this.client) throw new Error("RESEND_API_KEY is not configured");
    const { error } = await this.client.emails.send({ from: this.from, ...message });
    if (error) throw new Error(`Resend rejected the email: ${error.message}`);
  }
}

export class EmailService {
  constructor(
    private readonly transport: EmailTransport,
    private readonly shopEmail: string | undefined = process.env.SHOP_NOTIFICATION_EMAIL,
    private readonly logger: Pick<Console, "error" | "warn"> = console,
  ) {}

  /**
   * Send both emails. Failures are logged, never thrown: the booking already
   * exists and must not be affected. Returns true if the customer email went out.
   */
  async sendBookingEmails(booking: BookingDetails): Promise<boolean> {
    const customer = { to: booking.customerEmail, ...customerConfirmation(booking) };
    const notifications = this.shopEmail ? [{ to: this.shopEmail, ...shopNotification(booking) }] : [];
    const results = await Promise.allSettled([customer, ...notifications].map((m) => this.transport.send(m)));
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        this.logger.error(`Email ${i === 0 ? "to customer" : "to shop"} failed for ${booking.reference}: ${(r.reason as Error).message}`);
      }
    });
    return results[0].status === "fulfilled";
  }
}
