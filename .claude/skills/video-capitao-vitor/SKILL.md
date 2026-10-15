---
name: video-capitao-vitor
description: Edição completa de vídeos do Prefeito Capitão Vítor Prado (Timóteo/MG) para Reels, Stories e WhatsApp. Recebe o vídeo bruto (upload no chat, Google Drive ou em partes), junta as partes, centraliza o rosto, gera legenda sincronizada revisada palavra por palavra, motion de título no instante da frase-tema, ícones que ilustram as falas, trilha própria com ducking, final com fade e master pronto para as redes, com a identidade visual do Capitão. Use sempre que chegar um vídeo do Capitão ou do prefeito para editar, ou quando pedirem "edita o vídeo do Capitão", "monta o Reels do prefeito", "legenda esse vídeo", "vídeo do Vítor", "coloca legenda e ícones". Use também para guardar ou atualizar os assets da marca (logo, cores, fontes).
---

# Vídeo do Capitão Vítor

Pipeline de edição do projeto `video-capitao/` (Remotion + scripts Python).
Padrão validado no vídeo do Dia dos Professores (15/10/2026).

## Entrega padrão

- MP4 vertical 1080x1920, 30 fps, H.264 + AAC.
- Rosto centralizado, com câmera virtual suave.
- Legenda estilo TikTok sincronizada e revisada palavra por palavra.
- Motion de título no instante exato da frase-tema.
- Ícones ilustrando as falas, cerca de 1 a cada 5 s.
- Trilha própria, sem direitos de terceiros, que abaixa quando ele fala.
- Último quadro congelado com fade no fim.
- Áudio entre −14 e −15 LUFS, pico até −1 dBFS, voz em sincronia exata.
- Assets da marca aplicados quando existirem em `video-capitao/public/brand/`.

## Mapa

| O quê | Onde |
|---|---|
| Projeto Remotion | `video-capitao/` |
| Roteiro visual do vídeo (título, zooms, ícones) | `video-capitao/src/Overlays.tsx` |
| Legenda, rastreio do rosto e metadados (gerados) | `video-capitao/src/data/` |
| Cores e fonte | `video-capitao/src/theme.ts` |
| Assets da marca | `video-capitao/public/brand/` (inventário no `README.md` da pasta) |
| Scripts | `video-capitao/scripts/` |
| Voz, tom e hashtags do Capitão | skill `capitao-vitor-instagram` |

## Fluxo

### 0. Ambiente (toda sessão nova)

```bash
cd video-capitao
pip install -q -r scripts/requirements.txt
npm ci --loglevel=error
scripts/baixar-modelos.sh <scratchpad>/modelos   # ~1 GB, vem do GitHub
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

Confira a versão do Chromium com `ls /opt/pw-browsers`.

### 1. Receber o vídeo

- **Upload no chat:** o arquivo chega em `/root/.claude/uploads/<sessão>/`.
- **Google Drive:** o conector baixa só até 10 MB. Para arquivos maiores, o usuário libera
  `drive.usercontent.google.com` e `drive.google.com` em Network access do ambiente, ou manda por upload.
- **Vídeo em partes:** peça cerca de 1 s repetido entre elas e junte com
  `python3 scripts/juntar-partes.py p1 p2 [...] <scratchpad>/video.mp4`.
  - A ordem se descobre pela fala. Transcreva os 10 s iniciais e finais de cada parte: a abertura
    traz a saudação ou o tema, e o fecho traz a despedida ("Um abraço a todos").
  - Sem trecho repetido, a emenda é direta. Confira se ela cai numa pausa (RMS dos 0,5 s de cada lado).

### 2. Preparar

`scripts/preparar.sh <video> <modelos>` faz, em cerca de 2 min por minuto de vídeo:

- normaliza para 30 fps constante;
- corta a tela preta final do CapCut;
- transcreve com Silero VAD, Parakeet (tempo por palavra) e Whisper (referência);
- rastreia o rosto;
- gera a trilha e os efeitos.

### 3. Revisar a transcrição (obrigatório)

1. Leia `scripts/out/transcricao.txt`, que traz PARAKEET × WHISPER por trecho.
2. Onde divergirem, redecodifique com contexto (janelas de 5 a 10 s) com os dois modelos, usando
   `load_models` e `decode` de `scripts/transcrever.py`. Com contexto, eles costumam convergir.
3. Corrija `src/data/captions.json` por índice, com `assert` do texto antigo antes de cada troca.
   Ao dividir uma palavra em duas, reparta o tempo original entre elas.
4. Nomes próprios: use a forma mais provável e peça confirmação ao usuário na entrega.
5. Erros já vistos: "So" → "Estou", "He" → "que", "Pela" → "por uma", "At tools" → "a todos".

Para listar as palavras com os tempos:

```bash
python3 -c "import json;[print(i,w['text'],w['startMs']) for i,w in enumerate(json.load(open('src/data/captions.json')))]"
```

### 4. Roteiro visual (`src/Overlays.tsx`)

- **`TITLE`:** `at` é o início da frase-tema, e a duração vai até o fim dela (3 a 4 s). Defina
  `kicker`, `title`, `badge` e 4 ícones do tema. A legenda some sozinha durante o título.
- **`PUNCH_INS`:** 2 a 4 zooms leves (1.06 a 1.10) nas falas de emoção ou de chamada à ação.
- **`ICONS`:**
  - um por ideia concreta, 0,1 s antes da palavra-chave;
  - lados alternados, 2,6 s cada, sem sobreposição;
  - rótulo curto: até 10 letras por palavra e no máximo 2 linhas;
  - ícones do `lucide-react` (confira o nome em `node_modules/lucide-react/dist/lucide-react.d.ts`).

### 5. Conferir quadros antes do render

1. Faça o bundle uma vez: `npx remotion bundle --out-dir=<scratchpad>/bundle`.
2. Gere os stills:
   `npx remotion still <bundle> VideoCapitao q.png --frame=N --browser-executable=$REMOTION_BROWSER`.
3. Monte uma folha de contato com o filtro `tile` do ffmpeg e confira:
   - os selos não tocam o rosto;
   - as palavras da legenda não encostam umas nas outras;
   - o título entra no instante certo;
   - as emendas não dão salto;
   - o final congela.

### 6. Render e master

`scripts/finalizar.sh out/<data>-<tema>.mp4`. O render leva cerca de 4 min e o master cerca de 2 min
(4 CPUs). Com pressa, `PRESET=veryfast` economiza cerca de 1,5 min.

### 7. Verificar o arquivo final

- **Loudness:** `ffmpeg -i out/X.mp4 -af ebur128=peak=true -f null -` deve dar I entre −14 e −15 LUFS
  e pico até −1 dBFS.
- **Sincronia:** a correlação da voz do arquivo final com `public/video-original.mp4`, em 4 ou 5
  pontos, tem de dar 0 ms.
- **Imagem:** folha de contato do arquivo final.

### 8. Entregar

1. Envie o MP4 com `SendUserFile` (`display: render`).
2. Faça um resumo curto do que foi feito.
3. Liste as pendências que o usuário precisa confirmar: nomes próprios e rótulos trocados.
4. Ofereça a legenda do post no formato Reels, pela skill `capitao-vitor-instagram`.
5. Faça um commit com a mensagem `Vídeo: <tema>`. Os dados do vídeo ficam versionados.

## Regras de estilo

- **Legenda:**
  - Montserrat Black, caixa alta, sem pontuação no fim das palavras;
  - a palavra falada fica em dourado;
  - as palavras-chave (`KEYWORDS` em `Captions.tsx`) ficam maiores;
  - o "pop" é proporcional ao tamanho da palavra.
- **Selos:** círculo azul com borda dourada ao lado da cabeça (y ≈ 560), nunca sobre o rosto.
- **Texto em tela:** segue a voz do Capitão. Primeira pessoa, caloroso sem exagero, Timóteo no
  centro, sem inventar dados.
- **Trilha:** baixa sob a voz (0,1) e sobe nas pausas (0,2).

## Assets da marca

Os assets ficam em `video-capitao/public/brand/`. O `README.md` da pasta é o inventário: o que existe
e onde cada item entra no vídeo.

Ao receber um asset:

1. Salve com nome descritivo e atualize o inventário.
2. Aplique no modelo:
   - cores em `src/theme.ts`;
   - logo como selo discreto ou cartão final;
   - fonte em `public/fonts`, com `loadFont`.
3. Mostre ao usuário uma folha de contato de antes e depois.

## Armadilhas conhecidas

- **OpenCV 5** removeu `readNetFromCaffe`. Mantenha `opencv-python-headless<5`, que já está no
  `requirements.txt`.
- **`@remotion/media`** avisa que não decodifica e cai para `OffthreadVideo`. Nesta nuvem isso é normal.
- **`trim=start=`** do ffmpeg arredonda para a base de tempo do link. Para cortar por quadro, use
  `start_frame` e `end_frame` depois de `fps=30:start_time=0`, como já faz o `juntar-partes.py`.
- **Concat do ffmpeg:** cada segmento precisa ter um número inteiro de quadros. Senão o áudio ganha
  silêncio na emenda.
- **Limitador do master:** o áudio do celular vem perto de 0 dBFS, e o limitador usa `latency=1`.
  Sem isso, a voz atrasa 5 ms.
- **Vídeo em 720p:** fica mais suave quando ampliado para 1080p. O ideal é receber o arquivo original.
- **`tool-results`:** não apague arquivos em `/root/.claude/projects/.../tool-results`. A ação é bloqueada.
