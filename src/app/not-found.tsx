import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="grid flex-1 place-items-center px-4 py-24 text-center">
        <div>
          <p className="text-sm font-bold text-blue">404</p>
          <h1 className="mt-2 text-4xl font-extrabold">This street isn&apos;t on our map yet.</h1>
          <p className="mt-3 text-muted">The page you were looking for doesn&apos;t exist or has moved.</p>
          <div className="mt-8 flex justify-center gap-3">
            <LinkButton href="/">Go home</LinkButton>
            <LinkButton href="/explore" variant="secondary">Explore Pune</LinkButton>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
