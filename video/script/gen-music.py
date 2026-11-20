# Generates an original background bed with MusicGen (facebook/musicgen-small, runs locally, no account).
# python script/gen-music.py  -> assets/music/bed-raw.wav (~30 s)
import numpy as np, soundfile as sf, torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration

torch.manual_seed(7)  # reproducible
proc = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")
prompt = "uplifting modern startup background music, warm piano chords, soft synth pads, light clean percussion, optimistic and calm, 100 bpm, no vocals"
inputs = proc(text=[prompt], padding=True, return_tensors="pt")
# ~50 tokens per second of audio
audio = model.generate(**inputs, do_sample=True, guidance_scale=3.0, max_new_tokens=1500)
sr = model.config.audio_encoder.sampling_rate
sf.write("assets/music/bed-raw.wav", audio[0, 0].cpu().numpy().astype(np.float32), sr)
print("wrote assets/music/bed-raw.wav", round(audio.shape[-1] / sr, 2), "s")
