import React, { useEffect, useMemo } from "react";
import { interpolate, random } from "remotion";
import * as THREE from "three";
import { clamp, COR } from "../marca";
import { Palco3D } from "../ui/Palco3D";

// Espaço 3D da abertura e do encerramento: símbolos "+" da marca extrudados (azul-vivo
// brilhante com contorno verde-neon) flutuando em profundidade, com poeira de luz. A cena
// controla tudo por props calculadas a partir de useCurrentFrame(): câmera, revelação na luz,
// rastros de luz (warp) e o anel de fechamento do encerramento.
// Os "+" são dois InstancedMesh (corpo e contorno): duas chamadas de desenho por quadro.

// Proporções do "+" da marca (as mesmas do SimboloMais: braço com 26% do tamanho)
const MEIO_BRACO = 0.13;
const PONTA = 0.5;
const PROFUNDIDADE = 0.2;
const CHANFRO = 0.04;
const ESPESSURA_CONTORNO = 0.036;

const formaMais = (b: number, l: number) => {
  const forma = new THREE.Shape();
  forma.moveTo(-b, l);
  forma.lineTo(b, l);
  forma.lineTo(b, b);
  forma.lineTo(l, b);
  forma.lineTo(l, -b);
  forma.lineTo(b, -b);
  forma.lineTo(b, -l);
  forma.lineTo(-b, -l);
  forma.lineTo(-b, -b);
  forma.lineTo(-l, -b);
  forma.lineTo(-l, b);
  forma.lineTo(-b, b);
  forma.closePath();
  return forma;
};

const criarGeometriaMais = () => {
  const geometria = new THREE.ExtrudeGeometry(formaMais(MEIO_BRACO, PONTA), {
    depth: PROFUNDIDADE,
    bevelEnabled: true,
    bevelThickness: CHANFRO,
    bevelSize: 0.032,
    bevelSegments: 1,
    curveSegments: 1,
  });
  geometria.center();
  return geometria;
};

// Contorno neon espesso na face da frente (as linhas de WebGL têm só 1 px)
const criarContornoMais = () => {
  const externo = formaMais(MEIO_BRACO, PONTA);
  const interno = formaMais(
    MEIO_BRACO - ESPESSURA_CONTORNO,
    PONTA - ESPESSURA_CONTORNO,
  );
  externo.holes.push(new THREE.Path(interno.getPoints()));
  const geometria = new THREE.ShapeGeometry(externo, 1);
  geometria.translate(0, 0, PROFUNDIDADE / 2 + CHANFRO + 0.003);
  return geometria;
};

type Mais = {
  pos: [number, number, number];
  tam: number;
  rot: [number, number, number];
  giro: [number, number, number];
  atraso: number; // 0..1: ordem em que surge da escuridão
};

// Campo de "+" num tubo elíptico em volta do eixo da câmera (o centro fica livre para o
// texto). Ângulo áureo e profundidade estratificada: distribuição uniforme, sem buracos.
const TOTAL = 52;
export const NO_ANEL = 16; // os primeiros "+" do campo formam o anel do encerramento

const CAMPO: Mais[] = Array.from({ length: TOTAL }, (_, i) => {
  const r = (k: string) => random(`espaco-mais-${i}-${k}`);
  const angulo = i * 2.39996 + (r("a") - 0.5) * 0.6;
  const raio = 2.0 + Math.sqrt(r("r")) * 5.4;
  // Sequência "plástica" para a profundidade: não se alinha com o ângulo áureo
  const camada = ((i * 0.7548777) % 1) * 0.85 + r("z") * 0.15;
  return {
    pos: [
      Math.cos(angulo) * raio,
      Math.sin(angulo) * raio * 1.75,
      6 - camada * 58,
    ],
    tam: 0.6 + r("t") * 1.0,
    rot: [(r("rx") - 0.5) * 1.2, (r("ry") - 0.5) * 1.2, r("rz") * Math.PI],
    giro: [
      (r("gx") - 0.5) * 0.012,
      (r("gy") - 0.5) * 0.014,
      (r("gz") - 0.5) * 0.01,
    ],
    atraso: r("d"),
  };
});

// Poeira de luz: pontos pequenos espalhados no mesmo volume
const POEIRA = (() => {
  const total = 320;
  const pos = new Float32Array(total * 3);
  for (let i = 0; i < total; i++) {
    const r = (k: string) => random(`poeira-${i}-${k}`);
    pos[i * 3] = (r("x") - 0.5) * 18;
    pos[i * 3 + 1] = (r("y") - 0.5) * 30;
    pos[i * 3 + 2] = 8 - r("z") * 62;
  }
  return pos;
})();

export type EstadoEspaco = {
  quadro: number; // quadro local da cena (giros contínuos)
  camera: [number, number, number];
  alvo: [number, number, number];
  revela?: number; // 0..1: os "+" surgem da escuridão (névoa recua e eles crescem)
  rastro?: number; // 0..1: os "+" se esticam em rastros de luz
  anel?: number; // 0..1: os primeiros NO_ANEL "+" formam o anel de fechamento
  anelCentro?: [number, number, number];
  anelRaio?: number;
  anelInclinacao?: number; // radianos: o alto do anel se afasta da câmera
  pulso?: number; // 0..1: brilho extra do contorno, dos corpos e do anel
  luz?: { posicao: [number, number, number]; intensidade: number };
};

const mistura = (a: number, b: number, t: number) => a + (b - a) * t;

// Objetos auxiliares reaproveitados no cálculo das matrizes
const AUX = {
  obj: new THREE.Object3D(),
};

const ConteudoEspaco: React.FC<EstadoEspaco> = ({
  quadro,
  revela = 1,
  rastro = 0,
  anel = 0,
  anelCentro = [0, 0, 0],
  anelRaio = 2.5,
  anelInclinacao = 0.9,
  pulso = 0,
  luz,
}) => {
  const recursos = useMemo(() => {
    const geometria = criarGeometriaMais();
    const contorno = criarContornoMais();
    const corpo = new THREE.MeshStandardMaterial({
      color: COR.vivo,
      emissive: new THREE.Color(COR.vivo),
      metalness: 0.25,
      roughness: 0.3,
    });
    const neon = new THREE.MeshBasicMaterial({
      color: COR.neon,
      toneMapped: false,
    });
    const corpos = new THREE.InstancedMesh(geometria, corpo, TOTAL);
    const contornos = new THREE.InstancedMesh(contorno, neon, TOTAL);
    corpos.frustumCulled = false;
    contornos.frustumCulled = false;
    const poeiraGeo = new THREE.BufferGeometry();
    poeiraGeo.setAttribute("position", new THREE.BufferAttribute(POEIRA, 3));
    const poeiraMat = new THREE.PointsMaterial({
      color: COR.branco,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const poeira = new THREE.Points(poeiraGeo, poeiraMat);
    return {
      geometria,
      contorno,
      corpo,
      neon,
      corpos,
      contornos,
      poeiraGeo,
      poeiraMat,
      poeira,
    };
  }, []);
  useEffect(
    () => () => {
      recursos.geometria.dispose();
      recursos.contorno.dispose();
      recursos.corpo.dispose();
      recursos.neon.dispose();
      recursos.corpos.dispose();
      recursos.contornos.dispose();
      recursos.poeiraGeo.dispose();
      recursos.poeiraMat.dispose();
    },
    [recursos],
  );

  // Materiais compartilhados: valores do quadro atual (uniforms, sem recompilar)
  recursos.corpo.emissiveIntensity = 0.32 + 0.45 * pulso + 2.4 * rastro;
  recursos.poeiraMat.opacity = 0.55 * (1 - rastro) * Math.min(1, revela * 1.5);

  const longe = interpolate(revela, [0, 1], [4, 52], clamp);
  const perto = Math.min(10, longe * 0.5);
  // Primeiro os "+" se alinham de frente para a câmera, depois esticam (sem barras cruzadas)
  const alinha = interpolate(rastro, [0, 0.3], [0, 1], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 2),
  });
  const estica = 1 + 120 * Math.pow(rastro, 2.4);
  const afina = 1 - 0.6 * rastro; // rastros finos, como fios de luz
  const giroAnel = quadro * 0.004;
  const cosI = Math.cos(anelInclinacao);
  const senI = Math.sin(anelInclinacao);

  // Matriz de cada "+" no quadro atual
  const o = AUX.obj;
  CAMPO.forEach((m, i) => {
    const nasce = interpolate(revela * 1.4 - m.atraso * 0.4, [0, 1], [0, 1], {
      ...clamp,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    let px = m.pos[0];
    let py = m.pos[1];
    let pz = m.pos[2];
    let tam = m.tam;
    let rotX = (m.rot[0] + m.giro[0] * quadro) * (1 - alinha);
    let rotY = (m.rot[1] + m.giro[1] * quadro) * (1 - alinha);
    let rotZ = m.rot[2] + m.giro[2] * quadro;
    // Anel de fechamento (encerramento)
    if (i < NO_ANEL && anel > 0) {
      const a = (i / NO_ANEL) * Math.PI * 2 + giroAnel;
      px = mistura(px, anelCentro[0] + anelRaio * Math.cos(a), anel);
      py = mistura(py, anelCentro[1] + anelRaio * Math.sin(a) * cosI, anel);
      pz = mistura(pz, anelCentro[2] - anelRaio * Math.sin(a) * senI, anel);
      tam = mistura(tam, i % 2 === 0 ? 0.46 : 0.3, anel);
      rotX = mistura(rotX, -anelInclinacao * 0.35, anel);
      rotY = mistura(rotY, 0, anel);
      rotZ = mistura(rotZ, quadro * 0.012 + i * 0.4, anel);
    }
    const s = Math.max(0.0001, tam * nasce);
    o.position.set(px, py, pz);
    o.rotation.set(rotX, rotY, rotZ);
    o.scale.set(s * afina, s * afina, s * estica);
    o.updateMatrix();
    recursos.corpos.setMatrixAt(i, o.matrix);
    recursos.contornos.setMatrixAt(i, o.matrix);
  });
  recursos.corpos.instanceMatrix.needsUpdate = true;
  recursos.contornos.instanceMatrix.needsUpdate = true;

  return (
    <>
      <fog attach="fog" args={[COR.noite, 10, 52]} near={perto} far={longe} />
      {luz ? (
        <pointLight
          position={luz.posicao}
          intensity={luz.intensidade}
          distance={22}
          color={COR.branco}
        />
      ) : null}
      <primitive object={recursos.corpos} />
      <primitive object={recursos.contornos} />
      <primitive object={recursos.poeira} />
      {anel > 0.01 ? (
        <mesh position={anelCentro} rotation={[-anelInclinacao, 0, 0]}>
          <torusGeometry args={[anelRaio, 0.014, 6, 120]} />
          <meshBasicMaterial
            color={COR.neon}
            toneMapped={false}
            transparent
            opacity={anel * (0.3 + 0.7 * Math.min(1, pulso))}
          />
        </mesh>
      ) : null}
    </>
  );
};

export const EspacoMais: React.FC<EstadoEspaco> = (props) => (
  <Palco3D camera={{ posicao: props.camera, alvo: props.alvo, fov: 40 }}>
    <ConteudoEspaco {...props} />
  </Palco3D>
);

// Ponto da tela (px) -> coordenada do mundo num plano a `distancia` da câmera (fov 40,
// câmera olhando para -z). Serve para centrar o anel na logo.
export const telaParaMundo = (
  xPx: number,
  yPx: number,
  distancia: number,
  largura: number,
  altura: number,
) => {
  const meiaAltura = distancia * Math.tan((40 / 2) * (Math.PI / 180));
  const meiaLargura = meiaAltura * (largura / altura);
  const nx = (xPx / largura) * 2 - 1;
  const ny = 1 - (yPx / altura) * 2;
  return [nx * meiaLargura, ny * meiaAltura] as const;
};
