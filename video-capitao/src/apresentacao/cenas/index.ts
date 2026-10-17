import type React from "react";
import { CenaAbertura } from "./Abertura";
import { CenaNumeros } from "./Numeros";
import { CenaRitmo } from "./Ritmo";
import { CenaReels } from "./Reels";
import { CenaPilares } from "./Pilares";
import { CenaEstrategia } from "./Estrategia";
import { CenaSemana } from "./Semana";
import { CenaJanela } from "./Janela";
import { CenaCalendario } from "./Calendario";
import { CenaMetas } from "./Metas";
import { CenaCrise } from "./Crise";
import { CenaEncerramento } from "./Encerramento";

// Componente de cada cena, pelo id do roteiro
export const COMPONENTES: Record<string, React.FC> = {
  abertura: CenaAbertura,
  numeros: CenaNumeros,
  ritmo: CenaRitmo,
  reels: CenaReels,
  pilares: CenaPilares,
  estrategia: CenaEstrategia,
  semana: CenaSemana,
  janela: CenaJanela,
  calendario: CenaCalendario,
  metas: CenaMetas,
  crise: CenaCrise,
  encerramento: CenaEncerramento,
};
