import type { ReactNode } from "react";
import { Eyebrow } from "./ui";

export function ProsePage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
      <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-navy/85 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_a]:font-semibold [&_a]:text-blue [&_a]:underline-offset-4 hover:[&_a]:underline">
        {children}
      </div>
    </div>
  );
}
