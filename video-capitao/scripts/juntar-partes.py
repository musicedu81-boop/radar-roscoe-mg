"""Junta partes de um vídeo que foi dividido para caber no upload.

Se as partes tiverem um trecho repetido entre si (recomendado: ~1 s),
o alinhamento é feito pelo áudio e o corte cai no ponto mais silencioso
desse trecho. Sem trecho repetido, as partes são apenas emendadas.

Uso: python3 scripts/juntar-partes.py <parte1> <parte2> [...] <saida.mp4>
"""

import json
import subprocess
import sys

import numpy as np

SR = 16000
FPS = 30
AR = 48000
JANELA = 4.0  # segundos do fim de uma parte comparados com o início da próxima
MIN_CORR = 0.5


def audio(path):
    raw = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", path, "-vn",
        "-af", "aresample=async=1:first_pts=0", "-ac", "1", "-ar", str(SR),
        "-f", "s16le", "-"])
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def info(path):
    p = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:stream_side_data=rotation:format=duration",
        "-of", "json", path]))
    s = p["streams"][0]
    w, h = s["width"], s["height"]
    rot = next((int(d["rotation"]) for d in s.get("side_data_list", []) if "rotation" in d), 0)
    if abs(rot) % 180 == 90:
        w, h = h, w
    return w, h, float(p["format"]["duration"])


def sobreposicao(a, b):
    """Retorna (inicio_de_b_em_a, corr) ou None se não houver trecho repetido."""
    n = int(JANELA * SR)
    cauda, cabeca = a[-n:], b[:n]
    if len(cauda) < SR or len(cabeca) < SR:
        return None
    m = len(cauda) + len(cabeca) - 1
    nfft = 1 << (m - 1).bit_length()
    xc = np.fft.irfft(np.fft.rfft(cauda, nfft) * np.conj(np.fft.rfft(cabeca, nfft)), nfft)
    lags = np.concatenate([xc[: len(cauda)], xc[nfft - len(cabeca) + 1 :]])
    lag_vals = np.concatenate([np.arange(len(cauda)), np.arange(-len(cabeca) + 1, 0)])
    validos = lag_vals >= 0
    i = np.argmax(np.where(validos, lags, -np.inf))
    lag = int(lag_vals[i])
    sob = len(cauda) - lag
    if sob < SR * 0.2:
        return None
    x, y = cauda[lag:], cabeca[:sob]
    corr = float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-9))
    if corr < MIN_CORR:
        return None
    return (len(a) - len(cauda) + lag) / SR, corr


def ponto_silencioso(a, ini, fim):
    """Instante (s) de menor energia em a[ini:fim], janelas de 50 ms."""
    w = int(0.05 * SR)
    seg = a[int(ini * SR) : int(fim * SR)]
    if len(seg) <= w:
        return (ini + fim) / 2
    energia = np.convolve(seg ** 2, np.ones(w), "valid")
    margem = min(w, len(energia) // 4)
    k = margem + int(np.argmin(energia[margem : len(energia) - margem or None]))
    return ini + (k + w / 2) / SR


def main(partes, saida):
    audios = [audio(p) for p in partes]
    infos = [info(p) for p in partes]
    W, H = infos[0][:2]
    n = len(partes)

    # Cada segmento: início (no tempo da própria parte) e duração em quadros
    # inteiros, para o concat não precisar completar o áudio com silêncio.
    ini = [0.0] * n
    quadros = [0] * n
    for i in range(n):
        dur = min(len(audios[i]) / SR, infos[i][2])
        r = sobreposicao(audios[i], audios[i + 1]) if i < n - 1 else None
        if r is None:
            quadros[i] = int((dur - ini[i]) * FPS)
            if i < n - 1:
                print(f"parte {i + 1} -> {i + 2}: sem trecho repetido, emenda direta")
            continue
        inicio_b, corr = r
        c = ponto_silencioso(audios[i], max(inicio_b, ini[i]), len(audios[i]) / SR)
        quadros[i] = round((c - ini[i]) * FPS)
        corte = ini[i] + quadros[i] / FPS
        ini[i + 1] = max(0.0, corte - inicio_b)
        print(f"parte {i + 1} -> {i + 2}: {len(audios[i]) / SR - inicio_b:.2f}s repetidos "
              f"(corr {corr:.2f}), corte em {corte:.3f}s da parte {i + 1}")

    args, filtros, entradas = [], [], ""
    for i, p in enumerate(partes):
        args += ["-i", p]
        q0 = round(ini[i] * FPS)
        a0 = round(ini[i] * AR)
        filtros.append(
            f"[{i}:v]fps={FPS}:start_time=0,"
            f"trim=start_frame={q0}:end_frame={q0 + quadros[i]},"
            f"setpts=PTS-STARTPTS,scale={W}:{H},setsar=1,format=yuv420p[v{i}]")
        filtros.append(
            f"[{i}:a]aresample={AR}:async=1:first_pts=0,"
            f"atrim=start_sample={a0}:end_sample={a0 + quadros[i] * AR // FPS},"
            f"asetpts=PTS-STARTPTS,aformat=channel_layouts=stereo[a{i}]")
        entradas += f"[v{i}][a{i}]"
    filtros.append(f"{entradas}concat=n={n}:v=1:a=1[v][a]")

    subprocess.check_call([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args,
        "-filter_complex", ";".join(filtros), "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "16",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida])
    print(f"{saida}: {n} partes, {sum(quadros) / FPS:.2f}s")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    main(sys.argv[1:-1], sys.argv[-1])
