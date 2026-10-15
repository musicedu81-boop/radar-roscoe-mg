"""Efeitos sonoros sintetizados para os motions (whoosh, pop, brilho)."""

import numpy as np
from scipy import signal
import soundfile as sf

SR = 44100
rng = np.random.default_rng(7)


def whoosh(dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    # Filtro passa-banda varrendo de grave para agudo
    for i, fc in enumerate(np.geomspace(300, 4500, 24)):
        seg = slice(int(i * n / 24), int((i + 1) * n / 24) + 512)
        b, a = signal.butter(2, [fc * 0.7 / (SR / 2), min(fc * 1.4, SR / 2 - 100) / (SR / 2)], "band")
        out[seg] += signal.lfilter(b, a, noise[seg])[: len(out[seg])]
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * env


def pop(dur=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 18) + 220
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)
    click = rng.normal(0, 1, n) * np.exp(-t * 400) * 0.3
    return body + click


def chime(dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, note in enumerate([74, 78, 81, 86]):
        f = 440 * 2 ** ((note - 69) / 12)
        start = int(k * 0.07 * SR)
        tt = t[: n - start]
        mod = np.sin(2 * np.pi * f * 3.5 * tt) * 1.5 * np.exp(-tt * 4)
        out[start:] += np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * 2.8) * 0.5
    return out


def save(name, x, peak_db=-3):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)
    sf.write(f"public/sfx-{name}.wav", np.stack([x, x], axis=1), SR)


if __name__ == "__main__":
    save("whoosh", whoosh(), -6)
    save("pop", pop(), -6)
    save("brilho", chime(), -8)
    print("SFX gerados em public/")
