import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { Hours } from "./Hours";
import { shop } from "@/config/shop";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-page grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-[0.9375rem] text-paper/75">
            Cuts, fades and shaves in Tshiame A, Harrismith. Walk-ins welcome when a chair is free, but booking guarantees your time.
          </p>
          <div className="mt-6 flex gap-3">
            <a href={shop.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Copperline on Instagram" className="flex h-11 w-11 items-center justify-center border border-paper/40 hover:bg-paper hover:text-ink"><Instagram size={20} aria-hidden="true" /></a>
            <a href={shop.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Copperline on Facebook" className="flex h-11 w-11 items-center justify-center border border-paper/40 hover:bg-paper hover:text-ink"><Facebook size={20} aria-hidden="true" /></a>
          </div>
        </div>
        <nav aria-label="Footer">
          <h2 className="font-display text-base font-bold text-paper">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {[["/", "Home"], ["/services", "Services and prices"], ["/about", "About us"], ["/about#barbers", "Our barbers"], ["/contact", "Contact and location"], ["/book", "Book an appointment"]].map(([href, label]) => (
              <li key={href}><Link href={href} className="text-paper/80 hover:text-white hover:underline">{label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-display text-base font-bold text-paper">Opening hours</h2>
          <div className="mt-3 text-paper/85"><Hours light /></div>
        </div>
        <address className="not-italic">
          <h2 className="font-display text-base font-bold text-paper">Find us</h2>
          <ul className="mt-4 space-y-3 text-[0.9375rem] text-paper/85">
            <li className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0" aria-hidden="true" /><span>{shop.address.street}<br />{shop.address.suburb}, {shop.address.city} {shop.address.postcode}</span></li>
            <li className="flex gap-3"><Phone size={18} className="mt-1 shrink-0" aria-hidden="true" /><a href={shop.phoneHref} className="hover:underline">{shop.phone}</a></li>
            <li className="flex gap-3"><Mail size={18} className="mt-1 shrink-0" aria-hidden="true" /><a href={`mailto:${shop.email}`} className="break-all hover:underline">{shop.email}</a></li>
          </ul>
        </address>
      </div>
      <div className="border-t border-paper/20">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-paper/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {shop.name}. A fictional business created for a practical assessment.</p>
          <p className="flex gap-5"><Link href="/terms" className="hover:text-white hover:underline">Terms and conditions</Link><Link href="/book" className="hover:text-white hover:underline">Book now</Link></p>
        </div>
      </div>
    </footer>
  );
}
