import Image from "next/image";
import Link from "next/link";
import { weekdayNames } from "@/config/shop";
import type { BarberDto } from "@/types";

const order = [1, 2, 3, 4, 5, 6, 0];

export function BarberCard({ barber, detailed = false }: { barber: BarberDto; detailed?: boolean }) {
  const days = order.filter((d) => barber.workingDays.includes(d)).map((d) => weekdayNames[d].slice(0, 3)).join(", ");
  return (
    <article className="flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Image src={barber.image} alt={`Portrait of ${barber.name}`} fill sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 90vw" className="object-cover" />
      </div>
      <h3 className="mt-4 font-display text-h3 font-bold">{barber.name}</h3>
      <p className="text-sm font-medium text-pole">{barber.title}</p>
      {detailed && <p className="mt-3 text-[0.9375rem] text-steel">{barber.bio}</p>}
      <p className="mt-2 text-sm text-steel">Works {days}</p>
      <Link href={`/book?barber=${barber.slug}`} className="mt-4 inline-block self-start text-sm font-semibold underline underline-offset-4 hover:text-pole">
        Book with {barber.name.split(" ")[0]}
      </Link>
    </article>
  );
}
