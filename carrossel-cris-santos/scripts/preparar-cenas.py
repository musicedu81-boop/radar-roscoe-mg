# Linha do tempo do motion "Névoa lúpica" (cenas animadas, sem slides) e trilha com os cortes nos mesmos frames.
# Lê src/cenas/roteiro.json (batidas de cada cena a 72 BPM, 25 frames por batida) e grava src/cenas/linha.json.
# Uso: python3 scripts/preparar-cenas.py [--sem-trilha]
import argparse
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
TEMPO = 25  # 72 BPM
INICIO = 125  # 5ª batida: a primeira cena nasce da névoa enquanto a logo vai para o canto
VOLTA_LOGO = 25  # a logo volta ao centro uma batida depois da última cena
FIM_ASSINATURA = 90  # a assinatura fica 3s no centro


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sem-trilha', action='store_true')
    a = ap.parse_args()
    cenas = json.load(open(os.path.join(RAIZ, 'src/cenas/roteiro.json'), encoding='utf-8'))['cenas']
    inicios, t = [], INICIO
    for c in cenas:
        inicios.append(t)
        t += c['tempos'] * TEMPO
    fim = t
    pouso = fim + VOLTA_LOGO
    duracao = pouso + FIM_ASSINATURA
    linha = {'fps': FPS, 'tempo': TEMPO, 'inicios': inicios, 'fim': fim, 'pousoAssinatura': pouso, 'duracao': duracao}
    json.dump(linha, open(os.path.join(RAIZ, 'src/cenas/linha.json'), 'w', encoding='utf-8'), indent=1)
    print(f'{len(cenas)} cenas, {duracao / FPS:.2f}s, assinatura em {pouso / FPS:.2f}s')
    if not a.sem_trilha:
        cortes = ','.join(f'{p / FPS:.4f}' for p in inicios[1:] + [fim])
        subprocess.run([sys.executable, os.path.join(RAIZ, 'scripts/compor-trilha.py'), '--duracao', f'{duracao / FPS:.4f}', '--cortes', cortes, '--assinatura', f'{pouso / FPS:.4f}', '--saida', 'out/trilha-nevoa-bruta.wav'], check=True, cwd=RAIZ)
        subprocess.run(['bash', os.path.join(RAIZ, 'scripts/masterizar-trilha.sh'), 'out/trilha-nevoa-bruta.wav', 'public/trilha-nevoa.wav'], check=True, cwd=RAIZ)


if __name__ == '__main__':
    main()
