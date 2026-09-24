import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ["", "/services", "/about", "/contact", "/book", "/terms"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/book" ? 0.9 : 0.6,
  }));
}
