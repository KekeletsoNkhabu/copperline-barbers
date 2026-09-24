"use client";

import { addDays, parseDateString, weekdayOf } from "@/lib/time";
import { shop } from "@/config/shop";

const HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  today: string;
  workingDays: number[];
  value: string | null;
  onChange: (date: string) => void;
}

export function DatePicker({ today, workingDays, value, onChange }: Props) {
  // Start the grid on the Monday of the current week
  const offsetToMonday = (weekdayOf(today) + 6) % 7;
  const gridStart = addDays(today, -offsetToMonday);
  const last = addDays(today, shop.maxAdvanceDays);
  const cells: string[] = [];
  for (let d = gridStart; d <= last; d = addDays(d, 1)) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(addDays(cells[cells.length - 1], 1));

  const isAvailable = (d: string) => {
    if (d < today || d > last) return false;
    const wd = weekdayOf(d);
    return shop.hours[wd].open !== null && workingDays.includes(wd);
  };

  return (
    <div role="group" aria-label="Choose a date">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-steel" aria-hidden="true">
        {HEADERS.map((h) => <div key={h} className="py-1">{h}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const { day, month } = parseDateString(d);
          const available = isAvailable(d);
          const selected = value === d;
          const showMonth = i === 0 || day === 1;
          return (
            <button
              key={d}
              type="button"
              disabled={!available}
              aria-pressed={selected}
              aria-label={new Intl.DateTimeFormat("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`)) + (available ? "" : ", unavailable")}
              onClick={() => onChange(d)}
              className={`flex min-h-[52px] flex-col items-center justify-center border text-base transition-colors ${
                selected ? "border-ink bg-ink text-paper" : available ? "border-line bg-white hover:border-ink" : "border-transparent text-steel/40"
              } ${d === today && !selected ? "font-bold" : ""}`}
            >
              <span className="text-[0.625rem] leading-none opacity-80">{showMonth ? MONTHS[month - 1] : "\u00a0"}</span>
              <span className="font-display font-semibold leading-tight">{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
