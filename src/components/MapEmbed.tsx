import { shop } from "@/config/shop";

export function MapEmbed() {
  const q = encodeURIComponent(shop.mapQuery);
  return (
    <iframe
      title={`Map showing ${shop.name} in ${shop.address.suburb}, ${shop.address.city}`}
      src={`https://maps.google.com/maps?q=${q}&z=14&output=embed`}
      className="h-full min-h-[320px] w-full border-0 bg-bone"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
