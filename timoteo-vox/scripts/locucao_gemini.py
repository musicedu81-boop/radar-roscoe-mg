"""Locução com a voz do Google AI Studio (Gemini TTS), no mesmo formato de saída de
`scripts/locucao.py`: faixa mestre em public/voz/<nome>.mp3 e mapa de tempos em JSON.

Mesma chamada que o HyperFrames usa (`media-use/audio/scripts/lib/gemini-tts.mjs`):
POST /v1beta/interactions, modelo gemini-3.8-flash-tts, ritmo controlado por "style".

Chave: GEMINI_API_KEY ou GOOGLE_API_KEY no ambiente. Se nenhuma estiver definida, a
requisição sai sem chave e o proxy do ambiente injeta o segredo de rede configurado
para generativelanguage.googleapis.com (cabeçalho x-goog-api-key).

Uso:
  python3 scripts/locucao_gemini.py [roteiro.json] [timing.json] [nome_audio]
Variáveis:
  GEMINI_VOZ (Charon)  GEMINI_MODELO (gemini-3.8-flash-tts)
  GAP_FALA PRE_CENA POS_CENA PRE_ABERTURA   (pausas, em segundos)
  VERIFICAR=1   confere a pronúncia de "Timóteo" em cada fala (Gemini ouvindo o áudio)
  AMOSTRA=n     gera só as n primeiras falas, para testar voz e ritmo
"""
import base64
import hashlib
import io
import json
import os
import re
import sys
import time

import numpy as np
import requests
import soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://generativelanguage.googleapis.com/v1beta"
MODELO = os.environ.get("GEMINI_MODELO", "gemini-3.8-flash-tts")
VOZ = os.environ.get("GEMINI_VOZ", "Charon")
CHAVE = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
VERIFICAR = os.environ.get("VERIFICAR") == "1"
AMOSTRA = int(os.environ.get("AMOSTRA", 0))

FPS = 30
SR = 24000
# Ritmo mais enxuto que a versão Kokoro (0.32 / 0.45 / 0.65 / 0.9).
GAP_FALA = float(os.environ.get("GAP_FALA", 0.16))
PRE_CENA = float(os.environ.get("PRE_CENA", 0.22))
POS_CENA = float(os.environ.get("POS_CENA", 0.38))
PRE_ABERTURA = float(os.environ.get("PRE_ABERTURA", 0.5))
MARGEM = 0.04  # silêncio mantido nas pontas de cada fala depois do corte

ESTILO = (
    "Narrador de documentário no estilo Vox, em português do Brasil. "
    "Ritmo ágil e dinâmico, energia alta mas natural, frases encadeadas sem pausas longas, "
    "tom curioso de quem conta uma história, com ênfase leve em datas e números. "
    "Pronuncie o nome da cidade Timóteo sempre como Ti-mó-têo: sílaba tônica 'mó' e o final "
    "'têo' com 'e' fechado e audível. Nunca diga Timótio nem Timótchiu."
)

# Grafias tentadas em ordem se a verificação reprovar a pronúncia.
GRAFIAS = ["Timóteo", "Timótêo", "Ti-mó-têo"]

CACHE = os.path.join(ROOT, ".cache", "gemini-tts")


def cabecalhos():
    h = {"Content-Type": "application/json"}
    if CHAVE:
        h["x-goog-api-key"] = CHAVE
    return h


def limpa(msg: str) -> str:
    return msg.replace(CHAVE, "[oculto]") if CHAVE else msg


def post(url, corpo, tentativas=5):
    for i in range(tentativas):
        r = requests.post(url, headers=cabecalhos(), json=corpo, timeout=180)
        if r.status_code in (429, 500, 502, 503, 504) and i < tentativas - 1:
            time.sleep(2 ** (i + 1))
            continue
        if r.status_code in (401, 403):
            raise SystemExit(
                "Gemini recusou a chave (HTTP %d). Configure GEMINI_API_KEY ou o segredo de rede "
                "para generativelanguage.googleapis.com.\n%s" % (r.status_code, limpa(r.text[:400]))
            )
        if not r.ok:
            raise RuntimeError(limpa(f"HTTP {r.status_code}: {r.text[:600]}"))
        return r.json()
    raise RuntimeError("Gemini não respondeu")


def sintetiza(texto: str) -> np.ndarray:
    """Uma fala -> áudio mono float32 a 24 kHz. Resultado fica em cache local."""
    chave_cache = hashlib.sha256(f"{MODELO}|{VOZ}|{ESTILO}|{texto}".encode()).hexdigest()[:24]
    arq = os.path.join(CACHE, chave_cache + ".wav")
    if not os.path.exists(arq):
        moderno = MODELO.startswith("gemini-3.8-")
        conteudo = {"type": "text", "text": texto if moderno else f"Read the following text with this delivery: {ESTILO}\n\n{texto}"}
        if moderno:
            conteudo["annotations"] = [{"type": "speech_metadata", "style": ESTILO}]
        resp = post(f"{API}/interactions", {
            "model": MODELO,
            "input": [{"type": "user_input", "content": [conteudo]}],
            "response_format": {"type": "audio", "mime_type": "audio/wav"} if moderno else {"type": "audio"},
            "generation_config": {"speech_config": [{"voice": VOZ}]},
            "store": False,
        })
        if resp.get("status") != "completed":
            raise RuntimeError(f"TTS não concluiu: {resp.get('status')}")
        partes = [c for s in resp.get("steps", []) if s.get("type") == "model_output"
                  for c in s.get("content", []) if c.get("type") == "audio"]
        assert len(partes) == 1 and partes[0].get("data"), "TTS sem bloco de áudio"
        bruto = base64.b64decode(partes[0]["data"])
        mime = partes[0].get("mime_type", "")
        if mime.startswith("audio/l16"):
            taxa = int(re.search(r"rate=(\d+)", mime).group(1))
            pcm = np.frombuffer(bruto, dtype="<i2").astype(np.float32) / 32768
            buf = io.BytesIO()
            sf.write(buf, pcm, taxa, format="WAV", subtype="PCM_16")
            bruto = buf.getvalue()
        os.makedirs(CACHE, exist_ok=True)
        open(arq, "wb").write(bruto)
    audio, taxa = sf.read(arq, dtype="float32", always_2d=True)
    audio = audio.mean(axis=1)
    if taxa != SR:
        g = np.gcd(taxa, SR)
        audio = resample_poly(audio, SR // g, taxa // g).astype(np.float32)
    return audio


def envelope(audio, janela=0.02):
    n = int(SR * janela)
    k = len(audio) // n
    rms = np.sqrt((audio[: k * n].reshape(k, n) ** 2).mean(axis=1) + 1e-12)
    return rms, n


def apara(audio):
    """Corta o silêncio das pontas (o Gemini costuma devolver respiro sobrando)."""
    rms, n = envelope(audio)
    limiar = max(rms.max() * 0.04, 1e-4)
    voz = np.where(rms > limiar)[0]
    if not len(voz):
        return audio
    m = int(MARGEM * SR)
    return audio[max(0, voz[0] * n - m): min(len(audio), (voz[-1] + 1) * n + m)]


def trechos_falados(audio, pausa_min=0.16):
    """Intervalos (ini, fim) em segundos com voz, separados por pausas >= pausa_min."""
    rms, n = envelope(audio)
    ativo = rms > max(rms.max() * 0.05, 1e-4)
    seg, ini, sil = [], None, 0
    passo = n / SR
    for i, a in enumerate(ativo):
        if a:
            if ini is None:
                ini = i
            sil = 0
        elif ini is not None:
            sil += 1
            if sil * passo >= pausa_min:
                seg.append((ini * passo, (i - sil + 1) * passo))
                ini, sil = None, 0
    if ini is not None:
        seg.append((ini * passo, len(ativo) * passo))
    return seg


def peso(w):
    return len(re.sub(r"[^\wÀ-ú0-9]", "", w)) + 1.6


def palavras(cap, audio, ini):
    """Tempo de cada palavra da legenda. Se as pausas do áudio batem com a pontuação,
    cada pedaço de frase é encaixado no seu trecho falado; senão, rateio proporcional."""
    toks = cap.split()
    pedacos, cur = [], []
    for w in toks:
        cur.append(w)
        if re.search(r"[,.;:?!]$", w):
            pedacos.append(cur)
            cur = []
    if cur:
        pedacos.append(cur)
    seg = trechos_falados(audio)
    out = []
    if len(seg) == len(pedacos) and len(seg) > 1:
        for (a, b), ped in zip(seg, pedacos):
            tot = sum(peso(w) for w in ped)
            acc = a
            for w in ped:
                out.append({"w": w, "t": round(ini + acc, 3)})
                acc += (b - a) * peso(w) / tot
        return out
    a = seg[0][0] if seg else 0.0
    b = seg[-1][1] if seg else len(audio) / SR
    tot = sum(peso(w) for w in toks)
    acc = a
    for w in toks:
        out.append({"w": w, "t": round(ini + acc, 3)})
        acc += (b - a) * peso(w) / tot
    return out


_ouvinte = None


def ouvinte():
    """Escolhe um modelo Gemini 'flash' de texto que aceite áudio, para checar a pronúncia."""
    global _ouvinte
    if _ouvinte is None:
        r = requests.get(f"{API}/models?pageSize=200", headers=cabecalhos(), timeout=60)
        r.raise_for_status()
        nomes = [m["name"] for m in r.json().get("models", [])
                 if "generateContent" in m.get("supportedGenerationMethods", [])
                 and "flash" in m["name"] and not re.search(r"tts|image|live|audio|embed", m["name"])]
        nomes.sort(key=lambda s: ("preview" in s or "exp" in s, "lite" in s, s), reverse=False)
        _ouvinte = os.environ.get("GEMINI_OUVINTE") or (nomes[0] if nomes else "models/gemini-2.5-flash")
        print(f"verificador de pronúncia: {_ouvinte}")
    return _ouvinte


def pronuncia_ok(audio) -> bool:
    buf = io.BytesIO()
    sf.write(buf, audio, SR, format="WAV", subtype="PCM_16")
    pergunta = (
        "Ouça o áudio em português do Brasil. Ele contém o nome da cidade Timóteo. "
        "Como o falante pronuncia a última sílaba desse nome? Responda só com JSON: "
        '{"final": "teo"} se terminar em "têo" (com e audível), '
        '{"final": "tio"} se soar "tiu"/"tio"/"tchiu".'
    )
    resp = post(f"{API}/{ouvinte()}:generateContent", {
        "contents": [{"role": "user", "parts": [
            {"inline_data": {"mime_type": "audio/wav", "data": base64.b64encode(buf.getvalue()).decode()}},
            {"text": pergunta},
        ]}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json"},
    })
    txt = "".join(p.get("text", "") for c in resp.get("candidates", []) for p in c.get("content", {}).get("parts", []))
    try:
        return json.loads(txt).get("final") == "teo"
    except json.JSONDecodeError:
        return "teo" in txt.lower() and "tio" not in txt.lower()


def fala_audio(say: str):
    """Sintetiza a fala; se citar Timóteo e a verificação estiver ligada, tenta grafias até passar."""
    if "Timóteo" not in say or not VERIFICAR:
        return apara(sintetiza(say)), say
    for g in GRAFIAS:
        texto = say.replace("Timóteo", g)
        audio = apara(sintetiza(texto))
        if pronuncia_ok(audio):
            return audio, texto
        print(f"   pronúncia reprovada com a grafia '{g}', tentando a próxima")
    raise SystemExit(f"Nenhuma grafia passou na verificação: {say}")


ARG_ROTEIRO = sys.argv[1] if len(sys.argv) > 1 else "roteiro/roteiro.json"
ARG_TIMING = sys.argv[2] if len(sys.argv) > 2 else "src/data/timing.json"
ARG_AUDIO = sys.argv[3] if len(sys.argv) > 3 else "narracao"
roteiro = json.load(open(os.path.join(ROOT, ARG_ROTEIRO), encoding="utf-8"))


def silencio(seg):
    return np.zeros(int(round(seg * SR)), dtype=np.float32)


if AMOSTRA:
    falas = [f for c in roteiro["cenas"] for f in c.get("falas", [])][:AMOSTRA]
    partes = []
    for f in falas:
        a, txt = fala_audio(f["say"])
        partes += [a, silencio(GAP_FALA)]
        print(f"{len(a) / SR:5.2f}s  {txt}")
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    destino = os.path.join(ROOT, "out", f"amostra-{VOZ}.wav")
    sf.write(destino, np.concatenate(partes), SR, subtype="PCM_16")
    print(destino)
    sys.exit(0)

trilha, cenas, t = [], [], 0.0
grafias_usadas = {}
for ci, cena in enumerate(roteiro["cenas"]):
    ini_cena, falas_out = t, []
    if cena.get("fixo"):
        trilha.append(silencio(cena["fixo"]))
        t += cena["fixo"]
    else:
        pre = PRE_ABERTURA if ci == 0 else PRE_CENA
        trilha.append(silencio(pre))
        t += pre
        for fi, fala in enumerate(cena["falas"]):
            audio, texto = fala_audio(fala["say"])
            if texto != fala["say"]:
                grafias_usadas[f"{cena['id']}-{fi + 1}"] = texto
            dur = len(audio) / SR
            rel = round(t - ini_cena, 3)
            falas_out.append({"id": f"{cena['id']}-{fi + 1}", "cap": fala["cap"], "t": rel,
                              "dur": round(dur, 3), "words": palavras(fala["cap"], audio, rel)})
            trilha.append(audio)
            t += dur
            if fi < len(cena["falas"]) - 1:
                trilha.append(silencio(GAP_FALA))
                t += GAP_FALA
        trilha.append(silencio(POS_CENA))
        t += POS_CENA
    dur_cena = t - ini_cena
    frames = int(round(dur_cena * FPS))
    ajuste = frames / FPS - dur_cena
    if ajuste > 0:
        trilha.append(silencio(ajuste))
    elif ajuste < 0:
        trilha[-1] = trilha[-1][: len(trilha[-1]) + int(round(ajuste * SR))]
    t = ini_cena + frames / FPS
    cenas.append({"id": cena["id"], "inicio": round(ini_cena, 3), "dur": round(frames / FPS, 3),
                  "frames": frames, "falas": falas_out})
    print(f"{cena['id']:<12} {frames / FPS:6.2f}s  falas={len(falas_out)}")

master = np.concatenate(trilha)
pico = float(np.max(np.abs(master))) or 1.0
master = master / pico * 10 ** (-1 / 20)
os.makedirs(os.path.join(ROOT, "public", "voz"), exist_ok=True)
wav = os.path.join(ROOT, "public", "voz", ARG_AUDIO + ".wav")
sf.write(wav, master, SR, subtype="PCM_16")
os.system(f"ffmpeg -v error -y -i \"{wav}\" -c:a libmp3lame -b:a 192k \"{wav[:-4]}.mp3\" && rm \"{wav}\"")
total = sum(c["frames"] for c in cenas)
json.dump({"fps": FPS, "motor": "gemini", "modelo": MODELO, "voz": VOZ, "velocidade": 1,
           "totalFrames": total, "cenas": cenas},
          open(os.path.join(ROOT, ARG_TIMING), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
if grafias_usadas:
    print("grafias alternativas usadas:", json.dumps(grafias_usadas, ensure_ascii=False))
print(f"TOTAL {total / FPS:.1f}s ({total} frames)")
