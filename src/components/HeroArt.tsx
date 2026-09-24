/** Hero illustration: an oversized barber pole on ink, drawn as SVG so it is crisp at every size. */
export function HeroArt() {
  return (
    <svg viewBox="0 0 480 560" role="img" aria-label="Illustration of a barber pole" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id="hero-pole"><rect x="170" y="70" width="140" height="400" rx="70" /></clipPath>
        <pattern id="hero-stripes" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <rect width="90" height="90" fill="#F5F3EE" />
          <rect width="30" height="90" fill="#A5342A" />
          <rect x="45" width="30" height="90" fill="#15202B" />
        </pattern>
        <linearGradient id="hero-shade" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset=".35" stopColor="#fff" stopOpacity=".12" /><stop offset="1" stopColor="#000" stopOpacity=".32" /></linearGradient>
      </defs>
      <rect width="480" height="560" fill="#1C2A38" />
      <rect x="24" y="24" width="432" height="512" fill="none" stroke="#F5F3EE" strokeOpacity=".25" />
      <rect x="150" y="40" width="180" height="46" rx="6" fill="#F5F3EE" />
      <rect x="150" y="454" width="180" height="46" rx="6" fill="#F5F3EE" />
      <g clipPath="url(#hero-pole)">
        <rect x="170" y="70" width="140" height="400" fill="url(#hero-stripes)" />
        <rect x="170" y="70" width="140" height="400" fill="url(#hero-shade)" />
      </g>
      <text x="240" y="532" textAnchor="middle" fill="#F5F3EE" fillOpacity=".8" fontFamily="'Archivo Variable', Arial, sans-serif" fontSize="14" letterSpacing="4" fontWeight="600">TSHIAME A, HARRISMITH</text>
    </svg>
  );
}
