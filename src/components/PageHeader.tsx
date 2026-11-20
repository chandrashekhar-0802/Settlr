import type { ReactNode } from "react";
import { Eyebrow } from "./ui";

export function PageHeader({ eyebrow, title, body, actions }: { eyebrow?: string; title: string; body?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {body && <p className="mt-2 text-muted">{body}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
