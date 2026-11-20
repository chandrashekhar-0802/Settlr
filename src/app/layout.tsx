import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { StoreProvider } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/env";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Settlr — Your new job. Your new city. Everything sorted.",
    template: "%s · Settlr",
  },
  description:
    "Settlr helps young professionals relocating for work find a stay, food, commute and everyday essentials — organised around their workplace and budget. Launching in Pune.",
  openGraph: {
    title: "Settlr — Your new job. Your new city. Everything sorted.",
    description: "Plan your stay, food, commute and essentials around your new workplace.",
    siteName: "Settlr",
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f4f9fc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${jakarta.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <StoreProvider connected={isSupabaseConfigured()}>{children}</StoreProvider>
      </body>
    </html>
  );
}
