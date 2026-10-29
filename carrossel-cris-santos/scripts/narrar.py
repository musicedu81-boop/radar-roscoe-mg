# Narração com o TTS do Gemini (Google AI Studio).
# Lê roteiro/narracao.json, gera um WAV por cena em public/narracao/ e grava as durações em src/narracao.json,
# que comandam o tempo de cada cena (a voz é o relógio do vídeo).
#
# A chave vem da variável GEMINI_API_KEY (salva nas configurações do ambiente, nunca no código).
# Uso:
#   python3 scripts/narrar.py                          # todas as falas do roteiro
#   python3 scripts/narrar.py --amostras Sulafat,Vindemiatrix,Achernar   # mesma frase em vozes diferentes
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
import wave

import numpy as np

API = 'https://generativelanguage.googleapis.com/v1beta'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def chamar(caminho, corpo=None):
    cabecalhos = {'Content-Type': 'application/json'}
    chave = os.environ.get('GEMINI_API_KEY')
    if chave:
        cabecalhos['x-goog-api-key'] = chave
    dados = json.dumps(corpo).encode() if corpo is not None else None
    for tentativa in range(5):
        req = urllib.request.Request(f'{API}/{caminho}', data=dados, headers=cabecalhos, method='POST' if dados else 'GET')
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:300]
            if e.code in (429, 500, 502, 503, 504) and tentativa < 4:
                time.sleep(2 ** (tentativa + 1))
                continue
            if e.code in (401, 403) and 'unregistered callers' in msg:
                sys.exit('Sem chave: salve GEMINI_API_KEY nas configurações do ambiente e abra uma sessão nova.')
            raise SystemExit(f'Gemini respondeu {e.code}: {msg}')


def modelo_tts(preferido):
    """Usa o modelo pedido; se não existir na conta, escolhe um TTS disponível (flash antes de pro)."""
    nomes = [m['name'].split('/')[-1] for m in chamar('models?pageSize=200').get('models', [])]
    if preferido in nomes:
        return preferido
    tts = sorted([n for n in nomes if 'tts' in n], key=lambda n: ('flash' not in n, n))
    if not tts:
        sys.exit('Nenhum modelo de voz (TTS) disponível para esta chave.')
    print(f'Modelo {preferido} indisponível; usando {tts[0]}')
    return tts[0]


def falar(modelo, voz, direcao, texto):
    corpo = {
        'contents': [{'parts': [{'text': f'{direcao}: {texto}'}]}],
        'generationConfig': {
            'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voz}}},
        },
    }
    r = chamar(f'models/{modelo}:generateContent', corpo)
    parte = r['candidates'][0]['content']['parts'][0]['inlineData']
    taxa = int(parte['mimeType'].split('rate=')[1].split(';')[0]) if 'rate=' in parte['mimeType'] else 24000
    pcm = np.frombuffer(base64.b64decode(parte['data']), '<i2')
    return aparar(pcm, taxa), taxa


def aparar(pcm, taxa, limiar_db=-45, margem=0.06):
    """Corta o silêncio do começo e do fim, deixando uma margem curta."""
    x = pcm.astype(float) / 32768
    janela = int(0.01 * taxa)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(janela) / janela, 'same'))
    vivo = np.nonzero(20 * np.log10(rms + 1e-9) > limiar_db)[0]
    if len(vivo) == 0:
        return pcm
    m = int(margem * taxa)
    return pcm[max(vivo[0] - m, 0) : min(vivo[-1] + m, len(pcm))]


def gravar(caminho, pcm, taxa):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(pcm.astype('<i2').tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--amostras', help='vozes separadas por vírgula, para comparar')
    args = ap.parse_args()
    roteiro = json.load(open(os.path.join(RAIZ, 'roteiro/narracao.json'), encoding='utf-8'))
    modelo = modelo_tts(roteiro['modelo'])
    pasta = os.path.join(RAIZ, 'public/narracao')

    if args.amostras:
        frase = roteiro['falas'][0]['texto']
        for voz in args.amostras.split(','):
            pcm, taxa = falar(modelo, voz.strip(), roteiro['direcao'], frase)
            gravar(os.path.join(pasta, f'amostra-{voz.strip()}.wav'), pcm, taxa)
            print(f'amostra {voz.strip()}: {len(pcm) / taxa:.2f}s')
        return

    saida = []
    for fala in roteiro['falas']:
        pcm, taxa = falar(modelo, roteiro['voz'], fala.get('direcao', roteiro['direcao']), fala['texto'])
        gravar(os.path.join(pasta, f"{fala['id']}.wav"), pcm, taxa)
        saida.append({'id': fala['id'], 'arquivo': f"narracao/{fala['id']}.wav", 'duracao': round(len(pcm) / taxa, 3)})
        print(f"{fala['id']}: {saida[-1]['duracao']:.2f}s")
    json.dump({'modelo': modelo, 'voz': roteiro['voz'], 'falas': saida}, open(os.path.join(RAIZ, 'src/narracao.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('total de voz:', round(sum(f['duracao'] for f in saida), 2), 's')


if __name__ == '__main__':
    main()
