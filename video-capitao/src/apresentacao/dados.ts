import type { Pilar } from "./marca";

// Todos os dados vêm do artifact "Planejamento Estratégico Capitão" (Talentos Business).
// Fontes citadas no próprio plano: Metricool (@capitaovitorprado, 28/07 a 16/10/2026),
// perfil público do Instagram e plano de março/2026. Não inventar números aqui.

export const PLANO = {
  titulo: "Planejamento Estratégico",
  cliente: "Capitão Vítor Prado",
  cidade: "Timóteo, MG",
  agencia: "Talentos Business",
  periodo: { inicio: "26/10", fim: "31/12/2026" },
  lema: "Gestão que entrega, prefeito que aparece",
  estreia: "O plano entra no ar em 26/10",
  semPautaEleitoral: true,
};

// Aba Visão Geral: os quatro números de partida
export const NUMEROS = {
  seguidoresHoje: { valor: 25850, legenda: "Seguidores hoje", fonte: "Metricool, 16/10/2026" },
  meta: { valor: 27000, legenda: "Meta 31/12", nota: "proposta realista, +1.150" },
  desafio: { valor: 28000, legenda: "Desafio 31/12", nota: "exige 28 novos por dia" },
  viewsPorReel: { valor: 3.6, proposta: 5, legenda: "Views por Reel (mil)", nota: "mediana desde 06/10" },
};

// Aba Metas e Diagnóstico: ritmo de crescimento (seguidores por dia)
export const RITMO = {
  seguidores2807: 24708,
  seguidores1610: 25850,
  ganho11Semanas: 1142,
  mediaPorDia: 14,
  ganhoNoPico: 865, // 14/09 a 05/10, pico de crise e campanha
  percentualNoPico: 76,
  ritmoAtualPorDia: 6, // desde 06/10
  dia1410: { sairam: 28, entraram: 14 },
  necessario: [
    { meta: "27 mil", porDia: 15, leitura: "meta realista" },
    { meta: "28 mil", porDia: 28, leitura: "desafio" },
    { meta: "32 mil", porDia: 81, leitura: "não fecha" },
  ],
};

// Metas propostas
export const METAS = [
  { data: "30/11", seguidores: 26400, leitura: "Marco intermediário, 15 por dia" },
  { data: "31/12", seguidores: 27000, leitura: "Meta realista" },
  { data: "31/12", seguidores: 28000, leitura: "Desafio: exige um novo momento de alta" },
];

// KPIs de acompanhamento (proposta)
export const KPIS = [
  { indicador: "Mediana de views por Reel", hoje: "3,6 mil", meta: "5 mil", hojeNum: 3.6, metaNum: 5, fonte: "Metricool" },
  { indicador: "Seguidores líquidos por semana", hoje: "cerca de 40", meta: "105", hojeNum: 40, metaNum: 105, fonte: "Metricool" },
  { indicador: "Quadros na janela de 10h a 12h ou 18h", hoje: "a medir", meta: "70%", hojeNum: null, metaNum: 70, fonte: "Metricool" },
  { indicador: "Quadros publicados no dia fixo", hoje: "a medir", meta: "90%", hojeNum: null, metaNum: 90, fonte: "Calendário" },
];

// O que o perfil mostrou (16/09 a 16/10): os 5 Reels de maior alcance
export const TOP_REELS: { titulo: string; data: string; views: number; compartilhamentos: number; pilar: Pilar }[] = [
  { titulo: "Temporal, resposta da prefeitura", data: "17/09", views: 105385, compartilhamentos: 657, pilar: "Utilidade" },
  { titulo: "Bairro Alegre, equipes da Cemig e doações", data: "18/09", views: 30452, compartilhamentos: 178, pilar: "Utilidade" },
  { titulo: "Humanizar, Semana do Idoso", data: "01/10", views: 19694, compartilhamentos: 101, pilar: "Cuidado" },
  { titulo: "Comunicado oficial da Cemig", data: "18/09", views: 17597, compartilhamentos: 168, pilar: "Utilidade" },
  { titulo: "Homenagem à Polícia Militar", data: "09/10", views: 16763, compartilhamentos: 85, pilar: "Orgulho" },
];

export const FUNCIONA = [
  "O Capitão como fonte de informação útil na hora crítica",
  "Identidade e orgulho da cidade",
  "Pessoas reais, com nome e rosto",
  "Obra com morador ganha mais que obra sem rosto",
];
export const NAO_FUNCIONA = [
  "Comunicados institucionais e legendas longas sem gancho: abaixo de 3 mil views",
  "Volume sem série: sem eixo semanal nem quadro fixo",
];

// Três pilares, tirados do que performou
export const PILARES: { nome: Pilar; titulo: string; prova: string; views: string }[] = [
  { nome: "Utilidade", titulo: "Utilidade no momento crítico", prova: "Temporal de 17/09: o Capitão foi a fonte", views: "105 mil views" },
  { nome: "Orgulho", titulo: "Orgulho de Timóteo", prova: "Homenagem à Polícia Militar (09/10)", views: "16,8 mil views" },
  { nome: "Cuidado", titulo: "Cuidado com gente", prova: "Semana do Idoso (01/10)", views: "19,7 mil views" },
];
export const ARQUETIPO =
  "Gestor sóbrio e emocional. O gesto vem antes do discurso e o morador é o protagonista.";

export const ESTRATEGIA_CENTRAL = {
  titulo: "Quadros fixos",
  frase: "Cada um com uma função e um dia.",
  apoio: "O seguidor aprende o que esperar de cada dia. O algoritmo reconhece série, não post avulso.",
};

// Grade semanal: sete dias, um quadro por dia
export const SEMANA: { dia: string; sigla: string; quadro: string; funcao: string; formato: string; pilar: Pilar }[] = [
  { dia: "Segunda", sigla: "SEG", quadro: "Radar do Capitão", funcao: "O que todas as secretarias fazem esta semana", formato: "Reel 30 a 45s + Stories · 10h", pilar: "Utilidade" },
  { dia: "Terça", sigla: "TER", quadro: "A Saúde Tem Nome", funcao: "Um paciente, uma UBS, um nome", formato: "Reel 60s · 10h", pilar: "Cuidado" },
  { dia: "Quarta", sigla: "QUA", quadro: "Prefeito Cast ou Prefeito no Bairro", funcao: "Alterna a cada quinzena", formato: "Live 18h30 ou Reel às 10h", pilar: "Utilidade" },
  { dia: "Quinta", sigla: "QUI", quadro: "Vale a Pena Ver de Novo", funcao: "O TBT de obras do Capitão", formato: "Reel ou carrossel · 10h", pilar: "Orgulho" },
  { dia: "Sexta", sigla: "SEX", quadro: "E o Povo Aprova!", funcao: "Prints de comentários de moradores", formato: "Carrossel 5 a 7 slides · 10h", pilar: "Orgulho" },
  { dia: "Sábado", sigla: "SÁB", quadro: "Lo-fi", funcao: "O Capitão pessoa: família, fé, cidade e feira", formato: "Reel 30s ou Stories · 10h", pilar: "Cuidado" },
  { dia: "Domingo", sigla: "DOM", quadro: "Radar Resumo", funcao: "Recirculação, WhatsApp e o melhor clipe do Cast", formato: "Clipping + broadcast · 10h", pilar: "Utilidade" },
];

// Janela de publicação (Metricool)
export const JANELA = {
  picoPrincipal: "10h às 12h",
  segundoPico: "18h",
  diasUteis: "segunda a sexta",
  comparativo: [
    { rotulo: "Sexta, 10h", pontos: 6734 },
    { rotulo: "Sábado, 10h", pontos: 3409 },
  ],
  regra: "Os Reels dos quadros saem às 10h. Carrosséis extras saem às 18h.",
};

// Calendário: dez semanas, cada uma com um eixo
export const CALENDARIO: { semana: number; datas: string; eixo: string; destaque: string }[] = [
  { semana: 1, datas: "26/10 a 01/11", eixo: "Saúde e bem-estar", destaque: "Estreia do plano em 26/10" },
  { semana: 2, datas: "02/11 a 08/11", eixo: "Obras e infraestrutura", destaque: "Os Números: dados de outubro (04/11)" },
  { semana: 3, datas: "09/11 a 15/11", eixo: "Educação e juventude", destaque: "Dia Mundial do Diabetes (14/11)" },
  { semana: 4, datas: "16/11 a 22/11", eixo: "Gestão e transparência", destaque: "Consciência Negra (20/11)" },
  { semana: 5, datas: "23/11 a 29/11", eixo: "Saúde e bem-estar", destaque: "Novembro Azul na reta final" },
  { semana: 6, datas: "30/11 a 06/12", eixo: "Obras e infraestrutura", destaque: "Os Números: dados de novembro (02/12)" },
  { semana: 7, datas: "07/12 a 13/12", eixo: "Educação e juventude", destaque: "Encerramento do ano nas escolas e CEIs" },
  { semana: 8, datas: "14/12 a 20/12", eixo: "Gestão e transparência", destaque: "Prestação de contas do ano no Radar" },
  { semana: 9, datas: "21/12 a 27/12", eixo: "Cuidado com gente", destaque: "Natal: tom sóbrio e humano" },
  { semana: 10, datas: "28/12 a 31/12", eixo: "Balanço 2026", destaque: "Radar do Ano e Cast especial" },
];

// Contingência: protocolo de resposta a crise
export const CRISE = {
  gatilho: "Em 17/09, o temporal levou o perfil a 105 mil views em um Reel e 320 seguidores novos em um dia.",
  passos: [
    { quando: "2 horas", acao: "Comunicado curto, uma única fonte oficial. Capitão em campo, em vídeo direto." },
    { quando: "Agora", acao: "Utilidade primeiro: onde pedir ajuda, telefones, pontos de doação." },
    { quando: "Horário fixo", acao: "Atualização mesmo sem novidade, para o silêncio não virar boato." },
    { quando: "72 horas", acao: "Retomar os quadros da semana." },
  ],
  regraDeOuro: "Nunca mentir, ajustar o enquadramento.",
};
