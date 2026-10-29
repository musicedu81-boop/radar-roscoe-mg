import {Img, interpolate, staticFile} from 'remotion';
import {CAIXA, ESCALA_ANEL, medida} from '../Cartao';
import type {Slide} from '../linha';
import {C, clamp} from '../tokens';
import {Easing} from 'remotion';

// Carrossel 3D da abertura (carousel-spin da skill de efeitos): todos os slides num anel que gira,
// desacelera e para com o primeiro de frente; os outros somem e o primeiro segue para a leitura.
// Profundidade com foco: quanto mais para trás no anel, mais escuro e desfocado.
export const Anel3D: React.FC<{slides: Slide[]; f: number; inicio: number; parada: number; entrega: number}> = ({slides, f, inicio, parada, entrega}) => {
  if (f < inicio || f >= entrega || slides.length === 0) return null;
  const m = Math.max(slides.length, 7);
  const passo = 360 / m;
  const raio = (m * (CAIXA.largura * ESCALA_ANEL + 70)) / (2 * Math.PI);
  const giro = interpolate(f, [inicio, parada], [250, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const inclinacao = interpolate(f, [inicio, parada - 10, parada], [-14, -10, 0], {...clamp, easing: Easing.inOut(Easing.quad)});
  const aparece = interpolate(f, [inicio, inicio + 14], [0, 1], clamp);
  const somemOutros = interpolate(f, [entrega - 15, entrega - 5], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${CAIXA.cx}px ${CAIXA.cy}px`, transformStyle: 'preserve-3d', transform: `translateZ(${-raio}px) rotateX(${inclinacao}deg) rotateY(${giro}deg)`}}>
        {slides.slice(0, 12).map((s, i) => {
          const ang = i * passo;
          const total = (((ang + giro) % 360) + 360) % 360;
          const fundo = (1 - Math.cos((total * Math.PI) / 180)) / 2; // 0 na frente, 1 atrás
          const {w, h} = medida(s);
          // o primeiro slide é entregue ao cartão de leitura em `entrega - 15`
          if (i === 0 && f >= entrega - 15) return null;
          return (
            <div
              key={s.arquivo}
              style={{
                position: 'absolute',
                left: CAIXA.cx - w / 2,
                top: CAIXA.cy - h / 2,
                width: w,
                height: h,
                transform: `rotateY(${ang}deg) translateZ(${raio}px) scale(${ESCALA_ANEL})`,
                backfaceVisibility: 'hidden',
                opacity: aparece * (i === 0 ? 1 : somemOutros),
                filter: `blur(${10 * fundo}px) brightness(${1 - 0.5 * fundo})`,
              }}
            >
              <div style={{width: w, height: h, borderRadius: 26, overflow: 'hidden', boxShadow: `0 40px 90px rgba(13,2,21,0.65), 0 0 0 1.5px ${C.lavanda}55`}}>
                <Img src={staticFile(s.arquivo)} style={{width: w, height: h, display: 'block'}} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
