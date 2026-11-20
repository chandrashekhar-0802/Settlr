/**
 * Reserved slot for the 60-second explainer. No video exists yet, so nothing pretends to play:
 * the Play button is disabled and labelled "coming soon". Replace with a <video> once the explainer is approved.
 */
export function VideoPlaceholder() {
  return (
    <section aria-labelledby="video-h" className="grid items-center gap-6 rounded-[32px] bg-white p-5 shadow-soft ring-1 ring-line/70 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue">Explainer</p>
        <h2 id="video-h" className="mt-2 text-2xl font-extrabold sm:text-3xl">
          See how Settlr works
        </h2>
        <p className="mt-2 text-muted">A one-minute walkthrough of planning your move — from onboarding to your first week.</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-sun-soft px-3 py-1 text-xs font-bold text-[#7a5b0c]">Explainer coming soon</p>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8EBFB] via-[#F4F9FC] to-[#FDECEA]">
        {/* poster art */}
        <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full" aria-hidden>
          <g transform="translate(320 210)">
            <path d="M0 -70 200 30 0 130 -200 30Z" fill="#fff" />
            <path d="M-200 30 0 130v14l-200-100Z" fill="#DBE6EF" />
            <path d="M200 30 0 130v14l200-100Z" fill="#C9D6E3" />
            <path d="M-120 10 -80 -12 -40 10v-90l-40-22-40 22Z" fill="#fff" stroke="#DBE6EF" />
            <path d="M-80 -12 -40 10v-90l-40-22Z" fill="#E3ECF4" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M-112 ${-60 + i * 14} -86 ${-74 + i * 14}`} stroke="#B9C4F3" strokeWidth="6" />
            ))}
            <path d="M10 40 50 18 90 40v-46L50 -28 10 -6Z" fill="#fff" stroke="#DBE6EF" />
            <path d="M6 -6 50 -32 94 -6 50 18Z" fill="#F36A5B" />
            <circle cx="120" cy="-40" r="16" fill="#F36A5B" />
            <path d="M108 -32 120 -8 132 -32Z" fill="#F36A5B" />
            <circle cx="120" cy="-40" r="6" fill="#fff" />
            <path d="M-20 70 60 26" stroke="#6879DE" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 14" />
          </g>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <button type="button" disabled aria-disabled="true" aria-label="Play explainer video (coming soon)" className="grid size-20 cursor-not-allowed place-items-center rounded-full bg-white/90 text-navy shadow-lift ring-1 ring-line">
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7Z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <span className="absolute bottom-3 left-3 rounded-full bg-navy/80 px-3 py-1 text-xs font-semibold text-white">Coming soon · 1:00</span>
      </div>
    </section>
  );
}
