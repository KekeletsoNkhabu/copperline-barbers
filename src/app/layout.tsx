import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { shop } from "@/config/shop";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Copperline Barbers | Haircuts, fades and shaves in Harrismith", template: "%s | Copperline Barbers" },
  description: "Copperline Barbers in Tshiame A, Harrismith. Skin fades, scissor cuts, beard trims and hot towel shaves. Book your chair online in a minute.",
  openGraph: {
    type: "website", siteName: shop.name, locale: "en_ZA",
    title: "Copperline Barbers | Haircuts, fades and shaves in Harrismith",
    description: "Four barbers, one chair each, no rushing. Book online.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#15202B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: shop.name,
    telephone: shop.phone,
    email: shop.email,
    url: siteUrl,
    address: { "@type": "PostalAddress", streetAddress: shop.address.street, addressLocality: shop.address.city, postalCode: shop.address.postcode, addressCountry: "ZA" },
    priceRange: "R100-R270",
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday", "Friday"], opens: "09:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "09:00", closes: "19:30" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "15:00" },
    ],
  };
  return (
    <html lang="en-ZA">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
