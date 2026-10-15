"""Rastreia o rosto do personagem e gera a trilha de câmera virtual.

Saída: src/data/face-track.json com {t, x, y} normalizados (0 a 1),
já suavizados para a câmera se mover com calma, sem tremer.

Uso: python3 scripts/rastrear-rosto.py <video> <dir_modelos>
"""

import json
import sys

import cv2
import numpy as np

SAMPLE_FPS = 10


def detect(net, frame):
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104, 177, 123))
    net.setInput(blob)
    det = net.forward()[0, 0]
    faces = []
    for d in det:
        conf = float(d[2])
        if conf < 0.5:
            continue
        x1, y1, x2, y2 = d[3] * w, d[4] * h, d[5] * w, d[6] * h
        faces.append((conf, (x1 + x2) / 2 / w, (y1 + y2) / 2 / h, (x2 - x1) / w))
    return faces


def smooth(values, deadzone, alpha):
    """Câmera virtual: ignora micro movimentos (zona morta) e segue com inércia."""
    out = []
    cam = values[0]
    target = values[0]
    for v in values:
        if abs(v - target) > deadzone:
            target = v
        cam += (target - cam) * alpha
        out.append(cam)
    # Passada reversa para não atrasar a câmera em relação ao movimento
    back = []
    cam = out[-1]
    for v in reversed(out):
        cam += (v - cam) * alpha
        back.append(cam)
    return list(reversed(back))


def main(video, models):
    net = cv2.dnn.readNetFromCaffe(f"{models}/deploy.prototxt", f"{models}/res10.caffemodel")
    cap = cv2.VideoCapture(video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    step = max(1, round(fps / SAMPLE_FPS))
    times, xs, ys = [], [], []
    prev = None
    i = 0
    while True:
        ok = cap.grab()
        if not ok:
            break
        if i % step == 0:
            _, frame = cap.retrieve()
            faces = detect(net, frame)
            if faces:
                if prev is None:
                    best = max(faces, key=lambda f: f[0] * f[3])
                else:
                    # Mantém o mesmo personagem: maior rosto perto do anterior
                    best = max(faces, key=lambda f: f[3] - 0.5 * np.hypot(f[1] - prev[0], f[2] - prev[1]))
                prev = (best[1], best[2])
                times.append(i / fps)
                xs.append(best[1])
                ys.append(best[2])
        i += 1
    cap.release()

    total = i / fps
    if not times:
        print("Nenhum rosto detectado: usando centro do quadro")
        track = [{"t": 0, "x": 0.5, "y": 0.4}, {"t": round(total, 3), "x": 0.5, "y": 0.4}]
    else:
        grid = np.arange(0, total + 1e-6, 1 / SAMPLE_FPS)
        gx = np.interp(grid, times, xs)
        gy = np.interp(grid, times, ys)
        sx = smooth(list(gx), deadzone=0.035, alpha=0.18)
        sy = smooth(list(gy), deadzone=0.035, alpha=0.18)
        track = [{"t": round(float(t), 3), "x": round(float(x), 4), "y": round(float(y), 4)} for t, x, y in zip(grid, sx, sy)]
        print(f"Rosto detectado em {len(times)} de {len(range(0, i, step))} amostras")

    with open("src/data/face-track.json", "w") as f:
        json.dump(track, f)
    print(f"face-track.json: {len(track)} pontos")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
