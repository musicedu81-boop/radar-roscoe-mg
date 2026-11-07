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
  GRAFIA        como escrever "Timóteo" para o TTS acertar TI-MÓ-TÊO (padrão: Timóteo).
                O Gemini não aceita fonemas; a grafia é escolhida de ouvido.
  LOTE=cena     uma chamada por cena (padrão, economiza cota) ou LOTE=fala, uma por frase
  GRUPO=n       junta n cenas por chamada (cenas já em cache são reaproveitadas)
  ALINHAR=1     experimental: corta pelas palavras (transcreve cada trecho entre pausas).
                Em blocos longos o transcritor junta trechos e desloca as falas; o padrão
                (corte pelo tamanho esperado) foi mais confiável.
  FALA_A_FALA=cena1,cena2   gera essas cenas frase a frase (para corrigir um corte errado)
  TAKES=arquivo.json  falas refeitas sozinhas, com grafia e tomada próprias:
                {"final-1": {"grafia": "Timótêo", "take": 2}} ou {"x-1": {"arquivo": "roteiro/emendas/x-1.wav"}}.
                Usado para trocar só as
                frases em que o Gemini errou a pronúncia (ver scripts/confere_pronuncia.py).
  AMOSTRA=n     gera só as n primeiras falas, para testar voz e ritmo

Atenção: um modelo Gemini "ouvindo" o áudio não serve para checar a pronúncia: ele
transcreve o nome da cidade como conhece, mesmo quando a fala está certa (testado com a
locução Kokoro de fonema forçado).
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
GRAFIA = os.environ.get("GRAFIA", "Timóteo")
LOTE = os.environ.get("LOTE", "cena")
GRUPO = int(os.environ.get("GRUPO", 1))
ALINHAR = os.environ.get("ALINHAR", "0") == "1"
FALA_A_FALA = set(filter(None, os.environ.get("FALA_A_FALA", "").split(",")))
TAKES_ARQ = os.environ.get("TAKES", "roteiro/takes-gemini.json")
OUVINTE = os.environ.get("GEMINI_OUVINTE", "gemini-3.5-flash")
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


_ultimo = [0.0]
INTERVALO = float(os.environ.get("GEMINI_INTERVALO", 21))  # plano gratuito: 3 pedidos/min


def post(url, corpo, tentativas=8):
    for i in range(tentativas):
        espera = _ultimo[0] + INTERVALO - time.time()
        if "/interactions" in url and espera > 0:
            time.sleep(espera)
        r = requests.post(url, headers=cabecalhos(), json=corpo, timeout=180)
        if "/interactions" in url:
            _ultimo[0] = time.time()
        if r.status_code in (429, 500, 502, 503, 504) and i < tentativas - 1:
            pedido = re.search(r"retry in ([\d.]+)\s*s", r.text)
            if r.status_code == 429 and re.search(r"per day|PerDay|daily", r.text):
                raise SystemExit("Cota diária do Gemini esgotada. O cache guarda o que já foi gerado; rode de novo depois.\n"
                                 + limpa(r.text[:300]))
            time.sleep((float(pedido.group(1)) + 2) if pedido else min(60, 2 ** (i + 2)))
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


def sintetiza(texto: str, take: int = 0) -> np.ndarray:
    """Uma fala -> áudio mono float32 a 24 kHz. Resultado fica em cache local.
    `take` > 0 força uma nova geração do mesmo texto (outra tomada)."""
    arq = chave_cache(texto, take)
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


def _expande(tok):
    """Palavras que um token da legenda vira na fala (números por extenso, km², %)."""
    try:
        from num2words import num2words
    except ImportError:
        num2words = None
    base = re.sub(r"[^\w²%,.]", "", tok)
    nucleo = base.rstrip(".,")
    pal = []
    if nucleo.endswith("%"):
        nucleo, suf = nucleo[:-1], ["por", "cento"]
    else:
        suf = []
    if nucleo.lower() == "km²":
        return ["quilômetros", "quadrados"]
    if num2words and re.fullmatch(r"\d{1,3}(\.\d{3})+|\d+(,\d+)?", nucleo):
        valor = float(nucleo.replace(".", "").replace(",", "."))
        valor = int(valor) if valor.is_integer() else valor
        pal = re.sub(r"[^\wÀ-ú ]", " ", num2words(valor, lang="pt_BR")).split()
    return (pal or [tok]) + suf


def pesos_falados(cap, say):
    """Peso de cada palavra da legenda pelo que é FALADO: "2.734" pesa como "dois mil
    setecentos e trinta e quatro". Expande números da legenda e alinha com o texto falado."""
    import difflib
    ct, st = cap.split(), say.split()
    n = lambda w: re.sub(r"[^\wÀ-ú]", "", w.lower())
    exp, dono = [], []
    for i, w in enumerate(ct):
        for e in _expande(w):
            exp.append(n(e))
            dono.append(i)
    sm = difflib.SequenceMatcher(None, exp, [n(w) for w in st], autojunk=False)
    pesos = [0.0] * len(ct)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                pesos[dono[i1 + k]] += peso(st[j1 + k])
        elif op == "replace":
            falado = sum(peso(w) for w in st[j1:j2])
            donos = dono[i1:i2]
            for d in donos:
                pesos[d] += falado / len(donos)
        elif op == "insert":
            alvo = dono[i1 - 1] if i1 > 0 else 0
            pesos[alvo] += sum(peso(w) for w in st[j1:j2])
    return [p if p > 0 else 0.6 for p in pesos]


def palavras(cap, audio, ini, say=None):
    """Tempo de cada palavra da legenda. Se as pausas do áudio batem com a pontuação,
    cada pedaço de frase é encaixado no seu trecho falado; senão, rateio proporcional.
    Os pesos vêm do texto falado (números por extenso), não da legenda."""
    toks = cap.split()
    pw = pesos_falados(cap, say) if say else [peso(w) for w in toks]
    pedacos, cur = [], []
    for k, w in enumerate(toks):
        cur.append(k)
        if re.search(r"[,.;:?!]$", w):
            pedacos.append(cur)
            cur = []
    if cur:
        pedacos.append(cur)
    seg = trechos_falados(audio)
    out = []
    if len(seg) == len(pedacos) and len(seg) > 1:
        for (a, b), ped in zip(seg, pedacos):
            tot = sum(pw[k] for k in ped)
            acc = a
            for k in ped:
                out.append({"w": toks[k], "t": round(ini + acc, 3)})
                acc += (b - a) * pw[k] / tot
        return out
    a = seg[0][0] if seg else 0.0
    b = seg[-1][1] if seg else len(audio) / SR
    tot = sum(pw)
    acc = a
    for k, w in enumerate(toks):
        out.append({"w": w, "t": round(ini + acc, 3)})
        acc += (b - a) * pw[k] / tot
    return out


def _norm(txt):
    return re.sub(r"[^a-z0-9à-ú ]", " ", txt.lower()).split()


def alinha_por_transcricao(audio, caps):
    """Transcreve cada trecho entre pausas (uma chamada, trechos separados por bipes) e
    escolhe as fronteiras onde o texto ouvido acaba como cada fala acaba."""
    seg = trechos_falados(audio, pausa_min=0.12)
    if len(seg) < len(caps):
        return None
    arq = os.path.join(CACHE, hashlib.sha256(audio.tobytes()).hexdigest()[:24] + ".alinha.json")
    if os.path.exists(arq):
        trechos = json.load(open(arq, encoding="utf-8"))
    else:
        t = np.arange(int(0.22 * SR)) / SR
        bip = (0.3 * np.sin(2 * np.pi * np.where(t < 0.11, 1200, 800) * t)).astype(np.float32)
        z = np.zeros(int(0.15 * SR), np.float32)
        partes = []
        for x, y in seg:
            partes += [audio[int(x * SR): int(y * SR)], z, bip, z]
        buf = io.BytesIO()
        sf.write(buf, np.concatenate(partes), SR, format="WAV", subtype="PCM_16")
        pergunta = (f"O áudio tem {len(seg)} trechos de fala em português, cada um seguido de um bipe. "
                    f"Transcreva cada trecho literalmente, na ordem. Responda só com uma lista JSON de exatamente "
                    f"{len(seg)} strings, uma por trecho.")
        resp = post(f"{API}/models/{OUVINTE}:generateContent", {
            "contents": [{"role": "user", "parts": [
                {"inline_data": {"mime_type": "audio/wav", "data": base64.b64encode(buf.getvalue()).decode()}},
                {"text": pergunta}]}],
            "generationConfig": {"temperature": 0, "responseMimeType": "application/json"},
        })
        txt = "".join(p.get("text", "") for c in resp.get("candidates", []) for p in c.get("content", {}).get("parts", []))
        try:
            trechos = json.loads(txt)
        except json.JSONDecodeError:
            return None
        if not isinstance(trechos, list) or len(trechos) != len(seg):
            print(f"   transcrição devolveu {len(trechos) if isinstance(trechos, list) else '?'} trechos de {len(seg)}")
            return None
        os.makedirs(CACHE, exist_ok=True)
        json.dump(trechos, open(arq, "w", encoding="utf-8"), ensure_ascii=False)
    palavras_t = [_norm(x) for x in trechos]
    palavras_c = [_norm(c) for c in caps]
    acum_t = np.cumsum([len(w) for w in palavras_t])
    acum_c = np.cumsum([len(w) for w in palavras_c])
    n, m_ = len(caps), len(seg)
    tot_t, tot_c = acum_t[-1] or 1, acum_c[-1] or 1

    def custo(k, i):  # fala k termina no trecho i
        c = abs(acum_t[i] / tot_t - acum_c[k] / tot_c) * 10
        ult_t = palavras_t[i][-1:] if palavras_t[i] else []
        ult_c = palavras_c[k][-1:] if palavras_c[k] else []
        if ult_t and ult_c and ult_t == ult_c:
            c -= 1.0
        return c

    INF = float("inf")
    dp = [[INF] * m_ for _ in range(n)]
    de = [[-1] * m_ for _ in range(n)]
    for i in range(m_ - n + 1):
        dp[0][i] = custo(0, i)
    for k in range(1, n):
        for i in range(k, m_ - (n - 1 - k)):
            melhor, arg = INF, -1
            for j in range(k - 1, i):
                if dp[k - 1][j] < melhor:
                    melhor, arg = dp[k - 1][j], j
            if arg >= 0:
                dp[k][i], de[k][i] = melhor + custo(k, i), arg
    if dp[n - 1][m_ - 1] == INF:
        return None
    fins = [m_ - 1]
    for k in range(n - 1, 0, -1):
        fins.append(de[k][fins[-1]])
    fins = list(reversed(fins))
    cortes = [(seg[i][1] + seg[i + 1][0]) / 2 for i in fins[:-1]]
    bordas = [0.0] + cortes + [len(audio) / SR]
    return [apara(audio[int(bordas[i] * SR): int(bordas[i + 1] * SR)]) for i in range(n)]


def divide(audio, textos, caps=None):
    if ALINHAR and caps:
        r = alinha_por_transcricao(audio, caps)
        if r:
            return r
        print("   alinhamento por transcrição falhou; usando tamanho esperado")
    """Corta o áudio (várias falas numa chamada) nas pausas que melhor reproduzem o
    tamanho esperado de cada fala (proporcional aos caracteres). Programação dinâmica:
    minimiza o desvio relativo de cada pedaço, com bônus para pausas longas."""
    seg = trechos_falados(audio, pausa_min=0.12)
    if len(seg) < len(textos):
        return None
    pausas = [(seg[i][1], seg[i + 1][0]) for i in range(len(seg) - 1)]
    ini, fim = seg[0][0], seg[-1][1]
    pesos = [len(t) for t in textos]
    W = sum(pesos)
    esp = [(fim - ini) * w / W for w in pesos]
    n, P = len(textos), len(pausas)
    meio = [(x + y) / 2 for x, y in pausas]
    bonus = [0.35 * min(y - x, 0.8) for x, y in pausas]
    INF = float("inf")

    def custo(k, a, b):
        return ((b - a) - esp[k]) ** 2 / esp[k] ** 2

    if n == 1:
        return [apara(audio)]
    # dp[k][j]: melhor custo com o corte k (0-based) na pausa j
    dp = [[INF] * P for _ in range(n - 1)]
    de = [[-1] * P for _ in range(n - 1)]
    for j in range(P):
        dp[0][j] = custo(0, ini, meio[j]) - bonus[j]
    for k in range(1, n - 1):
        for j in range(k, P):
            melhor, arg = INF, -1
            for i in range(k - 1, j):
                if dp[k - 1][i] < INF:
                    c = dp[k - 1][i] + custo(k, meio[i], meio[j])
                    if c < melhor:
                        melhor, arg = c, i
            if arg >= 0:
                dp[k][j], de[k][j] = melhor - bonus[j], arg
    total, ultimo = INF, -1
    for j in range(n - 2, P):
        if dp[n - 2][j] < INF:
            c = dp[n - 2][j] + custo(n - 1, meio[j], fim)
            if c < total:
                total, ultimo = c, j
    if ultimo < 0:
        return None
    cortes = [ultimo]
    for k in range(n - 2, 0, -1):
        cortes.append(de[k][cortes[-1]])
    cortes = [meio[j] for j in reversed(cortes)]
    bordas = [0.0] + cortes + [len(audio) / SR]
    pedacos = [apara(audio[int(bordas[i] * SR): int(bordas[i + 1] * SR)]) for i in range(n)]
    durs = [len(x) / SR for x in pedacos]
    soma = sum(durs)
    for d, w in zip(durs, pesos):
        e = soma * w / W
        if not (0.55 * e <= d <= 1.7 * e):
            return None
    return pedacos


def chave_cache(texto: str, take: int = 0) -> str:
    base = f"{MODELO}|{VOZ}|{ESTILO}|{texto}" + (f"|take{take}" if take else "")
    return os.path.join(CACHE, hashlib.sha256(base.encode()).hexdigest()[:24] + ".wav")


def prepara(say: str) -> str:
    return say.replace("Timóteo", GRAFIA)


def falas_da_cena(falas):
    """Lista de áudios (um por fala). Em LOTE=cena, uma chamada só para a cena."""
    textos = [prepara(f["say"]) for f in falas]
    if LOTE == "cena" and len(textos) > 1:
        bloco = sintetiza("\n\n".join(textos))
        pedacos = divide(bloco, textos, [f["cap"] for f in falas])
        if pedacos:
            return pedacos
        print("   divisão por pausas falhou nesta cena; gerando frase a frase")
    return [apara(sintetiza(t)) for t in textos]


ARG_ROTEIRO = sys.argv[1] if len(sys.argv) > 1 else "roteiro/roteiro.json"
ARG_TIMING = sys.argv[2] if len(sys.argv) > 2 else "src/data/timing.json"
ARG_AUDIO = sys.argv[3] if len(sys.argv) > 3 else "narracao"
roteiro = json.load(open(os.path.join(ROOT, ARG_ROTEIRO), encoding="utf-8"))


def silencio(seg):
    return np.zeros(int(round(seg * SR)), dtype=np.float32)


if AMOSTRA:
    falas = [f for c in roteiro["cenas"] for f in c.get("falas", [])][:AMOSTRA]
    partes = []
    for f, a in zip(falas, falas_da_cena(falas)):
        partes += [a, silencio(GAP_FALA)]
        print(f"{len(a) / SR:5.2f}s  {prepara(f['say'])}")
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    destino = os.path.join(ROOT, "out", f"amostra-{VOZ}.wav")
    sf.write(destino, np.concatenate(partes), SR, subtype="PCM_16")
    print(destino)
    sys.exit(0)

def gera_todas(cenas_rot):
    """Áudios de todas as cenas. Reaproveita o cache por cena e junta as pendentes em grupos."""
    prontos, pendentes = {}, []
    for c in cenas_rot:
        if c.get("fixo"):
            continue
        textos = [prepara(f["say"]) for f in c["falas"]]
        if c["id"] in FALA_A_FALA:
            prontos[c["id"]] = [apara(sintetiza(x)) for x in textos]
        elif LOTE != "cena" or len(textos) == 1 or os.path.exists(chave_cache("\n\n".join(textos))):
            prontos[c["id"]] = falas_da_cena(c["falas"])
        else:
            pendentes.append(c)
    for g in range(0, len(pendentes), max(1, GRUPO)):
        grupo = pendentes[g: g + max(1, GRUPO)]
        if len(grupo) == 1:
            prontos[grupo[0]["id"]] = falas_da_cena(grupo[0]["falas"])
            continue
        textos = [prepara(f["say"]) for c in grupo for f in c["falas"]]
        pedacos = divide(sintetiza("\n\n".join(textos)), textos, [f["cap"] for c in grupo for f in c["falas"]])
        if not pedacos:
            print(f"   divisão falhou no grupo {[c['id'] for c in grupo]}; gerando cena a cena")
            for c in grupo:
                prontos[c["id"]] = falas_da_cena(c["falas"])
            continue
        i = 0
        for c in grupo:
            prontos[c["id"]] = pedacos[i: i + len(c["falas"])]
            i += len(c["falas"])
    return prontos


AUDIOS = gera_todas(roteiro["cenas"])
_takes_path = os.path.join(ROOT, TAKES_ARQ)
if os.path.exists(_takes_path):
    TAKES = json.load(open(_takes_path, encoding="utf-8"))
    for c in roteiro["cenas"]:
        for fi, f in enumerate(c.get("falas", [])):
            fid = f"{c['id']}-{fi + 1}"
            if fid in TAKES:
                tk = TAKES[fid]
                if "arquivo" in tk:  # fala montada à mão (emenda), já aprovada
                    x, taxa = sf.read(os.path.join(ROOT, tk["arquivo"]), dtype="float32")
                    assert taxa == SR, taxa
                    AUDIOS[c["id"]][fi] = x
                    print(f"   {fid}: {tk['arquivo']}")
                else:
                    AUDIOS[c["id"]][fi] = apara(sintetiza(f["say"].replace("Timóteo", tk.get("grafia", GRAFIA)), tk.get("take", 0)))
                    print(f"   {fid}: tomada {tk.get('take', 0)} ({tk.get('grafia', GRAFIA)})")
trilha, cenas, t = [], [], 0.0
for ci, cena in enumerate(roteiro["cenas"]):
    ini_cena, falas_out = t, []
    if cena.get("fixo"):
        trilha.append(silencio(cena["fixo"]))
        t += cena["fixo"]
    else:
        pre = PRE_ABERTURA if ci == 0 else PRE_CENA
        trilha.append(silencio(pre))
        t += pre
        audios = AUDIOS[cena["id"]]
        for fi, (fala, audio) in enumerate(zip(cena["falas"], audios)):
            dur = len(audio) / SR
            rel = round(t - ini_cena, 3)
            falas_out.append({"id": f"{cena['id']}-{fi + 1}", "cap": fala["cap"], "t": rel,
                              "dur": round(dur, 3), "words": palavras(fala["cap"], audio, rel, fala["say"])})
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
json.dump({"fps": FPS, "motor": "gemini", "modelo": MODELO, "voz": VOZ, "grafia": GRAFIA, "velocidade": 1,
           "totalFrames": total, "cenas": cenas},
          open(os.path.join(ROOT, ARG_TIMING), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"TOTAL {total / FPS:.1f}s ({total} frames)")
