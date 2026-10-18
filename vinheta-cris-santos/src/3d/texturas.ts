import * as THREE from 'three';
import {ANTENAS, ASA_INFERIOR, ASA_SUPERIOR, CORPO, MANCHAS, VEIAS} from '../borboleta-desenho';
import {C} from '../tokens';

const canvas = (w: number, h: number) => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível');
  return {cv, ctx};
};

const textura = (cv: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

// Asa direita no mesmo traço do SVG 2D. Cobre x de -4 a 116 e y de -90 a 90 (unidades SVG).
export const texturaAsa = () => {
  const s = 512 / 120;
  const {cv, ctx} = canvas(512, 768);
  ctx.translate(4 * s, 90 * s);
  ctx.scale(s, s);
  const grad = ctx.createLinearGradient(0, -80, 0, 70);
  grad.addColorStop(0, 'rgba(253,248,255,0.95)');
  grad.addColorStop(1, 'rgba(212,160,255,0.8)');
  ctx.fillStyle = grad;
  ctx.strokeStyle = C.medio;
  ctx.lineJoin = 'round';
  for (const d of [ASA_SUPERIOR, ASA_INFERIOR]) {
    const p = new Path2D(d);
    ctx.fill(p);
    ctx.lineWidth = 2.4;
    ctx.stroke(p);
  }
  ctx.lineWidth = 1.5;
  ctx.stroke(new Path2D(VEIAS));
  for (const m of MANCHAS) {
    ctx.beginPath();
    ctx.arc(m.cx, m.cy, m.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  return textura(cv);
};

// Corpo e antenas. Cobre x de -32 a 32 e y de -64 a 64.
export const texturaCorpo = () => {
  const s = 4;
  const {cv, ctx} = canvas(256, 512);
  ctx.translate(32 * s, 64 * s);
  ctx.scale(s, s);
  ctx.fillStyle = C.principal;
  ctx.strokeStyle = C.lavanda;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(CORPO.cx, CORPO.cy, CORPO.rx, CORPO.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = C.claro;
  ctx.lineWidth = 2;
  ctx.stroke(new Path2D(ANTENAS));
  return textura(cv);
};

// Fundo: mesmo degradê radial da versão 2D, centrado no alto do quadro
export const texturaFundo = (rx: number, ry: number, cy: number) => {
  const {cv, ctx} = canvas(1024, 1024);
  ctx.translate(512, cy * 1024);
  ctx.scale(rx * 1024, ry * 1024);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, C.principal);
  g.addColorStop(0.45, C.profundo);
  g.addColorStop(1, C.noite);
  ctx.fillStyle = g;
  ctx.fillRect(-4, -4, 8, 8);
  return textura(cv);
};

// Escurece a metade de baixo para o nome respirar sobre o retrato
export const texturaLegibilidade = () => {
  const {cv, ctx} = canvas(4, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, 'rgba(45,8,69,0)');
  g.addColorStop(0.45, 'rgba(45,8,69,0)');
  g.addColorStop(0.72, 'rgba(45,8,69,0.8)');
  g.addColorStop(0.88, 'rgba(13,2,21,1)');
  g.addColorStop(1, 'rgba(13,2,21,1)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 512);
  return textura(cv);
};

// Brilho radial (clarão da fusão)
export const texturaClarao = () => {
  const {cv, ctx} = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(253,248,255,1)');
  g.addColorStop(0.25, 'rgba(212,160,255,0.6)');
  g.addColorStop(0.6, 'rgba(168,85,216,0.15)');
  g.addColorStop(1, 'rgba(168,85,216,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return textura(cv);
};

// Feixe de luz vindo do alto
export const texturaFeixe = () => {
  const {cv, ctx} = canvas(128, 512);
  const h = ctx.createLinearGradient(0, 0, 128, 0);
  h.addColorStop(0, 'rgba(212,160,255,0)');
  h.addColorStop(0.5, 'rgba(212,160,255,1)');
  h.addColorStop(1, 'rgba(212,160,255,0)');
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, 128, 512);
  ctx.globalCompositeOperation = 'destination-in';
  const v = ctx.createLinearGradient(0, 0, 0, 512);
  v.addColorStop(0, 'rgba(0,0,0,1)');
  v.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, 128, 512);
  return textura(cv);
};

// Degradê da face das letras, igual ao da versão 2D: creme no alto, lavanda embaixo.
// As UVs da tampa do TextGeometry são as coordenadas do glifo (em), então o degradê vai de y = -0.16 a 0.55.
export const texturaDegradeLetra = () => {
  const {cv, ctx} = canvas(4, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, C.creme);
  g.addColorStop(1, C.lavanda);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const t = textura(cv);
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(1, 1 / 0.71);
  t.offset.set(0, 0.16 / 0.71);
  return t;
};
