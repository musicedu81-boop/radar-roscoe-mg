import {Composition} from 'remotion';
import {Carreata} from './Carreata';

export const Root = () => (
  <Composition id="Carreata" component={Carreata} durationInFrames={240} fps={30} width={1080} height={1920} />
);
