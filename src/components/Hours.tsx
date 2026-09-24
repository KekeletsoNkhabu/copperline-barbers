import { shop, weekdayNames } from "@/config/shop";
import { formatMinutes } from "@/lib/time";

const order = [1, 2, 3, 4, 5, 6, 0];

export function Hours({ light = false }: { light?: boolean }) {
  return (
    <dl className={`divide-y ${light ? "divide-paper/20" : "divide-line"}`}>
      {order.map((d) => {
        const h = shop.hours[d];
        return (
          <div key={d} className="flex justify-between gap-6 py-2.5 text-[0.9375rem]">
            <dt className="font-medium">{weekdayNames[d]}</dt>
            <dd>{h.open === null ? "Closed" : `${formatMinutes(h.open)} to ${formatMinutes(h.close!)}`}</dd>
          </div>
        );
      })}
    </dl>
  );
}
