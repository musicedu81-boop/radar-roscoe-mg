import React from "react";
import { C } from "./theme";

/** Ícones em recorte de papel com contorno de tinta (viewBox 100x100). */
const S = { stroke: C.tinta, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type IconName =
  | "fabrica"
  | "arvore"
  | "casa"
  | "escola"
  | "hospital"
  | "clube"
  | "trem"
  | "rio"
  | "vaca"
  | "tropeiro"
  | "venda"
  | "urna"
  | "martelo"
  | "bobina"
  | "pata"
  | "macaco"
  | "montanha"
  | "moeda"
  | "documento"
  | "check"
  | "x"
  | "pessoa"
  | "carvao"
  | "escudo"
  | "lagoa"
  | "pergunta"
  | "corrente";

export const Icon: React.FC<{ name: IconName; size?: number; color?: string; color2?: string; style?: React.CSSProperties }> = ({
  name,
  size = 120,
  color,
  color2,
  style,
}) => {
  const g = (() => {
    switch (name) {
      case "fabrica":
        return (
          <g {...S}>
            <rect x={18} y={20} width={10} height={36} fill={color2 ?? C.cinzaClaro} />
            <rect x={34} y={30} width={10} height={26} fill={color2 ?? C.cinzaClaro} />
            <path d="M8 92 L8 54 L30 42 L30 54 L52 42 L52 54 L74 42 L74 54 L92 54 L92 92 Z" fill={color ?? C.aco} />
            <rect x={18} y={66} width={12} height={12} fill={C.marca} />
            <rect x={42} y={66} width={12} height={12} fill={C.marca} />
            <rect x={66} y={66} width={12} height={12} fill={C.marca} />
          </g>
        );
      case "arvore":
        return (
          <g {...S}>
            <rect x={44} y={62} width={12} height={30} fill={C.terra} />
            <path d="M50 6 L82 50 L66 50 L88 74 L12 74 L34 50 L18 50 Z" fill={color ?? C.mata} />
          </g>
        );
      case "casa":
        return (
          <g {...S}>
            <path d="M12 48 L50 14 L88 48" fill="none" />
            <path d="M20 44 L50 18 L80 44 L80 90 L20 90 Z" fill={color ?? C.papelClaro} />
            <rect x={42} y={62} width={16} height={28} fill={color2 ?? C.aco} />
            <rect x={26} y={52} width={12} height={12} fill={C.marca} />
          </g>
        );
      case "escola":
        return (
          <g {...S}>
            <path d="M10 46 L50 16 L90 46 Z" fill={color2 ?? C.aco} />
            <rect x={16} y={46} width={68} height={44} fill={color ?? C.papelClaro} />
            <rect x={42} y={64} width={16} height={26} fill={C.tinta2} />
            <circle cx={50} cy={36} r={6} fill={C.marca} />
            <rect x={24} y={56} width={10} height={10} fill={C.rioClaro} />
            <rect x={66} y={56} width={10} height={10} fill={C.rioClaro} />
          </g>
        );
      case "hospital":
        return (
          <g {...S}>
            <rect x={14} y={22} width={72} height={68} fill={color ?? C.papelClaro} />
            <path d="M44 34 H56 V46 H68 V58 H56 V70 H44 V58 H32 V46 H44 Z" fill={color2 ?? C.aco} />
          </g>
        );
      case "clube":
        return (
          <g {...S}>
            <circle cx={50} cy={52} r={36} fill={color ?? C.papelClaro} />
            <path d="M50 30 L70 44 L62 68 L38 68 L30 44 Z" fill={C.tinta} />
            <path d="M50 16 L50 30 M84 44 L70 44 M74 80 L62 68 M26 80 L38 68 M16 44 L30 44" fill="none" />
          </g>
        );
      case "trem":
        return (
          <g {...S}>
            <rect x={12} y={26} width={58} height={46} rx={6} fill={color ?? C.marca} />
            <rect x={70} y={40} width={20} height={32} fill={color2 ?? C.aco} />
            <rect x={20} y={34} width={16} height={14} fill={C.rioClaro} />
            <rect x={44} y={34} width={16} height={14} fill={C.rioClaro} />
            <circle cx={28} cy={80} r={9} fill={C.tinta2} />
            <circle cx={58} cy={80} r={9} fill={C.tinta2} />
            <circle cx={82} cy={80} r={7} fill={C.tinta2} />
          </g>
        );
      case "rio":
        return (
          <g {...S} fill="none" stroke={color ?? C.rio} strokeWidth={8}>
            <path d="M8 34 C24 22 38 46 54 34 C70 22 80 44 92 34" />
            <path d="M8 56 C24 44 38 68 54 56 C70 44 80 66 92 56" />
            <path d="M8 78 C24 66 38 90 54 78 C70 66 80 88 92 78" />
          </g>
        );
      case "vaca":
        return (
          <g {...S}>
            <rect x={18} y={36} width={56} height={32} rx={12} fill={color ?? C.papelClaro} />
            <circle cx={36} cy={50} r={7} fill={C.tinta} />
            <circle cx={58} cy={46} r={5} fill={C.tinta} />
            <rect x={70} y={26} width={22} height={24} rx={8} fill={color ?? C.papelClaro} />
            <path d="M74 26 L70 16 M88 26 L92 16" />
            <path d="M24 68 V88 M36 68 V88 M58 68 V88 M68 68 V88" strokeWidth={6} />
          </g>
        );
      case "tropeiro":
        return (
          <g {...S}>
            <path d="M14 54 Q14 40 30 40 L62 40 Q74 40 74 52 L74 60 L14 60 Z" fill={color ?? C.terra} />
            <path d="M74 44 L86 28 L94 34 L82 52 Z" fill={color ?? C.terra} />
            <path d="M20 60 V86 M32 60 V86 M58 60 V86 M70 60 V86" strokeWidth={6} />
            <rect x={26} y={26} width={30} height={16} fill={color2 ?? C.aco} />
            <path d="M90 30 L92 22" />
          </g>
        );
      case "venda":
        return (
          <g {...S}>
            <rect x={16} y={40} width={68} height={50} fill={color ?? C.papelClaro} />
            <path d="M10 40 L20 18 L80 18 L90 40 Z" fill={color2 ?? C.aco} />
            <path d="M24 18 L18 40 M40 18 L38 40 M60 18 L62 40 M76 18 L82 40" />
            <rect x={28} y={54} width={18} height={36} fill={C.terra} />
            <rect x={54} y={54} width={22} height={18} fill={C.marca} />
          </g>
        );
      case "urna":
        return (
          <g {...S}>
            <rect x={16} y={40} width={68} height={50} fill={color ?? C.papelClaro} />
            <rect x={36} y={38} width={28} height={6} fill={C.tinta} />
            <path d="M40 10 L64 14 L60 40 L36 36 Z" fill={C.marca} />
            <path d="M32 66 H68" />
          </g>
        );
      case "martelo":
        return (
          <g {...S}>
            <rect x={22} y={22} width={44} height={22} rx={4} fill={color ?? C.terra} transform="rotate(-30 44 33)" />
            <path d="M48 44 L80 86" strokeWidth={10} stroke={C.tinta} />
            <rect x={12} y={84} width={44} height={8} fill={C.tinta2} />
          </g>
        );
      case "bobina":
        return (
          <g {...S}>
            <ellipse cx={34} cy={52} rx={18} ry={34} fill={C.cinzaClaro} />
            <path d="M34 18 L70 18 A18 34 0 0 1 70 86 L34 86" fill={color ?? "#d9dde0"} />
            <ellipse cx={34} cy={52} rx={18} ry={34} fill={color ?? "#eef1f3"} />
            <ellipse cx={34} cy={52} rx={7} ry={13} fill={C.tinta2} />
            <path d="M28 30 A18 34 0 0 0 28 74" fill="none" stroke="#9aa3aa" strokeWidth={3} />
          </g>
        );
      case "pata":
        return (
          <g {...S} fill={color ?? C.terra}>
            <ellipse cx={50} cy={64} rx={20} ry={17} />
            <ellipse cx={24} cy={44} rx={9} ry={12} />
            <ellipse cx={40} cy={30} rx={9} ry={12} />
            <ellipse cx={60} cy={30} rx={9} ry={12} />
            <ellipse cx={76} cy={44} rx={9} ry={12} />
          </g>
        );
      case "macaco":
        return (
          <g {...S}>
            <path d="M58 60 C80 58 90 76 82 90" fill="none" strokeWidth={6} />
            <ellipse cx={46} cy={64} rx={20} ry={24} fill={color ?? C.terra} />
            <circle cx={46} cy={30} r={18} fill={color ?? C.terra} />
            <ellipse cx={46} cy={34} rx={11} ry={9} fill={C.tinta2} />
            <circle cx={41} cy={27} r={3} fill={C.papelClaro} stroke="none" />
            <circle cx={51} cy={27} r={3} fill={C.papelClaro} stroke="none" />
            <path d="M28 52 C14 40 10 24 16 12" fill="none" strokeWidth={6} />
          </g>
        );
      case "montanha":
        return (
          <g {...S}>
            <path d="M4 90 L36 30 L54 58 L66 40 L96 90 Z" fill={color ?? C.mataClara} />
            <path d="M36 30 L28 46 L36 42 L44 48 Z" fill={C.papelClaro} />
          </g>
        );
      case "moeda":
        return (
          <g {...S}>
            <circle cx={50} cy={50} r={36} fill={color ?? C.marca} />
            <circle cx={50} cy={50} r={26} fill="none" />
            <text x={50} y={62} fontSize={34} fontWeight={900} textAnchor="middle" fill={C.tinta} stroke="none" fontFamily="sans-serif">
              $
            </text>
          </g>
        );
      case "documento":
        return (
          <g {...S}>
            <path d="M22 8 L64 8 L80 24 L80 92 L22 92 Z" fill={color ?? C.papelClaro} />
            <path d="M64 8 L64 24 L80 24" fill="none" />
            <path d="M32 40 H70 M32 52 H70 M32 64 H58" />
          </g>
        );
      case "check":
        return (
          <g {...S}>
            <circle cx={50} cy={50} r={40} fill={color ?? C.mata} />
            <path d="M30 52 L44 66 L72 36" fill="none" stroke={C.papelClaro} strokeWidth={10} />
          </g>
        );
      case "x":
        return (
          <g {...S}>
            <circle cx={50} cy={50} r={40} fill={color ?? C.aco} />
            <path d="M34 34 L66 66 M66 34 L34 66" fill="none" stroke={C.papelClaro} strokeWidth={10} />
          </g>
        );
      case "pessoa":
        return (
          <g {...S}>
            <circle cx={50} cy={28} r={16} fill={color ?? C.tinta2} />
            <path d="M20 92 C20 60 80 60 80 92 Z" fill={color ?? C.tinta2} />
          </g>
        );
      case "carvao":
        return (
          <g {...S}>
            <path d="M14 80 L26 56 L44 62 L54 44 L72 52 L86 78 Z" fill={color ?? C.tinta2} />
            <path d="M30 40 C26 30 36 24 32 14 M56 34 C52 24 62 18 58 8" fill="none" stroke={C.cinza} strokeWidth={4} />
          </g>
        );
      case "escudo":
        return (
          <g {...S}>
            <path d="M50 8 L86 20 L86 48 C86 72 68 86 50 94 C32 86 14 72 14 48 L14 20 Z" fill={color ?? C.mata} />
            <path d="M50 26 L66 54 L58 54 L70 70 L30 70 L42 54 L34 54 Z" fill={C.mataClara} />
          </g>
        );
      case "lagoa":
        return (
          <g {...S}>
            <path d="M14 56 C10 34 40 26 58 32 C84 38 94 58 78 72 C62 86 18 82 14 56 Z" fill={color ?? C.rio} />
            <path d="M34 54 C42 50 50 58 58 54" fill="none" stroke={C.rioClaro} strokeWidth={4} />
          </g>
        );
      case "pergunta":
        return (
          <g {...S}>
            <circle cx={50} cy={50} r={40} fill={color ?? C.marca} />
            <text x={50} y={68} fontSize={54} fontWeight={900} textAnchor="middle" fill={C.tinta} stroke="none" fontFamily="sans-serif">
              ?
            </text>
          </g>
        );
      case "corrente":
        return (
          <g {...S} fill="none" strokeWidth={8}>
            <rect x={8} y={36} width={40} height={28} rx={14} stroke={color ?? C.tinta2} />
            <rect x={56} y={36} width={40} height={28} rx={14} stroke={color ?? C.tinta2} transform="rotate(14 76 50)" />
          </g>
        );
      default:
        return null;
    }
  })();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", ...style }}>
      {g}
    </svg>
  );
};
