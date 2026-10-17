# Guia de arte · Apresentação do Planejamento Estratégico (vertical, com narração)

Motion vertical 9:16 (1080x1920, 30 fps, 192 s) que apresenta o plano de redes do Capitão Vítor
Prado, com narração em português, legenda, trilha original e efeitos. Padrão de produtora premium:
gráficos, 3D, transições glitch e a identidade da marca em tudo. **Todo texto em português do Brasil.**

## Estrutura (não alterar)

- `marca.ts`: cores (`COR`, `PILAR`), fontes, logo, `LARGURA`/`ALTURA`, `MARGEM`, faixas da tela
  (`ZONA`), ritmo e curvas. Use só essas cores.
- `dados.ts`: todos os números e textos do plano. **Nunca invente número, data ou nome.**
- `roteiro.ts`: cenas e compassos (vindos da narração), `inicioLocal`, `inicioDaCena`,
  `frasesDaCena(i)` (frases da narração com início e fim em f) e `momentoDaPalavra(i, "palavra")`
  (quadro f em que a locutora diz aquela palavra).
- `narracao.json`: gerado por `scripts/gerar-narracao.py` a partir de `narracao-roteiro.json`.
- `ui/`: componentes compartilhados (`Fundo`, `Titulo`, `Texto`, `Etiqueta`, `Pill`, `LinhaNeon`,
  `Contador`, `Logo`, `Cartao3D`, `GlitchTexto`, `SimboloMais`, `Palco3D`, `Moldura` = HUD,
  `Narracao` = voz + legenda).
- `preview.tsx`: prévia isolada para construir e conferir cenas em paralelo.
- `Apresentacao.tsx`: monta as cenas com transição glitch em cada corte, narração e legenda dentro
  de cada cena, HUD, trilha com ducking sob a voz e SFX de corte.

Cada construtor de cena edita **somente** o seu arquivo em `cenas/` e pode criar arquivos novos em
`cenas/` com o prefixo da cena (ex.: `cenas/AberturaEspaco.tsx`). Não edite `ui/`, `marca.ts`,
`dados.ts`, `roteiro.ts`, `narracao*.json`, `preview.tsx`, `Apresentacao.tsx`, `Root.tsx` nem
`cenas/index.ts`. Mudança compartilhada: descreva no relatório final.

## Tempo e narração (motion na fala)

- 120 BPM: tempo = 15 quadros, compasso = 60 quadros (2 s).
- Em toda cena: `const f = frame - inicioLocal(INDICE)`. `f = 0` é o corte. A cena já aparece em
  `f = -6` (meio da transição) e os últimos 6 quadros ficam sob a transição seguinte.
- **A animação segue a fala.** Cada elemento entra quando a locutora fala dele: use
  `frasesDaCena(INDICE)[k].inicio` para blocos e `momentoDaPalavra(INDICE, "25.850")` para palavras
  (comece a entrada 4 a 8 quadros antes da palavra). Ideias que a narração não cita entram no
  tempo musical mais próximo (múltiplos de 15).
- Depois da última frase, a cena mantém um estado final limpo e legível até o corte.

| # | Cena | id | Compassos | Quadros | Início global | Trilha | Frases da narração (f) |
|---|---|---|---|---|---|---|---|
| 1 | Abertura | abertura | 7 | 420 | 0 | intro, último compasso sobe | 78 Planejamento estratégico do Capitão Vítor Prado · 171 De 26/10 a 31/12 · 266 Gestão que entrega, prefeito que aparece |
| 2 | Ponto de partida | numeros | 9 | 540 | 420 | alta (impacto no corte) | 10 O perfil começa com 25.850 seguidores · 142 meta realista 27 mil · 244 desafio 28 mil · 309 mediana de views por Reel de 3,6 mil para 5 mil |
| 3 | Diagnóstico | ritmo | 10 | 600 | 960 | média | 10 ganha cerca de 6 por dia · 109 76% do ganho num único pico, 14/09 a 05/10 · 281 32 mil seriam 81 por dia, não fecha · 433 meta realista pede 15 por dia |
| 4 | O que funcionou | reels | 7 | 420 | 1560 | alta | 10 O que funcionou no último mês? · 75 Reel do temporal chegou a 105 mil views · 212 utilidade, orgulho e gente de verdade |
| 5 | Três pilares | pilares | 7 | 420 | 1980 | média | 10 os três pilares · 80 Utilidade... Orgulho... Cuidado... · 246 o gesto vem antes do discurso |
| 6 | Estratégia central | estrategia | 5 | 300 | 2400 | pausa, último compasso sobe | 10 quadros fixos · 88 uma função e um dia · 151 o algoritmo reconhece série |
| 7 | Grade semanal | semana | 14 | 840 | 2700 | alta (impacto no corte) | 10 Segunda · 135 Terça · 238 Quarta · 364 Quinta · 462 Sexta · 562 Sábado · 626 Domingo |
| 8 | Janela de publicação | janela | 7 | 420 | 3540 | média | 10 às 10h, segunda a sexta · 138 segundo pico às 18h · 253 fim de semana cai para cerca da metade |
| 9 | Calendário | calendario | 9 | 540 | 3960 | alta | 10 10 semanas · 99 eixos se revezam · 220 Os Números em 04/11 e 02/12 · 353 Balanço 2026 |
| 10 | Metas e KPIs | metas | 8 | 480 | 4500 | alta | 10 26.400 em 30/11 · 145 27 mil em 31/12 · 226 os indicadores |
| 11 | Contingência | crise | 9 | 540 | 4980 | média, último compasso sobe | 10 protocolo pronto · 100 comunicado em até 2 horas · 204 utilidade, horário fixo, 72 horas · 365 regra de ouro |
| 12 | Encerramento | encerramento | 4 | 240 | 5520 | final: impacto e acorde | 27 O plano entra no ar em 26/10 · 116 Capitão Vítor, o prefeito do povo |

Quadro global de um momento: `global = inicioDaCena(i) + f` (coluna "Início global" + f).

## Tela vertical

- `ZONA` em `marca.ts`. Cenas 2 a 11 têm o HUD: topo de 0 a 200 (assinatura e logo) e base de
  1730 em diante (seção e progresso).
- **Faixa da legenda da narração: y de 1480 a 1700, em todas as cenas. Nada importante ali.**
- Área de conteúdo: **x de 80 a 1000 e y de 230 a 1450** (cenas 2 a 11). Abertura e encerramento
  não têm HUD: podem usar a tela toda, mas a faixa da legenda continua reservada.
- Composição vertical: empilhe (título no alto da área, peça principal no meio, apoio embaixo).
  Gráficos verticais ou barras horizontais largas funcionam melhor que linhas longas.
- Fundo: `<Fundo />` (azul) ou `<Fundo variante="noite" />` (cenas 3D). Nunca `branco`.
- Inversão da marca para dados: cartões brancos sobre o fundo azul, borda 3 px azul-noite,
  cabeçalho verde (`COR.verde`) com rótulo Montserrat 800 em caixa alta branco, número grande Anton
  azul-noite.

## Tipografia

- Títulos: `Titulo` (Anton, caixa alta), 96 a 130 px; cabem ~12 letras por linha em 920 px a 110 px.
  A palavra-chave entre `*asteriscos*` sai em amarelo itálico com glitch. Uma por título.
- Textos: Montserrat, mínimo 34 px no corpo e 26 px em rótulos (tela de celular). Números grandes
  em Anton.
- Números no formato brasileiro (`formatarNumero`, `Contador`): 25.850; 3,6 mil.
- Português correto, com acentos.

## Movimento

- Curvas: `EASE.entrada` para entrar, `spring` para cartões, nada linear em objeto que se move.
- Glitch é tempero: `GlitchTexto` em palavras-chave. Não deixe a tela tremendo o tempo todo.
- 3D: CSS 3D (`perspective`, `rotateX/Y`, `preserve-3d`) para cartões, carrossel e gráficos;
  three.js (`Palco3D`) nas cenas marcadas. Tudo guiado por `useCurrentFrame()`.
  Proibido: `Math.random`, `useFrame`, animações e transições CSS. Use `random(semente)` do remotion.
- Gráficos: barras crescem com `EASE.entrada` quando a narração cita o valor, valores contam
  junto, rótulos legíveis, fonte em rodapé discreto ("Fonte: Metricool").

## Som (opcional, no máximo 3 por cena)

`<Sequence from={quadroLocal} durationInFrames={60} premountFor={fps}><Audio src={staticFile("apresentacao/sfx-X.wav")} volume={v} /></Sequence>`
(`Audio` de `@remotion/media`). X = `tick` (contagem, 0,2), `swoosh` (movimento 3D, 0,25),
`subida` (barras crescendo, 0,25). A voz é a protagonista: efeitos baixos e nunca em cima de uma
palavra importante. Glitch e impacto dos cortes já estão na `Apresentacao`.

## Qualidade (checar antes de entregar)

1. `npx eslint src/apresentacao/cenas/<Arquivo>.tsx` e `npx tsc --noEmit` limpos.
2. Prévia isolada: crie `src/apresentacao/cenas/_entrada-<id>.tsx` como no comentário de
   `preview.tsx`, faça `npx remotion bundle src/apresentacao/cenas/_entrada-<id>.tsx
   --out-dir=<scratchpad>/bundle-<id>` e gere stills com
   `npx remotion still <bundle> Preview q.png --frame=<global> --gl=swangle`
   (com `REMOTION_BROWSER` exportado). Folha de contato com `ffmpeg ... tile` e olhe.
3. Nada cortado, nada sobre o HUD nem na faixa da legenda, contraste bom, hierarquia clara,
   alinhamento em grade, espaço respirando, sincronia com a fala. Parece produtora, não slide.
4. Cenas three.js: cada quadro renderiza em menos de ~2 s (geometria enxuta).

## Cenas

### 1 · Abertura (three.js, sem HUD)
Espaço 3D azul-noite com símbolos "+" da marca extrudados (ExtrudeGeometry, azul-vivo brilhante
com arestas verde-neon) flutuando em profundidade; câmera em dolly lento.
- f 0-75: os "+" surgem da escuridão com a luz.
- f 70-160 (na frase "Planejamento estratégico do Capitão Vítor Prado"): logo (`Logo` branco,
  ~760 px) entra com glitch e reflexo, no terço superior; `PLANEJAMENTO *ESTRATÉGICO*` abaixo.
- f ~179 ("De 26/10 a 31/12"): `Etiqueta` verde "26/10 → 31/12/2026".
- f ~280 ("Gestão que entrega..."): `Texto` com a frase; crédito pequeno
  "Capitão Vítor Prado · Timóteo, MG · Talentos Business".
- f 360-420 (subida): câmera acelera para dentro, os "+" viram rastros de luz, clarão no corte.

### 2 · Ponto de partida
Título `PONTO DE *PARTIDA*`. Quatro cartões de dados (inversão) empilhados em grade 2x2 ou coluna,
entrando em 3D (`Cartao3D`) quando a narração cita cada um, com `Contador`: Seguidores hoje 25.850
(Metricool, 16/10/2026) · Meta 31/12 27 mil (+1.150, proposta realista) · Desafio 31/12 28 mil
(28 novos por dia) · Views por Reel 3,6 mil → 5 mil (mediana desde 06/10). Selo "O plano entra no
ar em 26/10" no fim.

### 3 · Diagnóstico (ritmo)
Título `O RITMO DE *HOJE*`. Gráfico de barras em CSS 3D (frente, topo e lateral) de seguidores por
dia, crescendo na fala: Desde 06/10 6 · Média de 11 semanas 14 · Meta 27 mil 15 · Desafio 28 mil 28 ·
Meta de 32 mil 81. Na frase "seriam 81 por dia" a barra dispara e recebe o selo coral "NÃO FECHA"
com glitch. Na frase dos 76%: anel de 76% ("76% do ganho veio entre 14/09 e 05/10").

### 4 · O que funcionou (three.js)
Título `O QUE *FUNCIONOU*`. Gráfico de barras 3D real (three.js) com os 5 Reels de `TOP_REELS`,
cor por pilar (`PILAR`), material brilhante, câmera em órbita curta que assenta para leitura.
Rótulos HTML por cima (views com `Contador`, título curto, data, etiqueta do pilar), posicionados
pela projeção da câmera. A barra de 105 mil cresce na frase "chegou a 105 mil views". Legenda dos
pilares na frase final.

### 5 · Três pilares
Título `TRÊS *PILARES*`. Três cartões (Utilidade, Orgulho, Cuidado) empilhados, entrando em 3D cada
um quando a locutora diz o nome, com a cor do pilar, ícone (lucide-react), título, prova e views.
Na frase final, a regra do arquétipo (`ARQUETIPO`) como citação.

### 6 · Estratégia central (pausa → subida)
Tipografia cinética: `QUADROS *FIXOS*` enorme no centro na primeira frase; "Cada um com uma função
e um dia." na segunda; "O algoritmo reconhece série, não post avulso." na terceira. No último
compasso (subida) as sete siglas SEG...DOM se montam e o conjunto avança para a câmera.

### 7 · Grade semanal
Título `GRADE *SEMANAL*`. Carrossel 3D (CSS) com os sete cartões de `SEMANA` num cilindro. Em cada
frase da narração (Segunda, Terça...), o carrossel gira e traz aquele dia para a frente: sigla
grande, quadro, função, formato e etiqueta do pilar. Cartão da frente em destaque, os outros recuados.
Depois de "domingo", o carrossel abre numa grade com os sete dias (resumo da semana).

### 8 · Janela de publicação
Título `JANELA DE *PUBLICAÇÃO*`. Relógio ou linha de 24 h com blocos acesos: 10h às 12h (pico,
verde-neon) na primeira frase e 18h (segundo pico, amarelo) na segunda, cursor percorrendo o dia,
"segunda a sexta". Na terceira frase, barras: Sexta, 10h: 6.734 · Sábado, 10h: 3.409. Fonte: Metricool.

### 9 · Calendário
Título `CALENDÁRIO *26/10 → 31/12*`. Linha do tempo vertical em perspectiva (plano inclinado em
CSS 3D) com as 10 semanas de `CALENDARIO`, deslizando enquanto a narração fala, com cor por eixo.
Marcos destacados na fala: Os Números 04/11 e 02/12; Balanço 2026 no fim.

### 10 · Metas e KPIs
Título `METAS E *KPIS*`. Em cima: gráfico de trajetória de seguidores (trecho real sólido 28/07
24.708 → 16/10 25.850; projeção tracejada 30/11 26.400 e 31/12 27.000 meta em verde-neon; desafio
28.000 amarelo; 32.000 coral "não fecha"), desenhado na fala das metas. Embaixo: os 4 `KPIS` com
barra de progresso (hoje → meta; "a medir" = só a meta em contorno tracejado), entrando na frase dos
indicadores.

### 11 · Contingência
Título `PROTOCOLO DE *CRISE*`, acento coral. "17/09: 105 mil views em um Reel e 320 seguidores
novos em um dia" no alto. Linha do tempo vertical de 4 passos (`CRISE.passos`) revelados na fala.
"Regra de ouro: nunca mentir, ajustar o enquadramento." na última frase. No último compasso
(subida) tudo converge para o centro.

### 12 · Encerramento (sem HUD)
Retoma o espaço 3D da abertura (mesmos "+" extrudados). Logo grande no centro com reflexo na
primeira frase, `O plano entra no ar em *26/10*`, crédito "Talentos Business · Planejamento
Estratégico 2026". Últimos 30 quadros: escurece para preto.

## Regenerar narração e trilha

1. Edite `narracao-roteiro.json` (fala por extenso para a voz, legenda com algarismos).
2. `python3 scripts/gerar-narracao.py <modelos_tts>/kokoro-multi-lang-v1_0 <modelos_asr>`
   (Kokoro baixado de github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models).
3. `python3 scripts/gerar-trilha-motion.py "<mapaTrilha do narracao.json>" public/apresentacao/trilha.wav`
   e `python3 scripts/gerar-sfx-motion.py`.
