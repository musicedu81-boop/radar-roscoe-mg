import { Flag } from "lucide-react";
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CALENDARIO } from "../dados";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO, LARGURA } from "../marca";
import { MarcoFinal, MarcoNumeros } from "./CalendarioMarco";
import {
  camera,
  corDoEixo,
  estiloDoEixo,
  esmaecimentoDaBase,
  GRADE,
  MARCO_FINAL,
  MARCOS_NUMEROS,
  PLANO_3D,
  PONTAS,
  qCal,
  T,
  yDaSemana,
} from "./CalendarioTempos";

// Linha do tempo vertical num plano inclinado em CSS 3D. As dez semanas ficam empilhadas ao
// longo de uma espinha verde-neon; a câmera (inclinação, deslize e aproximação) é guiada pela
// fala. Os eixos acendem com a cor de cada um quando a locutora diz o nome; nos marcos, placas
// brancas se levantam do plano e ficam de frente para a câmera.

const { largura: L, alturaLinha: H, espinha: X_ESPINHA, cartaoX: X_CARTAO } = PLANO_3D;
const X_ETIQUETA = 352; // dentro do cartão da semana

// Etiqueta do eixo no estilo inclinado da marca. Entra neutra (contorno) e, quando o eixo é
// citado, a cor varre da esquerda para a direita.
const EtiquetaEixo: React.FC<{ eixo: string; aparece: number; acende: number }> = ({
  eixo,
  aparece,
  acende,
}) => {
  const estilo = estiloDoEixo(eixo);
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    padding: "5px 16px 4px",
    fontFamily: FONTE_TITULO,
    fontSize: 36,
    lineHeight: 1.12,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    transform: "skewX(-8deg)",
    boxSizing: "border-box",
  };
  return (
    <div
      style={{
        position: "absolute",
        left: X_ETIQUETA,
        top: (H - 50) / 2,
        height: 50,
        opacity: aparece,
        translate: `${(1 - aparece) * 24}px 0px`,
      }}
    >
      <div
        style={{
          ...base,
          border: "2px solid rgba(255,255,255,0.38)",
          background: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.72)",
        }}
      >
        <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>{eixo}</span>
      </div>
      <div
        style={{
          ...base,
          border: `2px solid ${estilo.borda}`,
          background: estilo.fundo,
          color: estilo.texto,
          clipPath: `inset(-4px ${(1 - acende) * 100}% -4px 0)`,
          boxShadow: estilo.destaque ? `0 0 26px rgba(255,205,14,0.45)` : undefined,
        }}
      >
        <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>{eixo}</span>
      </div>
    </div>
  );
};

// Uma semana: nó na espinha, número, datas e etiqueta do eixo
const Semana: React.FC<{ k: number; f: number }> = ({ k, f }) => {
  const s = CALENDARIO[k];
  const cor = corDoEixo(s.eixo);
  const entra = interpolate(f, [T.linhas + k * 3, T.linhas + k * 3 + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const etiqueta = interpolate(f, [T.eixos + k * 4, T.eixos + k * 4 + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const tAcende = T.acende(s.eixo);
  const acende = interpolate(f, [tAcende, tAcende + 10], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const anel = interpolate(f, [tAcende, tAcende + 22], [0, 1], clamp);
  // Semanas de "Os Números": piscam em amarelo quando a locutora diz "Os Números"
  const marco = MARCOS_NUMEROS.find((m) => m.k === k);
  const final = MARCO_FINAL.k === k;
  const aviso = marco
    ? interpolate(f, [T.numeros, T.numeros + 8], [0, 1], clamp) *
      (0.6 + 0.4 * Math.cos(((f - T.numeros) / 15) * Math.PI * 2))
    : 0;
  const contornoFinal = final ? interpolate(f, [T.balanco, T.balanco + 10], [0, 1], clamp) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: yDaSemana(k),
        width: L,
        height: H,
        opacity: entra,
        translate: `0px ${(1 - entra) * 40}px`,
      }}
    >
      {/* Cartão da semana */}
      <div
        style={{
          position: "absolute",
          left: X_CARTAO,
          top: 0,
          width: L - X_CARTAO,
          height: H,
          boxSizing: "border-box",
          borderRadius: 14,
          background: "rgba(1,26,54,0.66)",
          border: "1.5px solid rgba(255,255,255,0.16)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            background: cor,
            opacity: 0.25 + 0.75 * acende,
          }}
        />
        {/* Brilho do eixo ao acender */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, ${cor} 0%, transparent 60%)`,
            opacity: 0.16 * acende + 0.22 * (1 - anel) * acende,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 0,
            height: H,
            display: "flex",
            alignItems: "center",
            fontFamily: FONTE_TITULO,
            fontSize: 56,
            lineHeight: 1,
            color: COR.branco,
          }}
        >
          {String(s.semana).padStart(2, "0")}
        </div>
        <div
          style={{
            position: "absolute",
            left: 104,
            top: 0,
            height: H,
            display: "flex",
            alignItems: "center",
            fontFamily: FONTE_TEXTO,
            fontWeight: 700,
            fontSize: 34,
            color: COR.tintaClara,
            whiteSpace: "nowrap",
          }}
        >
          {s.datas}
        </div>
        <EtiquetaEixo eixo={s.eixo} aparece={etiqueta} acende={acende} />
        {/* Contorno amarelo dos marcos */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            border: `3px solid ${COR.amarelo}`,
            opacity: Math.max(aviso, contornoFinal),
          }}
        />
      </div>

      {/* Nó na espinha */}
      <div
        style={{
          position: "absolute",
          left: X_ESPINHA - 15,
          top: H / 2 - 15,
          width: 30,
          height: 30,
          boxSizing: "border-box",
          borderRadius: 999,
          border: `3px solid ${acende > 0.5 ? COR.branco : "rgba(255,255,255,0.6)"}`,
          background: acende > 0.02 ? cor : COR.noite,
          boxShadow: acende > 0.02 ? `0 0 18px ${cor}` : undefined,
        }}
      />
      {anel > 0 && anel < 1 ? (
        <div
          style={{
            position: "absolute",
            left: X_ESPINHA - 15,
            top: H / 2 - 15,
            width: 30,
            height: 30,
            boxSizing: "border-box",
            borderRadius: 999,
            border: `3px solid ${cor}`,
            scale: 1 + 1.6 * anel,
            opacity: 1 - anel,
          }}
        />
      ) : null}
      {aviso > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: X_ESPINHA - 22,
            top: H / 2 - 22,
            width: 44,
            height: 44,
            boxSizing: "border-box",
            borderRadius: 999,
            border: `3px solid ${COR.amarelo}`,
            opacity: aviso,
          }}
        />
      ) : null}
    </div>
  );
};

// Ponta da linha do tempo (início e fim do plano)
const Ponta: React.FC<{
  y: number;
  cor: string;
  titulo: string;
  texto?: string;
  icone?: boolean;
  opacidade: number;
}> = ({ y, cor, titulo, texto, icone, opacidade }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: y - 30,
      width: L,
      height: 60,
      opacity: opacidade,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: X_ESPINHA - 20,
        top: 10,
        width: 40,
        height: 40,
        boxSizing: "border-box",
        borderRadius: 999,
        border: `4px solid ${cor}`,
        background: COR.noiteProfunda,
        boxShadow: `0 0 20px ${cor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icone ? (
        <Flag size={20} strokeWidth={3} color={cor} />
      ) : (
        <div style={{ width: 12, height: 12, borderRadius: 999, background: cor }} />
      )}
    </div>
    <div
      style={{
        position: "absolute",
        left: X_CARTAO + 10,
        top: 0,
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 18,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontFamily: FONTE_TITULO, fontSize: 48, color: cor, lineHeight: 1 }}>
        {titulo}
      </span>
      {texto ? (
        <span
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 700,
            fontSize: 30,
            color: COR.tintaClara,
          }}
        >
          {texto}
        </span>
      ) : null}
    </div>
  </div>
);

// Placa que se levanta do plano: articulada na borda de cima da semana, sai deitada (de lado
// para a câmera) e gira até ficar de frente, compensando a inclinação do plano.
const Placa: React.FC<{
  k: number;
  inicio: number;
  th: number;
  x: number;
  largura: number;
  altura: number;
  f: number;
  children: React.ReactNode;
}> = ({ k, inicio, th, x, largura, altura, f, children }) => {
  const { fps } = useVideoConfig();
  if (f < inicio) {
    return null;
  }
  const levanta = spring({
    frame: f - inicio,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.9 },
  });
  const angulo = interpolate(levanta, [0, 1], [90 - th, -th]);
  const topo = yDaSemana(k);
  return (
    <>
      {/* Sombra da placa no plano */}
      <div
        style={{
          position: "absolute",
          left: x - 20,
          top: topo - altura * 0.55,
          width: largura + 40,
          height: altura * 0.55,
          background: "linear-gradient(0deg, rgba(1,10,25,0.5) 0%, rgba(1,10,25,0) 100%)",
          opacity: interpolate(levanta, [0, 1], [0, 1], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: topo - altura,
          width: largura,
          height: altura,
          transformOrigin: "50% 100%",
          transform: `rotateX(${angulo}deg)`,
          opacity: interpolate(f - inicio, [0, 4], [0, 1], clamp),
        }}
      >
        {children}
      </div>
    </>
  );
};

export const CalendarioPlano: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - qCal(0);
  const cam = camera(f);

  // A espinha se desenha de cima para baixo enquanto as semanas entram
  const desenha = interpolate(f, [T.plano - 2, T.linhas + 40], [0, 1], {
    ...clamp,
    easing: EASE.suave,
  });
  const comprimento = PLANO_3D.fimY - PLANO_3D.inicioY;
  // Pulso de luz que desce pela espinha sem parar (o tempo passando)
  const pulso = ((f * 7) % (comprimento + 300)) - 150;
  const pontas = interpolate(f, [T.linhas, T.linhas + 14], [0, 1], clamp);
  const base = esmaecimentoDaBase(f);
  const marcaAno = interpolate(f, [T.ano, T.ano + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: GRADE.palco.top,
        width: LARGURA,
        height: GRADE.palco.altura,
        perspective: GRADE.perspectiva,
        perspectiveOrigin: `${LARGURA / 2}px ${GRADE.fuga}px`,
        overflow: "hidden",
        maskImage: `linear-gradient(180deg, transparent 0px, black 44px, black calc(100% - ${base}px), transparent 100%)`,
        WebkitMaskImage: `linear-gradient(180deg, transparent 0px, black 44px, black calc(100% - ${base}px), transparent 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: LARGURA / 2 - L / 2,
          top: cam.foco,
          width: L,
          height: 0,
          transformOrigin: `${L / 2}px 0px`,
          transformStyle: "preserve-3d",
          transform: `translateZ(${cam.z}px) rotateX(${cam.th}deg) translateY(${-cam.c}px)`,
        }}
      >
        {/* Piso do plano: grade discreta alinhada às semanas */}
        <div
          style={{
            position: "absolute",
            left: -70,
            top: PLANO_3D.inicioY - 260,
            width: L + 140,
            height: comprimento + 520,
            backgroundImage:
              "linear-gradient(rgba(1,237,67,0.09) 2px, transparent 2px), linear-gradient(90deg, rgba(1,237,67,0.09) 2px, transparent 2px)",
            backgroundSize: `${PLANO_3D.passo}px ${PLANO_3D.passo}px`,
            backgroundPosition: `${X_ESPINHA + 69}px ${260 + PLANO_3D.inicioY + 42}px`,
            opacity: desenha,
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
          }}
        />

        {/* Espinha verde-neon e o pulso de luz */}
        <div
          style={{
            position: "absolute",
            left: X_ESPINHA - 3,
            top: PLANO_3D.inicioY,
            width: 6,
            height: comprimento * desenha,
            borderRadius: 3,
            background: COR.neon,
            boxShadow: `0 0 16px ${COR.neon}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: X_ESPINHA - 3,
            top: PLANO_3D.inicioY + Math.max(0, pulso),
            width: 6,
            height: Math.max(0, Math.min(150, comprimento - Math.max(0, pulso), pulso + 150)),
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 100%)",
            opacity: desenha,
          }}
        />

        <Ponta
          y={PLANO_3D.inicioY}
          cor={COR.neon}
          titulo={PONTAS.inicio}
          texto={PONTAS.estreia}
          opacidade={pontas}
        />
        <Ponta y={PLANO_3D.fimY} cor={COR.amarelo} titulo={PONTAS.fim} icone opacidade={pontas} />

        {CALENDARIO.map((_, k) => (
          <Semana key={k} k={k} f={f} />
        ))}

        {/* Placas dos marcos */}
        {MARCOS_NUMEROS.map((m, i) => (
          <Placa
            key={m.k}
            k={m.k}
            inicio={T.marcos[i]}
            th={cam.th}
            x={420}
            largura={480}
            altura={190}
            f={f}
          >
            <MarcoNumeros
              titulo={m.titulo}
              semana={CALENDARIO[m.k].semana}
              data={m.data}
              texto={m.texto}
              inicioGlitch={qCal(T.marcos[i] + 4)}
            />
          </Placa>
        ))}
        <Placa
          k={MARCO_FINAL.k}
          inicio={T.balanco}
          th={cam.th}
          x={404}
          largura={500}
          altura={232}
          f={f}
        >
          <MarcoFinal
            semana={MARCO_FINAL.semana}
            datas={MARCO_FINAL.datas}
            eixo={MARCO_FINAL.eixo}
            texto={MARCO_FINAL.texto}
            inicioGlitch={qCal(T.ano)}
            marca={marcaAno}
          />
        </Placa>
      </div>
    </div>
  );
};
