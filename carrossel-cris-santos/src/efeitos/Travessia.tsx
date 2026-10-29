import {interpolate} from 'remotion';
import {Borboleta, bater} from '../Borboleta';
import {DURACAO_TROCA, voo} from '../Cartao';
import {C, clamp} from '../tokens';
import {Easing} from 'remotion';

// A borboleta que atravessa o quadro na troca 'borboleta': grande, com rastro de brilho; o slide novo abre atrás dela
export const Travessia: React.FC<{f: number; pouso: number}> = ({f, pouso}) => {
  const dur = DURACAO_TROCA.borboleta;
  if (f < pouso - dur || f > pouso + 2) return null;
  const t = interpolate(f, [pouso - dur, pouso], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});
  const b = voo(t);
  const tamanho = 260 + 120 * Math.sin(Math.PI * t);
  const rastro = Array.from({length: 18}, (_, k) => {
    const tk = Math.max(0, t - (k + 1) * 0.022);
    const q = voo(tk);
    const r = 3 + 4 * (1 - k / 18);
    return <div key={k} style={{position: 'absolute', left: q.x - r, top: q.y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: C.creme, opacity: 0.8 * (1 - k / 18), boxShadow: `0 0 ${r * 5}px ${C.lavanda}`}} />;
  });
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {rastro}
      <div style={{position: 'absolute', left: b.x - tamanho / 2, top: b.y - tamanho / 2, rotate: '38deg'}}>
        <Borboleta tamanho={tamanho} abertura={bater(f)} brilho={1.4} />
      </div>
    </div>
  );
};
