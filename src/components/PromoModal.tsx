"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { shop } from "@/config/shop";

const STORAGE_KEY = "copperline-offer-dismissed";
const HIDE_DAYS = 14;

/** One first-visit offer on the home page. Appears once after a short delay, then stays away for two weeks. */
export function PromoModal() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let dismissedAt = 0;
    try { dismissedAt = Number(localStorage.getItem(STORAGE_KEY) ?? 0); } catch { /* storage blocked */ }
    if (Date.now() - dismissedAt < HIDE_DAYS * 86_400_000) return;
    const timer = window.setTimeout(() => {
      const dialog = ref.current;
      if (dialog && !dialog.open && typeof dialog.showModal === "function") dialog.showModal();
    }, 6000);
    return () => window.clearTimeout(timer);
  }, []);

  const remember = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* storage blocked */ }
  };
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="promo m-auto w-[calc(100%-2rem)] max-w-md border-0 bg-paper p-0 text-ink shadow-xl backdrop:bg-ink/60"
      aria-labelledby="promo-title"
      aria-describedby="promo-desc"
      onClose={remember}
      onClick={(e) => { if (e.target === ref.current) close(); }}
    >
      <div className="pole-stripe h-2" aria-hidden="true" />
      <div className="relative p-7">
        <button type="button" onClick={close} aria-label="Close offer" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center hover:text-pole">
          <X size={22} aria-hidden="true" />
        </button>
        <h2 id="promo-title" className="pr-8 font-display text-2xl font-bold leading-tight">R{shop.newClientDiscountRand} off your first visit</h2>
        <p id="promo-desc" className="mt-3 text-[0.9375rem] text-steel">
          New to Copperline? Tick &ldquo;This is my first visit&rdquo; when you book online and we will take R{shop.newClientDiscountRand} off any service when you pay in the shop.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/book?offer=first" className="btn btn-primary flex-1" onClick={close}>Book my first visit</Link>
          <button type="button" onClick={close} className="btn btn-outline flex-1">Not now</button>
        </div>
      </div>
    </dialog>
  );
}
