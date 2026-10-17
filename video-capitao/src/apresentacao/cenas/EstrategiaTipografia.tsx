import React from "react";
import { Easing, interpolate } from "remotion";
import { clamp, COR, EASE, FONTE_TITULO } from "../marca";
import { GlitchTexto } from "../ui/Glitch";

// Peças de tipografia cinética da cena Estratégia central. Tudo é guiado pelo quadro da cena
// (`f`, 0 = corte) que a cena passa adiante; nada anima sozinho.

// Métricas da Anton, em em (medidas no navegador com a fonte da marca). Com altura de linha 1,
// a linha de base fica a 0,925 do topo da caixa, a versal tem 0,87 de altura, o acento de
// maiúscula (É, Á) sobe 0,24 acima da versal e o Ç desce 0,31 abaixo da linha de base.
export const ANTON = {
  base: 0.925,
  versal: 0.87,
  espaco: 0.234,
  quadros: 3.37, // largura de "QUADROS"
  fixos: 2.057, // largura de "FIXOS"
};

// "Nunca sai": quadro bem depois do fim de qualquer cena (interpolate exige faixa crescente)
const NUNCA = 100000;

// Folgas da máscara, em em: o acento de maiúscula (É, Ã) passa do topo da caixa, o Ç desce
// abaixo da linha de base e o itálico sintético inclina para a direita.
const FOLGA = { topo: 0.3, base: 0.3, direita: 0.2 };

// Deslocamento vertical (px) de uma palavra que sobe por trás da máscara em `entra` e sai por
// cima em `sai`
const deslocamento = (f: number, entra: number, sai: number, tamanho: number) => {
  const sobe = interpolate(f, [entra, entra + 11], [1.6 * tamanho, 0], {
    ...clamp,
    easing: EASE.entrada,
  });
  const vai = interpolate(f, [sai, sai + 9], [0, -1.7 * tamanho], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  return sobe + vai;
};

export type PalavraProps = {
  texto: string;
  entra: number; // f em que a palavra começa a subir
  sai?: number; // f em que ela começa a sair por cima
  tamanho: number;
  cor?: string;
  italico?: boolean;
  porLetra?: boolean; // cada letra sobe com um pequeno atraso
  glitch?: number; // quadro local (Sequence) do glitch da palavra-chave
  // Risco que atravessa a palavra (f de início); `alem` estende o traço para a direita
  risco?: { inicio: number; alem?: number; cor: string };
  // Sublinhado que se desenha sob a palavra (f de início)
  sublinhado?: { inicio: number; cor: string };
};

// Palavra em Anton que sobe por trás de uma máscara no instante em que a locutora a diz.
// Sem `x`/`y`, fica no fluxo de uma `Linha` (alinhada pela linha de base); com eles, fica
// solta na tela (topo da caixa da palavra em `y`).
export const Palavra: React.FC<
  PalavraProps & { f: number; x?: number; y?: number; linhaDeBase?: number }
> = ({
  texto,
  f,
  entra,
  sai = NUNCA,
  x,
  y,
  tamanho,
  cor = COR.branco,
  italico = false,
  porLetra = false,
  glitch,
  risco,
  sublinhado,
  linhaDeBase,
}) => {
  const solta = x !== undefined && y !== undefined;
  const ate = (FOLGA.topo + ANTON.base) * tamanho;
  const visivel = f >= entra - 1 && f <= sai + 12;
  const estilo: React.CSSProperties = {
    fontFamily: FONTE_TITULO,
    fontSize: tamanho,
    lineHeight: 1,
    color: cor,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    fontStyle: italico ? "italic" : "normal",
  };
  const dy = deslocamento(f, entra, sai, tamanho);
  const conteudo = porLetra ? (
    <span style={estilo}>
      {Array.from(texto).map((letra, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            translate: `0px ${deslocamento(f, entra + i * 2, sai + i, tamanho)}px`,
          }}
        >
          {letra}
        </span>
      ))}
    </span>
  ) : (
    <span style={{ ...estilo, display: "inline-block", translate: `0px ${dy}px` }}>
      {texto}
    </span>
  );
  // Traços que acompanham a palavra (sobem e saem junto com ela)
  const tracoRisco = risco
    ? interpolate(f, [risco.inicio, risco.inicio + 9], [0, 1], {
        ...clamp,
        easing: EASE.entrada,
      })
    : 0;
  const tracoSub = sublinhado
    ? interpolate(f, [sublinhado.inicio, sublinhado.inicio + 12], [0, 1], {
        ...clamp,
        easing: EASE.entrada,
      })
    : 0;
  const saida = interpolate(f, [sai, sai + 8], [1, 0], clamp);
  return (
    <div
      style={{
        ...(solta
          ? { position: "absolute", left: x, top: y - FOLGA.topo * tamanho }
          : {
              position: "relative",
              marginTop: linhaDeBase === undefined ? 0 : linhaDeBase - ate,
              marginRight: -FOLGA.direita * tamanho,
            }),
        visibility: visivel ? "visible" : "hidden",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          padding: `${FOLGA.topo * tamanho}px ${FOLGA.direita * tamanho}px ${FOLGA.base * tamanho}px 0`,
          lineHeight: 1,
        }}
      >
        {glitch === undefined ? (
          conteudo
        ) : (
          <GlitchTexto inicio={glitch} duracao={12}>
            {conteudo}
          </GlitchTexto>
        )}
      </div>
      {risco && tracoRisco > 0 ? (
        <div
          style={{
            position: "absolute",
            left: -4,
            top: (FOLGA.topo + ANTON.base - ANTON.versal * 0.46) * tamanho,
            width: `calc((100% - ${FOLGA.direita * tamanho}px + ${(risco.alem ?? 0) + 8}px) * ${tracoRisco})`,
            height: Math.max(6, tamanho * 0.075),
            background: risco.cor,
            boxShadow: "0 3px 10px rgba(1,10,25,0.45)",
            opacity: saida,
          }}
        />
      ) : null}
      {sublinhado && tracoSub > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: (FOLGA.topo + ANTON.base) * tamanho + tamanho * 0.07,
            width: `calc((100% - ${FOLGA.direita * tamanho}px) * ${tracoSub})`,
            height: Math.max(6, tamanho * 0.035),
            background: sublinhado.cor,
            boxShadow: `0 0 18px ${sublinhado.cor}`,
            opacity: saida,
          }}
        />
      ) : null}
    </div>
  );
};

// Linha de palavras alinhadas pela linha de base (`base`, em px na tela), a partir de `x`.
// As palavras mantêm o lugar mesmo antes de entrar, então a linha nunca pula.
export const Linha: React.FC<{
  f: number;
  x: number;
  base: number;
  vao: number;
  palavras: PalavraProps[];
}> = ({ f, x, base, vao, palavras }) => {
  const maior = Math.max(...palavras.map((p) => p.tamanho));
  const ate = (FOLGA.topo + ANTON.base) * maior;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: base - ate,
        display: "flex",
        alignItems: "flex-start",
        gap: vao,
      }}
    >
      {palavras.map((p, i) => (
        <Palavra key={i} f={f} linhaDeBase={ate} {...p} />
      ))}
    </div>
  );
};

// Visor de câmera (quatro cantos neon) que emoldura o título: o "quadro" literal.
// Desenha-se no corte, respira no compasso, trava em "fixos" e se abre quando o título sobe.
export const Visor: React.FC<{
  f: number;
  desenha: number; // f em que os cantos começam a se desenhar
  trava: number; // f em que o visor fecha sobre o título
  abre: number; // f em que ele se abre e some
  caixa: { x: number; y: number; largura: number; altura: number };
}> = ({ f, desenha, trava, abre, caixa }) => {
  const braco = 86;
  const espessura = 8;
  const traco = interpolate(f, [desenha, desenha + 14], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  // Respira devagar (um ciclo por compasso) até travar
  const respira =
    6 *
    Math.sin((f / 60) * Math.PI * 2) *
    interpolate(f, [trava, trava + 8], [1, 0], clamp);
  const fecha = interpolate(f, [trava, trava + 10], [0, 18], {
    ...clamp,
    easing: EASE.entrada,
  });
  const abreFora = interpolate(f, [abre, abre + 16], [0, 140], {
    ...clamp,
    easing: EASE.saida,
  });
  const opacidade =
    interpolate(f, [desenha, desenha + 4], [0, 1], clamp) *
    interpolate(f, [abre + 4, abre + 16], [1, 0], clamp);
  const clarao = interpolate(f, [trava + 6, trava + 10, trava + 26], [0, 1, 0], clamp);
  if (opacidade <= 0) {
    return null;
  }
  const recuo = fecha - respira - abreFora;
  const cantos: { x: number; y: number; sx: number; sy: number }[] = [
    { x: caixa.x, y: caixa.y, sx: 1, sy: 1 },
    { x: caixa.x + caixa.largura, y: caixa.y, sx: -1, sy: 1 },
    { x: caixa.x, y: caixa.y + caixa.altura, sx: 1, sy: -1 },
    { x: caixa.x + caixa.largura, y: caixa.y + caixa.altura, sx: -1, sy: -1 },
  ];
  const brilho = `0 0 ${14 + 30 * clarao}px rgba(1,237,67,${0.55 + 0.45 * clarao})`;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: opacidade }}>
      {cantos.map((c, i) => {
        const cx = c.x + c.sx * recuo;
        const cy = c.y + c.sy * recuo;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: c.sx > 0 ? cx : cx - braco * traco,
                top: c.sy > 0 ? cy : cy - espessura,
                width: braco * traco,
                height: espessura,
                background: COR.neon,
                boxShadow: brilho,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: c.sx > 0 ? cx : cx - espessura,
                top: c.sy > 0 ? cy : cy - braco * traco,
                width: espessura,
                height: braco * traco,
                background: COR.neon,
                boxShadow: brilho,
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};
