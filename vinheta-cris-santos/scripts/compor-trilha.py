# Trilha original da vinheta (8s), sincronizada com o roteiro em src/roteiro.ts.
# Tonalidade: Ré maior. Caixinha de música nas letras, pad de cordas, sinos, sub e reverb.
# Uso: python3 scripts/compor-trilha.py  ->  out/trilha-bruta.wav (masterizar com ffmpeg loudnorm)
import json
import wave

import numpy as np

SR = 48000
DUR = 8.0
N = int(SR * DUR)
FPS = 30
rng = np.random.default_rng(81)

# ---------- Roteiro (mesmos números de src/roteiro.ts) ----------
WRITE_START = round(0.55 * FPS + 1e-9)  # 17 (Math.round(16.5) em JS)
WRITE_END = 128
TAGLINE = 132
DIVE = 150
RISE = 168
MERGE = 212
HIT = (MERGE - 6) / FPS  # borboleta chega no retrato e explode em brilho
NOME = 'CRIS SANTOS & LÚPUS'


def bezier(x1, y1, x2, y2):
    def bx(t):
        return 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t ** 2 * (1 - t) + t ** 3

    def by(t):
        return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t ** 2 * (1 - t) + t ** 3

    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(60):
            mid = (lo + hi) / 2
            if bx(mid) < x:
                lo = mid
            else:
                hi = mid
        return by((lo + hi) / 2)

    return f


suave = bezier(0.65, 0, 0.35, 1)


def prog(q):
    x = min(max((q - WRITE_START) / (WRITE_END - WRITE_START), 0), 1)
    return suave(x)


# Frame em que cada letra nasce (mesma regra da versão 3D)
font = json.load(open('public/fonts/montserrat-900.typeface.json'))
adv = [font['glyphs'][ch]['ha'] / 1000 for ch in NOME]
xs, acc = [], 0.0
for a in adv:
    xs.append(acc)
    acc += a + 0.02
largura = acc - 0.02
pos = [x - largura / 2 for x in xs]
xR, xSF = pos[1], pos[-1]
nasc = []
for i, ch in enumerate(NOME):
    if i in (0, len(NOME) - 1) or ch == ' ':
        continue
    q = next((q for q in range(WRITE_END + 1) if xR + prog(q) * (xSF - xR) >= pos[i] + adv[i] + 0.01), WRITE_END)
    nasc.append((ch, q, pos[i] / (largura / 2)))

# ---------- Utilidades ----------
L = np.zeros(N)
R = np.zeros(N)
SL = np.zeros(N)  # envio para o reverb
SR_ = np.zeros(N)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, start, gain=1.0, pan=0.0, send=0.25):
    i0 = int(round(start * SR))
    if i0 >= N:
        return
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    sig = sig[: N - i0] * gain
    pan = np.asarray(pan, dtype=float)
    if pan.ndim:
        pan = pan[: len(sig)]
    th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    gl, gr = np.cos(th), np.sin(th)
    sl = slice(i0, i0 + len(sig))
    L[sl] += sig * gl
    R[sl] += sig * gr
    SL[sl] += sig * gl * send
    SR_[sl] += sig * gr * send


def env_ad(n, atk, dec):
    tt = np.arange(n) / SR
    return (1 - np.exp(-tt / atk)) * np.exp(-tt / dec)


def caixinha(m, decay=1.3, brilho=1.0):
    """Nota de caixinha de música / celesta (FM suave + dente metálico)."""
    f = mtof(m)
    n = int(min(decay * 5, 3.5) * SR)
    tt = np.arange(n) / SR
    idx = 1.3 * brilho * np.exp(-tt / 0.16)
    s = np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * f * tt))
    s += 0.3 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / (decay * 0.35))
    s += 0.1 * np.sin(2 * np.pi * 4.07 * f * tt) * np.exp(-tt / 0.09)
    return s * env_ad(n, 0.0015, decay)


def sino(m, decay=2.6):
    """Sino de vidro, parciais levemente inarmônicos."""
    f = mtof(m)
    n = int(min(decay * 4, 4.0) * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for ratio, amp, d in [(1, 1, 1), (2.01, 0.45, 0.6), (2.76, 0.25, 0.35), (5.4, 0.12, 0.12), (8.93, 0.06, 0.06)]:
        if f * ratio < 14000:
            s += amp * np.sin(2 * np.pi * f * ratio * tt) * np.exp(-tt / (decay * d))
    return s * (1 - np.exp(-tt / 0.002))


def harpa(m, decay=0.9):
    f = mtof(m)
    n = int(decay * 4 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.3) + 0.12 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / 0.12)
    return s * env_ad(n, 0.003, decay)


def automacao(pontos, tt):
    ts, vs = zip(*pontos)
    return np.interp(tt, ts, vs)


# Corte do filtro do pad e volume ao longo da vinheta (respira no mergulho, abre na subida)
CORTE = [(0, 700), (1.5, 1500), (4.4, 2000), (5.0, 1500), (5.6, 450), (HIT - 0.05, 3600), (HIT + 0.4, 3000), (8.0, 2000)]
VOLUME_PAD = [(0, 0.0), (0.6, 0.5), (4.4, 0.6), (5.0, 0.55), (5.55, 0.3), (HIT - 0.05, 1.5), (HIT + 0.1, 1.3), (8.0, 1.1)]


def pad(notas, t0, t1, atk=0.6, rel=0.5, detunes=(-0.09, 0.0, 0.08), parciais=22, ganho=0.06, pan_largura=0.6):
    """Pad de cordas aditivo: serras desafinadas com filtro passa-baixa aplicado por parcial."""
    n = int((t1 - t0 + rel) * SR)
    tt = np.arange(n) / SR
    abs_t = t0 + tt
    fc = automacao(CORTE, abs_t)
    vol = automacao(VOLUME_PAD, abs_t)
    env = np.clip(tt / atk, 0, 1) ** 2 * np.clip((t1 - t0 + rel - tt) / rel, 0, 1)
    vib = 1 + 0.0025 * np.sin(2 * np.pi * 4.8 * tt)
    for j, m in enumerate(notas):
        voz = np.zeros(n)
        for d in detunes:
            f = mtof(m + d)
            fase = 2 * np.pi * f * np.cumsum(vib) / SR
            for k in range(1, parciais + 1):
                if f * k > 12000:
                    break
                lp = 1 / np.sqrt(1 + (f * k / fc) ** 4)
                voz += (1 / k) * lp * np.sin(k * fase + rng.uniform(0, 2 * np.pi))
        p = (j / max(len(notas) - 1, 1) - 0.5) * 2 * pan_largura
        add(voz * env * vol * ganho / len(detunes), t0, pan=p, send=0.45)


def sub(m, t0, t1, ganho=0.22, rel=0.4):
    n = int((t1 - t0 + rel) * SR)
    tt = np.arange(n) / SR
    f = mtof(m)
    env = np.clip(tt / 0.3, 0, 1) * np.clip((t1 - t0 + rel - tt) / rel, 0, 1)
    vol = automacao(VOLUME_PAD, t0 + tt)
    s = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)
    add(s * env * vol * ganho, t0, pan=0, send=0.05)


def ruido_banda(dur, fc_pts, banda_oit, seed):
    """Ruído com banda que se move no tempo (STFT), para swooshes e risers."""
    n = int(dur * SR)
    hop, nfft = 256, 2048
    win = np.hanning(nfft)
    out = np.zeros(n + nfft)
    freqs = np.fft.rfftfreq(nfft, 1 / SR)
    g = np.random.default_rng(seed)
    for start in range(0, n, hop):
        fc = automacao(fc_pts, np.array([start / SR]))[0]
        lf = np.log2(np.maximum(freqs, 20) / fc)
        mag = np.exp(-0.5 * (lf / (banda_oit / 2)) ** 2)
        spec = mag * np.exp(1j * g.uniform(0, 2 * np.pi, len(freqs)))
        out[start : start + nfft] += np.fft.irfft(spec, nfft) * win
    out = out[:n]
    return out / (np.max(np.abs(out)) + 1e-9)


# ---------- Harmonia (Ré maior) ----------
ACORDES = [
    ([50, 57, 64, 66, 73], 0.0, 1.75, 38),  # Dmaj9
    ([47, 54, 62, 69, 73], 1.55, 3.05, 35),  # Bm9
    ([43, 50, 59, 66, 69], 2.85, 4.55, 31),  # Gmaj9
    ([45, 52, 62, 64, 69], 4.35, 5.75, 33),  # Asus4 (slogan e mergulho)
    ([43, 50, 57, 59, 64], 5.55, 6.3, 31),  # G6/9 (sobe com o rosto)
    ([45, 52, 57, 61, 64], 6.15, HIT + 0.05, 33),  # A (dominante)
    ([38, 45, 50, 54, 64, 69, 78], HIT - 0.02, 8.0, 38),  # Dadd9 final
]
for notas, t0, t1, raiz in ACORDES:
    final = t1 >= 8.0
    pad(notas, t0, t1, atk=0.12 if final else 0.6, rel=0.5, ganho=0.07 if final else 0.06)
    sub(raiz, t0, t1, ganho=0.08 if not final else 0.0)

# ---------- Entrada: swoosh da borboleta, da direita para o centro ----------
d = WRITE_START / FPS + 0.35
w = ruido_banda(d, [(0, 7000), (d * 0.7, 1400), (d, 900)], 1.2, 1)
tt = np.arange(len(w)) / SR
w *= np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2
add(w, 0.0, gain=0.09, pan=np.linspace(0.85, -0.3, len(w)), send=0.3)
add(sino(93, 1.8), 0.08, gain=0.05, pan=0.6, send=0.6)  # brilho quando C e S surgem

# ---------- Escrita: uma nota de caixinha por letra, seguindo a borboleta ----------
# R I S | S A N T O S | & | L Ú P U  (pentatônica de Ré, subindo até o nome fechar)
MELODIA = [74, 76, 78, 81, 78, 76, 78, 81, 83, 86, 81, 83, 86, 88]
for (ch, q, x), m in zip(nasc, MELODIA):
    t = (q + 1) / FPS
    add(caixinha(m, decay=1.1), t, gain=0.1, pan=x * 0.6, send=0.5)
    add(caixinha(m + 12, decay=0.5, brilho=0.6), t + 0.004, gain=0.025, pan=x * 0.6, send=0.6)

# Faíscas: pings agudos e curtos, densidade igual à das partículas
for i in range(60):
    t = WRITE_START / FPS + rng.uniform(0, (WRITE_END - WRITE_START) / FPS)
    f = rng.uniform(3200, 8500)
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tt) * env_ad(n, 0.001, rng.uniform(0.03, 0.09))
    x = (xR + prog(t * FPS) * (xSF - xR)) / (largura / 2)
    add(s, t, gain=rng.uniform(0.008, 0.02), pan=np.clip(x * 0.7 + rng.uniform(-0.2, 0.2), -1, 1), send=0.7)

# Pouso no S final
t_pouso = (WRITE_END + 14) / FPS
add(sino(90, 2.2), t_pouso - 0.05, gain=0.09, pan=0.5, send=0.6)
add(sino(97, 1.2), t_pouso - 0.03, gain=0.03, pan=0.55, send=0.7)

# Slogan: arpejo descendente bem leve
for k, m in enumerate([86, 81, 78, 74]):
    add(harpa(m, 0.8), TAGLINE / FPS + 0.05 + k * 0.07, gain=0.05, pan=0.3 - k * 0.2, send=0.6)

# ---------- Mergulho: swoosh descendente ----------
d = (RISE - DIVE) / FPS + 0.15
w = ruido_banda(d, [(0, 3200), (d, 280)], 1.4, 2)
tt = np.arange(len(w)) / SR
w *= np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
add(w, DIVE / FPS, gain=0.07, pan=np.linspace(0.4, 0.1, len(w)), send=0.25)

# ---------- Subida com o rosto: riser e harpa acelerando ----------
t0 = RISE / FPS
d = HIT - t0
w = ruido_banda(d, [(0, 500), (d, 9000)], 1.0, 3)
tt = np.arange(len(w)) / SR
w *= (np.clip(tt / d, 0, 1) ** 3)
add(w, t0, gain=0.07, pan=0, send=0.4)
gliss = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86, 88, 90, 93]
for k, m in enumerate(gliss):
    t = HIT - 0.62 + 0.6 * (1 - (1 - k / len(gliss)) ** 1.7)
    add(harpa(m, 0.7), t, gain=0.045 + 0.003 * k, pan=-0.6 + 1.2 * k / len(gliss), send=0.55)

# ---------- Fusão: impacto quente, sinos e chuva de brilho ----------
n = int(2.2 * SR)
tt = np.arange(n) / SR
freq = 38 + (95 - 38) * np.exp(-tt / 0.09)
boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_ad(n, 0.004, 0.75)
add(boom, HIT, gain=0.42, pan=0, send=0.08)
th = rng.standard_normal(int(0.08 * SR))
th = np.convolve(th, np.ones(24) / 24, mode='same') * env_ad(len(th), 0.001, 0.018)
add(th, HIT, gain=0.25, pan=0, send=0.2)
for k, m in enumerate([74, 78, 81, 86, 88, 93]):
    add(sino(m, 2.4), HIT + k * 0.012, gain=0.12, pan=-0.5 + k * 0.2, send=0.65)
for i in range(70):
    t = HIT + rng.exponential(0.25)
    f = rng.uniform(3000, 9500)
    nn = int(0.3 * SR)
    t2 = np.arange(nn) / SR
    s = np.sin(2 * np.pi * f * t2) * env_ad(nn, 0.001, rng.uniform(0.04, 0.12))
    add(s, t, gain=rng.uniform(0.008, 0.02), pan=rng.uniform(-0.9, 0.9), send=0.8)

# ---------- Reverb (convolução com resposta sintética) ----------
def resposta(dur=2.8, rt=2.3, seed=5):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    g = np.random.default_rng(seed)
    pre = int(0.02 * SR)
    out = []
    for _ in range(2):
        ir = g.standard_normal(n) * np.exp(-tt * 6.9 / rt)
        spec = np.fft.rfft(ir)
        fr = np.fft.rfftfreq(n, 1 / SR)
        spec *= 1 / np.sqrt(1 + (fr / 6500) ** 2)
        ir = np.fft.irfft(spec, n)
        ir = np.concatenate([np.zeros(pre), ir])[:n]
        out.append(ir / np.sqrt(np.sum(ir ** 2)))
    return out


def convolve(x, h):
    m = len(x) + len(h) - 1
    nfft = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[: len(x)]


irL, irR = resposta()
L += convolve(SL, irL) * 0.55
R += convolve(SR_, irR) * 0.55

# ---------- Master ----------
def passa_altas(x, fc=32):
    spec = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 / np.sqrt(1 + (fc / np.maximum(fr, 1e-3)) ** 4)
    return np.fft.irfft(spec, len(x))


L, R = passa_altas(L), passa_altas(R)
mix = np.stack([L, R], axis=1)
tt = np.arange(N) / SR
fade = np.clip(tt / 0.01, 0, 1) * np.clip((DUR - tt) / 0.45, 0, 1) ** 1.5
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) / 0.89
mix = np.tanh(mix * 1.15) / np.tanh(1.15)

with wave.open('out/trilha-bruta.wav', 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())

print('letras:', [(ch, q, round((q + 1) / FPS, 2)) for ch, q, _ in nasc])
print('impacto:', round(HIT, 3), 's')
