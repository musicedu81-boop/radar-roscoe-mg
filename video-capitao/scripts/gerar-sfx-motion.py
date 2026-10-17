"""Efeitos sonoros da apresentação em motion (síntese própria).

Gera em public/apresentacao/: sfx-glitch, sfx-impacto, sfx-tick, sfx-swoosh, sfx-subida.

Uso: python3 scripts/gerar-sfx-motion.py
"""

import os

import numpy as np
import soundfile as sf
from scipy import signal

SR = 44100
rng = np.random.default_rng(17)
DEST = "public/apresentacao"


def env(n, a, r):
    a_n = max(1, int(a * SR))
    e = np.ones(n)
    e[:a_n] = np.linspace(0, 1, a_n)
    e[a_n:] = np.exp(-np.arange(n - a_n) / SR / max(r, 1e-4))
    return e


def norm(x, pico=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * pico


def glitch():
    """Rajada digital: blocos de ruído com bitcrush, bipes picotados e um baque grave."""
    n = int(0.42 * SR)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        bloco = int(rng.uniform(0.012, 0.045) * SR)
        tipo = rng.integers(0, 3)
        b = min(bloco, n - pos)
        t = np.arange(b) / SR
        if tipo == 0:
            passo = int(rng.integers(6, 30))
            ruido = np.repeat(rng.standard_normal(b // passo + 1), passo)[:b]
            x[pos : pos + b] = np.round(ruido * 4) / 4
        elif tipo == 1:
            f = rng.choice([880, 1320, 1760, 2640, 440])
            x[pos : pos + b] = np.sign(np.sin(2 * np.pi * f * t)) * 0.6
        pos += b + int(rng.uniform(0, 0.01) * SR)
    x *= env(n, 0.001, 0.25)
    t = np.arange(n) / SR
    baque = np.sin(2 * np.pi * np.cumsum(50 + 120 * np.exp(-t / 0.02)) / SR) * env(n, 0.001, 0.09)
    est = np.stack([x + baque, np.roll(x, 90) + baque], axis=1)
    return norm(est, 0.8)


def impacto():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(34 + 70 * np.exp(-t / 0.06)) / SR) * env(n, 0.001, 0.55)
    b, a = signal.butter(2, 5000 / (SR / 2), "low")
    crash = signal.lfilter(b, a, rng.standard_normal(n)) * env(n, 0.001, 0.35) * 0.4
    x = np.tanh(1.5 * (sub + crash))
    return norm(np.stack([x, x], axis=1), 0.9)


def tick():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.008) + 0.3 * rng.standard_normal(n) * env(n, 0.0002, 0.002)
    return norm(np.stack([x, x], axis=1), 0.6)


def swoosh():
    n = int(0.7 * SR)
    x = rng.standard_normal(n)
    saida = np.zeros(n)
    passos = 20
    for k in range(passos):
        a, bb = k * n // passos, (k + 1) * n // passos
        c = 500 + 4000 * np.sin(np.pi * k / passos)
        b, a2 = signal.butter(2, [c * 0.6 / (SR / 2), min(c * 1.5, SR / 2 - 100) / (SR / 2)], "band")
        saida[a:bb] = signal.lfilter(b, a2, x[a:bb])
    forma = np.sin(np.pi * np.arange(n) / n) ** 2
    pan = np.linspace(-1, 1, n)
    e = saida * forma
    return norm(np.stack([e * (1 - pan) / 2, e * (1 + pan) / 2], axis=1), 0.7)


def subida():
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    f = 300 * (6 ** (t / t[-1]))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.05) * env(n, 0.001, 0.5) ** 0.3
    x *= np.linspace(0.4, 1, n)
    return norm(np.stack([x, x], axis=1), 0.5)


if __name__ == "__main__":
    os.makedirs(DEST, exist_ok=True)
    for nome, fn in [("glitch", glitch), ("impacto", impacto), ("tick", tick), ("swoosh", swoosh), ("subida", subida)]:
        sf.write(f"{DEST}/sfx-{nome}.wav", fn(), SR)
    print(f"SFX gerados em {DEST}/")
