import type { Metadata } from "next";
import Link from "next/link";
import { GroupedServices } from "@/components/ServiceList";
import { getServices } from "@/lib/catalog";
import { shop } from "@/config/shop";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Services and prices",
  description: "Haircuts from R130, skin fades, scissor cuts, beard trims and hot towel shaves at Copperline Barbers in Harrismith. Full price list and durations.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="container-page section">
      <div className="grid gap-12 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <h1 className="font-display text-hero font-extrabold">Services and prices</h1>
          <p className="mt-5 max-w-sm text-steel">All prices are in rand and paid in the shop. Card and cash are both fine. The time shown is how long your chair is reserved.</p>
          <p className="mt-6 border-l-2 border-pole pl-4 text-[0.9375rem]">First visit? Take R{shop.newClientDiscountRand} off when you <Link href="/book?offer=first" className="font-semibold underline underline-offset-4">book online</Link>.</p>
        </div>
        <GroupedServices services={services} />
      </div>
    </div>
  );
}
