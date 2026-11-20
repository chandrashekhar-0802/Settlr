// Verifies the explainer loads and plays (served over HTTP, as on Vercel) in each browser engine.
import { chromium, firefox, webkit } from "@playwright/test";
const url = (process.argv[2] ?? "http://localhost:3100") + "/video/settlr-explainer.mp4";
for (const [name, type] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
  const b = await type.launch();
  const p = await b.newPage();
  await p.goto(url.replace(/\/video\/.*/, "/help"));
  const r = await p.evaluate(async (src) => {
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.src = src;
    document.body.append(v);
    const ok = await new Promise((res) => { v.onloadedmetadata = () => res(true); v.onerror = () => res(false); setTimeout(() => res(false), 15000); });
    if (!ok) return { canPlay: v.canPlayType("video/mp4"), error: v.error?.code };
    await v.play().catch(() => {});
    await new Promise((res) => setTimeout(res, 1500));
    return { duration: v.duration, w: v.videoWidth, h: v.videoHeight, advanced: v.currentTime > 0.3 };
  }, url);
  console.log(name, JSON.stringify(r));
  await b.close();
}
