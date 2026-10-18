# Vinheta Cris Santos & Lúpus

Abertura de 8s, vertical 1080x1920, 30fps. Duas versões no mesmo projeto Remotion:

| Composição | Arquivo | O que é |
|---|---|---|
| `Vinheta2D` | `src/Vinheta2D.tsx` | Versão plana: texto em degradê, borboleta SVG |
| `Vinheta3D` | `src/3d/` | Letras extrudadas, câmera orbitando o C, asas articuladas, bloom |

## Roteiro (igual nas duas)

1. C e S colados, alinhados à esquerda.
2. A borboleta é o lápis: o C fica parado, o S avança e o nome se escreve atrás dela.
3. Slogan "A realidade de quem vive".
4. A borboleta abaixa e sobe com o retrato, metade rosto e metade borboleta, e se funde nele.

## Trilha

Original, composta em código (`scripts/compor-trilha.py`) e sincronizada com o roteiro. Ré maior.

- Entrada: swoosh da borboleta, da direita para o centro
- Escrita: uma nota de caixinha de música por letra, no frame em que a letra nasce, andando no estéreo junto com a borboleta
- Slogan: arpejo leve; pouso no S: sino
- Mergulho: o pad respira e escurece
- Subida do rosto: riser e harpa acelerando
- Fusão (6,87s): impacto quente, acorde de sinos e chuva de brilho

Masterizada em -14 LUFS / -1 dBTP (`public/trilha.wav`).

## Onde mexer

- Texto: `src/roteiro.ts` (`NOME`, `SLOGAN`)
- Tempos: `MOMENTOS` em `src/roteiro.ts`, em segundos
- Cores: `src/tokens.ts`
- Traço da borboleta: `src/borboleta-desenho.ts` (alimenta 2D e 3D)

## Comandos

```bash
npm i
npm run studio      # pré-visualização
npm run render:2d
npm run render:3d
npm run fontes      # regenera as fontes 3D se mudar o texto (acentos incluídos)
npm run rosto       # trata o retrato com a paleta
npm run trilha      # recompõe e masteriza a trilha (python3 + ffmpeg)
```

O render 3D usa WebGL por software (`swangle`), configurado em `remotion.config.ts`.
