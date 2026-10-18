import {useEffect, useMemo} from 'react';
import * as THREE from 'three';

export type Ponto = {x: number; y: number; z: number; tam: number; alfa: number; cor: THREE.Color};

const VERT = /* glsl */ `
attribute float aTam;
attribute float aAlfa;
attribute vec3 aCor;
uniform float uEscala;
varying float vAlfa;
varying vec3 vCor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aTam * uEscala / -mv.z;
  gl_Position = projectionMatrix * mv;
  vAlfa = aAlfa;
  vCor = aCor;
}`;

const FRAG = /* glsl */ `
uniform float uSuave;
varying float vAlfa;
varying vec3 vCor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = pow(clamp(1.0 - d, 0.0, 1.0), uSuave);
  gl_FragColor = vec4(vCor * a * vAlfa, 1.0);
}`;

// Partículas aditivas. Tamanho em unidades do mundo; posições recalculadas a cada frame (sem animação própria).
export const Pontos: React.FC<{pontos: Ponto[]; escalaTela: number; suave?: number}> = ({pontos, escalaTela, suave = 1.6}) => {
  const geo = useMemo(() => {
    const n = pontos.length;
    const pos = new Float32Array(n * 3);
    const cor = new Float32Array(n * 3);
    const tam = new Float32Array(n);
    const alfa = new Float32Array(n);
    pontos.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
      cor[i * 3] = p.cor.r;
      cor[i * 3 + 1] = p.cor.g;
      cor[i * 3 + 2] = p.cor.b;
      tam[i] = p.tam;
      alfa[i] = p.alfa;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aCor', new THREE.BufferAttribute(cor, 3));
    g.setAttribute('aTam', new THREE.BufferAttribute(tam, 1));
    g.setAttribute('aAlfa', new THREE.BufferAttribute(alfa, 1));
    return g;
  }, [pontos]);
  useEffect(() => () => geo.dispose(), [geo]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {uEscala: {value: escalaTela}, uSuave: {value: suave}},
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [escalaTela, suave],
  );
  useEffect(() => () => mat.dispose(), [mat]);

  return <points geometry={geo} material={mat} frustumCulled={false} />;
};
