import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 sm:px-6">
        <h1 className="text-5xl font-extrabold">Settlr</h1>
        <p className="mt-4 text-muted">Your new job. Your new city. Everything sorted.</p>
      </main>
      <SiteFooter />
    </>
  );
}
