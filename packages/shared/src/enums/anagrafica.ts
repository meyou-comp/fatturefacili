// ──── Tipo Soggetto ──────────────────────────────────────
export const TipoSoggetto = {
  PERSONA_FISICA: 'PERSONA_FISICA',
  PERSONA_GIURIDICA: 'PERSONA_GIURIDICA',
  ASSOCIAZIONE: 'ASSOCIAZIONE',
  ENTE_PUBBLICO: 'ENTE_PUBBLICO',
} as const;
export type TipoSoggetto = (typeof TipoSoggetto)[keyof typeof TipoSoggetto];

// ──── Tipo Cliente ───────────────────────────────────────
export const TipoCliente = {
  PRIVATO: 'PRIVATO',
  AZIENDA: 'AZIENDA',
  PA: 'PA',
  PROFESSIONISTA: 'PROFESSIONISTA',
  ASSOCIAZIONE: 'ASSOCIAZIONE',
} as const;
export type TipoCliente = (typeof TipoCliente)[keyof typeof TipoCliente];

// ──── Tipo Attività ──────────────────────────────────────
export const TipoAttivita = {
  ASILO_NIDO: 'ASILO_NIDO',
  SCUOLA_INFANZIA: 'SCUOLA_INFANZIA',
  CENTRO_EDUCATIVO: 'CENTRO_EDUCATIVO',
  LIBERO_PROFESSIONISTA: 'LIBERO_PROFESSIONISTA',
  PMI: 'PMI',
  ARTIGIANO: 'ARTIGIANO',
  COMMERCIANTE: 'COMMERCIANTE',
  ASSOCIAZIONE: 'ASSOCIAZIONE',
  ONLUS: 'ONLUS',
  STUDIO_COMMERCIALISTA: 'STUDIO_COMMERCIALISTA',
  ALTRO: 'ALTRO',
} as const;
export type TipoAttivita = (typeof TipoAttivita)[keyof typeof TipoAttivita];
