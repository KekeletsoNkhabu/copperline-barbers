import type { Metadata } from "next";
import Link from "next/link";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { barberRepository, serviceRepository } from "@/repositories/prisma";
import { nowInZone } from "@/lib/time";
import { shop } from "@/config/shop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Book your chair at Copperline Barbers in Harrismith. Choose a service, barber and time, and add it to your calendar.",
};

export default async function BookPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  let services, barbers;
  try {
    [services, barbers] = await Promise.all([serviceRepository.listActive(), barberRepository.listActive()]);
  } catch (error) {
    console.error("Booking page failed to load catalogue:", (error as Error).message);
    return (
      <div className="container-page section max-w-2xl">
        <h1 className="font-display text-h2 font-bold">Online booking is unavailable right now</h1>
        <p className="mt-3 text-steel">Please try again in a few minutes, or call us on <a href={shop.phoneHref} className="font-semibold underline underline-offset-4">{shop.phone}</a> and we will book you in.</p>
        <Link href="/" className="btn btn-outline mt-6">Back to home</Link>
      </div>
    );
  }
  return (
    <div className="container-page py-10 sm:py-14">
      <BookingFlow
        services={services}
        barbers={barbers}
        today={nowInZone(shop.timezone).date}
        initialServiceSlug={params.service}
        initialBarberSlug={params.barber}
        firstVisitOffer={params.offer === "first"}
      />
    </div>
  );
}
