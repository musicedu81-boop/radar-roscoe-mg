import {Composition} from 'remotion';
import {Carreata} from './Carreata';
import batida from './batida.json';

// Duração vem da batida: 100 semicolcheias de 0,1s = 10s
export const Root = () => (
  <Composition id="Carreata" component={Carreata} durationInFrames={Math.round(batida.passos * batida.passoSegundos * 30)} fps={30} width={1080} height={1920} />
);
