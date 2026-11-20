import type { MetadataRoute } from "next";
import { DEMO_LISTINGS } from "@/lib/demo-data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/explore", "/explore/accommodation", "/explore/food", "/explore/transport", "/explore/essentials", "/onboarding", "/for-employers", "/provider/apply", "/help", "/about", "/contact", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...DEMO_LISTINGS.filter((l) => l.category !== "transport").map((l) => ({ url: `${base}/services/${l.id}`, priority: 0.4 })),
  ];
}
