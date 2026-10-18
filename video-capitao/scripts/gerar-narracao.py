"""Gera a narração da apresentação em motion e os tempos de cada frase e palavra.

Entrada: src/apresentacao/narracao-roteiro.json (frases faladas e legendas, por cena).
Saídas:
  public/apresentacao/narracao/<cena>.wav   áudio da narração de cada cena (começa no corte)
  src/apresentacao/narracao.json             compassos por cena, tempos das frases e legendas
                                             palavra por palavra (formato Caption do Remotion)

Voz ("motor" em voz, no roteiro):
  gemini  Gemini TTS da API do Google AI Studio, uma chamada por cena (fala corrida, com direção
          de locução comercial). Chave em GEMINI_API_KEY (ou GOOGLE_API_KEY).
  kokoro  Kokoro multi-lang v1.0 (sherpa-onnx) local, frase por frase.
Os tempos das palavras saem da transcrição da própria voz com o Parakeet, alinhada ao texto da
legenda. A "fala" pode trazer grafia de pronúncia (ex.: "Timótêo", "Kést"); a legenda mostra a
grafia certa.

Uso: python3 scripts/gerar-narracao.py <dir_modelos_tts> <dir_modelos_asr>
     (com o motor gemini, <dir_modelos_tts> não é usado: passe -)
"""

import base64
import difflib
import importlib.util
import json
import math
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

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
CAUDA_ENCAIXE = 0.9  # respiro mínimo quando a voz do Gemini é acelerada para caber na cena
ANDAMENTO_MAX = 1.25  # acima disso a fala fica corrida demais: gera de novo

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


GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models"


def modelos_tts(cabecalhos):
    """Modelos de TTS que a chave enxerga, do pro para o flash (o nome do modelo muda com o tempo)."""
    pedido = urllib.request.Request(f"{GEMINI_API}?pageSize=1000", headers=cabecalhos)
    with urllib.request.urlopen(pedido, timeout=60) as r:
        nomes = [m["name"].split("/")[-1] for m in json.load(r).get("models", []) if "tts" in m["name"]]
    return sorted(nomes, key=lambda n: ("pro" not in n, "preview" in n, n))


def falar_gemini(texto, voz):
    """Sintetiza `texto` com o Gemini TTS. Devolve (amostras float32 mono, taxa)."""
    chave = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    cabecalhos = {"Content-Type": "application/json"}
    if chave:
        cabecalhos["x-goog-api-key"] = chave
    corpo = {
        "contents": [{"parts": [{"text": f'{voz["direcao"]}: "{texto}"'}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voz["vozGemini"]}}},
        },
    }
    for tentativa in range(8):
        pedido = urllib.request.Request(
            f"{GEMINI_API}/{voz['modelo']}:generateContent",
            data=json.dumps(corpo).encode("utf-8"),
            headers=cabecalhos,
        )
        try:
            with urllib.request.urlopen(pedido, timeout=120) as r:
                dados = json.load(r)
            break
        except TimeoutError:
            print("  Gemini demorou demais; tentando de novo", flush=True)
            continue
        except urllib.error.HTTPError as e:
            erro = e.read().decode("utf-8", "replace")
            if e.code == 404 and tentativa < 7:
                # Modelo do roteiro saiu de linha: usa o melhor modelo de TTS disponível
                disponiveis = modelos_tts(cabecalhos)
                if not disponiveis:
                    sys.exit("Nenhum modelo de TTS disponível para esta chave do Gemini.")
                print(f"Modelo {voz['modelo']} indisponível; usando {disponiveis[0]}")
                voz["modelo"] = disponiveis[0]
                continue
            if e.code in (429, 500, 502, 503, 504) and tentativa < 7:
                espera = re.search(r'"retryDelay":\s*"(\d+)s"', erro)
                time.sleep(int(espera.group(1)) + 1 if espera else 5 * 2**tentativa)
                continue
            sys.exit(f"Gemini TTS respondeu {e.code}: {erro[:400]}")
    parte = dados["candidates"][0]["content"]["parts"][0]["inlineData"]
    taxa = re.search(r"rate=(\d+)", parte.get("mimeType", ""))
    pcm = np.frombuffer(base64.b64decode(parte["data"]), dtype="<i2")
    return pcm.astype(np.float32) / 32768.0, int(taxa.group(1)) if taxa else 24000

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


def locutor(x, sr):
    """Tratamento de locutor: corta graves, dá presença e brilho e comprime de leve.
    Filtros IIR e compressor sem antecipação: não atrasam a voz (a legenda segue em sincronia)."""
    cadeia = (
        "highpass=f=90,equalizer=f=3200:t=q:w=1.0:g=3,treble=g=2:f=9000,"
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=90"
    )
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
         "-af", cadeia, "-f", "f32le", "-"],
        input=x.astype(np.float32).tobytes(), capture_output=True, check=True,
    )
    y = np.frombuffer(r.stdout, dtype=np.float32)
    return y[: len(x)] if len(y) >= len(x) else np.pad(y, (0, len(x) - len(y)))


def acelerar(x, sr, fator):
    """Acelera a fala por `fator` mantendo o tom e o timbre (rubberband)."""
    if abs(fator - 1) < 0.005:
        return x
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
         "-af", f"rubberband=tempo={fator:.4f}:transients=mixed:formant=preserved",
         "-f", "f32le", "-"],
        input=x.astype(np.float32).tobytes(), capture_output=True, check=True,
    )
    return np.frombuffer(r.stdout, dtype=np.float32).copy()


def confere(palavras_asr, texto):
    """A voz leu o texto pedido? Compara o que o Parakeet ouviu com as palavras da legenda.
    Pega instrução lida em voz alta, frase pulada ou repetida."""
    a = [normalizar(w) for w in texto.split()]
    b = [normalizar(w["text"]) for w in palavras_asr]
    semelhanca = difflib.SequenceMatcher(a=a, b=b, autojunk=False).ratio()
    return semelhanca >= 0.8 and len(b) <= 1.2 * len(a), semelhanca

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


def preparar(x, sr, voz):
    x = aparar(x, sr)
    if voz.get("tratamento") == "locutor":
        x = locutor(x, sr)
    return nivelar(x)


def legenda(palavra, a, b):
    """Uma palavra no formato Caption do Remotion (a e b em segundos, a partir do corte)."""
    return {
        "text": " " + palavra,
        "startMs": round(a * 1000),
        "endMs": round(b * 1000),
        "timestampMs": round((a + b) / 2 * 1000),
        "confidence": None,
    }


def main(dir_tts, dir_asr):
    roteiro = json.load(open("src/apresentacao/narracao-roteiro.json", encoding="utf-8"))
    voz = roteiro["voz"]
    gemini = voz.get("motor") == "gemini"
    tts = None if gemini else carregar_tts(dir_tts, voz)
    spec = importlib.util.spec_from_file_location("transcrever", "scripts/transcrever.py")
    tr = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tr)
    parakeet, _ = tr.load_models(dir_asr)

    def ouvir(x, sr, dur):
        """Palavras reconhecidas na própria voz (Parakeet em 16 kHz), com início e fim."""
        x16 = signal.resample_poly(x, 2, 3).astype(np.float32) if sr == 24000 else x
        res = tr.decode(parakeet, x16)
        return tr.words_from_tokens(res.tokens, res.timestamps, 0.0, dur)

    os.makedirs("public/apresentacao/narracao", exist_ok=True)
    saida = {"voz": voz["nome"], "fps": FPS, "cenas": []}
    mapa = []

    for cena in roteiro["cenas"]:
        entrada = cena.get("entradaSegundos", ENTRADA_PADRAO)
        pedacos, frases, legendas = [], [], []
        t = entrada
        sr = None
        if gemini:
            # A cena inteira numa chamada: a fala corre como num comercial, e o início e o fim de
            # cada frase saem dos tempos das palavras
            texto_legenda = " ".join(fr["legenda"] for fr in cena["frases"])
            # Espaço da fala dentro da cena travada (minCompassos), com um respiro antes do corte
            cabe = cena["minCompassos"] * COMPASSO_S - CAUDA_ENCAIXE - entrada
            for tentativa in range(5):
                x, sr = falar_gemini(" ".join(fr["fala"] for fr in cena["frases"]), voz)
                x = aparar(x, sr)
                fator = max(voz.get("andamento", 1.0), len(x) / sr / cabe)
                if fator > ANDAMENTO_MAX:
                    print(f"  {cena['id']}: fala longa demais ({len(x) / sr:.1f}s), gerando de novo", flush=True)
                    continue
                x = preparar(acelerar(x, sr, fator), sr, voz)
                dur = len(x) / sr
                palavras = ouvir(x, sr, dur)
                ok, semelhanca = confere(palavras, texto_legenda)
                if ok:
                    break
                print(f"  {cena['id']}: a voz saiu do texto (semelhança {semelhanca:.2f}), gerando de novo", flush=True)
            else:
                sys.exit(f"Gemini não leu o texto da cena {cena['id']} depois de 5 tentativas.")
            print(f"  {cena['id']}: andamento {fator:.2f}x, semelhança {semelhanca:.2f}", flush=True)
            alinhadas = alinhar(texto_legenda, palavras, 0.0, dur)
            for fr in cena["frases"]:
                n = len(fr["legenda"].split())
                trecho, alinhadas = alinhadas[:n], alinhadas[n:]
                legendas += [legenda(palavra, t + a, t + b) for palavra, (a, b) in trecho]
                frases.append({
                    "legenda": fr["legenda"],
                    "inicio": round((t + trecho[0][1][0]) * FPS),
                    "fim": round((t + trecho[-1][1][1]) * FPS),
                })
            pedacos.append((t, x))
            t += dur
        else:
            for k, fr in enumerate(cena["frases"]):
                g = tts.generate(fr["fala"], sid=voz["falante"], speed=voz["velocidade"])
                sr = g.sample_rate
                x = preparar(np.array(g.samples, dtype=np.float32), sr, voz)
                dur = len(x) / sr
                for palavra, (a, b) in alinhar(fr["legenda"], ouvir(x, sr, dur), 0.0, dur):
                    legendas.append(legenda(palavra, t + a, t + b))
                frases.append({
                    "legenda": fr["legenda"],
                    "inicio": round(t * FPS),
                    "fim": round((t + dur) * FPS),
                })
                pedacos.append((t, x))
                t += dur
                if k < len(cena["frases"]) - 1:
                    ponto = fr["fala"].rstrip()[-1] in ".?:!"
                    t += voz.get("pausaPonto", PAUSA_PONTO) if ponto else voz.get("pausaVirgula", PAUSA_VIRGULA)

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
        print(f"{cena['id']:<13} fala {t - entrada:5.1f}s  ->  {compassos} compassos ({compassos * COMPASSO_S:.0f}s)", flush=True)

    saida["mapaTrilha"] = " ".join(mapa)
    json.dump(saida, open("src/apresentacao/narracao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    total = sum(c["compassos"] for c in saida["cenas"]) * COMPASSO_S
    print(f"Total: {total:.0f}s. Mapa da trilha: {saida['mapaTrilha']}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
