import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/money";
import type { ServiceDto } from "@/types";

export function ServiceRow({ service, action = true }: { service: ServiceDto; action?: boolean }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div>
        <h3 className="font-display text-h3 font-bold">{service.name}</h3>
        <p className="mt-1 max-w-prose text-[0.9375rem] text-steel">{service.description}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-steel"><Clock size={15} aria-hidden="true" /> {formatDuration(service.durationMinutes)}</p>
      </div>
      <p className="font-display text-xl font-bold">{formatPrice(service.priceCents)}</p>
      {action && (
        <Link href={`/book?service=${service.slug}`} className="btn btn-outline col-span-2 sm:col-span-1" aria-label={`Book ${service.name}`}>Book</Link>
      )}
    </li>
  );
}

export function GroupedServices({ services }: { services: ServiceDto[] }) {
  const categories = Array.from(new Set(services.map((s) => s.category)));
  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <section key={category} aria-labelledby={`cat-${category.replace(/\W+/g, "-")}`}>
          <h2 id={`cat-${category.replace(/\W+/g, "-")}`} className="border-b-2 border-ink pb-3 font-display text-h2 font-bold">{category}</h2>
          <ul className="divide-y divide-line">
            {services.filter((s) => s.category === category).map((s) => <ServiceRow key={s.id} service={s} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}
