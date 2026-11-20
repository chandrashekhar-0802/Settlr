import type { Listing } from "@/lib/types";

/**
 * Illustrated thumbnail (not a photo). Demo listings have no real photography, so we draw an
 * isometric vignette per category instead of using stock images that would imply a real property.
 */
const BG = ["#E8EBFB", "#FDECEA", "#FDF5DC", "#E1F4EE", "#E9F2F8"];

export function ListingArt({ listing, className = "" }: { listing: Listing; className?: string }) {
  const seed = [...listing.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = BG[seed % BG.length];
  const cat = listing.category;
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-label={`Illustration for ${listing.name}`}>
      <rect width="320" height="180" fill={bg} />
      <g transform="translate(160 118)">
        <path d="M0 -38 96 14 0 66 -96 14Z" fill="#fff" opacity=".85" />
        <path d="M-96 14 0 66v8l-96-52Z" fill="#DBE6EF" />
        <path d="M96 14 0 66v8l96-52Z" fill="#C9D6E3" />
        {cat === "accommodation" && (
          <g>
            <path d="M-34 -6 0 -26 34 -6 34 -64 0 -84 -34 -64Z" fill="#fff" />
            <path d="M0 -26 34 -6V-64L0 -84Z" fill="#E3ECF4" />
            <path d="M-38 -62 0 -86 38 -62 0 -40Z" fill="#F36A5B" />
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <rect x={-26} y={-58 + r * 16 + 6} width="8" height="8" fill={r === seed % 3 ? "#F6C653" : "#B9C4F3"} transform="skewY(30)" />
                <rect x={-12} y={-58 + r * 16 + 14} width="8" height="8" fill="#B9C4F3" transform="skewY(30)" />
              </g>
            ))}
            <rect x={10} y={-20} width="8" height="14" fill="#17283A" transform="skewY(-30)" />
          </g>
        )}
        {cat === "food" && (
          <g>
            <ellipse cx="0" cy="-18" rx="44" ry="20" fill="#fff" stroke="#DBE6EF" />
            <ellipse cx="0" cy="-22" rx="30" ry="12" fill="#F6C653" />
            <circle cx="-10" cy="-24" r="6" fill="#F36A5B" />
            <circle cx="10" cy="-22" r="5" fill="#3FAE8C" />
            <rect x="34" y="-60" width="18" height="40" rx="5" fill="#6879DE" />
            <rect x="34" y="-66" width="18" height="8" rx="3" fill="#17283A" />
          </g>
        )}
        {cat === "transport" && (
          <g>
            <path d="M-50 -10 40 -62 66 -47 -24 5Z" fill="#6879DE" />
            <path d="M-24 5 66 -47v16L-24 21Z" fill="#5565C4" />
            <path d="M-50 -10 -24 5v16l-26-15Z" fill="#7B8BE6" />
            <path d="M-30 -14 30 -48 44 -40 -16 -6Z" fill="#17283A" opacity=".85" />
            <circle cx="-14" cy="20" r="6" fill="#17283A" />
            <circle cx="46" cy="-14" r="6" fill="#17283A" />
          </g>
        )}
        {cat === "essentials" && (
          <g>
            <path d="M-30 -10 0 -28 30 -10 0 8Z" fill="#E2B47A" />
            <path d="M-30 -10 0 8v30l-30-18Z" fill="#D9A86C" />
            <path d="M30 -10 0 8v30l30-18Z" fill="#C9955A" />
            <path d="M-4 -26 4 -26 4 8 -4 8Z" fill="#C9955A" opacity=".5" />
            <path d="M24 -64a26 26 0 0 1 36 0M31 -56a16 16 0 0 1 22 0" stroke="#6879DE" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="42" cy="-47" r="4" fill="#6879DE" />
          </g>
        )}
      </g>
    </svg>
  );
}
