# Timóteo: uma cidade, dois nomes

Dois cortes do mesmo projeto:

- **Short 9:16 (principal)** · 58s · 1080×1920 · estilo Vox colagem editorial: papel amassado, fotos reais rasgadas em P&B, recortes, setas a pincel, marca-texto limão, máquina de escrever, fundo de jornal, mapa estilo satélite com nuvens. Composição `TimoteoShort` (código em `src/short/`).
- **Versão longa 16:9** · 5min10s · 1920×1080 · estilo Vox infográfico (papel liso, ícones, mapas IBGE). Composição `TimoteoVox`.

Ambos com locução em pt-BR gerada pelo TTS do HyperFrames, legendas sincronizadas palavra a palavra, trilha original e efeitos sonoros.

**Tese do vídeo:** em 1944 nasceram, no mesmo ano, a Acesita (hoje Aperam) e o Parque Estadual do Rio Doce. A usina criou uma cidade dentro da cidade, e a floresta limitou o chão onde ela pode crescer. Por isso até hoje se fala em "Acesita" e "Timóteo" como se fossem dois lugares.

## Entregáveis (`entrega/`)

| Arquivo | O que é |
| --- | --- |
| `timoteo-short-9x16.mp4` | Short final com legendas, áudio normalizado (-14 LUFS, padrão redes) |
| `roteiro-short.md` | Roteiro do Short com tempos e legenda sugerida para o post |
| `roteiro-locucao.md` | Roteiro da versão longa com tempos por cena |
| `capa-short.jpg` | Quadro de capa do Short |

A versão longa 16:9 (75 MB) é entregue fora do repositório. Para gerar de novo: `npx remotion render TimoteoVox`.

## Pipeline

1. **Pesquisa**: Wikipédia (pt) "Timóteo" e "Parque Estadual do Rio Doce", IBGE (Censos, PIB 2023), PNUD, Aperam / Diário do Aço, Instituto Semeia e EKOS Brasil.
2. **Roteiro**: `roteiro/roteiro.json`. Campo `say` é o texto falado (números por extenso, nomes estrangeiros com grafia fonética); `cap` é o texto da legenda.
3. **Locução (HyperFrames)**: motor TTS do HyperFrames (Kokoro-82M, voz `pm_alex`, pt-BR), gerado frase a frase para sincronizar cada batida visual.
   ```bash
   pip install kokoro-onnx soundfile
   npx hyperframes tts "teste" -v pm_alex -l pt-br   # baixa o modelo no cache
   python3 scripts/locucao.py                       # gera public/voz/narracao.mp3 + src/data/timing.json
   ```
4. **Mapas**: malha municipal do IBGE (via geodata-br) projetada para SVG em `scripts/geo.py`. Rios Piracicaba e Doce traçados pelas divisas municipais. Parque e lagoas em representação aproximada.
5. **Trilha e texturas**: `scripts/texturas_trilha.py` gera papel, granulação e uma trilha ambiente original (sem samples externos). SFX da biblioteca do HyperFrames media-use (licença Pixabay).
6. **Animação (Remotion)**: cada cena lê `batidas(cena)` e dispara animações no frame exato da palavra falada.
   ```bash
   npm i
   python3 scripts/fontes.py          # fontes locais (render offline)
   npx remotion studio                # pré-visualização
   npx remotion render TimoteoShort out/timoteo-short.mp4
   npx remotion render TimoteoShortSemLegenda out/timoteo-short-sem-legenda.mp4
   npx remotion render TimoteoVox out/timoteo-vox.mp4
   ```

### Short: material extra

- Locução: `PRE_ABERTURA=0.35 PRE_CENA=0.18 POS_CENA=0.3 GAP_FALA=0.22 python3 scripts/locucao.py roteiro/roteiro-short.json src/data/timing-short.json narracao-short`
- Texturas (papel amassado, terreno, nuvens): `python3 scripts/short_texturas.py <mg-mun.json>`
- Fotos: Wikimedia Commons, créditos em `public/fotos/CREDITOS.md`. Recortes com fundo removido (rembg) em `public/recortes/`.

## Estrutura

```
roteiro/roteiro.json        roteiro (fala + legenda)
scripts/                    locução, mapas, fontes, texturas e trilha
src/fx/index.tsx            biblioteca de 45 efeitos
src/icons.tsx               ícones em recorte de papel
src/scenes/*.tsx            14 cenas
src/Video.tsx               montagem, transições, trilha, locução
src/Legendas.tsx            legenda karaokê
```

## Os 45 efeitos

| # | Efeito | Onde aparece |
| --- | --- | --- |
| 01 | Textura de papel | fundo de todo o vídeo |
| 02 | Granulação de filme animada | camada global |
| 03 | Vinheta | camada global |
| 04 | Câmera em deriva (Ken Burns) | cenas de história |
| 05 | Tremor de impacto | 1944, carimbos, plebiscito |
| 06 | Marca-texto | títulos e destaques |
| 07 | Círculo à mão | "2 cidades? 1" |
| 08 | Sublinhado rabiscado | biblioteca |
| 09 | Riscado | "2 cidades", nomes da empresa, "se espalha" |
| 10 | Máquina de escrever | perguntas, "Ribeirão de Timóteo" |
| 11 | Palavras em cascata | título, final |
| 12 | Pop com mola | ícones e cartões |
| 13 | Contador numérico | área, população, casas, PIB, IDH |
| 14 | Câmera de mapa com zoom logarítmico | Brasil → MG → Vale do Aço |
| 15 | Preenchimento de região | RMVA, distrito/município |
| 16 | Traço que se desenha | rios, ferrovia, gráfico, contorno final |
| 17 | Pino que cai | Acesita, Timóteo, BH, Itabira, Vitória |
| 18 | Anéis de pulso | pinos |
| 19 | Balão com linha guia | venda, Funcionários, Pico do Ana Moura |
| 20 | Retícula (halftone) | título, virada, créditos |
| 21 | Glitch cromático | título, "A virada" |
| 22 | Vazamento de luz | 1944, título, município, final |
| 23 | Transição papel rasgado | entre cenas |
| 24 | Transição faixas coloridas | entre cenas |
| 25 | Transição íris | entre cenas |
| 26 | Transição flash | entre cenas |
| 27 | Paralaxe | colinas da origem |
| 28 | Tela dividida | Acesita × Timóteo, aço × floresta |
| 29 | Cartão de papel rasgado | fichas e documentos |
| 30 | Carimbo | Distrito, 1944, Município, Barrado |
| 31 | Barras que crescem | biblioteca |
| 32 | Grade de pictogramas | 200 × 2.000, 2.734 casas |
| 33 | Corrida de votos | plebiscito |
| 34 | Odômetro de anos | 1831 → 1938, 1964 → 2026 |
| 35 | Cartão que vira (3D) | biblioteca |
| 36 | Fumaça | chaminés |
| 37 | Faíscas | ACESITA, aço inox |
| 38 | Folhas à deriva | parque, final |
| 39 | Ondulações na água | lagoas |
| 40 | Foco que entra (blur-in) | 1944, aço inox |
| 41 | Revelação por máscara | "TIMÓTEO" |
| 42 | Setas de compressão | cidade espremida |
| 43 | Hachura | área do parque |
| 44 | Legenda karaokê | camada global |
| 45 | Letterbox cinematográfico | título e encerramento |

## Notas de precisão

- Datas, números e nomes conferidos com a Wikipédia (pt) e fontes citadas nela. O ano do veto do governador e da quebra da aliança não aparece nas fontes, então o vídeo não cita ano para esses dois fatos.
- A área do parque e as lagoas no mapa são ilustrativas (o parque tem ~36 mil ha e ~40 lagoas). A fração de Timóteo dentro do parque (~37%) vem de 53,2 km² / 144,4 km².
- Traçados de ferrovia e rios na cena "a virada" são esquemáticos e estão sinalizados na tela.
