"""Trilha original para a apresentação em motion (síntese própria, sem samples).

120 BPM, Lá maior com progressão F#m - D - A - E (vi - IV - I - V): energia de tecnologia e
esperança. A trilha segue um mapa de energia por compasso, alinhado ao roteiro das cenas:

  I  intro: pad filtrado abrindo, pulso de baixo, tique de hi-hat
  R  subida: riser de ruído e rufada de caixa, prepara o impacto
  A  alto: bumbo four-on-the-floor, palmas, baixo pulsante, arpejo, pad com sidechain
  M  médio: meio-tempo, baixo e pad, hi-hat no contratempo
  B  pausa: só pad e arpejo esparso
  F  final: impacto e acorde de Lá maior sustentado até sumir

Uso: python3 scripts/gerar-trilha-motion.py <mapa> <saida.wav>
     mapa: uma letra por compasso, por exemplo "IIIIRAAAAMMMMM..."
"""

import sys

import numpy as np
import soundfile as sf
from scipy import signal

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(26)


def hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# F#m, D, A, E (notas MIDI do acorde e raiz do baixo)
ACORDES = [
    ([54, 57, 61, 64], 42),  # F#m(add11): F#3 A3 C#4 E4
    ([50, 54, 57, 62], 38),  # D: D3 F#3 A3 D4
    ([57, 61, 64, 69], 45),  # A: A3 C#4 E4 A4
    ([52, 56, 59, 64], 40),  # E: E3 G#3 B3 E4
]


def env(n, a, r):
    """Envelope ataque linear + queda exponencial."""
    a_n = max(1, int(a * SR))
    e = np.ones(n)
    e[:a_n] = np.linspace(0, 1, a_n)
    t = np.arange(n - a_n) / SR
    e[a_n:] = np.exp(-t / max(r, 1e-4))
    return e


def saw(f, n, fase=0.0):
    t = np.arange(n) / SR
    return 2 * ((f * t + fase) % 1) - 1


def lowpass(x, fc, ordem=2):
    fc = min(max(fc, 40), SR / 2 - 100)
    b, a = signal.butter(ordem, fc / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def highpass(x, fc, ordem=2):
    b, a = signal.butter(ordem, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bandpass(x, f1, f2, ordem=2):
    b, a = signal.butter(ordem, [f1 / (SR / 2), f2 / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def add(buf, x, ini, ganho=1.0, pan=0.0):
    i = int(ini * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    esq = np.cos((pan + 1) * np.pi / 4)
    dir_ = np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(x), 0] += x * ganho * esq * 1.414
    buf[i : i + len(x), 1] += x * ganho * dir_ * 1.414


def bumbo():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    fase = 2 * np.pi * np.cumsum(f) / SR
    corpo = np.sin(fase) * env(n, 0.001, 0.16)
    clique = rng.standard_normal(n) * env(n, 0.0005, 0.004) * 0.35
    return np.tanh(1.6 * (corpo + highpass(clique, 2000)))


def palma():
    n = int(0.3 * SR)
    ruido = bandpass(rng.standard_normal(n), 900, 3800)
    e = np.zeros(n)
    for k, atraso in enumerate([0, 0.011, 0.022]):
        i = int(atraso * SR)
        e[i:] += env(n - i, 0.0008, 0.012 if k < 2 else 0.09) * (0.8 if k < 2 else 1)
    tom = np.sin(2 * np.pi * 210 * np.arange(n) / SR) * env(n, 0.001, 0.03) * 0.3
    return (ruido * e + tom) * 0.9


def chimbal(aberto=False):
    n = int((0.16 if aberto else 0.045) * SR)
    x = highpass(rng.standard_normal(n), 7500, 4)
    return x * env(n, 0.0005, 0.06 if aberto else 0.012)


def baixo(nota, dur, corte):
    n = int(dur * SR)
    f = hz(nota)
    x = 0.6 * saw(f, n) + 0.4 * np.sin(2 * np.pi * f * np.arange(n) / SR)
    x = lowpass(x, corte, 2) * env(n, 0.004, dur * 0.55)
    return np.tanh(1.5 * x)


def pad(notas, dur, corte):
    n = int(dur * SR)
    x = np.zeros(n)
    for nota in notas:
        for det in (-0.08, 0.0, 0.08):
            x += saw(hz(nota + det), n, fase=rng.random())
    x = lowpass(x / (len(notas) * 3), corte, 2)
    a = min(0.25, dur * 0.3)
    e = np.minimum(1, np.arange(n) / (a * SR))
    e *= np.minimum(1, (n - np.arange(n)) / (0.08 * SR))
    return x * e


def pluck(nota, dur=0.22):
    n = int(dur * SR)
    f = hz(nota)
    t = np.arange(n) / SR
    x = 0.55 * np.sin(2 * np.pi * f * t) + 0.25 * saw(f, n) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
    return lowpass(x, 3200) * env(n, 0.002, 0.07)


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    saida = np.zeros(n)
    passos = 24
    for k in range(passos):
        a, b = k * n // passos, (k + 1) * n // passos
        c = 300 * (40 ** (k / passos))
        saida[a:b] = bandpass(x[a:b], c * 0.7, min(c * 1.4, SR / 2 - 200))
    tom = np.sin(2 * np.pi * np.cumsum(200 * (8 ** (t / dur))) / SR) * 0.25
    return (saida * 0.8 + tom) * (t / dur) ** 2


def impacto():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 32 + 60 * np.exp(-t / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.7)
    crash = lowpass(rng.standard_normal(n), 6000) * env(n, 0.001, 0.5) * 0.35
    return np.tanh(1.4 * (sub + crash))


def reverb(x, segundos=1.8, mistura=0.25):
    n = int(segundos * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (segundos / 5))
    ir = lowpass(ir, 5000)
    ir /= np.sqrt(np.sum(ir**2))
    molhado = signal.fftconvolve(x, ir)[: len(x)]
    return x + mistura * molhado


def render(mapa):
    total = len(mapa) * BAR + 3.0
    n = int(total * SR)
    seco = np.zeros((n, 2))
    envio = np.zeros((n, 2))  # vai para o reverb
    sidechain = np.ones(n)

    # Sidechain: o pad e o baixo abaixam a cada bumbo
    def duck(ini):
        i = int(ini * SR)
        m = int(0.22 * SR)
        if i < n:
            m = min(m, n - i)
            sidechain[i : i + m] = np.minimum(sidechain[i : i + m], 0.35 + 0.65 * (np.arange(m) / m) ** 0.6)

    camadas_pad = np.zeros((n, 2))
    camadas_baixo = np.zeros((n, 2))

    for c, ener in enumerate(mapa):
        t0 = c * BAR
        notas, raiz = ACORDES[c % 4]
        anterior = mapa[c - 1] if c else ""
        # Impacto na entrada de um trecho alto depois de uma subida, e no final
        if (ener in "AF" and anterior == "R") or (ener == "F" and anterior != "F"):
            add(seco, impacto(), t0, 0.55)

        if ener == "F":
            if anterior != "F":
                final = pad([57, 61, 64, 69, 73], BAR * mapa.count("F") + 2.5, 2200)
                fim = int(len(final) * 0.55)
                final[fim:] *= np.linspace(1, 0, len(final) - fim)
                add(envio, final, t0, 0.55, 0.0)
                add(seco, baixo(33, BAR * 2, 300), t0, 0.5)
            continue

        # Pad
        corte = {"I": 400 + 1100 * (c / max(1, mapa.index("R") if "R" in mapa else 4)), "R": 1800, "A": 2400, "M": 1600, "B": 1300}[ener]
        add(camadas_pad, pad(notas, BAR, corte), t0, 0.32 if ener != "B" else 0.42)

        # Baixo
        for k in range(8):
            if ener == "B":
                break
            if ener == "I" and k % 2:
                continue
            add(camadas_baixo, baixo(raiz, BEAT / 2 * 0.95, 900 if ener == "A" else 600), t0 + k * BEAT / 2, 0.5 if ener != "I" else 0.32)

        # Bateria
        for b in range(4):
            tb = t0 + b * BEAT
            if ener == "A" or (ener == "M" and b in (0, 2)):
                add(seco, bumbo(), tb, 0.85)
                duck(tb)
            if ener == "A" and b in (1, 3):
                add(seco, palma(), tb, 0.42)
                add(envio, palma(), tb, 0.12)
            if ener == "M" and b == 3:
                add(seco, palma(), tb, 0.3)
            if ener in "AMI":
                add(seco, chimbal(), tb + BEAT / 2, 0.22 if ener != "I" else 0.12, 0.3)
            if ener == "A" and b == 3:
                add(seco, chimbal(True), tb + BEAT * 0.75, 0.12, -0.3)

        if ener in "IR":
            for k in range(16):
                add(seco, chimbal(), t0 + k * BEAT / 4, 0.05 + 0.04 * (k % 4 == 0), 0.4 * (-1) ** k)

        # Arpejo
        if ener in "AB" or (ener == "M" and c % 2):
            passo = BEAT / 4 if ener == "A" else BEAT / 2
            seq = [notas[0], notas[1], notas[2], notas[3], notas[2], notas[1]]
            for k in range(int(BAR / passo)):
                nota = seq[k % len(seq)] + 12
                add(seco, pluck(nota), t0 + k * passo, 0.16, 0.5 * np.sin(k))
                add(envio, pluck(nota), t0 + k * passo + 0.375, 0.07, -0.5 * np.sin(k))

        # Subida
        if ener == "R":
            add(seco, riser(BAR), t0, 0.32)
            for k in range(16):
                vel = 0.08 + 0.3 * (k / 16) ** 2
                add(seco, palma(), t0 + BAR / 2 + k * BAR / 32, vel)

    camadas_pad *= sidechain[:, None]
    camadas_baixo *= sidechain[:, None]
    seco += camadas_baixo
    envio += camadas_pad
    mix = seco + np.stack([reverb(envio[:, 0]), reverb(envio[:, 1])], axis=1)

    # Fade de 2 s no fim e normalização
    f = int(2.0 * SR)
    mix[-f:] *= np.linspace(1, 0, f)[:, None]
    mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.89
    return mix


if __name__ == "__main__":
    mapa = sys.argv[1].upper().replace(" ", "")
    saida = sys.argv[2]
    sf.write(saida, render(mapa), SR)
    print(f"Trilha: {saida} ({len(mapa)} compassos, {len(mapa) * BAR:.1f}s + 3s de cauda)")
