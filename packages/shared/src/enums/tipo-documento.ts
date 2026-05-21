// ──── Tipo Documento (codici FatturaPA) ──────────────────
export const TipoDocumento = {
  FATTURA: 'FATTURA',                         // TD01
  ACCONTO_SU_FATTURA: 'ACCONTO_SU_FATTURA',   // TD02
  ACCONTO_SU_PARCELLA: 'ACCONTO_SU_PARCELLA', // TD03
  NOTA_CREDITO: 'NOTA_CREDITO',               // TD04
  NOTA_DEBITO: 'NOTA_DEBITO',                 // TD05
  PARCELLA: 'PARCELLA',                       // TD06
  FATTURA_SEMPLIFICATA: 'FATTURA_SEMPLIFICATA', // TD07
  NOTA_CREDITO_SEMP: 'NOTA_CREDITO_SEMP',     // TD08
  NOTA_DEBITO_SEMP: 'NOTA_DEBITO_SEMP',       // TD09
  AUTOFATTURA_ACQUISTI: 'AUTOFATTURA_ACQUISTI', // TD16
  AUTOFATTURA_REGOLARZ: 'AUTOFATTURA_REGOLARZ', // TD17
  INTEGRAZIONE_ACQUISTI: 'INTEGRAZIONE_ACQUISTI', // TD18
  INTEGRAZIONE_VENDITE: 'INTEGRAZIONE_VENDITE', // TD19
  AUTOFATTURA_REGOLARZ_2: 'AUTOFATTURA_REGOLARZ_2', // TD20
  FATTURA_DIFFERITA: 'FATTURA_DIFFERITA',     // TD24
  FATTURA_DIFF_COMMESS: 'FATTURA_DIFF_COMMESS', // TD25
} as const;
export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento];

/** Mappatura tipo documento → codice FatturaPA */
export const TIPO_DOCUMENTO_TO_CODE: Record<TipoDocumento, string> = {
  FATTURA: 'TD01',
  ACCONTO_SU_FATTURA: 'TD02',
  ACCONTO_SU_PARCELLA: 'TD03',
  NOTA_CREDITO: 'TD04',
  NOTA_DEBITO: 'TD05',
  PARCELLA: 'TD06',
  FATTURA_SEMPLIFICATA: 'TD07',
  NOTA_CREDITO_SEMP: 'TD08',
  NOTA_DEBITO_SEMP: 'TD09',
  AUTOFATTURA_ACQUISTI: 'TD16',
  AUTOFATTURA_REGOLARZ: 'TD17',
  INTEGRAZIONE_ACQUISTI: 'TD18',
  INTEGRAZIONE_VENDITE: 'TD19',
  AUTOFATTURA_REGOLARZ_2: 'TD20',
  FATTURA_DIFFERITA: 'TD24',
  FATTURA_DIFF_COMMESS: 'TD25',
};

/** Label italiano per tipo documento */
export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  FATTURA: 'Fattura',
  ACCONTO_SU_FATTURA: 'Acconto/Anticipo su Fattura',
  ACCONTO_SU_PARCELLA: 'Acconto/Anticipo su Parcella',
  NOTA_CREDITO: 'Nota di Credito',
  NOTA_DEBITO: 'Nota di Debito',
  PARCELLA: 'Parcella',
  FATTURA_SEMPLIFICATA: 'Fattura Semplificata',
  NOTA_CREDITO_SEMP: 'Nota di Credito Semplificata',
  NOTA_DEBITO_SEMP: 'Nota di Debito Semplificata',
  AUTOFATTURA_ACQUISTI: 'Autofattura per Acquisti',
  AUTOFATTURA_REGOLARZ: 'Autofattura per Regolarizzazione',
  INTEGRAZIONE_ACQUISTI: 'Integrazione Acquisti IntraUE',
  INTEGRAZIONE_VENDITE: 'Integrazione Vendite IntraUE',
  AUTOFATTURA_REGOLARZ_2: 'Autofattura per Regolarizzazione (TD20)',
  FATTURA_DIFFERITA: 'Fattura Differita',
  FATTURA_DIFF_COMMESS: 'Fattura Differita da Commessa',
};
