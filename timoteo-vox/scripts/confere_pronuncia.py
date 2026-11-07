"""Confere, sem ouvido humano, se cada "Timóteo" da locução saiu TI-MÓ-TÊO.

Usa um reconhecedor de fones (allosaurus, inventário do português), que transcreve os
sons sem dicionário. Modelos de linguagem que "ouvem" o áudio não servem: eles escrevem
o nome como conhecem, mesmo quando a fala está certa.

Critério (calibrado com a locução Kokoro de fonema forçado, certa e errada):
  certo  "Ti-mó-têo"   -> ... m ó  T  e/i o ...   (t puro antes do final)
  errado "Ti-mó-tchio" -> ... m ó  (sem t) i o ... (o t vira tch e o reconhecedor não marca t)

Instalação (pesada, só para conferir): pip install torch && pip install --no-deps allosaurus panphon
&& pip install resampy editdistance regex. O panphon importa `unicodecsv`, que não compila no
Python 3.13: um módulo `unicodecsv.py` com `from csv import *` no PYTHONPATH resolve.

Uso:
  python3 scripts/confere_pronuncia.py                 # todas as falas com Timóteo da narração atual
  python3 scripts/confere_pronuncia.py a.wav b.wav     # arquivos avulsos
Sai com código 1 se alguma ocorrência reprovar.
"""
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from allosaurus.app import read_recognizer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOGAIS_O = {"a", "o", "ɔ", "ə", "ɒ", "ʌ", "u"}
_modelo = None


def fones(wav_path):
    global _modelo
    if _modelo is None:
        _modelo = read_recognizer()
    linhas = _modelo.recognize(wav_path, lang_id="por", timestamp=True).strip().splitlines()
    return [ln.split()[2] for ln in linhas if len(ln.split()) == 3]


def passa(seq):
    """True se existe "m" + (vogal do "mó", às vezes omitida pelo reconhecedor) seguido de t puro."""
    for i, p in enumerate(seq):
        if p != "m":
            continue
        j = i + 1
        while j < len(seq) and j <= i + 2 and seq[j] in VOGAIS_O:
            j += 1
        if j < len(seq) and seq[j] in ("t̪", "t"):
            return True
    return False


def falas_da_narracao():
    t = json.load(open(os.path.join(ROOT, "src/data/timing.json"), encoding="utf-8"))
    r = json.load(open(os.path.join(ROOT, "roteiro/roteiro.json"), encoding="utf-8"))
    say = {f"{c['id']}-{i + 1}": f["say"] for c in r["cenas"] for i, f in enumerate(c.get("falas", []))}
    tmp = tempfile.mkdtemp()
    wav = os.path.join(tmp, "narr16.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, "public/voz/narracao.mp3"),
                    "-ac", "1", "-ar", "16000", wav], check=True)
    a, sr = sf.read(wav, dtype="float32")
    for c in t["cenas"]:
        for f in c["falas"]:
            if "Timóteo" in say.get(f["id"], ""):
                s = c["inicio"] + f["t"]
                arq = os.path.join(tmp, f["id"] + ".wav")
                sf.write(arq, a[int(s * sr): int((s + f["dur"]) * sr)], sr, subtype="PCM_16")
                yield f["id"], arq


def para_16k(path):
    a, sr = sf.read(path, dtype="float32", always_2d=True)
    a = a.mean(axis=1)
    if sr != 16000:
        from scipy.signal import resample_poly
        g = np.gcd(sr, 16000)
        a = resample_poly(a, 16000 // g, sr // g).astype(np.float32)
    out = tempfile.mktemp(suffix=".wav")
    sf.write(out, a, 16000, subtype="PCM_16")
    return out


if __name__ == "__main__":
    itens = [(os.path.basename(p), para_16k(p)) for p in sys.argv[1:]] or list(falas_da_narracao())
    ruins = []
    for nome, arq in itens:
        seq = fones(arq)
        ok = passa(seq)
        if not ok:
            ruins.append(nome)
        print(f"{'OK ' if ok else 'ERRO'} {nome:<22} {' '.join(seq)}")
    print("reprovadas:", ruins if ruins else "nenhuma")
    sys.exit(1 if ruins else 0)
