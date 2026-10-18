import {Environment, Lightformer} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {Bloom, EffectComposer, ToneMapping, Vignette} from '@react-three/postprocessing';
import {ToneMappingMode} from 'postprocessing';
import {useLayoutEffect, useMemo} from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import type {Font} from 'three/examples/jsm/loaders/FontLoader.js';
import {toCreasedNormals} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {NOME, QUADRO, SLOGAN, type Tempos, abertura, clamp, progressoDescida, progressoEscrita, progressoRosto, saida, suave, useTempos} from '../roteiro';
import {C} from '../tokens';
import {Borboleta3D} from './Borboleta3D';
import {type Ponto, Pontos} from './Pontos';
import {texturaClarao, texturaDegradeLetra, texturaFeixe, texturaFundo, texturaLegibilidade} from './texturas';

export const FOV = 45;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
const EM = 1; // tamanho da fonte, em unidades do mundo
const ESPACO = 0.02; // letter-spacing, em em
const CAP = 0.7; // altura das maiúsculas da Montserrat, em em
const PROFUNDIDADE = 0.55; // extrusão das letras
const Z_ROSTO = -6;
const DIST_FUNDO = 70; // fundo preso à câmera, sempre atrás de tudo

type Layout = {
  W: number;
  H: number;
  adv: number[];
  pos: number[];
  largura: number;
  D: number;
  aspecto: number;
  ppu: (dist: number) => number;
  xR: number;
  xSFinal: number;
};

const calcularLayout = (black: Font, W: number, H: number): Layout => {
  const res = black.data.resolution;
  const adv = [...NOME].map((ch) => ((black.data.glyphs[ch]?.ha ?? 0) / res) * EM);
  let acc = 0;
  const xs = adv.map((a) => {
    const v = acc;
    acc += a + ESPACO;
    return v;
  });
  const largura = acc - ESPACO;
  const pos = xs.map((v) => v - largura / 2);
  const aspecto = W / H;
  // Distância da câmera para o nome ocupar a mesma largura da versão 2D
  const D = largura / (QUADRO.larguraNome / W) / (2 * TAN * aspecto);
  return {W, H, adv, pos, largura, D, aspecto, ppu: (dist) => H / (2 * dist * TAN), xR: pos[1], xSFinal: pos[pos.length - 1]};
};

const baseNome = (f: number, L: Layout, T: Tempos) => -CAP / 2 - (progressoDescida(f, T) * QUADRO.descidaNome) / L.ppu(L.D);
const posS = (f: number, L: Layout, T: Tempos) => L.xR + progressoEscrita(f, T) * (L.xSFinal - L.xR);

const alvoBorboleta = (L: Layout) => {
  const z = Z_ROSTO + 0.6;
  const k = L.ppu(L.D - z);
  return {x: (QUADRO.alvoBorboleta.x - L.W / 2) / k, y: (L.H / 2 - QUADRO.alvoBorboleta.y) / k, z};
};

// A borboleta é o lápis: posição e pose puras em função do frame
const posBorboleta = (f: number, L: Layout, T: Tempos) => {
  const prog = progressoEscrita(f, T);
  const capTop = baseNome(f, L, T) + CAP;
  const bob = Math.sin(f / 4.5) * 0.14;
  const px = 1 / L.ppu(L.D);
  const eOut = Easing.out(Easing.cubic);
  let x = posS(f, L, T) - 0.02;
  let y = capTop + 0.5 + bob - Math.sin(prog * Math.PI * 9) * 0.2;
  let z = 0.7;
  // Entrada: arco vindo do fundo, pela direita, até a ponta do lápis
  const ent = interpolate(f, [0, T.writeStart], [0, 1], {...clamp, easing: eOut});
  const u = 1 - ent;
  x = u * u * L.largura * 0.7 + 2 * u * ent * L.largura * 0.3 + ent * ent * x;
  y = u * u * (capTop + 5) + 2 * u * ent * (capTop + 0.9) + ent * ent * y;
  z = u * u * -8 + 2 * u * ent * -1 + ent * ent * z;
  // Pousa sobre o S final
  x = interpolate(f, [T.writeEnd, T.writeEnd + 14], [x, L.xSFinal + L.adv[L.adv.length - 1] / 2], {...clamp, easing: suave});
  y = interpolate(f, [T.writeEnd, T.writeEnd + 14], [y, capTop + 0.42 + bob * 0.3], {...clamp, easing: suave});
  // Abaixa, vindo para perto da câmera
  const mergulho = interpolate(f, [T.dive, T.rise], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  y -= mergulho * 300 * px;
  z += mergulho * 3;
  // Sobe com o rosto até a metade borboleta do retrato
  const a = alvoBorboleta(L);
  x = interpolate(f, [T.rise, T.merge - 6], [x, a.x], {...clamp, easing: suave});
  y = interpolate(f, [T.rise, T.merge - 6], [y, a.y], {...clamp, easing: Easing.out(Easing.cubic)});
  z = interpolate(f, [T.rise, T.merge - 6], [z, a.z], {...clamp, easing: suave});
  const escala = interpolate(f, [T.dive, T.rise, T.merge - 6], [0.75, 0.95, 3.4], {...clamp, easing: suave});
  const opacidade = interpolate(f, [T.merge - 12, T.merge + 6], [1, 0], clamp);
  // Inclinada em voo, de frente para a câmera ao chegar no retrato
  const pose = interpolate(f, [T.rise, T.merge - 6], [1, 0], {...clamp, easing: suave});
  const rot: [number, number, number] = [-0.55 * pose, 0.3 * pose, (-0.22 + Math.sin(f / 6) * 0.14) * pose];
  return {x, y, z, escala, opacidade, rot, pose};
};

const cor = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

// Move a câmera padrão do R3F antes de cada render (o composer usa essa mesma câmera desde o primeiro frame)
const CameraOrbital: React.FC<{pivo: THREE.Vector3; rot: THREE.Euler; offset: THREE.Vector3}> = ({pivo, rot, offset}) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const q = new THREE.Quaternion().setFromEuler(rot);
    camera.position.copy(offset).applyQuaternion(q).add(pivo);
    camera.quaternion.copy(q);
    camera.updateMatrixWorld();
  }, [camera, pivo, rot, offset]);
  return null;
};

// Normais suaves nas laterais e no bevel, faces da frente e de trás perfeitamente planas
const geometriaLetra = (ch: string, font: Font) => {
  const g = new TextGeometry(ch, {font, size: EM, depth: PROFUNDIDADE, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.025, bevelSegments: 5});
  g.translate(0, 0, -PROFUNDIDADE / 2);
  const out = toCreasedNormals(g, 0.6);
  const n = out.getAttribute('normal');
  for (const grupo of out.groups) {
    if (grupo.materialIndex !== 0) continue;
    for (let i = grupo.start; i < grupo.start + grupo.count; i++) n.setXYZ(i, 0, 0, n.getZ(i) >= 0 ? 1 : -1);
  }
  n.needsUpdate = true;
  return out;
};

export const Cena: React.FC<{black: Font; medium: Font; rosto: THREE.Texture}> = ({black, medium, rosto}) => {
  const f = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const T = useTempos();
  const L = useMemo(() => calcularLayout(black, W, H), [black, W, H]);
  const escalaTela = H / (2 * TAN);

  // Geometria extrudada de cada letra, com bevel e normais suavizadas nas quinas
  const geos = useMemo(() => {
    const m = new Map<string, THREE.BufferGeometry>();
    for (const ch of new Set(NOME)) {
      if (ch === ' ') continue;
      m.set(ch, geometriaLetra(ch, black));
    }
    return m;
  }, [black]);

  // Frame em que cada letra nasce: quando o S passa e abre espaço
  const nascimento = useMemo(
    () =>
      [...NOME].map((_, i) => {
        if (i === 0 || i === NOME.length - 1) return 2;
        for (let q = 0; q <= T.writeEnd; q++) {
          if (posS(q, L, T) >= L.pos[i] + L.adv[i] + ESPACO * 0.5) return q;
        }
        return T.writeEnd;
      }),
    [L, T],
  );

  const tex = useMemo(() => {
    const visH = 2 * (L.D + DIST_FUNDO) * TAN * 1.3;
    return {
      fundo: texturaFundo(1.2 / 1.3, 0.8 / 1.3, 0.5 - 0.15 / 1.3),
      legibilidade: texturaLegibilidade(),
      clarao: texturaClarao(),
      feixe: texturaFeixe(),
      letra: texturaDegradeLetra(),
      fundoTam: [visH * L.aspecto, visH] as [number, number],
    };
  }, [L]);

  const T0 = useMemo(() => ({lav: cor(C.lavanda, 2.2), cre: cor(C.creme, 2.4), lavSuave: cor(C.lavanda, 0.9), claro: cor(C.claro, 0.8), creSuave: cor(C.creme, 0.7)}), []);

  const baseY = baseNome(f, L, T);
  const xS = posS(f, L, T);
  const b = posBorboleta(f, L, T);
  const alvo = alvoBorboleta(L);
  const rostoP = progressoRosto(f, T);
  const px = 1 / L.ppu(L.D);

  // Plano de corte: as letras nascem de dentro da linha de base
  const planos = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 1, 0), -(baseY - 0.045))], [baseY]);

  // Câmera orbita em torno do C: o C fica parado na tela enquanto o mundo gira
  // ry < 0: câmera à esquerda, o nome foge em perspectiva para a direita. rx < 0: câmera no alto, mostra a espessura.
  const ry = interpolate(f, [0, T.writeStart, T.writeEnd, T.end], [-0.58, -0.55, -0.1, 0.1], {...clamp, easing: [Easing.linear, suave, Easing.linear]});
  const rx = interpolate(f, [0, T.writeStart, T.writeEnd, T.end], [-0.34, -0.32, -0.14, -0.1], {...clamp, easing: [Easing.linear, suave, Easing.linear]});
  const pivoX = interpolate(f, [T.writeEnd, T.merge], [L.pos[0] + L.adv[0] / 2, 0], {...clamp, easing: suave});
  const dist = L.D * interpolate(f, [T.rise, T.end], [1, 0.965], clamp);

  // Retrato
  const kR = L.ppu(L.D - Z_ROSTO);
  const R = QUADRO.retrato;
  const larguraRosto = R.largura / kR;
  const yRosto = (H / 2 - (R.topo + (R.largura * R.proporcao) / 2)) / kR;
  const xRosto = (R.esquerda + R.largura / 2 - W / 2) / kR;
  const visRosto = 2 * (L.D - Z_ROSTO) * TAN;

  // Partículas: poeira em profundidade, faíscas da borboleta, rastro de luz e explosão da fusão
  const bokeh: Ponto[] = [];
  const coresBokeh = [T0.lavSuave, T0.claro, T0.lavSuave];
  for (let i = 0; i < 130; i++) {
    const z = -40 + random(`bz${i}`) * 46;
    const d = L.D - z;
    const meiaAltura = d * TAN;
    bokeh.push({
      x: (random(`bx${i}`) * 2 - 1) * meiaAltura * L.aspecto * 1.8 + 5,
      y: (random(`by${i}`) * 2 - 1) * meiaAltura * 1.1 + f * 0.012 * (0.4 + random(`bv${i}`)),
      z,
      tam: (0.25 + random(`bs${i}`) * 0.9) * (d / L.D),
      alfa: (0.04 + random(`ba${i}`) * 0.16) * (0.7 + 0.3 * Math.sin(f / 18 + i)),
      cor: coresBokeh[i % 3],
    });
  }

  const faiscas: Ponto[] = [];
  const totalFaiscas = 2 * (T.merge - T.writeStart + 12);
  for (let i = 0; i < totalFaiscas; i++) {
    const nasce = T.writeStart - 12 + i * 0.5;
    const vida = f - nasce;
    if (vida < 0 || vida > 30 || nasce > T.merge - 4) continue;
    const o = posBorboleta(nasce, L, T);
    const j = 0.22 * o.escala;
    faiscas.push({
      x: o.x + (random(`fx${i}`) - 0.5) * j * 2 - vida * 0.01,
      y: o.y - 0.1 * o.escala + (random(`fy${i}`) - 0.5) * j * 2 - vida * 0.016,
      z: o.z + (random(`fz${i}`) - 0.5) * j,
      tam: 0.05 + random(`ft${i}`) * 0.09,
      alfa: interpolate(vida, [0, 3, 30], [0, 1, 0], clamp) * (0.6 + 0.4 * Math.sin(vida * 0.9 + i)),
      cor: i % 3 === 0 ? T0.lav : T0.cre,
    });
  }
  for (let k = 1; k <= 112; k++) {
    const t = f - k * 0.125;
    if (t < 0 || t > T.merge) continue;
    const o = posBorboleta(t, L, T);
    const v = 1 - k / 112;
    faiscas.push({x: o.x, y: o.y - 0.12 * o.escala, z: o.z, tam: 0.03 + 0.09 * v, alfa: v * v * o.opacidade * 0.9, cor: T0.lav});
  }
  for (let i = 0; i < 70; i++) {
    const vida = f - (T.merge - 6);
    if (vida < 0 || vida > 34) continue;
    const th = random(`et${i}`) * Math.PI * 2;
    const ph = Math.acos(random(`ep${i}`) * 2 - 1);
    const d = (0.05 + random(`ev${i}`) * 0.16) * vida * (1 - vida / 90);
    faiscas.push({
      x: alvo.x + Math.sin(ph) * Math.cos(th) * d,
      y: alvo.y + Math.sin(ph) * Math.sin(th) * d,
      z: alvo.z + Math.cos(ph) * d * 0.5,
      tam: 0.06 + random(`es${i}`) * 0.12,
      alfa: interpolate(vida, [0, 3, 34], [0, 1, 0], clamp),
      cor: i % 2 ? T0.cre : T0.lav,
    });
  }

  const linha = interpolate(f, [2, T.writeEnd], [0, 1], {...clamp, easing: suave});
  const margem = 30 * px;
  const larguraLinha = (L.largura + 2 * margem) * Math.max(linha, 0.0001);

  // Slogan em placas finas, letra a letra
  const tamSlogan = 30 * px;
  const slogan = useMemo(() => {
    const res = medium.data.resolution;
    const esp = 0.42 * tamSlogan;
    let acc = 0;
    const itens = [...SLOGAN].map((ch) => {
      const x = acc;
      acc += ((medium.data.glyphs[ch]?.ha ?? 0) / res) * tamSlogan + esp;
      return {ch, x, geo: ch === ' ' ? null : new THREE.ShapeGeometry(medium.generateShapes(ch, tamSlogan), 8)};
    });
    const total = acc - esp;
    return itens.map((it) => ({...it, x: it.x - total / 2}));
  }, [medium, tamSlogan]);

  const flash = interpolate(f, [T.merge - 12, T.merge - 4, T.merge + 18], [0, 0.9, 0], clamp);
  const asas = interpolate(b.pose, [0, 1], [1, abertura(f)]);

  return (
    <>
      <color attach="background" args={[C.noite]} />
      <fog attach="fog" args={[C.profundo, L.D + 6, L.D + 60]} />

      <CameraOrbital pivo={new THREE.Vector3(pivoX, 0, 0)} rot={new THREE.Euler(rx, ry, 0)} offset={new THREE.Vector3(-pivoX, 0, dist)} />
      <group position={[pivoX, 0, 0]} rotation={[rx, ry, 0]}>
        <mesh position={[-pivoX, 0, dist - L.D - DIST_FUNDO]}>
          <planeGeometry args={tex.fundoTam} />
          <meshBasicMaterial map={tex.fundo} toneMapped={false} fog={false} depthWrite={false} />
        </mesh>
      </group>

      <ambientLight intensity={0.4} color={C.creme} />
      <directionalLight position={[-6, 8, 12]} intensity={3.2} color={C.creme} />
      <directionalLight position={[8, -3, 6]} intensity={1.2} color={C.claro} />
      <directionalLight position={[0, 6, -8]} intensity={2} color={C.lavanda} />
      <pointLight position={[b.x, b.y, b.z + 0.4]} color={C.lavanda} intensity={b.opacidade * 14} distance={5} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color={C.creme} position={[0, 7, 6]} scale={[16, 4, 1]} />
        <Lightformer form="ring" intensity={3} color={C.lavanda} position={[-7, 1, 7]} scale={4} />
        <Lightformer form="rect" intensity={2.2} color={C.claro} position={[8, -2, 4]} scale={[12, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color={C.medio} position={[0, -7, -6]} scale={[20, 6, 1]} />
      </Environment>

      {/* Feixes de luz do alto, como na vinheta original */}
      {[-11, -5, 2].map((x, i) => (
        <mesh key={x} position={[x, 14, -30]} rotation={[0, 0, -0.5]}>
          <planeGeometry args={[3 + i, 70]} />
          <meshBasicMaterial map={tex.feixe} transparent opacity={0.06 + 0.025 * Math.sin(f / 22 + i * 2)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      ))}

      {/* Retrato: metade rosto, metade borboleta */}
      <mesh position={[xRosto, yRosto - (1 - rostoP) * 9, Z_ROSTO]} rotation={[0, (1 - rostoP) * 0.35, 0]} scale={interpolate(f, [T.rise, T.end], [1.08, 1], clamp)}>
        <planeGeometry args={[larguraRosto, larguraRosto * R.proporcao]} />
        <meshBasicMaterial map={rosto} color={[0.92, 0.92, 0.92]} transparent opacity={rostoP} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[0, 0, Z_ROSTO + 0.3]}>
        <planeGeometry args={[visRosto * L.aspecto * 1.6, visRosto * 1.25]} />
        <meshBasicMaterial map={tex.legibilidade} transparent opacity={rostoP} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[alvo.x, alvo.y, alvo.z + 0.1]} scale={interpolate(f, [T.merge - 12, T.merge + 18], [4, 9], clamp)}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex.clarao} transparent opacity={flash} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>

      {/* Nome extrudado: C parado, letras nascem da linha conforme o S avança */}
      <group position={[0, baseY, 0]}>
        {[...NOME].map((ch, i) => {
          if (ch === ' ') return null;
          const ultima = i === NOME.length - 1;
          const a = spring({frame: f - nascimento[i], fps, config: {damping: 13, stiffness: 140, mass: 0.7}});
          // O S que empurra o nome fica aceso enquanto escreve
          const brilhoS = ultima ? interpolate(f, [T.writeStart, T.writeStart + 8, T.writeEnd, T.writeEnd + 20], [0, 0.35, 0.35, 0], clamp) : 0;
          const brilho = interpolate(f - nascimento[i], [0, 3, 24], [0, 1.4, 0.07], clamp) + brilhoS;
          return (
            <mesh key={i} geometry={geos.get(ch)} position={[ultima ? xS : L.pos[i], (1 - a) * -1.05, 0]} rotation={[(1 - a) * 0.6, 0, 0]}>
              <meshPhysicalMaterial attach="material-0" map={tex.letra} metalness={0.4} roughness={0.24} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.3} emissive={C.lavanda} emissiveIntensity={brilho} clippingPlanes={planos} />
              <meshPhysicalMaterial attach="material-1" color={C.medio} metalness={0.8} roughness={0.26} envMapIntensity={1.4} emissive={C.principal} emissiveIntensity={0.18 + brilho * 0.5} clippingPlanes={planos} />
            </mesh>
          );
        })}

        {/* Linha de base acesa */}
        <mesh position={[L.pos[0] - margem + larguraLinha / 2, -22 * px, 0.2]} scale={[larguraLinha, 1, 1]}>
          <boxGeometry args={[1, 2.4 * px, 2.4 * px]} />
          <meshBasicMaterial color={T0.lav} toneMapped={false} />
        </mesh>

        {/* Slogan */}
        {slogan.map((it, i) => {
          if (!it.geo) return null;
          const s = interpolate(f, [T.tagline + i * 0.7, T.tagline + i * 0.7 + 14], [0, 1], {...clamp, easing: saida});
          return (
            <mesh key={i} geometry={it.geo} position={[it.x, -79 * px - (1 - s) * 0.15, 0.05]}>
              <meshBasicMaterial color={C.lavanda} transparent opacity={s} toneMapped={false} />
            </mesh>
          );
        })}
      </group>

      {/* Borboleta-lápis */}
      <group position={[b.x, b.y, b.z]} rotation={b.rot} scale={b.escala}>
        <Borboleta3D abertura={asas} opacidade={b.opacidade} brilho={1.35 + (1 - b.pose) * 0.3} />
      </group>

      <Pontos pontos={bokeh} escalaTela={escalaTela} suave={0.7} />
      <Pontos pontos={faiscas} escalaTela={escalaTela} suave={1.8} />

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.25} luminanceThreshold={0.82} luminanceSmoothing={0.18} radius={0.78} />
        <Vignette offset={0.32} darkness={0.55} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </>
  );
};
