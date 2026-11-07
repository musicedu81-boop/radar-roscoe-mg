"""Gera texturas (papel, granulação) e uma trilha ambiente original, sem samples externos.
Uso: python3 scripts/texturas_trilha.py <duracao_em_segundos>
"""
import os
import sys

import numpy as np
import soundfile as sf
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
os.makedirs(os.path.join(PUB, "tex"), exist_ok=True)
os.makedirs(os.path.join(PUB, "musica"), exist_ok=True)
rng = np.random.default_rng(1944)

# ---------- papel ----------
W, H = 1920, 1080
base = np.zeros((H, W), np.float32)
for scale, amp in [(2, 0.5), (6, 0.35), (24, 0.25), (90, 0.2)]:
    small = rng.normal(0, 1, (H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray(small).resize((W, H), Image.BICUBIC)
    base += np.asarray(im)[:H, :W] * amp
# fibras
fib = Image.new("L", (W, H), 0)
fa = np.zeros((H, W), np.float32)
for _ in range(1400):
    x, y = rng.integers(0, W), rng.integers(0, H)
    ang = rng.uniform(0, np.pi)
    ln = rng.integers(10, 60)
    for t in range(ln):
        xx = int(x + np.cos(ang) * t)
        yy = int(y + np.sin(ang) * t)
        if 0 <= xx < W and 0 <= yy < H:
            fa[yy, xx] += 1
fa = np.asarray(Image.fromarray((fa * 60).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
lum = 0.955 + base * 0.022 - fa * 0.07
rgb = np.stack([lum * 1.0, lum * 0.985, lum * 0.95], -1)
rgb = (rgb * 255).clip(0, 255).astype(np.uint8)
Image.fromarray(rgb).save(os.path.join(PUB, "tex", "papel.png"))

# ---------- granulação (8 quadros, cinza neutro) ----------
for i in range(8):
    g = rng.normal(128, 38, (540, 960)).clip(0, 255).astype(np.uint8)
    Image.fromarray(g).save(os.path.join(PUB, "tex", f"grao{i}.png"))

# ---------- trilha ambiente ----------
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 312.0
SR = 44100
n = int(DUR * SR)
t = np.arange(n) / SR
BPM = 84
beat = 60 / BPM
# progressão: Am - F - C - G (2 compassos cada)
def midi(m):
    return 440 * 2 ** ((m - 69) / 12)
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]
bar = beat * 4
seg = bar * 2
pad = np.zeros(n, np.float32)
bass = np.zeros(n, np.float32)
pluck = np.zeros(n, np.float32)
for k in range(int(DUR / seg) + 1):
    ch = chords[k % 4]
    s0 = int(k * seg * SR)
    s1 = min(n, int((k + 1) * seg * SR) + int(0.8 * SR))
    if s0 >= n:
        break
    tt = np.arange(s1 - s0) / SR
    env = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (seg + 0.8 - tt) / 1.4))
    for m in ch:
        f = midi(m)
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            pad[s0:s1] += (np.sin(2 * np.pi * ff * tt + rng.uniform(0, 6)) * 0.6
                           + np.sin(2 * np.pi * ff * 2 * tt) * 0.12) * env * 0.035
    # baixo pulsado em colcheias suaves
    fb = midi(ch[0] - 12)
    for b in range(8):
        p0 = s0 + int(b * beat * SR)
        if p0 >= n:
            break
        p1 = min(n, p0 + int(beat * 0.9 * SR))
        tb = np.arange(p1 - p0) / SR
        eb = np.exp(-tb * 4.0) * np.minimum(1, tb / 0.01)
        bass[p0:p1] += np.sin(2 * np.pi * fb * tb) * eb * 0.16
    # pluck arpejado (motivo de 'curiosidade')
    arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 24, ch[3] + 12, ch[2] + 12, ch[0] + 24]
    for b, m in enumerate(arp):
        p0 = s0 + int(b * beat * SR)
        if p0 >= n:
            break
        p1 = min(n, p0 + int(1.2 * SR))
        tp = np.arange(p1 - p0) / SR
        ep = np.exp(-tp * 5.5) * np.minimum(1, tp / 0.004)
        f = midi(m)
        pluck[p0:p1] += (np.sin(2 * np.pi * f * tp) + 0.3 * np.sin(2 * np.pi * f * 3 * tp) * np.exp(-tp * 9)) * ep * 0.045

# filtro passa-baixa simples no pad (média móvel)
k = 24
pad = np.convolve(pad, np.ones(k) / k, mode="same")
mix = pad + bass + pluck
# eco estéreo no pluck
L = mix.copy()
R = mix.copy()
d = int(beat * 0.75 * SR)
R[d:] += pluck[:-d] * 0.45
L[2 * d:] += pluck[:-2 * d] * 0.25
st = np.stack([L, R], -1)
# fade in/out
fade = np.ones(n)
fi, fo = int(3 * SR), int(5 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo)
st *= fade[:, None]
st /= np.max(np.abs(st)) / 0.7
sf.write(os.path.join(PUB, "musica", "trilha.wav"), st.astype(np.float32), SR, subtype="PCM_16")
print("ok texturas e trilha", DUR)
