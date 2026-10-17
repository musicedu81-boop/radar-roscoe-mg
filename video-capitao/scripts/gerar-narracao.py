"""Gera a narração da apresentação em motion e os tempos de cada frase e palavra.

Entrada: src/apresentacao/narracao-roteiro.json (frases faladas e legendas, por cena).
Saídas:
  public/apresentacao/narracao/<cena>.wav   áudio da narração de cada cena (começa no corte)
  src/apresentacao/narracao.json             compassos por cena, tempos das frases e legendas
                                             palavra por palavra (formato Caption do Remotion)

Voz: Kokoro multi-lang v1.0 (sherpa-onnx), falante pt-BR. Os tempos das palavras saem da
transcrição da própria voz com o Parakeet, alinhada ao texto da legenda.

Uso: python3 scripts/gerar-narracao.py <dir_modelos_tts> <dir_modelos_asr>
"""

import difflib
import importlib.util
import json
import math
import os
import re
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf
from scipy import signal

FPS = 30
COMPASSO_S = 2.0  # 120 BPM
ENTRADA_PADRAO = 0.35  # a voz começa logo depois do corte
PAUSA_VIRGULA = 0.3
PAUSA_PONTO = 0.45
CAUDA_MIN = 1.2  # respiro depois da última frase antes do próximo corte

# Energia da trilha por cena: letra por compasso (ver gerar-trilha-motion.py)
ENERGIA = {
    "abertura": lambda n: "I" * (n - 1) + "R",
    "numeros": lambda n: "A" * n,
    "ritmo": lambda n: "M" * n,
    "reels": lambda n: "A" * n,
    "pilares": lambda n: "M" * n,
    "estrategia": lambda n: "B" * (n - 1) + "R",
    "semana": lambda n: "A" * n,
    "janela": lambda n: "M" * n,
    "calendario": lambda n: "A" * n,
    "metas": lambda n: "A" * n,
    "crise": lambda n: "M" * (n - 1) + "R",
    "encerramento": lambda n: "F" * n,
}


def carregar_tts(d, voz):
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=f"{d}/model.onnx",
                voices=f"{d}/voices.bin",
                tokens=f"{d}/tokens.txt",
                data_dir=f"{d}/espeak-ng-data",
                dict_dir=f"{d}/dict",
                lexicon=f"{d}/lexicon-us-en.txt,{d}/lexicon-zh.txt",
                lang="pt-br",
            ),
            num_threads=4,
        )
    )
    return sherpa_onnx.OfflineTts(cfg)


def aparar(x, sr):
    """Tira o silêncio do começo e do fim (janelas de 10 ms abaixo de -42 dBFS)."""
    j = int(0.01 * sr)
    rms = np.array([np.sqrt(np.mean(x[i : i + j] ** 2) + 1e-12) for i in range(0, len(x) - j, j)])
    voz = np.where(20 * np.log10(rms) > -42)[0]
    if not len(voz):
        return x
    a = max(0, voz[0] * j - int(0.03 * sr))
    b = min(len(x), (voz[-1] + 1) * j + int(0.06 * sr))
    return x[a:b]


def nivelar(x):
    """RMS da fala em -19 dBFS, pico limitado a -1 dBFS."""
    rms = np.sqrt(np.mean(x**2) + 1e-12)
    x = x * (10 ** (-19 / 20) / rms)
    pico = np.max(np.abs(x))
    if pico > 0.89:
        x = np.tanh(x / 0.89) * 0.89
    return x


def normalizar(p):
    return re.sub(r"[^\wà-ú]", "", p.lower().replace(".", "").replace(",", ""))


def alinhar(legenda, palavras_asr, ini_s, fim_s):
    """Tempos de cada palavra da legenda a partir das palavras reconhecidas na voz."""
    alvo = legenda.split()
    a = [normalizar(w) for w in alvo]
    b = [normalizar(w["text"]) for w in palavras_asr]
    tempos = [None] * len(alvo)
    for bloco in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks():
        for k in range(bloco.size):
            w = palavras_asr[bloco.b + k]
            tempos[bloco.a + k] = (w["start"], w["end"])
    # Palavras sem correspondência: distribui pelo tamanho entre as vizinhas conhecidas
    i = 0
    while i < len(alvo):
        if tempos[i] is not None:
            i += 1
            continue
        j = i
        while j < len(alvo) and tempos[j] is None:
            j += 1
        t0 = tempos[i - 1][1] if i > 0 else ini_s
        t1 = tempos[j][0] if j < len(alvo) else fim_s
        pesos = [max(1, len(alvo[k])) for k in range(i, j)]
        total = sum(pesos)
        acum = t0
        for k, p in zip(range(i, j), pesos):
            d = (t1 - t0) * p / total
            tempos[k] = (acum, acum + d)
            acum += d
        i = j
    return list(zip(alvo, tempos))


def main(dir_tts, dir_asr):
    roteiro = json.load(open("src/apresentacao/narracao-roteiro.json", encoding="utf-8"))
    voz = roteiro["voz"]
    tts = carregar_tts(dir_tts, voz)
    spec = importlib.util.spec_from_file_location("transcrever", "scripts/transcrever.py")
    tr = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tr)
    parakeet, _ = tr.load_models(dir_asr)

    os.makedirs("public/apresentacao/narracao", exist_ok=True)
    saida = {"voz": voz["nome"], "fps": FPS, "cenas": []}
    mapa = []

    for cena in roteiro["cenas"]:
        entrada = cena.get("entradaSegundos", ENTRADA_PADRAO)
        pedacos, frases, legendas = [], [], []
        t = entrada
        sr = None
        for k, fr in enumerate(cena["frases"]):
            g = tts.generate(fr["fala"], sid=voz["falante"], speed=voz["velocidade"])
            sr = g.sample_rate
            x = nivelar(aparar(np.array(g.samples, dtype=np.float32), sr))
            dur = len(x) / sr
            # Tempos das palavras: transcreve a própria voz em 16 kHz
            x16 = signal.resample_poly(x, 2, 3).astype(np.float32) if sr == 24000 else x
            res = tr.decode(parakeet, x16)
            palavras = tr.words_from_tokens(res.tokens, res.timestamps, 0.0, dur)
            for palavra, (a, b) in alinhar(fr["legenda"], palavras, 0.0, dur):
                legendas.append({
                    "text": " " + palavra,
                    "startMs": round((t + a) * 1000),
                    "endMs": round((t + b) * 1000),
                    "timestampMs": round((t + (a + b) / 2) * 1000),
                    "confidence": None,
                })
            frases.append({
                "legenda": fr["legenda"],
                "inicio": round(t * FPS),
                "fim": round((t + dur) * FPS),
            })
            pedacos.append((t, x))
            t += dur
            if k < len(cena["frases"]) - 1:
                t += PAUSA_PONTO if fr["fala"].rstrip()[-1] in ".?:!" else PAUSA_VIRGULA

        compassos = max(cena["minCompassos"], math.ceil((t + CAUDA_MIN) / COMPASSO_S))
        audio = np.zeros(int(t * sr) + int(0.2 * sr), dtype=np.float32)
        for ini, x in pedacos:
            i = int(ini * sr)
            audio[i : i + len(x)] += x
        sf.write(f"public/apresentacao/narracao/{cena['id']}.wav", audio, sr)
        saida["cenas"].append({
            "id": cena["id"],
            "compassos": compassos,
            "fimNarracao": round(t * FPS),
            "frases": frases,
            "legendas": legendas,
        })
        mapa.append(ENERGIA[cena["id"]](compassos))
        print(f"{cena['id']:<13} fala {t - entrada:5.1f}s  ->  {compassos} compassos ({compassos * COMPASSO_S:.0f}s)")

    saida["mapaTrilha"] = " ".join(mapa)
    json.dump(saida, open("src/apresentacao/narracao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    total = sum(c["compassos"] for c in saida["cenas"]) * COMPASSO_S
    print(f"Total: {total:.0f}s. Mapa da trilha: {saida['mapaTrilha']}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
