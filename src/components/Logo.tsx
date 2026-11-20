import Link from "next/link";

/** Original Settlr mark: an isometric tile (the new city) with a coral roof chevron (home). */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3 29 10.5v11L16 29 3 21.5v-11Z" fill="#17283A" />
      <path d="M16 3 29 10.5 16 18 3 10.5Z" fill="#2A3D52" />
      <path d="M9 15.2 16 11l7 4.2v1.9L16 13 9 17.1Z" fill="#F36A5B" />
      <path d="M11.5 17.6 16 15l4.5 2.6v4.6L16 24.8l-4.5-2.6Z" fill="#fff" />
      <circle cx="16" cy="19.6" r="1.25" fill="#6879DE" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-extrabold text-[1.15rem] tracking-tight text-navy">
      <LogoMark />
      <span>
        Settlr<span className="text-coral">.</span>
      </span>
    </Link>
  );
}
