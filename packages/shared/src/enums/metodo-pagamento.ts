// ──── Metodo Pagamento (codici FatturaPA) ────────────────
export const MetodoPagamento = {
  CONTANTI: 'CONTANTI',                     // MP01
  ASSEGNO: 'ASSEGNO',                       // MP02
  ASSEGNO_CIRCOLARE: 'ASSEGNO_CIRCOLARE',   // MP03
  CONTANTI_BANCA: 'CONTANTI_BANCA',         // MP04
  BONIFICO: 'BONIFICO',                     // MP05
  VAGLIA_CAMBIALE: 'VAGLIA_CAMBIALE',       // MP06
  BOLLETTINO_BANC: 'BOLLETTINO_BANC',       // MP07
  CARTA_PAGAMENTO: 'CARTA_PAGAMENTO',       // MP08
  RID: 'RID',                               // MP09
  RID_UTENZE: 'RID_UTENZE',                 // MP10
  RID_VELOCE: 'RID_VELOCE',                 // MP11
  RIBA: 'RIBA',                             // MP12
  MAV: 'MAV',                               // MP13
  QUIETANZA_ERARIO: 'QUIETANZA_ERARIO',     // MP14
  GIROCONTO: 'GIROCONTO',                   // MP15
  DOMICILIAZIONE_BANC: 'DOMICILIAZIONE_BANC', // MP16
  DOMICILIAZIONE_POST: 'DOMICILIAZIONE_POST', // MP17
  BOLLETTINO_POSTALE: 'BOLLETTINO_POSTALE', // MP18
  SEPA: 'SEPA',                             // MP19
  SEPA_CORE: 'SEPA_CORE',                   // MP20
  SEPA_B2B: 'SEPA_B2B',                     // MP21
  TRATTENUTA: 'TRATTENUTA',                 // MP22
  PAGOPA: 'PAGOPA',                         // MP23
  SATISPAY: 'SATISPAY',
  ALTRO: 'ALTRO',
} as const;
export type MetodoPagamento = (typeof MetodoPagamento)[keyof typeof MetodoPagamento];

/** Mappatura → codice FatturaPA */
export const METODO_PAGAMENTO_TO_CODE: Record<MetodoPagamento, string> = {
  CONTANTI: 'MP01',
  ASSEGNO: 'MP02',
  ASSEGNO_CIRCOLARE: 'MP03',
  CONTANTI_BANCA: 'MP04',
  BONIFICO: 'MP05',
  VAGLIA_CAMBIALE: 'MP06',
  BOLLETTINO_BANC: 'MP07',
  CARTA_PAGAMENTO: 'MP08',
  RID: 'MP09',
  RID_UTENZE: 'MP10',
  RID_VELOCE: 'MP11',
  RIBA: 'MP12',
  MAV: 'MP13',
  QUIETANZA_ERARIO: 'MP14',
  GIROCONTO: 'MP15',
  DOMICILIAZIONE_BANC: 'MP16',
  DOMICILIAZIONE_POST: 'MP17',
  BOLLETTINO_POSTALE: 'MP18',
  SEPA: 'MP19',
  SEPA_CORE: 'MP20',
  SEPA_B2B: 'MP21',
  TRATTENUTA: 'MP22',
  PAGOPA: 'MP23',
  SATISPAY: 'MP99',
  ALTRO: 'MP99',
};

/** Label italiano */
export const METODO_PAGAMENTO_LABELS: Record<MetodoPagamento, string> = {
  CONTANTI: 'Contanti',
  ASSEGNO: 'Assegno',
  ASSEGNO_CIRCOLARE: 'Assegno circolare',
  CONTANTI_BANCA: 'Contanti presso tesoreria',
  BONIFICO: 'Bonifico',
  VAGLIA_CAMBIALE: 'Vaglia cambiario',
  BOLLETTINO_BANC: 'Bollettino bancario',
  CARTA_PAGAMENTO: 'Carta di pagamento',
  RID: 'RID',
  RID_UTENZE: 'RID utenze',
  RID_VELOCE: 'RID veloce',
  RIBA: 'RIBA',
  MAV: 'MAV',
  QUIETANZA_ERARIO: 'Quietanza erario',
  GIROCONTO: 'Giroconto',
  DOMICILIAZIONE_BANC: 'Domiciliazione bancaria',
  DOMICILIAZIONE_POST: 'Domiciliazione postale',
  BOLLETTINO_POSTALE: 'Bollettino postale',
  SEPA: 'SEPA Direct Debit',
  SEPA_CORE: 'SEPA DD Core',
  SEPA_B2B: 'SEPA DD B2B',
  TRATTENUTA: 'Trattenuta su somme già riscosse',
  PAGOPA: 'PagoPA',
  SATISPAY: 'Satispay',
  ALTRO: 'Altro',
};
