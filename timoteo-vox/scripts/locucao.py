"""Gera a locução (Kokoro-82M, o mesmo motor do `npx hyperframes tts`) frase a frase
e monta a faixa mestre + o mapa de tempos usado pela animação.

Pré-requisito: rodar uma vez `npx hyperframes tts "teste" -v pm_alex` para baixar o modelo
no cache do HyperFrames (~/.cache/hyperframes/tts) e `pip install kokoro-onnx soundfile`.

Uso: python3 scripts/locucao.py [roteiro.json] [timing.json] [nome_audio]
  padrão (versão longa):  roteiro/roteiro.json  src/data/timing.json  narracao
  Short:                  roteiro/roteiro-short.json src/data/timing-short.json narracao-short
"""
import sys
import json
import os
import re

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

# Correções de pronúncia (fonemas IPA do espeak usados pelo Kokoro).
# Timóteo se fala TI-MÓ-TÊO: "ê" fechado no fim, nunca "timótchiu".
# O espeak gera "tʃˌimˈɔtʃjʊ"; o correto é "tʃˌimˈɔteʊ".
# Vale também para a forma ligada antes de vogal ("Timóteo é" -> "...tʃjw ɛ").
PRONUNCIA = [
    (re.compile(r"(tʃˌ?imˈɔ)tʃj[ʊw]"), r"\1teʊ"),
]


def fonemas(texto: str) -> str:
    ph = kokoro.tokenizer.phonemize(texto, "pt-br")
    for padrao, certo in PRONUNCIA:
        ph = padrao.sub(certo, ph)
    assert "ɔtʃj" not in ph, f"pronúncia de Timóteo não corrigida: {ph}"
    return ph

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.expanduser("~/.cache/hyperframes/tts")
MODEL = os.path.join(CACHE, "models", "kokoro-v1.0.onnx")
VOICES = os.path.join(CACHE, "voices", "voices-v1.0.bin")

FPS = 30
GAP_FALA = float(os.environ.get("GAP_FALA", 0.32))     # pausa entre frases da mesma cena
PRE_CENA = float(os.environ.get("PRE_CENA", 0.45))     # respiro antes da primeira frase da cena
POS_CENA = float(os.environ.get("POS_CENA", 0.65))     # respiro depois da última frase
PRE_ABERTURA = float(os.environ.get("PRE_ABERTURA", 0.9))

ARG_ROTEIRO = sys.argv[1] if len(sys.argv) > 1 else "roteiro/roteiro.json"
ARG_TIMING = sys.argv[2] if len(sys.argv) > 2 else "src/data/timing.json"
ARG_AUDIO = sys.argv[3] if len(sys.argv) > 3 else "narracao"
roteiro = json.load(open(os.path.join(ROOT, ARG_ROTEIRO), encoding="utf-8"))
voz = roteiro["voz"]
vel = roteiro["velocidade"]
kokoro = Kokoro(MODEL, VOICES)

sr_out = 24000
trilha = []
cenas = []
t = 0.0


def silencio(seg):
    return np.zeros(int(round(seg * sr_out)), dtype=np.float32)


def palavras(cap, ini, dur):
    """Estima o tempo de cada palavra proporcional ao tamanho (para legenda karaokê)."""
    toks = cap.split()
    pesos = [len(re.sub(r"[^\wÀ-ú0-9]", "", w)) + 1.6 for w in toks]
    total = sum(pesos)
    out, acc = [], ini
    for w, p in zip(toks, pesos):
        d = dur * p / total
        out.append({"w": w, "t": round(acc, 3)})
        acc += d
    return out


for ci, cena in enumerate(roteiro["cenas"]):
    ini_cena = t
    falas_out = []
    if cena.get("fixo"):
        dur = cena["fixo"]
        trilha.append(silencio(dur))
        t += dur
    else:
        pre = PRE_ABERTURA if ci == 0 else PRE_CENA
        trilha.append(silencio(pre))
        t += pre
        for fi, fala in enumerate(cena["falas"]):
            ph = fonemas(fala["say"])
            audio, sr = kokoro.create(ph, voice=voz, speed=vel, lang="pt-br", is_phonemes=True)
            assert sr == sr_out, sr
            audio = audio.astype(np.float32)
            dur = len(audio) / sr
            falas_out.append({
                "id": f"{cena['id']}-{fi + 1}",
                "cap": fala["cap"],
                "t": round(t - ini_cena, 3),
                "dur": round(dur, 3),
                "words": palavras(fala["cap"], round(t - ini_cena, 3), dur),
            })
            trilha.append(audio)
            t += dur
            if fi < len(cena["falas"]) - 1:
                trilha.append(silencio(GAP_FALA))
                t += GAP_FALA
        trilha.append(silencio(POS_CENA))
        t += POS_CENA
    # alinha cada cena a frames inteiros
    dur_cena = t - ini_cena
    frames = int(round(dur_cena * FPS))
    ajuste = frames / FPS - dur_cena
    if ajuste > 0:
        trilha.append(silencio(ajuste))
    elif ajuste < 0:
        trilha[-1] = trilha[-1][: len(trilha[-1]) + int(round(ajuste * sr_out))]
    t = ini_cena + frames / FPS
    cenas.append({"id": cena["id"], "inicio": round(ini_cena, 3), "dur": round(frames / FPS, 3),
                  "frames": frames, "falas": falas_out})
    print(f"{cena['id']:<12} {frames / FPS:6.2f}s  falas={len(falas_out)}")

master = np.concatenate(trilha)
# normaliza pico em -1 dBFS
pico = float(np.max(np.abs(master))) or 1.0
master = master / pico * 10 ** (-1 / 20)
os.makedirs(os.path.join(ROOT, "public", "voz"), exist_ok=True)
wav = os.path.join(ROOT, "public", "voz", ARG_AUDIO + ".wav")
sf.write(wav, master, sr_out, subtype="PCM_16")
os.system(f"ffmpeg -v error -y -i \"{wav}\" -c:a libmp3lame -b:a 192k \"{wav[:-4]}.mp3\" && rm \"{wav}\"")
total_frames = sum(c["frames"] for c in cenas)
json.dump({"fps": FPS, "voz": voz, "velocidade": vel, "totalFrames": total_frames, "cenas": cenas},
          open(os.path.join(ROOT, ARG_TIMING), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print(f"TOTAL {total_frames / FPS:.1f}s ({total_frames} frames)")
