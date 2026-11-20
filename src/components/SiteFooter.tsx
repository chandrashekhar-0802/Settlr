import Link from "next/link";
import { Logo } from "./Logo";

const COLS = [
  { title: "Product", links: [["Explore Pune", "/explore"], ["Create my plan", "/onboarding"], ["Budget planner", "/budget"], ["Moving checklist", "/checklist"]] },
  { title: "Company", links: [["About", "/about"], ["For employers", "/for-employers"], ["List your service", "/provider/apply"], ["Contact", "/contact"]] },
  { title: "Support", links: [["Help & FAQ", "/help"], ["Privacy Policy", "/privacy"], ["Terms", "/terms"], ["GitHub", "https://github.com/chandrashekhar-0802/Settlr"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/70 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">Your new job. Your new city. Everything sorted. Launching in Pune.</p>
          <p className="mt-4 max-w-xs text-xs text-muted">
            Listings marked <strong>DEMO</strong> are sample data for this MVP. Settlr does not process payments.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-bold">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  {href.startsWith("http") ? (
                    <a href={href} className="text-sm text-muted hover:text-navy" target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className="text-sm text-muted hover:text-navy">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line/60 py-5 text-center text-xs text-muted">© {new Date().getFullYear()} Settlr. Map data © OpenStreetMap contributors.</div>
    </footer>
  );
}
