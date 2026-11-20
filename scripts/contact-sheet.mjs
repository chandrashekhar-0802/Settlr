// node scripts/contact-sheet.mjs out.png colWidth cropHeight file1.png file2.png ...
import sharp from "sharp";
const [out, colW, cropH, ...files] = process.argv.slice(2);
const W = +colW, H = +cropH;
const tiles = await Promise.all(files.map(async (f) => {
  const m = await sharp(f).metadata();
  const scale = W / m.width;
  const h = Math.min(m.height, Math.round(H / scale));
  return sharp(f).extract({ left: 0, top: 0, width: m.width, height: h }).resize({ width: W }).png().toBuffer();
}));
const heights = await Promise.all(tiles.map(async (t) => (await sharp(t).metadata()).height));
await sharp({ create: { width: W * files.length + 10 * (files.length - 1), height: Math.max(...heights), channels: 3, background: "#ffffff" } })
  .composite(tiles.map((t, i) => ({ input: t, left: i * (W + 10), top: 0 })))
  .png().toFile(out);
console.log("wrote", out);
