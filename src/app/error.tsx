"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page section max-w-2xl">
      <h1 className="font-display text-h2 font-bold">Something went wrong</h1>
      <p className="mt-3 text-steel">We hit a problem loading this page. Please try again.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">Try again</button>
    </div>
  );
}
