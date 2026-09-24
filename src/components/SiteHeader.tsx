"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, Menu, Phone, X } from "lucide-react";
import { Logo } from "./Logo";
import { shop } from "@/config/shop";

export const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/about#barbers", label: "Barbers" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`text-[0.9375rem] font-medium hover:text-pole ${pathname === l.href ? "text-pole" : "text-ink"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={shop.phoneHref} className="hidden items-center gap-2 text-sm font-medium lg:flex" aria-label={`Call ${shop.phone}`}>
            <Phone size={16} aria-hidden="true" /> {shop.phone}
          </a>
          <Link href="/book" className="btn btn-primary hidden sm:inline-flex"><CalendarDays size={18} aria-hidden="true" /> Book now</Link>
          <button
            ref={buttonRef}
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-paper md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-4">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="border-b border-line py-4 font-display text-2xl font-bold">{l.label}</Link>
            ))}
            <Link href="/terms" className="border-b border-line py-4 text-base text-steel">Terms and conditions</Link>
            <Link href="/book" className="btn btn-primary mt-6 w-full"><CalendarDays size={18} aria-hidden="true" /> Book now</Link>
            <a href={shop.phoneHref} className="btn btn-outline mt-3 w-full"><Phone size={18} aria-hidden="true" /> Call {shop.phone}</a>
          </nav>
        </div>
      )}
    </header>
  );
}
