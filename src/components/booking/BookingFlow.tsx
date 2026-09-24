"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Clock, Loader2, User } from "lucide-react";
import { createBookingSchema, flattenZodErrors } from "@/schemas/booking";
import { shop } from "@/config/shop";
import { formatDuration, formatPrice } from "@/lib/money";
import type { BarberDto, BookingResponse, ServiceDto, Slot } from "@/types";
import { DatePicker } from "./DatePicker";
import { BookingSummary } from "./BookingSummary";
import { Confirmation } from "./Confirmation";

interface Props {
  services: ServiceDto[];
  barbers: BarberDto[];
  today: string;
  initialServiceSlug?: string;
  initialBarberSlug?: string;
  firstVisitOffer?: boolean;
}

const STEPS = ["Service", "Barber", "Date and time", "Your details", "Review"] as const;
type SlotsState = { status: "idle" | "loading" | "error" | "ready"; slots: Slot[]; message?: string };

const GENERIC_ERROR = "We couldn't complete your booking right now. Please try again.";

function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k${Date.now()}${Math.random().toString(16).slice(2)}`;
}

export function BookingFlow({ services, barbers, today, initialServiceSlug, initialBarberSlug, firstVisitOffer }: Props) {
  const initialService = services.find((s) => s.slug === initialServiceSlug);
  const initialBarber = barbers.find((b) => b.slug === initialBarberSlug);

  const [step, setStep] = useState(initialService ? (initialBarber ? 2 : 1) : 0);
  const [serviceId, setServiceId] = useState(initialService?.id ?? "");
  const [barberId, setBarberId] = useState(initialBarber?.id ?? "");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<Slot | null>(null);
  const [slotsState, setSlotsState] = useState<SlotsState>({ status: "idle", slots: [] });
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", newClient: Boolean(firstVisitOffer), acceptedTerms: false, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResponse | null>(null);
  const idempotencyKey = useRef<string>(newKey());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);

  // Move focus to the new step heading so keyboard and screen reader users know what changed
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, result]);

  const loadSlots = useCallback(async (signal?: AbortSignal) => {
    if (!serviceId || !barberId || !date) return;
    setSlotsState({ status: "loading", slots: [] });
    try {
      const qs = new URLSearchParams({ serviceId, barberId, date });
      const res = await fetch(`/api/availability?${qs}`, { signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "We couldn't check availability. Please try again.");
      setSlotsState({ status: "ready", slots: data.slots });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setSlotsState({ status: "error", slots: [], message: (e as Error).message || "We couldn't check availability. Please try again." });
    }
  }, [serviceId, barberId, date]);

  useEffect(() => {
    if (step !== 2 || !date) return;
    const controller = new AbortController();
    loadSlots(controller.signal);
    return () => controller.abort();
  }, [step, date, loadSlots]);

  // Any change to the appointment means a new submission, so it gets a new key
  useEffect(() => { idempotencyKey.current = newKey(); }, [serviceId, barberId, date, time]);

  const setField = (name: keyof typeof form, value: string | boolean) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([key]) => key !== name)));
  };

  const chooseService = (id: string) => { setServiceId(id); setTime(null); setDate(null); setSlotsState({ status: "idle", slots: [] }); };
  const chooseBarber = (id: string) => {
    setBarberId(id); setTime(null); setSlotsState({ status: "idle", slots: [] });
    const b = barbers.find((x) => x.id === id);
    if (date && b) { const wd = new Date(`${date}T00:00:00Z`).getUTCDay(); if (!b.workingDays.includes(wd)) setDate(null); }
  };

  const validateDetails = () => {
    const parsed = createBookingSchema.pick({ customerName: true, customerEmail: true, customerPhone: true, acceptedTerms: true }).safeParse({
      customerName: form.customerName, customerEmail: form.customerEmail, customerPhone: form.customerPhone, acceptedTerms: form.acceptedTerms,
    });
    if (parsed.success) { setErrors({}); return true; }
    setErrors(flattenZodErrors(parsed.error));
    return false;
  };

  const submit = async () => {
    if (submitting || !service || !barber || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId, barberId, date, startTime: time.start, ...form, idempotencyKey: idempotencyKey.current,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 201 && data?.booking) { setResult(data); return; }
      const code = data?.error?.code;
      if (code === "SLOT_UNAVAILABLE") {
        setTime(null); setStep(2); setSubmitError(data.error.message);
        return;
      }
      if (code === "VALIDATION" && data.error.fields) {
        const fields = data.error.fields as Record<string, string>;
        setErrors(fields);
        if (fields.startTime || fields.date) { setTime(null); setStep(2); setSubmitError(fields.startTime ?? fields.date); }
        else { setStep(3); }
        return;
      }
      setSubmitError(data?.error?.message ?? GENERIC_ERROR);
    } catch {
      setSubmitError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => (
    <BookingSummary service={service} barber={barber} date={date} time={time} newClient={form.newClient && step >= 3} discount={shop.newClientDiscountRand} />
  ), [service, barber, date, time, form.newClient, step]);

  if (result) return <Confirmation result={result} email={form.customerEmail} headingRef={headingRef} />;

  const canContinue = [Boolean(serviceId), Boolean(barberId), Boolean(date && time), true, true][step];
  const next = () => {
    if (step === 3 && !validateDetails()) return;
    setSubmitError(null);
    setStep((s) => Math.min(s + 1, 4));
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
      <div>
        <ol className="mb-8 flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-4 text-sm" aria-label="Booking progress">
          {STEPS.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined} className={`${i === step ? "font-bold text-ink" : i < step ? "text-ink" : "text-steel/70"}`}>
              <span className={`mr-1.5 inline-flex h-5 w-5 items-center justify-center text-xs ${i === step ? "bg-pole text-white" : i < step ? "bg-ink text-paper" : "border border-steel/50"}`}>{i + 1}</span>{label}
            </li>
          ))}
        </ol>

        {submitError && (
          <div role="alert" className="mb-6 flex items-start gap-3 border border-pole bg-white p-4 text-[0.9375rem]">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-pole" aria-hidden="true" /><p>{submitError}</p>
          </div>
        )}

        {step === 0 && (
          <section aria-labelledby="step-title">
            <h1 id="step-title" ref={headingRef} tabIndex={-1} className="font-display text-h2 font-bold outline-none">Choose a service</h1>
            <div role="radiogroup" aria-labelledby="step-title" className="mt-6 divide-y divide-line border-y border-line">
              {services.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={serviceId === s.id} onClick={() => chooseService(s.id)}
                  className={`flex w-full items-center justify-between gap-4 px-3 py-4 text-left transition-colors ${serviceId === s.id ? "bg-ink text-paper" : "hover:bg-bone"}`}>
                  <span>
                    <span className="block font-display text-lg font-bold">{s.name}</span>
                    <span className={`mt-0.5 flex items-center gap-1.5 text-sm ${serviceId === s.id ? "text-paper/80" : "text-steel"}`}><Clock size={14} aria-hidden="true" />{formatDuration(s.durationMinutes)}</span>
                  </span>
                  <span className="font-display text-lg font-bold">{formatPrice(s.priceCents)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="step-title">
            <h1 id="step-title" ref={headingRef} tabIndex={-1} className="font-display text-h2 font-bold outline-none">Choose your barber</h1>
            <div role="radiogroup" aria-labelledby="step-title" className="mt-6 grid gap-3 sm:grid-cols-2">
              {barbers.map((b) => (
                <button key={b.id} type="button" role="radio" aria-checked={barberId === b.id} onClick={() => chooseBarber(b.id)}
                  className={`flex items-center gap-4 border p-4 text-left transition-colors ${barberId === b.id ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink"}`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-bone text-ink"><User size={22} aria-hidden="true" /></span>
                  <span><span className="block font-display font-bold">{b.name}</span><span className={`text-sm ${barberId === b.id ? "text-paper/80" : "text-steel"}`}>{b.title}</span></span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && barber && (
          <section aria-labelledby="step-title">
            <h1 id="step-title" ref={headingRef} tabIndex={-1} className="font-display text-h2 font-bold outline-none">Pick a date and time</h1>
            <p className="mt-2 text-steel">Showing days {barber.name.split(" ")[0]} works. Bookings open {shop.maxAdvanceDays} days ahead.</p>
            <div className="mt-6 max-w-lg">
              <DatePicker today={today} workingDays={barber.workingDays} value={date} onChange={(d) => { setDate(d); setTime(null); setSubmitError(null); }} />
            </div>
            {date && (
              <div className="mt-8" aria-live="polite">
                <h2 className="font-display text-h3 font-bold">Available times</h2>
                {slotsState.status === "loading" && <p className="mt-3 flex items-center gap-2 text-steel"><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Checking availability...</p>}
                {slotsState.status === "error" && (
                  <p className="mt-3 text-pole-dark">{slotsState.message} <button type="button" onClick={() => loadSlots()} className="font-semibold underline underline-offset-4">Try again</button></p>
                )}
                {slotsState.status === "ready" && slotsState.slots.length === 0 && <p className="mt-3 text-steel">No appointments are available for this date. Please choose another day.</p>}
                {slotsState.status === "ready" && slotsState.slots.length > 0 && (
                  <div role="radiogroup" aria-label="Available start times" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {slotsState.slots.map((s) => (
                      <button key={s.start} type="button" role="radio" aria-checked={time?.start === s.start} onClick={() => setTime(s)}
                        className={`min-h-[44px] border px-2 text-[0.9375rem] font-medium transition-colors ${time?.start === s.start ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink"}`}>{s.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step-title">
            <h1 id="step-title" ref={headingRef} tabIndex={-1} className="font-display text-h2 font-bold outline-none">Your details</h1>
            <p className="mt-2 text-steel">No account needed. We use these only for this booking.</p>
            <form noValidate onSubmit={(e) => { e.preventDefault(); next(); }} className="mt-6 max-w-lg space-y-5">
              {([
                ["customerName", "Full name", "text", "name"],
                ["customerEmail", "Email address", "email", "email"],
                ["customerPhone", "Phone number", "tel", "tel"],
              ] as const).map(([name, label, type, auto]) => (
                <div key={name}>
                  <label htmlFor={name} className="label">{label}</label>
                  <input id={name} name={name} type={type} autoComplete={auto} className="input" value={form[name]}
                    onChange={(e) => setField(name, e.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />
                  {errors[name] && <p id={`${name}-error`} className="field-error"><AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{errors[name]}</p>}
                </div>
              ))}
              {/* Honeypot: hidden from people, tempting to bots */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setField("website", e.target.value)} /></label>
              </div>
              <label className="flex items-start gap-3 text-[0.9375rem]">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-[#A5342A]" checked={form.newClient} onChange={(e) => setField("newClient", e.target.checked)} />
                <span>This is my first visit. Take R{shop.newClientDiscountRand} off when I pay in the shop.</span>
              </label>
              <div>
                <label className="flex items-start gap-3 text-[0.9375rem]">
                  <input type="checkbox" className="mt-1 h-5 w-5 accent-[#A5342A]" checked={form.acceptedTerms} onChange={(e) => setField("acceptedTerms", e.target.checked)}
                    aria-invalid={Boolean(errors.acceptedTerms)} aria-describedby={errors.acceptedTerms ? "terms-error" : undefined} />
                  <span>I agree to the <Link href="/terms" target="_blank" className="font-semibold underline underline-offset-4">booking terms</Link>, including the 24 hour cancellation notice.</span>
                </label>
                {errors.acceptedTerms && <p id="terms-error" className="field-error"><AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{errors.acceptedTerms}</p>}
              </div>
              <button type="submit" className="sr-only">Continue</button>
            </form>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="step-title">
            <h1 id="step-title" ref={headingRef} tabIndex={-1} className="font-display text-h2 font-bold outline-none">Review and confirm</h1>
            <p className="mt-2 text-steel">Check everything below. You can go back to change any part.</p>
            <div className="mt-6 max-w-lg space-y-6">
              <div className="lg:hidden">{summary}</div>
              <dl className="divide-y divide-line border-y border-line text-[0.9375rem]">
                {[["Name", form.customerName], ["Email", form.customerEmail], ["Phone", form.customerPhone]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-steel">{k}</dt><dd className="break-all text-right font-medium">{v}</dd></div>
                ))}
              </dl>
              <p className="text-sm text-steel">Payment is taken in the shop after your service.</p>
            </div>
          </section>
        )}

        <div className="mt-10 flex max-w-lg items-center justify-between gap-4">
          {step > 0 ? (
            <button type="button" onClick={() => { setSubmitError(null); setStep(step - 1); }} className="btn btn-outline" disabled={submitting}><ArrowLeft size={18} aria-hidden="true" /> Back</button>
          ) : <span />}
          {step < 4 ? (
            <button type="button" onClick={next} disabled={!canContinue} className="btn btn-primary">Continue <ArrowRight size={18} aria-hidden="true" /></button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="btn btn-primary">
              {submitting ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Confirming...</> : "Confirm booking"}
            </button>
          )}
        </div>
      </div>

      <aside className="hidden lg:block" aria-label="Booking summary">
        <div className="sticky top-28 border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold">Your booking</h2>
          <div className="mt-3">{summary}</div>
          <p className="mt-4 text-sm text-steel">{shop.name}, {shop.address.street}, {shop.address.suburb}</p>
        </div>
      </aside>
    </div>
  );
}
