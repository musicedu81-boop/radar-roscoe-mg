# Guia de arte · Apresentação do Planejamento Estratégico

Motion 16:9 (1920x1080, 30 fps, 118 s) que apresenta o plano de redes do Capitão Vítor Prado.
Padrão: produtora premium. Gráficos, 3D, transições glitch, identidade da marca em tudo.

## Estrutura (não alterar)

- `marca.ts`: cores (`COR`, `PILAR`), fontes, logo, margens, ritmo, curvas. Use só essas cores.
- `dados.ts`: todos os números e textos do plano. **Nunca invente número, data ou nome.**
- `roteiro.ts`: cenas, compassos e helpers de tempo.
- `ui/`: componentes compartilhados (`Fundo`, `Titulo`, `Texto`, `Etiqueta`, `Pill`, `LinhaNeon`,
  `Contador`, `Logo`, `Cartao3D`, `GlitchTexto`, `SimboloMais`, `Palco3D`, `Moldura`).
- `preview.tsx`: prévia isolada para construir e conferir cenas em paralelo.
- `Apresentacao.tsx`: monta as cenas com transição glitch em cada corte, HUD, trilha e SFX de corte.

Cada construtor de cena edita **somente** o seu arquivo em `cenas/` e pode criar arquivos novos
em `cenas/` com o prefixo da cena (ex.: `cenas/AberturaEspaco.tsx`). Não edite `ui/`, `marca.ts`,
`dados.ts`, `roteiro.ts`, `Apresentacao.tsx` nem `Root.tsx`. Se precisar de mudança compartilhada,
descreva no relatório final.

## Tempo

- 120 BPM: tempo = 15 quadros, compasso = 60 quadros (2 s).
- Em toda cena: `const f = frame - inicioLocal(INDICE)`. `f = 0` é a cabeça do primeiro compasso
  da cena (o corte, junto com o acento da trilha). A cena já aparece em `f = -6` (meio da transição)
  e os últimos 6 quadros ficam sob a transição seguinte. Não precisa animar saída.
- Entradas importantes caem nos tempos: f = 0, 15, 30, 45, 60...
- Até f ≈ 20 a cena já tem algo forte na tela. Reserve o último compasso para um estado final
  legível (o espectador precisa ler).

| # | Cena | id | Compassos | Quadros | Início global | Energia da trilha |
|---|---|---|---|---|---|---|
| 1 | Abertura | abertura | 5 | 300 | 0 | intro baixa, compasso 5 é subida (riser) |
| 2 | Ponto de partida | numeros | 4 | 240 | 300 | alta (drop com impacto no corte) |
| 3 | Diagnóstico | ritmo | 5 | 300 | 540 | média |
| 4 | O que funcionou | reels | 6 | 360 | 840 | alta |
| 5 | Três pilares | pilares | 4 | 240 | 1200 | média |
| 6 | Estratégia central | estrategia | 3 | 180 | 1440 | pausa (pad), compasso 3 é subida |
| 7 | Grade semanal | semana | 8 | 480 | 1620 | alta (drop com impacto no corte) |
| 8 | Janela de publicação | janela | 4 | 240 | 2100 | média |
| 9 | Calendário | calendario | 6 | 360 | 2340 | alta |
| 10 | Metas e KPIs | metas | 6 | 360 | 2700 | alta |
| 11 | Contingência | crise | 4 | 240 | 3060 | média, compasso 4 é subida |
| 12 | Encerramento | encerramento | 4 | 240 | 3300 | final: impacto e acorde que some |

Quadro global de um momento da cena: `global = inicioDaCena(i) + f` (coluna "Início global" + f).

## Tela

- Cenas 2 a 11 têm o HUD (`Moldura`): faixa do topo até y = 130 e base a partir de y = 970.
  Área útil: x de 120 a 1800, y de 150 a 950. Nada de conteúdo fora disso.
- Abertura e encerramento não têm HUD: tela inteira, mas mantenha 120 px de margem para texto.
- Fundo: `<Fundo />` (azul) ou `<Fundo variante="noite" />` (cenas 3D). Nunca `branco` (o HUD é branco).
- Inversão da marca para dados: cartões brancos sobre o fundo azul, borda 3 px azul-noite,
  cabeçalho verde (`COR.verde`) com rótulo Montserrat 800 em caixa alta branco, número grande Anton azul-noite.

## Tipografia

- Títulos: `Titulo` (Anton, caixa alta), 96 a 130 px. A palavra-chave entre `*asteriscos*` sai em
  amarelo itálico com glitch. Uma palavra-chave por título.
- Textos: Montserrat, mínimo 28 px no corpo e 22 px em rótulos. Números grandes em Anton.
- Números no formato brasileiro (`formatarNumero`, `Contador`): 25.850; 3,6 mil.
- Português correto, com acentos. Caixa alta em títulos e etiquetas.

## Movimento

- Curvas: `EASE.entrada` para entrar, `spring` para cartões, nada linear em objeto que se move.
- Escalonamento entre itens: 3 a 8 quadros, ou um tempo (15) quando cada item é uma ideia.
- Glitch é tempero: `GlitchTexto` em palavras-chave, cortes. Não deixe a tela tremendo o tempo todo.
- 3D: CSS 3D (`perspective`, `rotateX/Y`, `preserve-3d`) para cartões, carrossel e gráficos;
  three.js (`Palco3D`) nas cenas marcadas. Tudo guiado por `useCurrentFrame()`.
  Proibido: `Math.random`, `useFrame`, animações CSS e transições CSS. Use `random(semente)` do remotion.
- Gráficos: barras crescem com `EASE.entrada`, valores contam junto, eixos e rótulos legíveis,
  fonte dos dados em rodapé discreto quando couber ("Fonte: Metricool").

## Som (opcional, máximo 3 por cena)

`<Sequence from={quadroLocal} durationInFrames={60} premountFor={fps}><Audio src={staticFile("apresentacao/sfx-X.wav")} volume={v} /></Sequence>`
(`Audio` de `@remotion/media`). X = `tick` (contagem, 0,25), `swoosh` (movimento 3D, 0,3),
`subida` (barras crescendo, 0,3). Glitch e impacto dos cortes já estão na `Apresentacao`.

## Qualidade (checar antes de entregar)

1. `npx eslint src/apresentacao/cenas/<Arquivo>.tsx` e `npx tsc --noEmit` limpos.
2. Prévia isolada (só as suas cenas, nos quadros globais reais, com o HUD por cima): crie
   `src/apresentacao/cenas/_entrada-<id>.tsx` como no comentário de `preview.tsx`, faça
   `npx remotion bundle src/apresentacao/cenas/_entrada-<id>.tsx --out-dir=<scratchpad>/bundle-<id>`
   e gere stills de vários quadros (início, cada entrada, estado final) com
   `npx remotion still <bundle> Preview q.png --frame=<global> --gl=swangle`
   (com `REMOTION_BROWSER` exportado). Monte folha de contato com `ffmpeg ... tile` e olhe.
   Os arquivos `_entrada-*` são ignorados pelo git.
3. Nada cortado, nada sobre o HUD, nada sobreposto sem querer, contraste bom, hierarquia clara,
   alinhamento em grade, espaço respirando. Parece trabalho de produtora, não slide.
4. Cenas three.js: cada quadro precisa renderizar em menos de ~2 s (geometria enxuta, sem sombras
   pesadas, no máximo ~200 objetos).

## Cenas

### 1 · Abertura (three.js, sem HUD)
Espaço 3D azul-noite com símbolos "+" da marca extrudados (ExtrudeGeometry, material azul-vivo
brilhante com arestas verde-neon) flutuando em profundidade; câmera em dolly lento para frente.
- f 0-60: os "+" surgem da escuridão com a luz.
- f 60-120: logo (`Logo` branco, ~620 px) entra com glitch e reflexo de luz.
- f 120-200: `PLANEJAMENTO *ESTRATÉGICO*` (Anton ~130), `Etiqueta` verde "26/10 → 31/12/2026",
  `Texto` "Gestão que entrega, prefeito que aparece"; crédito pequeno
  "Capitão Vítor Prado · Timóteo, MG · Talentos Business".
- f 240-300 (subida): câmera acelera para dentro, símbolos viram rastros de luz, clarão no corte.

### 2 · Ponto de partida
Título `PONTO DE *PARTIDA*`. Quatro cartões de dados (inversão), entrando em 3D (`Cartao3D`) nos tempos
0, 15, 30, 45, com `Contador`: Seguidores hoje 25.850 (Metricool, 16/10/2026) · Meta 31/12 27 mil
(+1.150, proposta realista) · Desafio 31/12 28 mil (28 novos por dia) · Views por Reel 3,6 mil → 5 mil
(mediana desde 06/10). Rodapé com `Etiqueta` "O plano entra no ar em 26/10". Ticks na contagem.

### 3 · Diagnóstico (ritmo)
Título `O RITMO DE *HOJE*` ou equivalente. Gráfico de barras em CSS 3D (barras extrudadas: frente,
topo e lateral) de seguidores por dia: Média de 11 semanas 14 · Desde 06/10 6 · Meta 27 mil 15 ·
Desafio 28 mil 28 · Meta de 32 mil 81. A barra de 81 dispara e recebe o selo coral "NÃO FECHA" com glitch.
Destaque lateral: anel de 76% ("76% do ganho veio entre 14/09 e 05/10, no pico de crise e campanha")
e "+1.142 seguidores em 11 semanas".

### 4 · O que funcionou (three.js)
Título `O QUE *FUNCIONOU*`. Gráfico de barras 3D real (three.js) com os 5 Reels de `TOP_REELS`,
cor por pilar (`PILAR`), material brilhante, câmera em órbita curta que assenta num enquadramento
fixo para a leitura. Rótulos HTML por cima (views com `Contador`, título curto, data, etiqueta do pilar),
posicionados pela projeção da câmera. Destaque: "105 mil views: o Capitão como fonte na hora crítica".
Legenda dos pilares.

### 5 · Três pilares
Título `TRÊS *PILARES*`. Três cartões altos (Utilidade, Orgulho, Cuidado) entrando em 3D da esquerda,
centro e direita, cada um com a cor do pilar, um ícone (lucide-react), o título, a prova e o número de
views em destaque. Rodapé: a regra do arquétipo (`ARQUETIPO`) como citação.

### 6 · Estratégia central (pausa → subida)
Tipografia cinética: `QUADROS *FIXOS*` enorme (~200 px) no centro, depois "Cada um com uma função e um
dia." e a frase de apoio. No compasso 3 (subida) as sete siglas SEG...DOM se montam numa fileira e o
conjunto avança para a câmera, preparando o corte.

### 7 · Grade semanal
Título `GRADE *SEMANAL*`. Carrossel 3D (CSS) com os sete cartões de `SEMANA` num cilindro. A cada
compasso (f 0, 60, ..., 360) o carrossel gira e traz o próximo dia para a frente: sigla grande, quadro,
função, formato e etiqueta do pilar. Cartão da frente em destaque, os outros recuados e escurecidos.
Compasso 8: o carrossel abre numa fileira com os sete dias lado a lado (resumo da semana).

### 8 · Janela de publicação
Título `JANELA DE *PUBLICAÇÃO*`. Linha do tempo de 24 h com blocos acesos: 10h às 12h (pico principal,
verde-neon) e 18h (segundo pico, amarelo), cursor que percorre o dia, rótulo "segunda a sexta".
Comparativo em barras: Sexta, 10h: 6.734 · Sábado, 10h: 3.409 ("fim de semana rende cerca de metade").
Regra: "Reels dos quadros às 10h · carrosséis extras às 18h". Fonte: Metricool.

### 9 · Calendário
Título `CALENDÁRIO *26/10 → 31/12*`. Linha do tempo em perspectiva (plano inclinado em CSS 3D) com as
10 semanas de `CALENDARIO`; a câmera desliza ao longo dela revelando eixo e destaque de cada semana,
com cor por eixo. Marcos: Estreia 26/10, Os Números 04/11 e 02/12, Balanço 31/12. Rodapé: "Terça, quinta
e sexta fixas em todas as semanas · sábado sempre lo-fi".

### 10 · Metas e KPIs
Título `METAS E *KPIS*`. Esquerda: gráfico de trajetória de seguidores. Trecho real sólido
28/07 24.708 → 16/10 25.850; projeção tracejada 30/11 26.400 → 31/12 27.000 (meta, verde-neon);
ramo desafio 28.000 (amarelo); 32.000 em coral com "não fecha". Direita: os 4 `KPIS` com barra ou anel
de progresso (hoje → meta); os "a medir" mostram só a meta em contorno tracejado.

### 11 · Contingência
Título `PROTOCOLO DE *CRISE*`, acento coral. Topo: "17/09: 105 mil views em um Reel e 320 seguidores
novos em um dia". Linha do tempo de 4 passos (`CRISE.passos`) revelados nos tempos. Fecho: "Regra de
ouro: nunca mentir, ajustar o enquadramento." No último compasso (subida) tudo converge para o centro.

### 12 · Encerramento (sem HUD)
Retoma o espaço 3D da abertura (mesmos "+" extrudados, como moldura). Logo grande no centro com
reflexo, `O plano entra no ar em *26/10*`, crédito "Talentos Business · Planejamento Estratégico 2026".
Último segundo: escurece para preto.

## Regenerar a trilha

`python3 scripts/gerar-trilha-motion.py "IIIIR AAAA MMMMM AAAAAA MMMM BBR AAAAAAAA MMMM AAAAAA AAAAAA MMMR FFFF" public/apresentacao/trilha.wav`
(uma letra por compasso, na ordem das cenas) e `python3 scripts/gerar-sfx-motion.py`.
