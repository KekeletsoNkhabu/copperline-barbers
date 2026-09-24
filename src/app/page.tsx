import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, Phone } from "lucide-react";
import { HeroArt } from "@/components/HeroArt";
import { ServiceRow } from "@/components/ServiceList";
import { BarberCard } from "@/components/BarberCard";
import { Hours } from "@/components/Hours";
import { MapEmbed } from "@/components/MapEmbed";
import { PromoModal } from "@/components/PromoModal";
import { getBarbers, getServices } from "@/lib/catalog";
import { shop } from "@/config/shop";

export const revalidate = 300;

const featured = ["haircut", "skin-fade", "beard-trim", "haircut-and-beard"];

export default async function HomePage() {
  const [services, barbers] = await Promise.all([getServices(), getBarbers()]);
  const popular = featured.map((slug) => services.find((s) => s.slug === slug)).filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <section className="border-b border-line">
        <div className="container-page grid items-stretch gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-0">
          <div className="flex flex-col justify-center md:py-24">
            <h1 className="font-display text-hero font-extrabold">Cuts and shaves, done properly.</h1>
            <p className="mt-6 max-w-lg text-lg text-steel">
              Four barbers, one chair each and no rushing. Book online in about a minute and we will have you in and out on time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn btn-primary"><CalendarDays size={18} aria-hidden="true" /> Book an appointment</Link>
              <Link href="/services" className="btn btn-outline">See services and prices</Link>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-steel"><MapPin size={16} aria-hidden="true" /> {shop.address.street}, {shop.address.suburb}, {shop.address.city}</p>
          </div>
          <div className="relative hidden min-h-[520px] md:block"><HeroArt /></div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-h2 font-bold">Most booked</h2>
            <p className="mt-3 max-w-xs text-steel">Prices are fixed and paid in the shop. Every cut ends with a neck shave and a look in the mirror.</p>
            <Link href="/services" className="mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:text-pole">All services <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {popular.map((s) => <ServiceRow key={s.id} service={s} />)}
          </ul>
        </div>
      </section>

      <section className="bg-bone section" aria-labelledby="how-title">
        <div className="container-page">
          <h2 id="how-title" className="font-display text-h2 font-bold">How booking works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              ["Choose", "Pick your service and the barber you want."],
              ["Pick a time", "See the times that are actually free and select one."],
              ["Confirm", "Add your details and we email you a confirmation with a calendar invite."],
            ].map(([title, text], i) => (
              <li key={title} className="border-t-2 border-ink pt-4">
                <p className="font-display text-sm font-bold text-pole">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-h3 font-bold">{title}</h3>
                <p className="mt-2 text-[0.9375rem] text-steel">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="barbers-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="barbers-title" className="font-display text-h2 font-bold">Your barbers</h2>
            <Link href="/about#barbers" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:text-pole">Meet the team <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((b) => <BarberCard key={b.id} barber={b} />)}
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:items-stretch">
          <div>
            <h2 className="font-display text-h2 font-bold text-paper">Hours and location</h2>
            <div className="mt-6 max-w-md text-paper"><Hours light /></div>
            <ul className="mt-8 space-y-3 text-[0.9375rem]">
              <li className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0" aria-hidden="true" />{shop.address.street}, {shop.address.suburb}, {shop.address.city} {shop.address.postcode}</li>
              <li className="flex gap-3"><Phone size={18} className="mt-1 shrink-0" aria-hidden="true" /><a href={shop.phoneHref} className="hover:underline">{shop.phone}</a></li>
              <li className="flex gap-3"><Clock size={18} className="mt-1 shrink-0" aria-hidden="true" />Last appointments finish at closing time.</li>
            </ul>
            <Link href="/book" className="btn btn-primary mt-8">Book a chair</Link>
          </div>
          <div className="min-h-[320px]"><MapEmbed /></div>
        </div>
      </section>
      <PromoModal />
    </>
  );
}
