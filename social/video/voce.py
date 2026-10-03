#!/usr/bin/env python3
"""Voce sintetica dei video: legge da stdin [{"id", "testo", "voce"?}], scrive <dir>/<id>.wav e stampa le durate in JSON.
Usa Kokoro (kokoro-onnx, licenza Apache 2.0; pronuncia con espeak-ng, GPL, usato solo come strumento).
Uso: VOCE_MODELLI=<cartella con kokoro-v1.0.onnx e voices-v1.0.bin> python voce.py <dir> [voce]"""
import json
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

cartella, voce = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "im_nicola")
velocita = float(os.environ.get("VOCE_VELOCITA", "1.15"))
m = os.environ.get("VOCE_MODELLI", ".")
k = Kokoro(os.path.join(m, "kokoro-v1.0.onnx"), os.path.join(m, "voices-v1.0.bin"))
durate = {}
for r in json.load(sys.stdin):
    a, sr = k.create(r["testo"], voice=r.get("voce") or voce, speed=velocita, lang="it")
    sf.write(os.path.join(cartella, r["id"] + ".wav"), a, sr)
    durate[r["id"]] = round(len(a) / sr, 3)
print(json.dumps(durate))
