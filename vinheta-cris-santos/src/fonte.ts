import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const FAMILIA = 'Montserrat';

export const fonteCarregada = Promise.all(
  [500, 900].map((w) => loadFont({family: FAMILIA, url: staticFile(`fonts/montserrat-latin-${w}-normal.woff2`), weight: String(w)})),
);
