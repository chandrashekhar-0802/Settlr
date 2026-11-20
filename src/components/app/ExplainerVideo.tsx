/**
 * The 60-second Hinglish explainer, served from /public (Vercel CDN) so it plays on any device.
 * Native controls, no autoplay, preload="none" so it costs nothing until the user presses play,
 * playsInline for iOS, and a WebVTT captions track.
 */
export function ExplainerVideo() {
  return (
    <section aria-labelledby="video-h" className="grid items-center gap-6 rounded-[32px] bg-white p-5 shadow-soft ring-1 ring-line/70 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue">Explainer · 1 min</p>
        <h2 id="video-h" className="mt-2 text-2xl font-extrabold sm:text-3xl">
          See how Settlr works
        </h2>
        <p className="mt-2 text-muted">A one-minute walkthrough in Hinglish — from onboarding to your first week. Captions included.</p>
      </div>
      <div className="overflow-hidden rounded-3xl bg-navy ring-1 ring-line">
        <video
          className="aspect-video h-auto w-full"
          controls
          playsInline
          preload="none"
          poster="/video/settlr-explainer-poster.jpg"
          aria-describedby="video-h"
        >
          <source src="/video/settlr-explainer.mp4" type="video/mp4" />
          <track kind="captions" src="/video/settlr-explainer.vtt" srcLang="hi" label="Hinglish" default />
          Your browser can&apos;t play this video. <a href="/video/settlr-explainer.mp4">Download the explainer (MP4)</a>.
        </video>
      </div>
    </section>
  );
}
