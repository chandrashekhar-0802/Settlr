import { SiteHeader } from "@/components/SiteHeader";
import { ModeBanner } from "@/components/ModeBanner";
import { SiteFooter } from "@/components/SiteFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader app />
      <ModeBanner />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-8 sm:px-6">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
