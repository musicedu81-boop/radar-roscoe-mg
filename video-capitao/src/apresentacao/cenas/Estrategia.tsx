import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ESTRATEGIA_CENTRAL } from "../dados";
import {
  clamp,
  COMPASSO,
  COR,
  EASE,
  FONTE_TEXTO,
  MARGEM,
} from "../marca";
import {
  CENAS,
  frasesDaCena,
  inicioLocal,
  momentoDaPalavra,
} from "../roteiro";
import { LinhaNeon } from "../ui/Elementos";
import { Fundo, SimboloMais } from "../ui/Fundo";
import {
  CENTRO_FAIXA,
  EstrategiaSemana,
  LinhasDeVelocidade,
  type TemposSubida,
} from "./EstrategiaSubida";
import {
  ANTON,
  Linha,
  Palavra,
  type PalavraProps,
  Visor,
} from "./EstrategiaTipografia";

// Cena 06 · Estratégia central. Tipografia cinética sobre a pausa da trilha (só pad e arpejo):
// "QUADROS FIXOS" enorme dentro de um visor de câmera na primeira frase, que depois sobe e vira
// o cabeçalho; as frases seguintes entram palavra por palavra, no instante em que a locutora
// as diz. Na fala "série", sete molduras acendem em fila. No último compasso (subida da
// trilha) elas viram as siglas SEG...DOM, que se montam letra por letra, e o conjunto avança
// para a câmera até o corte para a grade semanal.
const INDICE = 5;

const q = (f: number) => f + inicioLocal(INDICE);
const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE, palavra, ocorrencia);
const FRASES = frasesDaCena(INDICE);

// Normaliza uma palavra como roteiro.ts (sem pontuação final, minúscula)
const limpa = (t: string) =>
  t
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/u, "");

// Quadro (f) em que a locutora diz cada palavra de um texto de dados.ts que repete a frase `k`
// da narração (as repetições de uma palavra são contadas desde o início da cena)
const momentosDoTexto = (texto: string, k: number) => {
  const antes = FRASES.slice(0, k)
    .flatMap((fr) => fr.legenda.split(" "))
    .map(limpa);
  const vistas: string[] = [];
  return texto.split(" ").map((palavra) => {
    const alvo = limpa(palavra);
    const ocorrencia =
      antes.filter((w) => w === alvo).length +
      vistas.filter((w) => w === alvo).length;
    vistas.push(alvo);
    return momentoDaPalavra(INDICE, palavra, ocorrencia);
  });
};

// Textos (todos de dados.ts e roteiro.ts)
const [TITULO_A, TITULO_B] = ESTRATEGIA_CENTRAL.titulo.split(" ");
const ROTULO = CENAS[INDICE].titulo.split(" ");
const FRASE2 = ESTRATEGIA_CENTRAL.frase.split(" ");
const FRASE3_TEXTO = ESTRATEGIA_CENTRAL.apoio.split(". ")[1];
const FRASE3 = FRASE3_TEXTO.split(" ");
const T2 = momentosDoTexto(ESTRATEGIA_CENTRAL.frase, 1);
const T3 = momentosDoTexto(FRASE3_TEXTO, 2);

// Antecedência da entrada de cada palavra em relação ao instante em que ela é dita
const ANTES = 5;

// Momentos da cena, em f, ligados à fala e ao compasso
const SUBIDA = (CENAS[INDICE].compassos - 1) * COMPASSO; // último compasso: a trilha sobe
const M = {
  visor: -10, // os cantos se desenham sob o corte (já aparecem na transição)
  rotulo: ROTULO.map((w) => p(w) - 6), // cada palavra do rótulo entra quando é dita
  quadros: p("quadros") - 6,
  fixos: p("fixos") - 6,
  trava: p("fixos") + 4,
  cabecalho: FRASES[0].fim, // o título sobe para o cabeçalho na pausa entre as frases
  linha: FRASES[1].inicio + 5,
  // A frase 2 sai linha a linha antes de a frase 3 ocupar o mesmo lugar
  sai2: [FRASES[1].fim - 2, FRASES[1].fim + 2, FRASES[1].fim + 6],
  serie: p("série") + 2,
  risco: p("avulso") + 2,
  sai3: SUBIDA - 6,
};
const TEMPOS: TemposSubida = {
  serie: M.serie,
  sobe: SUBIDA,
  monta: SUBIDA + 2,
  avanca: SUBIDA + 28,
  fim: CENAS[INDICE].compassos * COMPASSO,
};

// Grade (px). Conteúdo entre y 230 e 1450; a faixa da legenda (1480+) fica livre.
const VISOR = { x: MARGEM, y: 480, largura: 920, altura: 720 };
const X_TEXTO = MARGEM + 50;
const TAM = { quadros: 236, fixos: 350, cabecalho: 120 };
// Título grande (topo da caixa de cada palavra) e posição no cabeçalho (como o Titulo das cenas)
const GRANDE = { rotulo: 525, quadros: 582, fixos: 827 };
const CABECALHO = {
  y: 237,
  xFixos: MARGEM + (ANTON.quadros + ANTON.espaco) * TAM.cabecalho,
};

// QUADROS / FIXOS: entram enormes no visor e depois encolhem para o cabeçalho
const TituloCinetico: React.FC<{ f: number }> = ({ f }) => {
  const vai = (atraso: number) =>
    interpolate(f, [M.cabecalho + atraso, M.cabecalho + atraso + 20], [0, 1], {
      ...clamp,
      easing: EASE.entrada,
    });
  const a = vai(0);
  const b = vai(2);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          translate: `${interpolate(a, [0, 1], [X_TEXTO, MARGEM])}px ${interpolate(a, [0, 1], [GRANDE.quadros, CABECALHO.y])}px`,
          scale: interpolate(a, [0, 1], [1, TAM.cabecalho / TAM.quadros]),
          transformOrigin: "0px 0px",
        }}
      >
        <Palavra
          texto={TITULO_A}
          f={f}
          entra={M.quadros}
          x={0}
          y={0}
          tamanho={TAM.quadros}
          porLetra
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          translate: `${interpolate(b, [0, 1], [X_TEXTO, CABECALHO.xFixos])}px ${interpolate(b, [0, 1], [GRANDE.fixos, CABECALHO.y])}px`,
          scale: interpolate(b, [0, 1], [1, TAM.cabecalho / TAM.fixos]),
          transformOrigin: "0px 0px",
        }}
      >
        {/* Batida da palavra-chave: chega um pouco maior e assenta */}
        <div
          style={{
            scale: interpolate(f, [M.fixos, M.fixos + 9], [1.18, 1], {
              ...clamp,
              easing: EASE.entrada,
            }),
            transformOrigin: `${(ANTON.fixos * TAM.fixos) / 2}px ${TAM.fixos / 2}px`,
          }}
        >
          <Palavra
            texto={TITULO_B}
            f={f}
            entra={M.fixos}
            x={0}
            y={0}
            tamanho={TAM.fixos}
            cor={COR.amarelo}
            italico
            glitch={q(M.fixos)}
          />
        </div>
      </div>
    </>
  );
};

// Rótulo "ESTRATÉGIA CENTRAL": cada palavra entra espaçada, na fala, e fecha o espaçamento;
// o rótulo some quando o título sobe
const Rotulo: React.FC<{ f: number }> = ({ f }) => {
  const some = interpolate(f, [M.cabecalho, M.cabecalho + 10], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  const barra = interpolate(f, [M.rotulo[0], M.rotulo[0] + 14], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  if (barra <= 0 || some >= 1) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: X_TEXTO,
        top: GRANDE.rotulo,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: 1 - some,
        translate: `0px ${-30 * some}px`,
      }}
    >
      <div
        style={{
          width: 44 * barra,
          height: 6,
          background: COR.neon,
          boxShadow: `0 0 12px ${COR.neon}`,
        }}
      />
      {ROTULO.map((palavra, i) => {
        const t = interpolate(f, [M.rotulo[i], M.rotulo[i] + 20], [0, 1], {
          ...clamp,
          easing: EASE.entrada,
        });
        return (
          <div
            key={palavra}
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 800,
              fontSize: 30,
              lineHeight: 1,
              letterSpacing: `${interpolate(t, [0, 1], [0.8, 0.32])}em`,
              color: COR.neon,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              opacity: interpolate(t, [0, 0.35], [0, 1], clamp),
              translate: `${(1 - t) * 24}px 0px`,
            }}
          >
            {palavra}
          </div>
        );
      })}
    </div>
  );
};

// Mira com o "+" da marca no centro do visor vazio: gira e pulsa devagar até o título entrar
const Mira: React.FC<{ f: number }> = ({ f }) => {
  const entra = interpolate(f, [M.visor + 4, M.visor + 18], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const sai = interpolate(f, [M.quadros - 2, M.quadros + 8], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  if (entra <= 0 || sai >= 1) {
    return null;
  }
  const pulso = 0.5 + 0.5 * Math.cos((f / 30) * Math.PI * 2);
  const centro = { x: VISOR.x + VISOR.largura / 2, y: VISOR.y + VISOR.altura / 2 + 20 };
  return (
    <div
      style={{
        position: "absolute",
        left: centro.x - 110,
        top: centro.y - 110,
        width: 220,
        height: 220,
        opacity: entra * (1 - sai),
        scale: interpolate(entra, [0, 1], [0.6, 1]) * (1 + 0.5 * sai),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          border: "3px dashed rgba(1,237,67,0.55)",
          rotate: `${f * 0.9}deg`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 34,
          borderRadius: 999,
          border: `2px solid rgba(255,255,255,${0.12 + 0.12 * pulso})`,
        }}
      />
      <SimboloMais
        tamanho={84}
        cor={COR.neon}
        style={{
          left: 68,
          top: 68,
          opacity: 0.55 + 0.3 * pulso,
          rotate: `${interpolate(entra, [0, 1], [-90, 0])}deg`,
        }}
      />
    </div>
  );
};

// Frase 2: "Cada um com uma / FUNÇÃO / e um DIA." (palavras de dados.ts, na fala)
const LINHAS_2 = { x: MARGEM, bases: [618, 958, 1328] };
const Frase2: React.FC<{ f: number }> = ({ f }) => {
  const w = (i: number, extra: Partial<PalavraProps> = {}): PalavraProps => ({
    texto: FRASE2[i],
    entra: T2[i] - ANTES,
    tamanho: 120,
    ...extra,
  });
  const iFuncao = 4;
  const iDia = FRASE2.length - 1;
  return (
    <>
      <Linha
        f={f}
        x={LINHAS_2.x}
        base={LINHAS_2.bases[0]}
        vao={28}
        palavras={[0, 1, 2, 3].map((i) => w(i, { sai: M.sai2[0] }))}
      />
      <Linha
        f={f}
        x={LINHAS_2.x}
        base={LINHAS_2.bases[1]}
        vao={28}
        palavras={[
          w(iFuncao, {
            tamanho: 300,
            cor: COR.neon,
            sai: M.sai2[1],
            glitch: q(T2[iFuncao] - ANTES),
          }),
        ]}
      />
      <Linha
        f={f}
        x={LINHAS_2.x}
        base={LINHAS_2.bases[2]}
        vao={30}
        palavras={[
          w(5, { sai: M.sai2[2] }),
          w(6, { sai: M.sai2[2] }),
          w(iDia, {
            tamanho: 300,
            cor: COR.amarelo,
            sai: M.sai2[2],
            glitch: q(T2[iDia] - ANTES),
            sublinhado: { inicio: T2[iDia] + 6, cor: COR.amarelo },
          }),
        ]}
      />
    </>
  );
};

// Frase 3: "O algoritmo / reconhece / SÉRIE, / [sete molduras] / não post avulso."
const LINHAS_3 = { x: MARGEM, bases: [600, 749, 1097, 1391] };
const Frase3: React.FC<{ f: number }> = ({ f }) => {
  const w = (i: number, extra: Partial<PalavraProps> = {}): PalavraProps => ({
    texto: FRASE3[i],
    entra: T3[i] - ANTES,
    tamanho: 130,
    ...extra,
  });
  const iSerie = 3;
  // "não post avulso." cai e some na subida (a ideia descartada)
  const cai = interpolate(f, [SUBIDA, SUBIDA + 14], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  return (
    <>
      <Linha
        f={f}
        x={LINHAS_3.x}
        base={LINHAS_3.bases[0]}
        vao={30}
        palavras={[w(0, { sai: M.sai3 }), w(1, { sai: M.sai3 })]}
      />
      <Linha
        f={f}
        x={LINHAS_3.x}
        base={LINHAS_3.bases[1]}
        vao={30}
        palavras={[w(2, { sai: M.sai3 + 2 })]}
      />
      <Linha
        f={f}
        x={LINHAS_3.x}
        base={LINHAS_3.bases[2]}
        vao={30}
        palavras={[
          w(iSerie, {
            tamanho: 300,
            cor: COR.neon,
            sai: M.sai3 + 4,
            glitch: q(T3[iSerie] - ANTES),
          }),
        ]}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `0px ${160 * cai}px`,
          rotate: `${5 * cai}deg`,
          opacity: 1 - cai,
          transformOrigin: `${MARGEM}px ${LINHAS_3.bases[3]}px`,
        }}
      >
        <Linha
          f={f}
          x={LINHAS_3.x}
          base={LINHAS_3.bases[3]}
          vao={26}
          palavras={[
            w(4, { tamanho: 112, cor: COR.coral }),
            w(5, {
              tamanho: 112,
              cor: COR.coral,
              risco: { inicio: M.risco, alem: 26, cor: COR.branco },
            }),
            w(6, {
              tamanho: 112,
              cor: COR.coral,
              risco: { inicio: M.risco + 5, cor: COR.branco },
            }),
          ]}
        />
      </div>
    </>
  );
};

export const CenaEstrategia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - inicioLocal(INDICE);

  // Avanço para a câmera no fim da subida (acelera até o corte)
  const avanco = interpolate(f, [TEMPOS.avanca, TEMPOS.fim], [0, 940], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  // Deriva lenta de câmera durante a pausa: o corpo do texto se aproxima devagar
  const deriva = interpolate(f, [0, SUBIDA], [1, 1.025], clamp);
  // A luz volta na subida e explode no corte
  const luz = interpolate(f, [SUBIDA, TEMPOS.fim], [0, 1], clamp);
  const clarao = interpolate(f, [TEMPOS.fim - 12, TEMPOS.fim - 1], [0, 0.85], {
    ...clamp,
    easing: EASE.saida,
  });

  return (
    <AbsoluteFill>
      <Fundo variante="noite" />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 44%, ${COR.vivo} 0%, rgba(0,92,219,0) 62%)`,
          opacity: 0.18 + 0.5 * luz,
        }}
      />

      <AbsoluteFill
        style={{
          perspective: 1000,
          perspectiveOrigin: `${CENTRO_FAIXA.x}px ${CENTRO_FAIXA.y}px`,
        }}
      >
        <AbsoluteFill
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(${avanco}px)`,
          }}
        >
          <Visor
            f={f}
            desenha={M.visor}
            trava={M.trava}
            abre={M.cabecalho}
            caixa={VISOR}
          />
          <Mira f={f} />
          <Rotulo f={f} />
          <TituloCinetico f={f} />
          <div style={{ position: "absolute", left: MARGEM, top: 372 }}>
            <LinhaNeon inicio={q(M.linha)} largura={200} />
          </div>

          <AbsoluteFill
            style={{
              scale: deriva,
              transformOrigin: `${MARGEM}px 900px`,
            }}
          >
            <Frase2 f={f} />
            <Frase3 f={f} />
          </AbsoluteFill>

          <EstrategiaSemana f={f} tempos={TEMPOS} />
        </AbsoluteFill>
      </AbsoluteFill>

      <LinhasDeVelocidade f={f} tempos={TEMPOS} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 44%, ${COR.branco} 0%, rgba(255,255,255,0.6) 35%, rgba(1,237,67,0) 75%)`,
          opacity: clarao,
          pointerEvents: "none",
        }}
      />

      {/* Efeitos discretos: o título subindo para o cabeçalho e o avanço para a câmera */}
      <Audio
        name="SFX swoosh · título sobe"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={q(M.cabecalho - 2)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.18}
      />
      <Audio
        name="SFX swoosh · avanço"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={q(TEMPOS.avanca)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.25}
      />
    </AbsoluteFill>
  );
};
