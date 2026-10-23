# Batida de funk carioca, 150 BPM, 5 compassos = 8s. Cada semicolcheia = 0,1s = 3 frames a 30fps.
# Gera out/batida-bruta.wav e src/batida.json (os mesmos eventos animam o vídeo).
# Uso: python3 scripts/compor-batida.py
import json
import wave

import numpy as np

SR = 48000
BPM = 150
PASSO = 60 / BPM / 4  # 0,1s
COMPASSOS = 5
N_PASSOS = 16 * COMPASSOS
DUR = N_PASSOS * PASSO
N = int(SR * DUR)
rng = np.random.default_rng(22)
FINAL = 16 * 4 + 12  # golpe final no último tempo (7,6s); depois só o eco

# ---------- Padrões (passos de 0 a 15 em cada compasso) ----------
KICK = [0, 3, 6, 8, 11, 14]          # tresillo duplo: tum..tum..tum.tum..tum..tum.
PALMA = [4, 12]                      # 2 e 4
TOM_ALTO = [2, 9]                    # tamborzão (atabaque)
TOM_BAIXO = [5, 15]
BERIMBAU = [0, 3, 6, 8, 10, 14]      # "tóin" metálico, entra no 2º compasso
NOTA_BERIMBAU = {0: 62, 3: 69, 6: 62, 8: 67, 10: 69, 14: 65}
GRAVE = {0: 38, 3: 38, 6: 41, 8: 38, 11: 33, 14: 36}  # Ré menor, grave do 808


def absolutos(padrao, compassos, ate=FINAL):
    return [c * 16 + p for c in compassos for p in padrao if c * 16 + p <= ate]


eventos = {
    'kick': absolutos(KICK, range(5)),
    'palma': absolutos(PALMA, range(5)),
    'tamborAlto': absolutos(TOM_ALTO, range(5)),
    'tamborBaixo': absolutos(TOM_BAIXO, range(5)),
    'chimbal': [p for p in range(N_PASSOS) if p <= FINAL],
    'berimbau': absolutos(BERIMBAU, range(1, 5)),
    'crash': [0, 64, FINAL],
    'virada': list(range(16 * 3 + 12, 16 * 4)),  # caixa em semicolcheias no fim do 4º compasso
    'apito': [0, 1, 2, 3],
    'sirene': [16 * 3 + 8],
    'final': FINAL,
}
eventos['kick'] = sorted(set(eventos['kick'] + [FINAL]))

L = np.zeros(N)
R = np.zeros(N)
SL = np.zeros(N)
SRv = np.zeros(N)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def t_(n):
    return np.arange(n) / SR


def add(sig, inicio, ganho=1.0, pan=0.0, eco=0.0):
    i0 = int(round(inicio * SR))
    if i0 >= N:
        return
    sig = sig[: N - i0] * ganho
    th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    gl, gr = np.cos(th), np.sin(th)
    L[i0 : i0 + len(sig)] += sig * gl
    R[i0 : i0 + len(sig)] += sig * gr
    SL[i0 : i0 + len(sig)] += sig * gl * eco
    SRv[i0 : i0 + len(sig)] += sig * gr * eco


def filtro(x, lo=None, hi=None):
    """Passa-faixa por FFT (sinais curtos)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, len(x))


# ---------- Instrumentos ----------
def bumbo_808(nota, dur):
    n = int(dur * SR)
    t = t_(n)
    f_fim = mtof(nota)
    freq = f_fim + (165 - f_fim) * np.exp(-t / 0.032)
    fase = 2 * np.pi * np.cumsum(freq) / SR
    corpo = np.sin(fase) + 0.3 * np.sin(2 * fase) * np.exp(-t / 0.06)  # 2º harmônico: o bumbo aparece no celular
    env = (1 - np.exp(-t / 0.0008)) * np.exp(-t / 0.3)
    clique = filtro(rng.standard_normal(n) * np.exp(-t / 0.0025), lo=1500) * 0.35
    x = np.tanh(2.2 * corpo * env) / np.tanh(2.2) + clique
    fade = np.clip((dur - t) / 0.006, 0, 1)  # o próximo bumbo corta o anterior
    return x * fade


def palma():
    n = int(0.35 * SR)
    t = t_(n)
    env = np.zeros(n)
    for k, d in enumerate([0, 0.009, 0.018]):
        tt = t - d
        env += (tt >= 0) * np.exp(-np.maximum(tt, 0) / 0.006) * (0.8 if k < 2 else 1.0)
    env += (t >= 0.018) * np.exp(-np.maximum(t - 0.018, 0) / 0.075) * 0.55
    ruido = filtro(rng.standard_normal(n), lo=900, hi=4200)
    corpo = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.035) * 0.25
    return ruido * env * 0.5 + corpo


def tambor(f0, f1, dec):
    n = int(0.5 * SR)
    t = t_(n)
    freq = f1 + (f0 - f1) * np.exp(-t / 0.04)
    s = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / dec)
    tapa = filtro(rng.standard_normal(n), lo=800, hi=5000) * np.exp(-t / 0.012) * 0.7
    return s + tapa


def chimbal(aberto=False, vel=1.0):
    n = int((0.25 if aberto else 0.08) * SR)
    t = t_(n)
    x = filtro(rng.standard_normal(n), lo=7000)
    return x * np.exp(-t / (0.11 if aberto else 0.022)) * vel


def berimbau(nota):
    """Corda metálica com cabaça: ataque brilhante, leve queda de afinação e 'uá' da cabaça."""
    f0 = mtof(nota)
    n = int(0.45 * SR)
    t = t_(n)
    freq = f0 * (1 + 0.05 * np.exp(-t / 0.025))
    fase = 2 * np.pi * np.cumsum(freq) / SR
    idx = 2.2 * np.exp(-t / 0.05)
    s = np.sin(fase + idx * np.sin(2 * fase)) + 0.3 * np.sin(3.01 * fase) * np.exp(-t / 0.08)
    caba = 0.75 + 0.25 * np.sin(2 * np.pi * 7 * t)
    return s * caba * (1 - np.exp(-t / 0.001)) * np.exp(-t / 0.22)


def apito(dur):
    """Apito de baile: trinado rápido na frequência + sopro."""
    n = int(dur * SR)
    t = t_(n)
    trinado = 1 + 0.045 * np.sign(np.sin(2 * np.pi * 27 * t)) * 0.6 + 0.02 * np.sin(2 * np.pi * 27 * t)
    fase = 2 * np.pi * np.cumsum(2850 * trinado) / SR
    s = np.sin(fase) + 0.15 * np.sin(2 * fase)
    sopro = filtro(rng.standard_normal(n), lo=2200, hi=4200) * 0.25
    env = np.clip(t / 0.01, 0, 1) * np.clip((dur - t) / 0.02, 0, 1)
    return (s + sopro) * env


def prato(dur=1.6):
    n = int(dur * SR)
    t = t_(n)
    x = filtro(rng.standard_normal(n), lo=4500) * np.exp(-t / 0.55)
    metal = sum(np.sin(2 * np.pi * f * t) for f in (3150, 4270, 5630)) * 0.05 * np.exp(-t / 0.3)
    return (x + metal) * (1 - np.exp(-t / 0.002))


def sirene(dur):
    n = int(dur * SR)
    t = t_(n)
    f = 650 + 450 * (0.5 - 0.5 * np.cos(2 * np.pi * t / (dur / 2)))
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = filtro(s, hi=3000)
    return s * np.clip(t / dur, 0, 1) ** 1.5


# ---------- Arranjo ----------
tp = lambda p: p * PASSO
kicks = eventos['kick']
for i, p in enumerate(kicks):
    prox = kicks[i + 1] if i + 1 < len(kicks) else N_PASSOS + 6
    dur = (prox - p) * PASSO if p != FINAL else 1.2
    nota = GRAVE.get(p % 16, 38)
    add(bumbo_808(nota, dur), tp(p), ganho=0.5 if p != FINAL else 0.62)
for p in eventos['palma']:
    add(palma(), tp(p), ganho=1.7, pan=0.05, eco=0.35)
for p in eventos['tamborAlto']:
    add(tambor(300, 215, 0.11), tp(p), ganho=0.62, pan=-0.35, eco=0.2)
for p in eventos['tamborBaixo']:
    add(tambor(200, 140, 0.15), tp(p), ganho=0.66, pan=0.3, eco=0.2)
for p in eventos['chimbal']:
    if p >= 16 * 3 + 12 and p < 16 * 4:
        continue  # espaço para a virada
    aberto = p % 16 == 7
    vel = 0.55 if p % 2 == 0 else 0.32
    add(chimbal(aberto, vel), tp(p), ganho=0.6, pan=0.35)
for p in eventos['berimbau']:
    add(berimbau(NOTA_BERIMBAU[p % 16]), tp(p), ganho=0.95, pan=-0.45, eco=0.3)
for k, p in enumerate(eventos['virada']):
    add(palma(), tp(p), ganho=0.7 + 0.15 * k, pan=-0.2 + 0.1 * k, eco=0.25)
    add(tambor(260 + 20 * k, 190 + 15 * k, 0.1), tp(p), ganho=0.45, pan=0.25 - 0.1 * k)
for p in eventos['crash']:
    add(prato(), tp(p), ganho=0.4 if p != FINAL else 0.5, pan=0.15, eco=0.4)
# Apito de abertura: pi-ri-ri-piiii
for ini, dur in [(0.0, 0.07), (0.1, 0.07), (0.2, 0.07), (0.3, 0.32)]:
    add(apito(dur), ini, ganho=0.2, pan=0.2, eco=0.35)
# Apito no golpe final
add(apito(0.38), tp(FINAL) + 0.02, ganho=0.18, pan=0.2, eco=0.45)
# Sirene subindo antes do drop do 5º compasso
add(sirene(tp(16 * 4) - tp(eventos['sirene'][0])), tp(eventos['sirene'][0]), ganho=0.16, pan=-0.1, eco=0.3)


# ---------- Eco (sala pequena) e master ----------
def resposta(dur=0.9, rt=0.55):
    n = int(dur * SR)
    t = t_(n)
    out = []
    for s in (1, 2):
        g = np.random.default_rng(s)
        ir = g.standard_normal(n) * np.exp(-t * 6.9 / rt)
        ir = filtro(ir, hi=7000)
        ir[: int(0.012 * SR)] = 0
        out.append(ir / np.sqrt(np.sum(ir ** 2)))
    return out


def conv(x, h):
    m = len(x) + len(h) - 1
    nfft = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[: len(x)]


irL, irR = resposta()
L += conv(SL, irL) * 0.5
R += conv(SRv, irR) * 0.5
mix = np.stack([L, R], 1)
mix -= mix.mean(0)
# Realce de presença (1-6 kHz) para a batida aparecer em alto-falante de celular
for c in range(2):
    X = np.fft.rfft(mix[:, c])
    f = np.fft.rfftfreq(N, 1 / SR)
    X *= 1 + 0.6 * np.exp(-0.5 * (np.log2(np.maximum(f, 1) / 2500) / 1.1) ** 2)
    mix[:, c] = np.fft.irfft(X, N)
mix /= np.max(np.abs(mix)) / 0.9
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
tt = t_(N)
mix *= (np.clip(tt / 0.003, 0, 1) * np.clip((DUR - tt) / 0.05, 0, 1))[:, None]
with wave.open('out/batida-bruta.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())

json.dump({'bpm': BPM, 'passoSegundos': PASSO, 'passos': N_PASSOS, **eventos}, open('src/batida.json', 'w'), indent=1)
print('duração', DUR, 's | kicks', len(eventos['kick']), '| final no passo', FINAL, f'({tp(FINAL):.1f}s)')
