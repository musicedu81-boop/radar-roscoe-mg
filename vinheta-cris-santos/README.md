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
```

O render 3D usa WebGL por software (`swangle`), configurado em `remotion.config.ts`.
