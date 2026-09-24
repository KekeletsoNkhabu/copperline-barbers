import type { Metadata } from "next";
import Link from "next/link";
import { BarberCard } from "@/components/BarberCard";
import { getBarbers } from "@/lib/catalog";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About us and our barbers",
  description: "Copperline Barbers opened in Tshiame A, Harrismith in 2014. Meet Thabo, Priya, Liam and Ayanda, and see who works which days.",
};

export default async function AboutPage() {
  const barbers = await getBarbers();
  return (
    <>
      <div className="container-page section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h1 className="font-display text-hero font-extrabold">A neighbourhood shop that takes its time.</h1>
          <div className="space-y-5 text-lg text-steel">
            <p>Thabo Mokoena opened Copperline in 2014 with two chairs and a borrowed mirror. He had spent ten years cutting hair in Johannesburg and wanted a shop where nobody watched the clock.</p>
            <p>Today there are four of us. We still keep appointments to a proper length, we still sweep between clients, and we still finish every cut with a hot towel and a check in the mirror from the back.</p>
            <p>We cut all hair types. If you bring a photo, we will tell you honestly whether it will work with your hair and how to get close.</p>
          </div>
        </div>
      </div>
      <section id="barbers" className="scroll-mt-24 bg-bone section" aria-labelledby="team-title">
        <div className="container-page">
          <h2 id="team-title" className="font-display text-h2 font-bold">Meet the barbers</h2>
          <p className="mt-3 max-w-xl text-steel">Each barber has set days. Choose one when you book and you will only see times they are working.</p>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((b) => <BarberCard key={b.id} barber={b} detailed />)}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-page flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-h2 font-bold">Ready for a fresh cut?</h2>
          <Link href="/book" className="btn btn-primary">Book an appointment</Link>
        </div>
      </section>
    </>
  );
}
