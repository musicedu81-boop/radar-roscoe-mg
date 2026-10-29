# Motion do carrossel Cris Santos & Lúpus

Vertical 1080x1920, 30fps, em Remotion 4.0.536, com as regras de movimento, som e área segura para vídeo vertical das skills do HyperFrames.

## Identidade (a mesma da vinheta)

- Paleta: `#2D0845`, `#5B1A8A`, `#7B2FBE`, `#A855D8`, `#D4A0FF`, `#FDF8FF` e o fundo `#0D0215` (`src/tokens.ts`)
- Fonte: Montserrat 900 para a marca e títulos, 700 para destaques, 500 para o slogan e texto corrido
- Nome em degradê creme para lavanda, linha luminosa embaixo, slogan "A REALIDADE DE QUEM VIVE" espaçado
- Borboleta em linha (`src/borboleta-desenho.ts`), a mesma da vinheta

## Peças prontas

| Peça | Arquivo | O que faz |
| --- | --- | --- |
| `AssinaturaAnimada` | `src/Logo.tsx` | a borboleta escreve o nome, risca a linha, pousa no S e o slogan entra |
| `Selo` | `src/Logo.tsx` | logo compacta para o canto das cenas |
| `Fundo` | `src/Fundo.tsx` | roxo profundo com foco de luz e poeira lavanda subindo devagar |
| `MarcaAbertura` | `src/Logo.tsx` | abertura do motion: a assinatura começa em voo, segura para leitura e encolhe até o topo, onde fica como selo durante as cenas |
| `Abertura` | `src/Abertura.tsx` | prévia da abertura (4,5s) com o brilho do voo e o impacto da vinheta no pouso |
| `Assinatura` | `src/Assinatura.tsx` | fim de vídeo de 4,5s com a marca sonora da vinheta (impacto e sinos) |

## Som

Efeitos em `public/sfx` vêm da biblioteca da skill media-use do HyperFrames (licença Pixabay, uso comercial livre; ver `public/sfx/CREDITS.md`). `public/trilha-vinheta.wav` é a trilha original da vinheta.

## Narração e trilha

- **Narração:** TTS do Gemini (Google AI Studio) com a chave em `GEMINI_API_KEY`, salva nas configurações do ambiente e nunca no código. O texto e a direção de voz ficam em `roteiro/narracao.json` (voz padrão `Sulafat`, acolhedora). `scripts/narrar.py` gera um WAV por fala em `public/narracao/` e grava as durações em `src/narracao.json`: a voz é o relógio das cenas. `--amostras Sulafat,Vindemiatrix,Achernar` grava a mesma frase em vozes diferentes para escolher.
- **Trilha:** `scripts/compor-trilha.py` compõe o fundo em Ré maior, 72 BPM, com os timbres da vinheta (`scripts/instrumentos.py`): pad de cordas, caixinha de música, harpa, sinos nas trocas de cena e a cadência Lá para Ré no pouso da borboleta na assinatura. Recebe `--duracao`, `--cortes` e `--assinatura` em segundos.

## O que falta

1. Os slides do carrossel, em ordem, em `public/slides/`.
2. A chave `GEMINI_API_KEY` no ambiente.
3. Com os dois: roteiro da narração a partir dos slides, cenas, mixagem com a trilha abaixando sob a voz e render.

## Comandos

```bash
npm i
npm run studio              # pré-visualização
npm run render:assinatura   # out/assinatura-cris-santos.mp4
npx remotion render Abertura out/abertura-cris-santos.mp4 --codec=h264 --crf=17
python3 scripts/narrar.py   # narração (precisa de GEMINI_API_KEY)
python3 scripts/compor-trilha.py --duracao 30 --cortes 4.5,10.2 --assinatura 27
```
