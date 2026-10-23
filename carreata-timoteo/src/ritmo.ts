import {useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import batida from './batida.json';

// Eventos da batida em frames (a mesma lista que gerou o áudio em scripts/compor-batida.py)
export const useRitmo = () => {
  const {fps} = useVideoConfig();
  return useMemo(() => {
    const q = batida.passoSegundos * fps; // frames por semicolcheia (3 a 30fps)
    const em = (passos: number[]) => passos.map((p) => p * q);
    const tempos = Array.from({length: batida.passos / 4}, (_, i) => i * 4 * q);
    return {
      q,
      compasso: 16 * q,
      kick: em(batida.kick),
      palma: em(batida.palma),
      tambor: em([...batida.tamborAlto, ...batida.tamborBaixo].sort((a, b) => a - b)),
      berimbau: em(batida.berimbau),
      crash: em(batida.crash),
      virada: em(batida.virada),
      sirene: batida.sirene[0] * q,
      drop: 64 * q,
      final: batida.final * q,
      tempos,
    };
  }, [fps]);
};

// Último evento até o frame f
export const ultimo = (f: number, lista: number[]) => {
  let u = -Infinity;
  for (const e of lista) {
    if (e <= f) u = e;
    else break;
  }
  return u;
};

// Pulso que acende no evento e decai
export const pulso = (f: number, lista: number[], decai: number) => {
  const u = ultimo(f, lista);
  return u === -Infinity ? 0 : Math.exp(-(f - u) / decai);
};

// Salto em arco depois de cada evento
export const salto = (f: number, lista: number[], dur: number, altura: number) => {
  const u = ultimo(f, lista);
  const t = f - u;
  return t >= 0 && t < dur ? altura * Math.sin((Math.PI * t) / dur) : 0;
};

// Amassa ao aterrissar (0 a 1)
export const amasso = (f: number, lista: number[], dur: number) => {
  const u = ultimo(f, lista);
  const t = f - u - dur;
  return t >= 0 && t < 6 ? Math.exp(-t / 2) : 0;
};
