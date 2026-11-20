// Lays the per-scene narration on a 60 s timeline, mixes assets/vo/voiceover.wav and writes
// script/timing.json + captions (assets/captions.vtt).
// Run from video/: node script/build-timing.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const TOTAL = 60;
const LEAD = 0.3; // silence before the first line
const GAP = 0.45; // pause between lines (scene cut sits in the middle)
const lines = JSON.parse(readFileSync("script/voiceover.json", "utf8"));
const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).trim();

const durs = lines.map((l) => dur(`assets/vo/${l.id}.wav`));
// Spread the spare time evenly between lines (0.45–1.6 s), keeping 1.6 s of end card after the last word.
const gap = Math.min(1.6, Math.max(GAP, (TOTAL - 1.6 - LEAD - durs.reduce((a, b) => a + b, 0)) / (lines.length - 1)));
let t = LEAD;
const timed = lines.map((l, i) => {
  const d = durs[i];
  const out = { id: l.id, start: +t.toFixed(3), dur: +d.toFixed(3), en: l.en };
  t += d + gap;
  return out;
});
// The closing line sits so it ends ~1.6 s before the end, leaving the end card to breathe.
const last = timed.at(-1);
last.start = +(TOTAL - 1.6 - last.dur).toFixed(3);
if (timed.at(-2).start + timed.at(-2).dur > last.start - 0.3) throw new Error("Narration too long for 60 s");

// Scene boundaries: halfway through each gap; first scene starts at 0, last ends at TOTAL.
const scenes = timed.map((l, i) => {
  const start = i === 0 ? 0 : +((timed[i - 1].start + timed[i - 1].dur + l.start) / 2).toFixed(3);
  const end = i === timed.length - 1 ? TOTAL : +((l.start + l.dur + timed[i + 1].start) / 2).toFixed(3);
  return { id: l.id, start, dur: +(end - start).toFixed(3), voStart: +(l.start - start).toFixed(3), voDur: l.dur };
});

// Caption groups: ≤5 words, break on punctuation; time by character share of the spoken line.
const captions = [];
for (const l of timed) {
  const words = l.en.split(/\s+/);
  const groups = [];
  let g = [];
  for (const w of words) {
    g.push(w);
    if (g.length >= 5 || /[.?!,:]$|\.\.\.$/.test(w)) {
      groups.push(g.join(" "));
      g = [];
    }
  }
  if (g.length) groups.push(g.join(" "));
  const chars = groups.reduce((s, x) => s + x.length, 0);
  let c = l.start;
  for (const text of groups) {
    const d = (text.length / chars) * l.dur;
    captions.push({ id: `c${captions.length}`, text, start: +c.toFixed(3), end: +(c + d).toFixed(3) });
    c += d;
  }
}

writeFileSync("script/timing.json", JSON.stringify({ total: TOTAL, lines: timed, scenes, captions }, null, 1));
const vtt = (s) => new Date(s * 1000).toISOString().slice(11, 23);
writeFileSync("assets/captions.vtt", "WEBVTT\n\n" + captions.map((c, i) => `${i + 1}\n${vtt(c.start)} --> ${vtt(c.end)}\n${c.text}\n`).join("\n"));

// Mix the narration: each line delayed to its start, padded to exactly 60 s.
const inputs = timed.flatMap((l) => ["-i", `assets/vo/${l.id}.wav`]);
const delays = timed.map((l, i) => `[${i}:a]adelay=${Math.round(l.start * 1000)}:all=1[a${i}]`).join(";");
const mix = `${delays};${timed.map((_, i) => `[a${i}]`).join("")}amix=inputs=${timed.length}:normalize=0,apad=whole_dur=${TOTAL},atrim=0:${TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...inputs, "-filter_complex", mix, "-map", "[out]", "-ar", "48000", "assets/vo/voiceover.wav"]);
// The composition plays the compressed copy (the WAV is a git-ignored intermediate).
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", "assets/vo/voiceover.wav", "-c:a", "aac", "-b:a", "160k", "assets/vo/voiceover.m4a"]);
console.log(JSON.stringify(scenes, null, 0));
console.log(`${captions.length} caption groups; voiceover.wav ${dur("assets/vo/voiceover.wav").toFixed(2)} s`);
