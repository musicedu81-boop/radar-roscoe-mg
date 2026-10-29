import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Borboleta} from '../Borboleta';
import {C, FONTE, NOME, SLOGAN, textoMarca} from '../tokens';

// Carrossel informativo na identidade da Cris Santos & Lúpus (1080x1350, formato do feed).
// Dados da Sociedade Brasileira de Reumatologia (reumatologia.org.br, página sobre lúpus eritematoso sistêmico).
export const TOTAL_SLIDES = 8;
const FONTE_SBR = 'Fonte: Sociedade Brasileira de Reumatologia';

const Destaque: React.FC<{children: React.ReactNode; cor?: string}> = ({children, cor = C.medio}) => <span style={{fontWeight: 700, color: cor}}>{children}</span>;

const Cabecalho: React.FC<{n: number; escuro?: boolean}> = ({n, escuro}) => (
  <div style={{position: 'absolute', left: 90, right: 90, top: 80, display: 'flex', justifyContent: 'space-between', fontFamily: FONTE, fontWeight: 700, fontSize: 26, letterSpacing: '0.18em', color: escuro ? C.lavanda : C.medio}}>
    <span>{NOME}</span>
    <span style={{opacity: 0.8}}>{String(n).padStart(2, '0')}/{String(TOTAL_SLIDES).padStart(2, '0')}</span>
  </div>
);

const Rodape: React.FC<{texto?: string; escuro?: boolean}> = ({texto = FONTE_SBR, escuro}) => (
  <div style={{position: 'absolute', left: 90, bottom: 72, fontFamily: FONTE, fontWeight: 500, fontSize: 24, color: escuro ? C.lavanda : C.medio, opacity: 0.8}}>{texto}</div>
);

const Titulo: React.FC<{children: React.ReactNode; tamanho?: number}> = ({children, tamanho = 84}) => (
  <div>
    <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: tamanho, lineHeight: 1.05, color: C.principal, letterSpacing: '0.01em'}}>{children}</div>
    <div style={{width: 150, height: 10, borderRadius: 5, marginTop: 30, background: `linear-gradient(90deg, ${C.claro}, ${C.lavanda})`}} />
  </div>
);

// Fundo claro: creme com brilhos lavanda e uma borboleta em marca d'água
const Claro: React.FC<{n: number; children: React.ReactNode; rodape?: string}> = ({n, children, rodape}) => (
  <AbsoluteFill style={{background: `radial-gradient(90% 55% at 88% 6%, #EBD7FF 0%, transparent 62%), radial-gradient(70% 45% at 0% 100%, #F1E3FF 0%, transparent 60%), ${C.creme}`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', right: -120, bottom: -60, opacity: 0.16, rotate: '-18deg'}}>
      <Borboleta tamanho={620} abertura={0.92} brilho={0} />
    </div>
    <Cabecalho n={n} />
    <div style={{position: 'absolute', left: 90, right: 90, top: 210, bottom: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 56}}>{children}</div>
    <Rodape texto={rodape} />
  </AbsoluteFill>
);

// Fundo escuro: o mesmo roxo da vinheta
const Escuro: React.FC<{n: number; children: React.ReactNode; rodape?: string; cabecalho?: boolean}> = ({n, children, rodape, cabecalho = true}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 30%, ${C.principal} 0%, ${C.profundo} 48%, ${C.noite} 100%)`, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.lavanda}22 0%, transparent 40%)`}} />
    {cabecalho ? <Cabecalho n={n} escuro /> : null}
    {children}
    {rodape ? <Rodape texto={rodape} escuro /> : null}
  </AbsoluteFill>
);

const corpo: React.CSSProperties = {fontFamily: FONTE, fontWeight: 500, fontSize: 46, lineHeight: 1.38, color: C.profundo};

const Item: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 26, ...corpo}}>
    <div style={{width: 18, height: 18, borderRadius: 9, background: C.claro, boxShadow: `0 0 0 7px ${C.lavanda}66`, flexShrink: 0}} />
    <div>{children}</div>
  </div>
);

const Capa: React.FC = () => (
  <Escuro n={1} cabecalho={false}>
    <Img
      src={staticFile('rosto.png')}
      style={{
        position: 'absolute',
        left: 160,
        top: -318,
        width: 760,
        WebkitMaskImage: 'linear-gradient(180deg, #000 86%, transparent 97%)',
        maskImage: 'linear-gradient(180deg, #000 86%, transparent 97%)',
      }}
    />
    <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 58%, ${C.profundo}dd 70%, ${C.noite} 90%)`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{...textoMarca(190), filter: `drop-shadow(0 0 40px ${C.claro}aa)`}}>LÚPUS</div>
      <div style={{fontFamily: FONTE, fontWeight: 500, fontSize: 48, color: C.lavanda, letterSpacing: '0.04em', marginTop: 4}}>o que você precisa saber</div>
    </div>
    <div style={{position: 'absolute', left: 90, right: 90, bottom: 74, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FONTE, fontWeight: 700, fontSize: 26, letterSpacing: '0.18em'}}>
      <span style={{color: C.lavanda}}>{NOME}</span>
      <span style={{color: C.creme}}>ARRASTE →</span>
    </div>
  </Escuro>
);

const OQueE: React.FC = () => (
  <Claro n={2}>
    <Titulo>O QUE É O LÚPUS?</Titulo>
    <div style={{...corpo, fontSize: 60, fontWeight: 700, lineHeight: 1.2, color: C.profundo}}>
      Uma doença <Destaque>autoimune</Destaque> e <Destaque>crônica</Destaque>.
    </div>
    <div style={corpo}>
      O sistema de defesa, que deveria proteger, passa a <Destaque>inflamar o próprio corpo</Destaque>.
    </div>
  </Claro>
);

const Onde: React.FC = () => {
  const lugares = ['Pele', 'Articulações', 'Rins', 'Pulmões e coração', 'Sangue', 'Sistema nervoso'];
  return (
    <Claro n={3}>
      <Titulo>ONDE ELE PODE APARECER</Titulo>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22}}>
        {lugares.map((l) => (
          <div key={l} style={{border: `3px solid ${C.lavanda}`, borderRadius: 26, padding: '26px 22px', background: '#FFFFFFAA', fontFamily: FONTE, fontWeight: 700, fontSize: 36, whiteSpace: 'nowrap', color: C.principal}}>
            {l}
          </div>
        ))}
      </div>
      <div style={{...corpo, fontSize: 42}}>
        Os sintomas <Destaque>mudam de pessoa para pessoa</Destaque>.
      </div>
    </Claro>
  );
};

const Quem: React.FC = () => (
  <Claro n={4} rodape="Estimativa da Sociedade Brasileira de Reumatologia">
    <Titulo>QUEM ELE ATINGE MAIS</Titulo>
    <div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 120, lineHeight: 1, color: C.medio}}>1 em 1.700</div>
      <div style={{...corpo, fontSize: 50, fontWeight: 700, marginTop: 14}}>mulheres no Brasil tem lúpus.</div>
    </div>
    <div style={corpo}>
      A doença aparece principalmente entre <Destaque>20 e 45 anos</Destaque>.
    </div>
  </Claro>
);

const Sinais: React.FC = () => (
  <Claro n={5}>
    <Titulo>SINAIS DE ALERTA</Titulo>
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <Item>Cansaço e desânimo</Item>
      <Item>Febre baixa</Item>
      <Item>Dor e inchaço nas juntas</Item>
      <Item>Manchas na pele com o sol</Item>
      <Item>Queda de cabelo</Item>
    </div>
    <div style={{...corpo, fontSize: 42}}>
      Notou sinais assim? <Destaque>Procure um reumatologista.</Destaque>
    </div>
  </Claro>
);

const PorQueBorboleta: React.FC = () => (
  <Escuro n={6} rodape={FONTE_SBR}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center'}}>
      <Borboleta tamanho={400} abertura={0.95} brilho={1.2} />
    </div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 640, display: 'flex', flexDirection: 'column', gap: 40}}>
      <div style={{...textoMarca(84), whiteSpace: 'normal', lineHeight: 1.05, filter: `drop-shadow(0 0 26px ${C.claro}88)`}}>POR QUE A BORBOLETA?</div>
      <div style={{fontFamily: FONTE, fontWeight: 500, fontSize: 46, lineHeight: 1.38, color: C.creme}}>
        A mancha mais típica aparece nas <span style={{fontWeight: 700, color: C.lavanda}}>maçãs do rosto e no nariz</span>, no desenho das asas de uma borboleta.
      </div>
    </div>
  </Escuro>
);

const Tratamento: React.FC = () => (
  <Claro n={7} rodape="Fonte: Sociedade Brasileira de Reumatologia">
    <Titulo>BOM SABER</Titulo>
    <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
      {['Não é contagioso.', 'Tem diagnóstico e tratamento.'].map((t) => (
        <div key={t} style={{display: 'flex', alignItems: 'center', gap: 24, fontFamily: FONTE, fontWeight: 700, fontSize: 52, color: C.profundo}}>
          <div style={{width: 58, height: 58, borderRadius: 29, background: C.medio, color: C.creme, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, flexShrink: 0}}>✓</div>
          {t}
        </div>
      ))}
    </div>
    <div style={corpo}>
      Com acompanhamento do <Destaque>reumatologista</Destaque>, dá para controlar a doença.
    </div>
  </Claro>
);

const Fecho: React.FC = () => (
  <Escuro n={8}>
    <div style={{position: 'absolute', left: 90, right: 90, top: 300, display: 'flex', flexDirection: 'column', gap: 44}}>
      <div style={{...textoMarca(100), whiteSpace: 'normal', lineHeight: 1.04, filter: `drop-shadow(0 0 30px ${C.claro}99)`}}>INFORMAÇÃO TAMBÉM É CUIDADO.</div>
      <div style={{fontFamily: FONTE, fontWeight: 500, fontSize: 48, lineHeight: 1.35, color: C.lavanda}}>Compartilhe com quem precisa saber.</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{rotate: '-12deg'}}>
          <Borboleta tamanho={70} abertura={0.9} brilho={0.6} />
        </div>
        <div style={{...textoMarca(46), filter: `drop-shadow(0 0 16px ${C.claro}aa)`}}>{NOME}</div>
      </div>
      <div style={{fontFamily: FONTE, fontWeight: 500, fontSize: 26, letterSpacing: '0.4em', paddingLeft: '0.4em', color: C.lavanda}}>{SLOGAN}</div>
    </div>
  </Escuro>
);

export const SLIDES_CRIS = [Capa, OQueE, Onde, Quem, Sinais, PorQueBorboleta, Tratamento, Fecho];
// Batidas na tela por slide (72 BPM): meio segundo mais 0,3 s por palavra, arredondado para o compasso da trilha
export const TEMPOS_CRIS = [4, 7, 6, 6, 7, 7, 6, 5];

export const SlideCris: React.FC<{indice: number}> = ({indice}) => {
  const Componente = SLIDES_CRIS[indice] ?? Capa;
  return <Componente />;
};
