// Generates index.html + compositions/*.html from script/timing.json, script/rects.json and the SHOTS list below.
// Camera moves land on the word the narrator is saying. Run from video/: node script/gen-scenes.mjs
// (Re-running overwrites hand edits to the generated files.)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const T = JSON.parse(readFileSync("script/timing.json", "utf8"));
const R = JSON.parse(readFileSync("script/rects.json", "utf8"));
const VP = { w: 1440, h: 810 }; // browser viewport inside the window
const REST = VP.w / 1920; // 0.75: whole page visible

const line = (id) => T.lines.find((l) => l.id === id);
const scene = (id) => T.scenes.find((s) => s.id === id);
/** Scene-local time at which `word` is spoken in scene `id` (by character position). */
const at = (id, word) => {
  const l = line(id), s = scene(id);
  const i = l.en.toLowerCase().indexOf(word.toLowerCase());
  if (i < 0) throw new Error(`cue "${word}" not in ${id}`);
  return +(l.start - s.start + (i / l.en.length) * l.dur).toFixed(2);
};
const rect = (shot, sel) => {
  const r = R[shot]?.[sel];
  if (!r) throw new Error(`no rect ${shot} ${sel}`);
  return r;
};
/** Camera that frames rect r (CSS px of the 1920×1080 page) inside the viewport. */
function cam(r, pad = 40, max = 1.75) {
  if (!r) return { x: 0, y: 0, scale: REST };
  const s = Math.min(max, VP.w / (r.w + pad * 2), VP.h / (r.h + pad * 2));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const x = clamp(VP.w / 2 - (r.x + r.w / 2) * s, VP.w - 1920 * s, 0);
  const y = clamp(VP.h / 2 - (r.y + r.h / 2) * s, VP.h - 1080 * s, 0);
  return { x: Math.round(x), y: Math.round(y), scale: +s.toFixed(4) };
}

// Shots per scene. `from`/`to` are scene-local seconds; `moves` are camera targets at a time.
const S = {
  s1: [
    { img: "home-problem", url: "/", from: 0, to: null, moves: [
      [0, cam(rect("home-problem", "section:nth-of-type(2) h2"), 120, 1.3)],
      [at("s1", "Lekin ab"), cam({ x: 344, y: 372, w: 640, h: 182 }, 50)],
      [at("s1", "khaana"), cam({ x: 936, y: 372, w: 640, h: 182 }, 50)],
      [at("s1", "sab kuch"), cam(rect("home-problem", "section:nth-of-type(2) ol"), 60)],
    ] },
  ],
  s2: [{ video: "assets/hero.mp4", url: "/", from: 0, to: null, moves: [
    [0, cam(null)],
    [at("s2", "everything"), cam({ x: 284, y: 240, w: 1300, h: 420 }, 30)],
    [at("s2", "Pune"), cam(null)],
  ] }],
  s3: [
    { img: "onb-city", url: "/onboarding", from: 0, moves: [[0, cam(rect("onb-city", "main form"), 30, 1.35)]] },
    { img: "onb-work", url: "/onboarding", from: at("s3", "office"), moves: [[0, cam(rect("onb-work", "main form"), 30, 1.35)]] },
    { img: "onb-date", url: "/onboarding", from: at("s3", "kab shift"), moves: [[0, cam(rect("onb-date", "main form"), 30, 1.35)]] },
    { img: "onb-budget", url: "/onboarding", from: at("s3", "budget"), moves: [[0, cam(rect("onb-budget", "main form"), 30, 1.35)]] },
  ],
  s4: [
    { img: "explore-stays", url: "/explore/accommodation", from: 0, moves: [[0, cam({ x: 600, y: 300, w: 1000, h: 560 }, 20)]] },
    { img: "explore-food", url: "/explore/food", from: at("s4", "tiffin"), moves: [[0, cam({ x: 600, y: 300, w: 1000, h: 560 }, 20)]] },
    { img: "explore-transport", url: "/explore/transport", from: at("s4", "commute"), moves: [[0, cam({ x: 344, y: 290, w: 1232, h: 560 }, 20)]] },
    { img: "explore-stays", url: "/explore/accommodation", from: at("s4", "Filter"), moves: [
      [0, cam({ x: 344, y: 300, w: 600, h: 560 }, 20)],
      [at("s4", "save") - at("s4", "Filter"), cam(rect("explore-stays", "main article"), 30)],
    ] },
    { img: "compare", url: "/compare", from: at("s4", "compare kijiye"), moves: [[0, cam(rect("compare", "main table"), 20)]] },
  ],
  s5: [
    { img: "my-plan", url: "/my-plan", from: 0, moves: [
      [0, cam(rect("my-plan", "main aside"), 40, 1.3)],
      [at("s5", "PG mein"), cam({ x: 344, y: 257, w: 860, h: 400 }, 30)],
    ] },
  ],
  s6: [
    { img: "checklist", url: "/checklist", from: 0, moves: [[0, cam({ x: 344, y: 200, w: 1232, h: 640 }, 20)]] },
    { img: "dashboard", url: "/dashboard", from: at("s6", "dashboard"), moves: [[0, cam(null)], [1.2, cam(rect("dashboard", "main section:nth-of-type(1)"), 30)]] },
  ],
};

const FONT = `@font-face { font-family: "Jakarta"; src: url("assets/fonts/PlusJakartaSans-latin.woff2") format("woff2"); font-weight: 200 800; }`;
const BASE_CSS = `
${FONT}
#root { position: absolute; inset: 0; background: #F4F9FC; font-family: "Jakarta", sans-serif; overflow: hidden; }
.deco { position: absolute; border-radius: 28px; }
.win { position: absolute; left: 240px; top: 50px; width: 1440px; height: 854px; border-radius: 22px; background: #fff; overflow: hidden;
  box-shadow: 0 2px 6px rgb(23 40 58 / .06), 0 40px 80px -30px rgb(23 40 58 / .35); }
.shot { position: absolute; inset: 0; }
.bar { position: absolute; left: 0; top: 0; right: 0; height: 44px; background: #EEF3F8; display: flex; align-items: center; gap: 8px; padding: 0 18px; }
.dot { width: 12px; height: 12px; border-radius: 50%; }
.url { margin-left: 18px; height: 30px; padding: 0 18px; border-radius: 15px; background: #fff; color: #4A5A6B; font-size: 18px; font-weight: 600; display: flex; align-items: center; }
.vp { position: absolute; left: 0; top: 44px; width: ${VP.w}px; height: ${VP.h}px; overflow: hidden; }
.cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
.cam img, .cam video { width: 1920px; height: 1080px; display: block; }
`;
const deco = (id) => `
    <div id="${id}-d1" class="deco" data-layout-ignore style="left:96px;top:690px;width:120px;height:120px;background:#17283A;"></div>
    <div id="${id}-d2" class="deco" data-layout-ignore style="left:1736px;top:120px;width:84px;height:84px;background:#F36A5B;"></div>
    <div id="${id}-d3" class="deco" data-layout-ignore style="left:1760px;top:760px;width:56px;height:56px;background:#F6C653;border-radius:16px;"></div>`;

function sceneHtml(id) {
  const sc = scene(id);
  const shots = S[id].map((sh, i, arr) => ({ ...sh, start: sh.from, end: i < arr.length - 1 ? arr[i + 1].from : sc.dur }));
  const body = shots
    .map((sh, i) => {
      const media = sh.video
        ? `<video id="${id}-v${i}" class="clip" src="${sh.video}" muted playsinline data-start="${sh.start}" data-duration="${(sh.end - sh.start).toFixed(2)}"></video>`
        : `<img src="assets/screens/${sh.img}.jpg" alt="" />`;
      const wrapAttrs = sh.video ? `class="shot"` : `class="clip shot" data-start="${sh.start}" data-duration="${(sh.end - sh.start).toFixed(2)}"`;
      return `
      <div id="${id}-shot${i}" ${wrapAttrs}>
        <div class="bar"><span class="dot" style="background:#F36A5B"></span><span class="dot" style="background:#F6C653"></span><span class="dot" style="background:#3FAE8C"></span><span class="url" data-layout-ignore>settlr${sh.url === "/" ? "" : " · " + sh.url}</span></div>
        <div class="vp"><div id="${id}-cam${i}" class="cam">${media}</div></div>
      </div>`;
    })
    .join("");
  const tweens = shots
    .flatMap((sh, i) => {
      const len = sh.end - sh.start;
      const [first, ...rest] = sh.moves;
      const c0 = first[1];
      const out = [`tl.set("#${id}-cam${i}", { x: ${c0.x}, y: ${c0.y}, scale: ${c0.scale} }, ${sh.start});`];
      rest.forEach(([t, c]) => out.push(`tl.to("#${id}-cam${i}", { x: ${c.x}, y: ${c.y}, scale: ${c.scale}, duration: 0.9, ease: "power3.inOut" }, ${(sh.start + t).toFixed(2)});`));
      // gentle drift so a held frame never freezes
      const last = (rest.at(-1) ?? first)[1];
      const lastT = sh.start + (rest.at(-1)?.[0] ?? 0) + (rest.length ? 0.9 : 0);
      if (sh.start + len - lastT > 0.6) out.push(`tl.to("#${id}-cam${i}", { scale: ${(last.scale * 1.025).toFixed(4)}, x: ${Math.round(last.x - VP.w * 0.0125)}, y: ${Math.round(last.y - VP.h * 0.0125)}, duration: ${(sh.start + len - lastT).toFixed(2)}, ease: "none" }, ${lastT.toFixed(2)});`);
      return out;
    })
    .join("\n    ");
  const intro = id === "s1"
    ? `tl.fromTo("#${id}-win", { y: 30 }, { y: 0, duration: 0.8, ease: "power3.out" }, 0);`
    : `tl.set("#${id}-win", { y: 0 }, 0);`;
  return `<template>
  <style>${BASE_CSS}</style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080">${deco(id)}
    <div id="${id}-win" class="win">${body}
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${intro}
    tl.fromTo("#${id}-d1", { y: 0, rotation: 8 }, { y: -24, rotation: 14, duration: ${sc.dur.toFixed(2)}, ease: "none" }, 0);
    tl.fromTo("#${id}-d2", { y: 0, rotation: -10 }, { y: 30, rotation: 2, duration: ${sc.dur.toFixed(2)}, ease: "none" }, 0);
    tl.fromTo("#${id}-d3", { y: 0, rotation: 20 }, { y: -18, rotation: 40, duration: ${sc.dur.toFixed(2)}, ease: "none" }, 0);
    ${tweens}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

function endHtml() {
  const id = "s7";
  const sc = scene(id);
  const t = (w) => at(id, w);
  return `<template>
  <style>
  ${FONT}
  #root { position: absolute; inset: 0; background: #17283A; font-family: "Jakarta", sans-serif; overflow: hidden; color: #fff; }
  #s7-mark { position: absolute; left: 50%; top: 250px; width: 150px; height: 150px; margin-left: -75px; }
  #s7-word { position: absolute; left: 0; right: 0; top: 420px; text-align: center; font-size: 104px; font-weight: 800; letter-spacing: -0.04em; }
  #s7-tag { position: absolute; left: 0; right: 0; top: 570px; text-align: center; font-size: 46px; font-weight: 700; letter-spacing: -0.02em; }
  #s7-tag span { display: inline-block; }
  #s7-cta { position: absolute; left: 0; right: 0; top: 690px; text-align: center; }
  #s7-pill { display: inline-block; padding: 18px 34px; border-radius: 16px; background: #F36A5B; font-size: 30px; font-weight: 700; }
  #s7-note { position: absolute; left: 0; right: 0; top: 800px; text-align: center; font-size: 28px; color: rgb(255 255 255 / .6); font-weight: 600; }
  .s7-sq { position: absolute; border-radius: 40px; }
  </style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080">
    <div id="s7-sq1" class="s7-sq" data-layout-ignore style="left:-60px;top:80px;width:260px;height:260px;background:rgb(104 121 222 / .35);"></div>
    <div id="s7-sq2" class="s7-sq" data-layout-ignore style="left:1700px;top:760px;width:180px;height:180px;background:rgb(243 106 91 / .45);"></div>
    <svg id="s7-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3 29 10.5v11L16 29 3 21.5v-11Z" fill="#2A3D52" />
      <path d="M16 3 29 10.5 16 18 3 10.5Z" fill="#3A5068" />
      <path d="M9 15.2 16 11l7 4.2v1.9L16 13 9 17.1Z" fill="#F36A5B" />
      <path d="M11.5 17.6 16 15l4.5 2.6v4.6L16 24.8l-4.5-2.6Z" fill="#fff" />
      <circle cx="16" cy="19.6" r="1.25" fill="#6879DE" />
    </svg>
    <div id="s7-word">Settlr<span style="color:#F36A5B">.</span></div>
    <div id="s7-tag"><span id="s7-t1">Your new job.</span> <span id="s7-t2">Your new city.</span> <span id="s7-t3" style="color:#9AA9F0">Everything sorted.</span></div>
    <div id="s7-cta"><span id="s7-pill">Create your plan →</span></div>
    <div id="s7-note">Launching in Pune</div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#s7-mark", { scale: 0.6, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }, ${Math.max(0.1, t("Settlr") - 0.1).toFixed(2)});
    tl.fromTo("#s7-word", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, ${(t("Settlr") + 0.15).toFixed(2)});
    tl.fromTo("#s7-t1", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${t("Nayi job").toFixed(2)});
    tl.fromTo("#s7-t2", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${t("naya shehar").toFixed(2)});
    tl.fromTo("#s7-t3", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${t("sab kuch").toFixed(2)});
    tl.fromTo("#s7-pill", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, ${(t("sab kuch") + 0.35).toFixed(2)});
    tl.fromTo("#s7-note", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ${(t("sab kuch") + 0.6).toFixed(2)});
    tl.fromTo("#s7-sq1", { rotation: 10, y: 0 }, { rotation: 18, y: 30, duration: ${sc.dur.toFixed(2)}, ease: "none" }, 0);
    tl.fromTo("#s7-sq2", { rotation: -8, y: 0 }, { rotation: 6, y: -26, duration: ${sc.dur.toFixed(2)}, ease: "none" }, 0);
    window.__timelines["s7"] = tl;
  </script>
</template>
`;
}

function captionsHtml() {
  const endStart = scene("s7").start;
  const caps = T.captions.filter((c) => c.start < endStart);
  const groups = caps
    .map((c, i) => {
      // One caption at a time: hand over exactly at the next group's start when it follows closely.
      const next = caps[i + 1];
      const end = next && next.start - c.end < 0.3 ? next.start : Math.min(c.end + 0.12, T.total);
      return `    <div id="cap-${c.id}" class="clip cap" data-start="${c.start}" data-duration="${(end - c.start).toFixed(3)}"><span id="cap-${c.id}-t" class="capt">${c.text}</span></div>`;
    })
    .join("\n");
  const tweens = caps.map((c) => `tl.fromTo("#cap-${c.id}-t", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, ${c.start});`).join("\n    ");
  return `<template>
  <style>
  ${FONT}
  #root { position: absolute; inset: 0; font-family: "Jakarta", sans-serif; pointer-events: none; }
  .cap { position: absolute; left: 0; right: 0; bottom: 64px; text-align: center; overflow: visible; }
  .capt { display: inline-block; padding: 10px 26px; border-radius: 14px; background: rgb(23 40 58 / .92); color: #fff; font-size: 40px; font-weight: 700; letter-spacing: -0.01em; }
  </style>
  <div id="root" data-composition-id="captions" data-width="1920" data-height="1080">
${groups}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${tweens}
    window.__timelines["captions"] = tl;
  </script>
</template>
`;
}

mkdirSync("compositions", { recursive: true });
for (const id of Object.keys(S)) writeFileSync(`compositions/${id}.html`, sceneHtml(id));
writeFileSync("compositions/s7.html", endHtml());
writeFileSync("compositions/captions.html", captionsHtml());

// Root: scene hosts, captions host, audio.
const hosts = T.scenes
  .map((s, i) => `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-track-kind="graphics" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`)
  .join("\n");
const cuts = T.scenes.slice(1);
const SFX_LEN = { whoosh: 0.57, "whoosh-short": 0.57, "click-soft": 0.37, pop: 0.72, chime: 2.5 };
const sfx = [
  ...cuts.map((s, i) => ({ id: `sfx-cut${i}`, src: i % 2 ? "whoosh-short" : "whoosh", t: Math.max(0, s.start - 0.12), v: 0.35 })),
  // a soft click on each onboarding screen change
  ...S.s3.slice(1).map((sh, i) => ({ id: `sfx-click${i}`, src: "click-soft", t: scene("s3").start + sh.from, v: 0.5 })),
  { id: "sfx-pop", src: "pop", t: scene("s7").start + at("s7", "sab kuch") + 0.35, v: 0.45 },
];
const audio = [
  `      <audio id="vo" class="clip" src="assets/vo/voiceover.m4a" data-start="0" data-duration="${T.total}" data-volume="1" data-track-index="10"></audio>`,
  `      <audio id="music" class="clip" src="assets/music/bed.m4a" data-start="0" data-duration="${T.total}" data-volume="0.16" data-track-index="11"></audio>`,
  ...sfx.map((x, i) => `      <audio id="${x.id}" class="clip" src="assets/sfx/${x.src}.mp3" data-start="${x.t.toFixed(2)}" data-duration="${SFX_LEN[x.src]}" data-volume="${x.v}" data-track-index="${12 + (i % 2)}"></audio>`),
].join("\n");

writeFileSync(
  "index.html",
  `<!doctype html>
<html lang="hi-Latn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Settlr — 60-second explainer</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #F4F9FC; }
      #root { position: relative; width: 1920px; height: 1080px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${T.total}" data-width="1920" data-height="1080">
${hosts}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-track-kind="captions" data-start="0" data-duration="${T.total}" data-track-index="2" data-width="1920" data-height="1080" style="z-index:50"></div>
${audio}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`,
);
console.log("generated index.html, compositions/s1..s7.html, captions.html");
