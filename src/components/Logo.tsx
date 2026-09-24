import Link from "next/link";

/** Mark: a barber pole set in a rounded capsule. Wordmark is live text so it stays sharp and readable. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="cl-pole"><rect x="13" y="2" width="14" height="36" rx="7" /></clipPath>
      </defs>
      <g clipPath="url(#cl-pole)">
        <rect x="13" y="2" width="14" height="36" fill="#F5F3EE" />
        <g transform="rotate(-35 20 20)" fill="#A5342A">
          <rect x="0" y="-6" width="60" height="5" /><rect x="0" y="4" width="60" height="5" /><rect x="0" y="14" width="60" height="5" />
          <rect x="0" y="24" width="60" height="5" /><rect x="0" y="34" width="60" height="5" /><rect x="0" y="44" width="60" height="5" />
        </g>
        <g transform="rotate(-35 20 20)" fill="#15202B">
          <rect x="0" y="-1" width="60" height="5" /><rect x="0" y="9" width="60" height="5" /><rect x="0" y="19" width="60" height="5" />
          <rect x="0" y="29" width="60" height="5" /><rect x="0" y="39" width="60" height="5" />
        </g>
      </g>
      <rect x="13" y="2" width="14" height="36" rx="7" fill="none" stroke="#15202B" strokeWidth="1.5" />
      <rect x="10" y="0" width="20" height="4" rx="1" fill="#15202B" />
      <rect x="10" y="36" width="20" height="4" rx="1" fill="#15202B" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Copperline Barbers, home">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-display text-xl font-extrabold tracking-tight ${light ? "text-paper" : "text-ink"}`}>Copperline</span>
        <span className={`mt-1 block text-[0.6875rem] font-semibold tracking-[0.18em] ${light ? "text-paper/70" : "text-steel"}`}>BARBERS</span>
      </span>
    </Link>
  );
}
