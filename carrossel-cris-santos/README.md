# Motion do carrossel Cris Santos & Lúpus

Vertical 1080x1920, 30fps, em Remotion 4.0.536, com as regras de movimento, som e área segura para vídeo vertical das skills do HyperFrames. Efeitos escolhidos da skill `effects` do cliente e refeitos na paleta da marca: `carousel-spin` (carrossel 3D), `dot-reveal` (slide que se forma de pontos de luz) e `place-in-grid` (grade 3x3 no fim), além de foco e profundidade de campo.

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
| `Carrossel` | `src/Carrossel.tsx` | o motion: abertura com a logo que vai para o canto, carrossel 3D girando, slides no compasso da trilha, grade 3x3 no fim e a logo voltando ao centro |
| `Cartao` | `src/Cartao.tsx` | cada slide inteiro, sem corte, dentro da faixa segura, com quatro trocas: giro do carrossel em 3D, troca de foco, pontos de luz e travessia da borboleta |
| `Anel3D` | `src/efeitos/Anel3D.tsx` | abertura com todos os slides num anel 3D que gira, desacelera e para no primeiro (inspirado no `carousel-spin`) |
| `Revoada` | `src/efeitos/Borboletas3D.tsx` | borboletas 3D ao fundo com profundidade de campo; o foco puxa para elas no meio das trocas de foco |
| `Travessia` | `src/efeitos/Travessia.tsx` | a borboleta que atravessa o quadro e abre o slide seguinte atrás dela |
| `Grade` | `src/efeitos/Grade.tsx` | o último slide encolhe na grade com os outros (inspirado no `place-in-grid`); a grade recua desfocada e a logo volta |
| `Pontos` | `src/Pontos.tsx` | indicador do carrossel como no Instagram, a pílula anda a cada troca |

## Som

Efeitos em `public/sfx` vêm da biblioteca da skill media-use do HyperFrames (licença Pixabay, uso comercial livre; ver `public/sfx/CREDITS.md`). `public/trilha-vinheta.wav` é a trilha original da vinheta.

## Narração e trilha

- **Narração:** TTS do Gemini (Google AI Studio) com a chave em `GEMINI_API_KEY`, salva nas configurações do ambiente e nunca no código. O texto e a direção de voz ficam em `roteiro/narracao.json` (voz padrão `Sulafat`, acolhedora). `scripts/narrar.py` gera um WAV por fala em `public/narracao/` e grava as durações em `src/narracao.json`: a voz é o relógio das cenas. `--amostras Sulafat,Vindemiatrix,Achernar` grava a mesma frase em vozes diferentes para escolher.
- **Trilha:** `scripts/compor-trilha.py` compõe o fundo em Ré maior, 72 BPM, com os timbres da vinheta (`scripts/instrumentos.py`): pad de cordas, caixinha de música, harpa, sinos nas trocas de cena e a cadência Lá para Ré no pouso da borboleta na assinatura. Recebe `--duracao`, `--cortes` e `--assinatura` em segundos.

## Carrossel desta versão

O post do Instagram não abre deste ambiente (o Instagram bloqueia leitura automática), então o carrossel foi feito na identidade da Cris com dados da Sociedade Brasileira de Reumatologia (`src/slides/SlidesCris.tsx`, 1080x1350):

1. Capa com o retrato metade rosto, metade borboleta da vinheta: "LÚPUS, o que você precisa saber"
2. O que é o lúpus: doença autoimune e crônica
3. Onde ele pode aparecer: pele, articulações, rins, pulmões e coração, sangue, sistema nervoso
4. Quem ele atinge mais: 1 em cada 1.700 mulheres no Brasil, principalmente entre 20 e 45 anos
5. Sinais de alerta e a orientação de procurar um reumatologista
6. Por que a borboleta: a mancha nas maçãs do rosto e no nariz
7. Bom saber: não é contagioso, tem diagnóstico e tratamento
8. Informação também é cuidado

Trocas: giro, pontos de luz, giro, foco, borboleta (abre o slide da borboleta), pontos de luz, giro.

## Como trocar pelos slides do post original

1. Apague os PNG de `public/slides/` e coloque os prints do carrossel, com nomes na ordem do post (`01.png`, `02.png`...).
2. `python3 scripts/preparar-slides.py`: lê os slides, calcula a linha do tempo (72 BPM, 25 frames por batida, 4 batidas por slide) e compõe a trilha com um sino em cada troca e a resolução no pouso da logo. Para dar mais tempo a um slide com muito texto, mude `tempos` dele em `src/slides.json` e rode de novo.
3. `npm run render`.

Para refazer os PNG deste carrossel: `npx remotion still SlideCris public/slides/01.png --props='{"indice": 0}'` (índices de 0 a 7).

Versão atual: sem narração, só trilha (pedido do cliente). O roteiro de narração com o Gemini continua pronto para uma versão narrada.

## Comandos

```bash
npm i
npm run studio              # pré-visualização
npm run render:assinatura   # out/assinatura-cris-santos.mp4
npx remotion render Abertura out/abertura-cris-santos.mp4 --codec=h264 --crf=17
python3 scripts/narrar.py   # narração (precisa de GEMINI_API_KEY)
python3 scripts/compor-trilha.py --duracao 30 --cortes 4.5,10.2 --assinatura 27
```
