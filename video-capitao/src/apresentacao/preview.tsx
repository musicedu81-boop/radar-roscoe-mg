import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { ALTURA, COR, FPS, LARGURA } from "./marca";
import {
  DURACAO_TOTAL,
  duracaoDaSequencia,
  inicioDaCena,
  TRANSICAO,
} from "./roteiro";
import { Moldura } from "./ui/Moldura";
import { Narracao } from "./ui/Narracao";

// Prévia isolada para construir cenas em paralelo: cada construtor faz o bundle só das suas
// cenas (um erro em outra cena não quebra a prévia). As cenas ficam nos mesmos quadros globais
// da apresentação final, com a narração e a legenda, e o HUD aparece por cima.
//
// Entrada (ex.: src/apresentacao/cenas/_entrada-numeros.tsx):
//   import { registerRoot } from "remotion";
//   import { criarRaizPreview } from "../preview";
//   import { CenaNumeros } from "./Numeros";
//   registerRoot(criarRaizPreview([{ indice: 1, Componente: CenaNumeros }]));
// Bundle: npx remotion bundle src/apresentacao/cenas/_entrada-numeros.tsx --out-dir=<dir>
// Still:  npx remotion still <dir> Preview q.png --frame=<global> --gl=swangle
export const criarRaizPreview = (
  cenas: { indice: number; Componente: React.FC }[],
) => {
  const Preview: React.FC = () => (
    <AbsoluteFill style={{ backgroundColor: COR.noiteProfunda }}>
      {cenas.map(({ indice, Componente }) => (
        <Sequence
          key={indice}
          from={indice === 0 ? 0 : inicioDaCena(indice) - TRANSICAO / 2}
          durationInFrames={duracaoDaSequencia(indice)}
          premountFor={FPS}
        >
          <Componente />
          <Narracao indice={indice} />
        </Sequence>
      ))}
      <Moldura />
    </AbsoluteFill>
  );
  const Raiz: React.FC = () => (
    <Composition
      id="Preview"
      component={Preview}
      durationInFrames={DURACAO_TOTAL}
      fps={FPS}
      width={LARGURA}
      height={ALTURA}
    />
  );
  return Raiz;
};
