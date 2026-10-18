import {Audio} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import {useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, cancelRender, continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {type Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {LuzVazada} from '../LuzVazada';
import {useTempos} from '../roteiro';
import {C} from '../tokens';
import {Cena, FOV} from './Cena';

type Recursos = {black: Font; medium: Font; rosto: THREE.Texture};

const useRecursos = () => {
  const [rec, setRec] = useState<Recursos | null>(null);
  const [h] = useState(() => delayRender('Carregando fontes 3D e retrato'));
  useEffect(() => {
    const loader = new FontLoader();
    const fonte = (p: string) =>
      fetch(staticFile(p))
        .then((r) => r.json())
        .then((j) => loader.parse(j));
    Promise.all([fonte('fonts/montserrat-900.typeface.json'), fonte('fonts/montserrat-500.typeface.json'), new THREE.TextureLoader().loadAsync(staticFile('rosto.png'))])
      .then(([black, medium, rosto]) => {
        rosto.colorSpace = THREE.SRGBColorSpace;
        rosto.anisotropy = 8;
        setRec({black, medium, rosto});
        continueRender(h);
      })
      .catch((e) => cancelRender(e));
  }, [h]);
  return rec;
};

export const Vinheta3D: React.FC = () => {
  const {width, height} = useVideoConfig();
  const T = useTempos();
  const rec = useRecursos();
  return (
    <AbsoluteFill style={{background: C.noite}}>
      {rec ? (
        <ThreeCanvas
          width={width}
          height={height}
          dpr={1}
          camera={{fov: FOV, near: 0.5, far: 400, position: [0, 0, 40]}}
          gl={{antialias: false, powerPreference: 'high-performance'}}
          onCreated={({gl}) => {
            gl.localClippingEnabled = true;
          }}
        >
          <Cena {...rec} />
        </ThreeCanvas>
      ) : null}
      <Sequence from={T.rise - 8} durationInFrames={T.merge - T.rise + 30} layout="none">
        <LuzVazada seed={7} intensidade={0.28} />
      </Sequence>
      <Audio src={staticFile('trilha.wav')} />
    </AbsoluteFill>
  );
};
