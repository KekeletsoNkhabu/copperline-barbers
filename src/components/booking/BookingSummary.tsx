import { formatPrice, formatDuration } from "@/lib/money";
import { formatDateLong, formatMinutes, timeToMinutes } from "@/lib/time";
import type { BarberDto, ServiceDto } from "@/types";

interface Props {
  service?: ServiceDto;
  barber?: BarberDto;
  date: string | null;
  time: { start: string; end: string } | null;
  newClient?: boolean;
  discount?: number;
}

export function BookingSummary({
  service,
  barber,
  date,
  time,
  newClient,
  discount = 0,
}: Props) {
  const rows: [string, string | undefined][] = [
    [
      "Service",
      service
        ? `${service.name} (${formatDuration(service.durationMinutes)})`
        : undefined,
    ],
    ["Barber", barber?.name],
    ["Date", date ? formatDateLong(date) : undefined],
    [
      "Time",
      time
        ? `${formatMinutes(timeToMinutes(time.start))} to ${formatMinutes(timeToMinutes(time.end))}`
        : undefined,
    ],
  ];
  return (
    <dl className="divide-y divide-line border-y border-line text-[0.9375rem]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-3">
          <dt className="text-steel">{label}</dt>
          <dd
            className={`text-right font-medium ${value ? "" : "text-steel/60"}`}
          >
            {value ?? "Not chosen yet"}
          </dd>
        </div>
      ))}
      {service && (
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-steel">Price</dt>
          <dd className="text-right font-display font-bold">
            {formatPrice(service.priceCents)}
            {newClient && (
              <span className="block text-sm font-normal text-steel">
                R{discount} off if this is your first visit with us
              </span>
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}
