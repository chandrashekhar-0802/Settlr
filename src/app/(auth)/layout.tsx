import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main id="main" className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
      </main>
      <div aria-hidden className="relative hidden overflow-hidden bg-[#E9F2F8] lg:block">
        <div className="absolute inset-10 bg-[url('/hero-city.webp')] bg-contain bg-center bg-no-repeat" />
        <p className="absolute bottom-10 left-10 right-10 text-2xl font-extrabold text-navy">Your new job. Your new city. Everything sorted.</p>
      </div>
    </div>
  );
}
