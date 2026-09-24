import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page section max-w-2xl">
      <h1 className="font-display text-h2 font-bold">Page not found</h1>
      <p className="mt-3 text-steel">That page does not exist. Try the links below.</p>
      <div className="mt-6 flex gap-3"><Link href="/" className="btn btn-outline">Home</Link><Link href="/book" className="btn btn-primary">Book now</Link></div>
    </div>
  );
}
