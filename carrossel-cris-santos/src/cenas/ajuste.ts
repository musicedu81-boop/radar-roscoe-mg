import {fitText} from '@remotion/layout-utils';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {fontesCarregadas} from '../fonte';
import {FAMILIA} from '../tokens';

// Tamanho de fonte (Montserrat 900) para a palavra caber na largura, com teto; espera a fonte carregar
export const useAjuste = (texto: string, largura: number, maximo: number) => {
  const [fs, setFs] = useState<number | null>(null);
  const [espera] = useState(() => delayRender(`Medindo "${texto}"`));
  useEffect(() => {
    fontesCarregadas.then(() => {
      const {fontSize} = fitText({text: texto, withinWidth: largura, fontFamily: FAMILIA, fontWeight: '900', letterSpacing: '0.01em'});
      setFs(Math.min(maximo, fontSize));
      continueRender(espera);
    });
  }, [espera, texto, largura, maximo]);
  return fs;
};
