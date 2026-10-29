# Instrumentos da trilha da vinheta Cris Santos & Lúpus (caixinha de música, sino de vidro, harpa,
# pad de cordas e sub), numa mesa estéreo com envio para reverb. Mesmos timbres da vinheta.
import numpy as np

SR = 48000


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


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


class Mesa:
    def __init__(self, duracao, seed=81):
        self.N = int(SR * duracao)
        self.dur = duracao
        self.L = np.zeros(self.N)
        self.R = np.zeros(self.N)
        self.SL = np.zeros(self.N)
        self.SR = np.zeros(self.N)
        self.rng = np.random.default_rng(seed)

    def add(self, sig, inicio, ganho=1.0, pan=0.0, envio=0.25):
        i0 = int(round(inicio * SR))
        if i0 >= self.N:
            return
        if i0 < 0:
            sig = sig[-i0:]
            i0 = 0
        sig = sig[: self.N - i0] * ganho
        th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
        gl, gr = np.cos(th), np.sin(th)
        sl = slice(i0, i0 + len(sig))
        self.L[sl] += sig * gl
        self.R[sl] += sig * gr
        self.SL[sl] += sig * gl * envio
        self.SR[sl] += sig * gr * envio

    def pad(self, notas, t0, t1, corte, volume, atk=0.8, rel=0.8, detunes=(-0.09, 0.0, 0.08), parciais=22, ganho=0.06, largura=0.6):
        """Pad de cordas aditivo: serras desafinadas com passa-baixa por parcial (corte e volume automatizados)."""
        n = int((t1 - t0 + rel) * SR)
        tt = np.arange(n) / SR
        fc = automacao(corte, t0 + tt)
        vol = automacao(volume, t0 + tt)
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
                    voz += (1 / k) * lp * np.sin(k * fase + self.rng.uniform(0, 2 * np.pi))
            p = (j / max(len(notas) - 1, 1) - 0.5) * 2 * largura
            self.add(voz * env * vol * ganho / len(detunes), t0, pan=p, envio=0.45)

    def sub(self, m, t0, t1, volume, ganho=0.05, rel=0.6):
        n = int((t1 - t0 + rel) * SR)
        tt = np.arange(n) / SR
        f = mtof(m)
        env = np.clip(tt / 0.4, 0, 1) * np.clip((t1 - t0 + rel - tt) / rel, 0, 1)
        s = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)
        self.add(s * env * automacao(volume, t0 + tt) * ganho, t0, envio=0.05)

    def finalizar(self, fade_fim=1.2):
        """Reverb de sala grande, passa-altas e normalização de pico. Devolve o estéreo (N, 2)."""

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

        def conv(x, h):
            m = len(x) + len(h) - 1
            nfft = 1 << (m - 1).bit_length()
            return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[: len(x)]

        def passa_altas(x, fc=32):
            spec = np.fft.rfft(x)
            fr = np.fft.rfftfreq(len(x), 1 / SR)
            spec *= 1 / np.sqrt(1 + (fc / np.maximum(fr, 1e-3)) ** 4)
            return np.fft.irfft(spec, len(x))

        irL, irR = resposta()
        L = passa_altas(self.L + conv(self.SL, irL) * 0.55)
        R = passa_altas(self.R + conv(self.SR, irR) * 0.55)
        mix = np.stack([L, R], axis=1)
        tt = np.arange(self.N) / SR
        mix *= (np.clip(tt / 0.01, 0, 1) * np.clip((self.dur - tt) / fade_fim, 0, 1) ** 1.5)[:, None]
        mix /= np.max(np.abs(mix)) / 0.89
        return np.tanh(mix * 1.15) / np.tanh(1.15)
