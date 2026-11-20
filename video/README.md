# Settlr explainer (HyperFrames project)

60 s · 1920×1080 · 30 fps · Hinglish voiceover with captions.

| Path | What |
|---|---|
| `script/voiceover.json` | The script: Devanagari text spoken by the voice, Roman Hinglish used for captions |
| `script/build-timing.mjs` | Lays the narration on the 60 s timeline, mixes `assets/vo/voiceover.wav`, writes `script/timing.json` and `assets/captions.vtt` |
| `script/gen-scenes.mjs` | Writes `index.html` and `compositions/*.html` (camera moves cue on spoken words). Re-running overwrites hand edits |
| `script/gen-music.py` | Original background bed with MusicGen (local, no account) |
| `script/rects.json` | On-screen positions of key UI elements, from `../scripts/capture-video-assets.mjs` |
| `assets/screens/` | Real screenshots of the site (2×) |
| `assets/hero.mp4` | Real screen recording of the live 3D hero |
| `assets/sfx/` | Pixabay-licensed sound effects (free for commercial use) |

## Rebuild

```powershell
# 1. Re-capture screens (site running on :3100):  node ..\scripts\capture-video-assets.mjs
# 2. Voice (local Kokoro; needs: pip install kokoro-onnx soundfile; set HYPERFRAMES_PYTHON to that Python)
#    npx hyperframes tts "<line>" -v hm_omega -l hi -o assets/vo/s1.wav   (one file per line in script/voiceover.json)
node script/build-timing.mjs
node script/gen-scenes.mjs
npx hyperframes check
npx hyperframes render -q delivery -o renders/settlr-explainer.mp4
```

Then copy a web-compressed version to `../public/video/` (see the ffmpeg command in the repo's DEPLOYMENT.md).

Voice: Kokoro `hm_omega`, synthetic, generated on-device. Music: MusicGen-small, generated on-device (seeded).
