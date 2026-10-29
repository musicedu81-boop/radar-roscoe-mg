import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {FAMILIA} from './tokens';

// Montserrat 500 (slogan e texto corrido), 700 (destaques) e 900 (marca e títulos)
export const fontesCarregadas = Promise.all(
  [500, 700, 900].map((w) => loadFont({family: FAMILIA, url: staticFile(`fonts/montserrat-latin-${w}-normal.woff2`), weight: String(w)})),
);
