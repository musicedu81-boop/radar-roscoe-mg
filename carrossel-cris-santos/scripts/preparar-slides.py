# Prepara os slides e a linha do tempo do motion (música é o relógio: 72 BPM, 25 frames por batida a 30fps).
# Lê as imagens de public/slides/ em ordem de nome, guarda o tamanho de cada uma e quantas batidas fica na tela
# (mantém o que já estiver em src/slides.json), calcula os pousos e compõe a trilha com os cortes nos mesmos frames.
# Uso: python3 scripts/preparar-slides.py [--tempos 4]
import argparse
import json
import os
import subprocess
import sys

import cv2

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
TEMPO = 25  # 72 BPM
POUSO_1 = 125  # o primeiro slide pousa na 5ª batida, enquanto a logo vira selo
FIM_ASSINATURA = 90  # a assinatura fica 3s no centro antes do fim
EXTENSOES = ('.png', '.jpg', '.jpeg', '.webp')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tempos', type=int, default=4, help='batidas por slide novo (4 = 3,3s)')
    ap.add_argument('--sem-trilha', action='store_true')
    a = ap.parse_args()

    caminho_json = os.path.join(RAIZ, 'src/slides.json')
    anterior = {}
    if os.path.exists(caminho_json):
        anterior = {s['arquivo']: s for s in json.load(open(caminho_json, encoding='utf-8'))['slides']}

    pasta = os.path.join(RAIZ, 'public/slides')
    nomes = sorted(n for n in os.listdir(pasta) if n.lower().endswith(EXTENSOES)) if os.path.isdir(pasta) else []
    slides = []
    for n in nomes:
        img = cv2.imread(os.path.join(pasta, n))
        if img is None:
            sys.exit(f'Não consegui ler {n}')
        arquivo = f'slides/{n}'
        slides.append({'arquivo': arquivo, 'largura': img.shape[1], 'altura': img.shape[0], 'tempos': anterior.get(arquivo, {}).get('tempos', a.tempos)})

    pousos, t = [], POUSO_1
    for s in slides:
        pousos.append(t)
        t += s['tempos'] * TEMPO
    saida_ultimo = t
    pouso_assinatura = saida_ultimo + TEMPO
    duracao = pouso_assinatura + FIM_ASSINATURA
    linha = {'fps': FPS, 'tempo': TEMPO, 'pousos': pousos, 'saidaUltimo': saida_ultimo, 'pousoAssinatura': pouso_assinatura, 'duracao': duracao}
    json.dump({'slides': slides, 'linha': linha}, open(caminho_json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(slides)} slides, {duracao / FPS:.2f}s, assinatura em {pouso_assinatura / FPS:.2f}s')

    if not a.sem_trilha:
        cortes = ','.join(f'{p / FPS:.4f}' for p in pousos[1:] + [saida_ultimo])
        subprocess.run(
            [sys.executable, os.path.join(RAIZ, 'scripts/compor-trilha.py'), '--duracao', f'{duracao / FPS:.4f}', '--cortes', cortes, '--assinatura', f'{pouso_assinatura / FPS:.4f}'],
            check=True,
            cwd=RAIZ,
        )
        subprocess.run(['bash', os.path.join(RAIZ, 'scripts/masterizar-trilha.sh')], check=True, cwd=RAIZ)


if __name__ == '__main__':
    main()
