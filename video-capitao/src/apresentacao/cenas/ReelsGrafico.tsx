import React, { useEffect, useMemo } from "react";
import { interpolate } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TOP_REELS } from "../dados";
import { ALTURA, clamp, COR, EASE, LARGURA, PILAR } from "../marca";
import { Palco3D } from "../ui/Palco3D";

// Gráfico de barras 3D (three.js) dos 5 Reels de maior alcance, com a cor do pilar de cada um.
// Tudo aqui é controlado por props calculadas a partir de useCurrentFrame() na cena:
// altura de cada barra, destaque (o pilar que a locutora cita) e a câmera.
// Geometria enxuta: 5 caixas arredondadas, um piso, uma grade de linhas e marcas de base.

type V3 = [number, number, number];

// Medidas do gráfico em unidades do mundo 3D
export const PASSO = 1.62; // distância entre os centros das barras
export const LARG_BARRA = 1.08;
export const PROF_BARRA = 1.08;
export const ALTURA_MAX = 6; // altura da barra de maior valor (o Reel do temporal)
const MAIOR = Math.max(...TOP_REELS.map((r) => r.views));
export const xDaBarra = (i: number) => (i - (TOP_REELS.length - 1) / 2) * PASSO;
export const alturaDaBarra = (i: number) =>
  (TOP_REELS[i].views / MAIOR) * ALTURA_MAX;

// Piso: placa escura com borda verde-neon na frente
export const PISO = {
  largura: (TOP_REELS.length - 1) * PASSO + LARG_BARRA + 1.0,
  profundidade: 2.5,
  espessura: 0.16,
};

export type EstadoCamera = { posicao: V3; alvo: V3; fov: number };

const mistura = (a: number, b: number, t: number) => a + (b - a) * t;
const RAD = Math.PI / 180;

// Câmera em órbita curta: começa de lado e mais baixa, gira e sobe até assentar no
// enquadramento fixo de leitura (quadro f 140 em diante). Pensada para a tela vertical.
export const cameraDoQuadro = (f: number): EstadoCamera => {
  const t = interpolate(f, [-6, 140], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const giro = mistura(44, 8, t) * RAD; // em torno do eixo Y
  const elevacao = mistura(24, 10, t) * RAD; // acima do horizonte do alvo
  const distancia = mistura(20, 28.5, t);
  const alvo: V3 = [mistura(0.8, 0, t), mistura(1.1, 2.75, t), 0];
  return {
    posicao: [
      alvo[0] + distancia * Math.cos(elevacao) * Math.sin(giro),
      alvo[1] + distancia * Math.sin(elevacao),
      alvo[2] + distancia * Math.cos(elevacao) * Math.cos(giro),
    ],
    alvo,
    fov: 34,
  };
};

// Projeção em JS puro, com uma THREE.PerspectiveCamera equivalente à do Palco3D
// (mesmos fov, proporção, posição e alvo). Devolve pixels da tela 1080x1920.
export const criarProjetor = (cam: EstadoCamera) => {
  const camera = new THREE.PerspectiveCamera(
    cam.fov,
    LARGURA / ALTURA,
    0.1,
    200,
  );
  camera.position.set(...cam.posicao);
  camera.lookAt(...cam.alvo);
  camera.updateMatrixWorld();
  const v = new THREE.Vector3();
  return (p: V3) => {
    v.set(p[0], p[1], p[2]).project(camera);
    return { x: ((v.x + 1) / 2) * LARGURA, y: ((1 - v.y) / 2) * ALTURA };
  };
};

const NOITE = new THREE.Color(COR.noiteProfunda);
const corApagada = (cor: string, destaque: number) =>
  `#${new THREE.Color(cor).lerp(NOITE, (1 - destaque) * 0.62).getHexString()}`;

const Barra: React.FC<{
  x: number;
  altura: number;
  cor: string;
  destaque: number;
  brilho: number;
}> = ({ x, altura, cor, destaque, brilho }) => {
  const raio = Math.min(0.08, altura / 2 - 0.001);
  const geometria = useMemo(
    () =>
      altura > 0.02
        ? new RoundedBoxGeometry(LARG_BARRA, altura, PROF_BARRA, 2, raio)
        : null,
    [altura, raio],
  );
  useEffect(() => () => geometria?.dispose(), [geometria]);
  const corFinal = corApagada(cor, destaque);
  return (
    <group position={[x, 0, 0]}>
      {geometria ? (
        <mesh geometry={geometria} position={[0, altura / 2, 0]}>
          <meshPhysicalMaterial
            color={corFinal}
            emissive={corFinal}
            emissiveIntensity={0.22 + 0.5 * brilho}
            roughness={0.26}
            metalness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.18}
          />
        </mesh>
      ) : null}
      {/* Marca de base: quadrado de luz na cor do pilar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[LARG_BARRA + 0.32, PROF_BARRA + 0.32]} />
        <meshBasicMaterial
          color={cor}
          transparent
          opacity={(0.22 + 0.5 * brilho) * (0.35 + 0.65 * destaque)}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// Grade do piso (linhas finas verde-neon), criada uma vez
const GRADE = (() => {
  const pontos: number[] = [];
  const meioX = PISO.largura / 2;
  const meioZ = PISO.profundidade / 2;
  const passo = 0.5;
  for (let x = -meioX; x <= meioX + 0.001; x += passo) {
    pontos.push(x, 0, -meioZ, x, 0, meioZ);
  }
  for (let z = -meioZ; z <= meioZ + 0.001; z += passo) {
    pontos.push(-meioX, 0, z, meioX, 0, z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pontos, 3));
  return g;
})();

const Piso: React.FC<{ aparece: number }> = ({ aparece }) => (
  <group>
    <mesh position={[0, -PISO.espessura / 2, 0]}>
      <boxGeometry args={[PISO.largura, PISO.espessura, PISO.profundidade]} />
      <meshStandardMaterial
        color={COR.noite}
        roughness={0.45}
        metalness={0.35}
        transparent
        opacity={aparece}
      />
    </mesh>
    <lineSegments geometry={GRADE} position={[0, 0.003, 0]}>
      <lineBasicMaterial
        color={COR.neon}
        transparent
        opacity={0.34 * aparece}
        depthWrite={false}
      />
    </lineSegments>
    {/* Borda de assinatura verde-neon na frente do piso */}
    <mesh position={[0, 0, PISO.profundidade / 2]}>
      <boxGeometry args={[PISO.largura * aparece, 0.035, 0.035]} />
      <meshBasicMaterial color={COR.neon} />
    </mesh>
  </group>
);

export type EstadoGrafico = {
  camera: EstadoCamera;
  alturas: number[]; // altura atual de cada barra (unidades do mundo)
  destaques: number[]; // 0..1: 1 = pilar em foco, 0 = apagada
  brilhos: number[]; // 0..1: pulso de luz (barra que acabou de pousar)
  piso: number; // 0..1: o piso se desenha no corte
};

export const ReelsGrafico3D: React.FC<EstadoGrafico> = ({
  camera,
  alturas,
  destaques,
  brilhos,
  piso,
}) => (
  <Palco3D camera={camera}>
    <Piso aparece={piso} />
    {TOP_REELS.map((r, i) => (
      <Barra
        key={r.titulo}
        x={xDaBarra(i)}
        altura={alturas[i]}
        cor={PILAR[r.pilar]}
        destaque={destaques[i]}
        brilho={brilhos[i]}
      />
    ))}
  </Palco3D>
);
