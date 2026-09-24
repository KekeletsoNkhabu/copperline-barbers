import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Hours } from "@/components/Hours";
import { MapEmbed } from "@/components/MapEmbed";
import { shop } from "@/config/shop";

export const metadata: Metadata = {
  title: "Contact and location",
  description: "Find Copperline Barbers at 150 Tshiame A, Harrismith. Opening hours, phone, email and directions.",
};

export default function ContactPage() {
  return (
    <div className="container-page section">
      <h1 className="font-display text-hero font-extrabold">Contact and location</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div className="space-y-10">
          <address className="not-italic">
            <h2 className="font-display text-h3 font-bold">Copperline Barbers</h2>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3"><MapPin size={20} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{shop.address.street}<br />{shop.address.suburb}, {shop.address.city} {shop.address.postcode}<br />{shop.address.country}</span></li>
              <li className="flex gap-3"><Phone size={20} className="mt-0.5 shrink-0" aria-hidden="true" /><a href={shop.phoneHref} className="font-medium underline underline-offset-4 hover:text-pole">{shop.phone}</a></li>
              <li className="flex gap-3"><Mail size={20} className="mt-0.5 shrink-0" aria-hidden="true" /><a href={`mailto:${shop.email}`} className="break-all font-medium underline underline-offset-4 hover:text-pole">{shop.email}</a></li>
            </ul>
          </address>
          <div>
            <h2 className="font-display text-h3 font-bold">Opening hours</h2>
            <div className="mt-3 max-w-sm"><Hours /></div>
          </div>
          <div>
            <p className="max-w-md text-steel">To change or cancel an appointment, call us at least 24 hours ahead and quote your booking reference.</p>
            <Link href="/book" className="btn btn-primary mt-5">Book an appointment</Link>
          </div>
        </div>
        <div className="min-h-[360px] lg:min-h-[480px]"><MapEmbed /></div>
      </div>
    </div>
  );
}
