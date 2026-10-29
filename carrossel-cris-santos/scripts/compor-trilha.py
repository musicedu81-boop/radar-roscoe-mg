# Trilha de fundo do motion do carrossel: calma e esperançosa, Ré maior, 72 BPM, feita para ficar por baixo
# da narração. Timbres da vinheta (scripts/instrumentos.py). Sinos marcam as trocas de cena; a cadência
# Lá -> Ré resolve no pouso da borboleta na assinatura.
# Uso: python3 scripts/compor-trilha.py --duracao 42.5 --cortes 4.2,9.8,15.1 --assinatura 39.3
import argparse
import wave

import numpy as np

from instrumentos import SR, Mesa, caixinha, harpa, sino

BPM = 72
TEMPO = 60 / BPM
COMPASSO = 4 * TEMPO
COLCHEIA = TEMPO / 2

# I, V6, vi, IV: Dmaj9, A/C#, Bm9, Gmaj9
ACORDES = [
    {'pad': [50, 57, 64, 66, 73], 'raiz': 38, 'arpejo': [74, 78, 81, 85, 88]},
    {'pad': [49, 57, 61, 64, 71], 'raiz': 37, 'arpejo': [73, 76, 81, 83, 85]},
    {'pad': [47, 54, 62, 69, 73], 'raiz': 35, 'arpejo': [71, 74, 78, 81, 85]},
    {'pad': [43, 50, 59, 66, 69], 'raiz': 31, 'arpejo': [71, 74, 78, 79, 83]},
]
DOMINANTE = ACORDES[1]
FINAL = {'pad': [38, 45, 50, 54, 64, 69, 78], 'raiz': 38}
# Desenho da caixinha em colcheias (índice no arpejo; None é pausa); muda a cada volta da harmonia
DESENHOS = [
    [0, None, 1, 2, None, 3, None, 2],
    [4, None, 3, None, 2, 1, None, None],
    [1, 2, None, 3, 4, None, 3, None],
    [2, None, None, 1, None, 0, 1, None],
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--duracao', type=float, required=True)
    ap.add_argument('--cortes', default='', help='trocas de cena em segundos, separadas por vírgula')
    ap.add_argument('--assinatura', type=float, help='pouso da borboleta na logo (resolução em Ré)')
    ap.add_argument('--saida', default='out/trilha-bruta.wav')
    a = ap.parse_args()
    dur = a.duracao
    fim = a.assinatura if a.assinatura else dur - 2.0
    cortes = [float(c) for c in a.cortes.split(',') if c.strip()]
    m = Mesa(dur + 0.01)

    volume = [(0, 0.0), (2.2, 0.5), (fim - 0.4, 0.6), (fim, 0.85), (dur, 0.7)]
    corte = [(0, 900), (COMPASSO * 2, 1500), (fim - 1.5, 1800), (fim, 2800), (dur, 2400)]

    # Harmonia em laço até a cadência; a dominante prepara o pouso
    dom = max(fim - 1.6, 0.0)
    t, volta = 0.0, 0
    while t < dom - 0.05:
        ac = ACORDES[volta % len(ACORDES)]
        t1 = t + COMPASSO if dom - (t + COMPASSO) >= 0.8 else dom
        # pads cruzam a barra de compasso (entra antes, sai depois) para não abrir um buraco na troca
        m.pad(ac['pad'], t - 0.35, t1 + 0.1, corte, volume, atk=0.7)
        m.sub(ac['raiz'], t, t1, volume)
        for k, n in enumerate(ac['arpejo'][:4]):
            m.add(harpa(n - 12, 1.0), t + 0.06 * k, ganho=0.03, pan=-0.4 + 0.27 * k, envio=0.55)
        if volta >= 1:  # caixinha entra no segundo compasso
            desenho = DESENHOS[(volta // len(ACORDES)) % len(DESENHOS)]
            for j, i in enumerate(desenho):
                tn = t + j * COLCHEIA
                if i is None or tn >= t1 - 0.05:
                    continue
                m.add(caixinha(ac['arpejo'][i], decay=1.2), tn, ganho=m.rng.uniform(0.045, 0.065), pan=0.35 if j % 2 else -0.35, envio=0.5)
        t, volta = t1, volta + 1
    m.pad(DOMINANTE['pad'], dom - 0.35, fim + 0.05, corte, volume, atk=0.6)
    m.sub(DOMINANTE['raiz'], dom, fim, volume)
    for j, n in enumerate([76, 81, 85]):
        m.add(caixinha(n, decay=1.0), dom + 0.2 + j * COLCHEIA, ganho=0.05, pan=0.3 - 0.3 * j, envio=0.55)

    # Resolução em Ré no pouso, com sinos e harpa subindo
    m.pad(FINAL['pad'], fim - 0.02, dur, corte, volume, atk=0.15, ganho=0.07)
    m.sub(FINAL['raiz'], fim - 0.02, dur, volume, ganho=0.04)
    for k, n in enumerate([74, 78, 81, 86]):
        m.add(sino(n, 2.4), fim + k * 0.015, ganho=0.06, pan=-0.45 + 0.3 * k, envio=0.65)
    for k, n in enumerate([62, 66, 69, 74, 78, 81]):
        m.add(harpa(n, 0.9), fim + 0.08 + 0.07 * k, ganho=0.035, pan=-0.5 + 0.2 * k, envio=0.6)

    # Sino suave em cada troca de cena (nota do acorde em curso, oitava alta)
    for c in cortes:
        ac = ACORDES[int(c // COMPASSO) % len(ACORDES)]
        m.add(sino(ac['arpejo'][2] + 12, 2.0), c, ganho=0.045, pan=0.25, envio=0.7)

    mix = m.finalizar()
    with wave.open(a.saida, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    print(f'trilha: {dur:.2f}s, {len(cortes)} cortes, resolução em {fim:.2f}s -> {a.saida}')


if __name__ == '__main__':
    main()
