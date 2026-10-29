import {Easing, interpolate, random} from 'remotion';
import {C, FONTE, clamp} from '../tokens';

// Anel de palavras em 3D (efeito órbita): giram em volta de um eixo vertical, desaceleram e param
// com a primeira palavra de frente. Profundidade com foco: atrás fica menor, escura e desfocada.
export const ANEL_PALAVRAS = {cy: 860, raio: 390, inclinacao: 90, tamanho: 48};

export const posicaoNoAnel = (i: number, n: number, giro: number) => {
  const ang = ((i * 360) / n + giro) * (Math.PI / 180);
  const fundo = (1 - Math.cos(ang)) / 2; // 0 na frente, 1 atrás
  return {x: 540 + ANEL_PALAVRAS.raio * Math.sin(ang), y: ANEL_PALAVRAS.cy + ANEL_PALAVRAS.inclinacao * Math.cos(ang), fundo, frente: Math.cos(ang)};
};

export const giroDoAnel = (t: number, parada: number) => interpolate(t, [0, parada], [540, 0], {...clamp, easing: Easing.out(Easing.cubic)});

export const AnelPalavras: React.FC<{palavras: string[]; t: number; parada: number; esconder?: number}> = ({palavras, t, parada, esconder = -1}) => {
  const giro = giroDoAnel(t, parada);
  const aparece = interpolate(t, [0, 16], [0, 1], clamp);
  const itens = palavras.map((p, i) => ({p, i, ...posicaoNoAnel(i, palavras.length, giro)})).sort((a, b) => a.frente - b.frente);
  return (
    <>
      {itens.map((w) =>
        w.i === esconder ? null : (
          <div
            key={w.p}
            style={{
              position: 'absolute',
              left: w.x,
              top: w.y,
              translate: '-50% -50%',
              scale: `${1 - 0.55 * w.fundo}`,
              opacity: aparece * (1 - 0.7 * w.fundo),
              filter: w.fundo > 0.05 ? `blur(${9 * w.fundo}px)` : undefined,
              fontFamily: FONTE,
              fontWeight: 900,
              fontSize: ANEL_PALAVRAS.tamanho,
              whiteSpace: 'pre',
              backgroundImage: `linear-gradient(180deg, ${C.creme} 30%, ${C.lavanda} 95%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: `0 0 30px ${C.claro}66`,
            }}
          >
            {w.p}
          </div>
        ),
      )}
    </>
  );
};

// Orbe da inflamação com partículas em órbitas inclinadas; as que passam por trás ficam desfocadas
export const OrbeInflamacao: React.FC<{t: number; cx: number; cy: number; raio: number}> = ({t, cx, cy, raio}) => {
  const e = interpolate(t, [0, 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const particulas = Array.from({length: 26}, (_, i) => {
    const plano = i % 3; // três órbitas com inclinações diferentes
    const inc = [18, -32, 58][plano] * (Math.PI / 180);
    const r = raio * (1.35 + 0.25 * plano + 0.08 * random(`or${i}`));
    const vel = (0.022 + 0.01 * random(`ov${i}`)) * (plano === 1 ? -1 : 1);
    const ang = t * vel + random(`oa${i}`) * Math.PI * 2;
    const x0 = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    const y = z * Math.sin(inc) * 0.35;
    const x = x0 * Math.cos(inc * 0.3);
    const frente = z / r; // 1 na frente
    const tam = (5 + 4 * random(`ot${i}`)) * (0.75 + 0.35 * frente);
    return {i, x, y, frente, tam};
  });
  const detras = particulas.filter((p) => p.frente < 0);
  const nafrente = particulas.filter((p) => p.frente >= 0);
  const ponto = (p: (typeof particulas)[number]) => (
    <div
      key={p.i}
      style={{
        position: 'absolute',
        left: cx + p.x - p.tam,
        top: cy + p.y - p.tam,
        width: p.tam * 2,
        height: p.tam * 2,
        borderRadius: '50%',
        background: C.creme,
        opacity: e * (0.45 + 0.55 * (p.frente + 1) / 2),
        boxShadow: `0 0 ${p.tam * 4}px ${C.lavanda}`,
        filter: p.frente < 0 ? `blur(${3 * -p.frente}px)` : undefined,
      }}
    />
  );
  return (
    <>
      {detras.map(ponto)}
      <div
        style={{
          position: 'absolute',
          left: cx - raio,
          top: cy - raio,
          width: raio * 2,
          height: raio * 2,
          borderRadius: '50%',
          scale: `${0.6 + 0.4 * e}`,
          opacity: e,
          background: `radial-gradient(circle at 42% 38%, ${C.creme} 0%, ${C.lavanda} 22%, ${C.claro}cc 48%, ${C.medio}55 72%, transparent 100%)`,
          boxShadow: `0 0 ${raio * 0.8}px ${C.claro}88`,
        }}
      />
      {nafrente.map(ponto)}
    </>
  );
};
