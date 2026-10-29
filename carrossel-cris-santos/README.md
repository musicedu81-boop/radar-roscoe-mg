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
| `Assinatura` | `src/Assinatura.tsx` | fim de vídeo de 4,5s com a marca sonora da vinheta (impacto e sinos) |

## Som

Efeitos em `public/sfx` vêm da biblioteca da skill media-use do HyperFrames (licença Pixabay, uso comercial livre; ver `public/sfx/CREDITS.md`). `public/trilha-vinheta.wav` é a trilha original da vinheta.

## Comandos

```bash
npm i
npm run studio              # pré-visualização
npm run render:assinatura   # out/assinatura-cris-santos.mp4
```
