"""Trilha original para o vídeo de Dia dos Professores.

Síntese 100% própria (sem samples, sem direitos de terceiros):
piano em arpejo, pad quente, baixo, sinos FM e percussão leve.
Progressão I - V - vi - IV em Ré maior, 92 BPM. Clima: gratidão, esperança.

Uso: python3 scripts/gerar-trilha.py <duracao_em_segundos> <saida.wav>
"""

import sys

import numpy as np
from scipy import signal
import soundfile as sf

SR = 44100
BPM = 92
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(15)


def midi_hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# Ré maior: D, A, Bm, G (com cores de 9ª/7ª para soar moderno)
CHORDS = [
    [50, 57, 62, 66, 69, 76],  # D(add9)
    [45, 52, 61, 64, 69, 73],  # A
    [47, 54, 62, 66, 69, 73],  # Bm7
    [43, 50, 59, 62, 67, 74],  # Gmaj7
]
BASS = [38, 33, 35, 31]


def env_adsr(n, a, d, s, r, sr=SR):
    a_n, d_n, r_n = int(a * sr), int(d * sr), int(r * sr)
    s_n = max(n - a_n - d_n - r_n, 0)
    e = np.concatenate([
        np.linspace(0, 1, a_n, endpoint=False),
        np.linspace(1, s, d_n, endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, r_n),
    ])
    return np.pad(e, (0, max(n - len(e), 0)))[:n]


def piano(freq, dur, vel=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, 9):
        inharm = k * np.sqrt(1 + 0.0004 * k * k)
        decay = 2.2 + 0.9 * k
        out += (0.6 ** (k - 1)) * np.sin(2 * np.pi * freq * inharm * t) * np.exp(-decay * t / (1 + freq / 600))
    attack = np.minimum(t / 0.004, 1)
    hammer = rng.normal(0, 1, n) * np.exp(-t * 90) * 0.02
    return vel * (out * attack + hammer)


def bell(freq, dur, vel=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * 2.2 * np.exp(-t * 3)
    return vel * np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 2.4)


def pad(freqs, dur, vel=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            phase = rng.uniform(0, 2 * np.pi)
            out += signal.sawtooth(2 * np.pi * ff * t + phase)
    b, a = signal.butter(2, 1400 / (SR / 2), "low")
    out = signal.lfilter(b, a, out) / (len(freqs) * 3)
    lfo = 1 + 0.08 * np.sin(2 * np.pi * 0.18 * t)
    return vel * out * lfo * env_adsr(n, 0.9, 0.5, 0.85, 1.2)


def bass(freq, dur, vel=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return vel * out * env_adsr(n, 0.01, 0.25, 0.7, 0.3)


def kick(vel=0.55):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 32)
    return vel * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)


def clap(vel=0.18):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    b, a = signal.butter(2, [900 / (SR / 2), 5000 / (SR / 2)], "band")
    return vel * signal.lfilter(b, a, noise) * np.exp(-t * 18)


def shaker(vel=0.05):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    b, a = signal.butter(2, 6000 / (SR / 2), "high")
    return vel * signal.lfilter(b, a, noise) * np.exp(-t * 40) * np.minimum(t / 0.01, 1)


def add(buf, sig, start):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(i + len(sig), len(buf))
    buf[i:j] += sig[: j - i]


def reverb(x, seconds=2.6, mix=0.28):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t * 3.2)
    b, a = signal.butter(1, 5000 / (SR / 2), "low")
    ir = signal.lfilter(b, a, ir)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return (1 - mix) * x + mix * wet


def render(duration):
    total = int((duration + 3) * SR)
    music = np.zeros(total)
    drums = np.zeros(total)
    bars = int(np.ceil(duration / BAR)) + 1
    arp_pattern = [0, 2, 3, 4, 5, 4, 3, 2]

    for bar in range(bars):
        t0 = bar * BAR
        ci = bar % 4
        chord = CHORDS[ci]
        section = 0 if bar < 4 else (1 if bar < 8 else 2)
        is_outro = t0 > duration - 2 * BAR

        # Piano em arpejo de colcheias
        for step, idx in enumerate(arp_pattern):
            vel = 0.32 if step % 2 == 0 else 0.24
            add(music, piano(midi_hz(chord[idx]), 1.6, vel), t0 + step * BEAT / 2)
        add(music, piano(midi_hz(chord[0]), 2.4, 0.3), t0)

        if section >= 1:
            add(music, pad([midi_hz(n) for n in chord[1:5]], BAR + 0.6), t0)
            add(music, bass(midi_hz(BASS[ci]), BEAT * 2.5), t0)
            add(music, bass(midi_hz(BASS[ci]), BEAT * 1.4, 0.28), t0 + BEAT * 2.5)

        if section >= 2 and not is_outro:
            melody = [chord[5], chord[4], chord[5] + 2, chord[4]]
            for k, note in enumerate(melody):
                add(music, bell(midi_hz(note + 12), 1.8), t0 + k * BEAT)
            for b in range(4):
                add(drums, kick(), t0 + b * BEAT)
                if b in (1, 3):
                    add(drums, clap(), t0 + b * BEAT)
                for s in range(2):
                    add(drums, shaker(0.05 if s else 0.035), t0 + b * BEAT + s * BEAT / 2)

    # Bombeado leve do kick sobre a harmonia (sidechain)
    pump = np.ones(total)
    if bars > 8:
        for b in range(8 * 4, bars * 4):
            i = int(b * BEAT * SR)
            n = int(BEAT * SR)
            seg = 1 - 0.22 * np.exp(-np.arange(n) / SR * 9)
            j = min(i + n, total)
            if i < total:
                pump[i:j] = seg[: j - i]

    mix = reverb(music * pump) + reverb(drums, 1.2, 0.12)
    mix = mix[: int(duration * SR)]

    # Fade in e fade out
    fi, fo = int(1.5 * SR), int(3.0 * SR)
    mix[:fi] *= np.linspace(0, 1, fi)
    mix[-fo:] *= np.linspace(1, 0, fo)

    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 10 ** (-1 / 20)

    # Estéreo com leve abertura
    delay = int(0.012 * SR)
    left = mix
    right = np.concatenate([np.zeros(delay), mix[:-delay]]) * 0.92 + mix * 0.08
    return np.stack([left, right], axis=1)


if __name__ == "__main__":
    dur = float(sys.argv[1]) if len(sys.argv) > 1 else 60
    out = sys.argv[2] if len(sys.argv) > 2 else "public/trilha.wav"
    sf.write(out, render(dur), SR)
    print(f"Trilha gerada: {out} ({dur:.1f}s)")
