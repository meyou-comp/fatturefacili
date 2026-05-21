/** Aliquote IVA standard italiane */
export const ALIQUOTE_IVA = [22, 10, 5, 4, 0] as const;
export type AliquotaIVA = (typeof ALIQUOTE_IVA)[number];

/** Nature IVA per operazioni esenti/escluse/non soggette */
export const NATURE_IVA = {
  N1: { codice: 'N1', descrizione: 'Escluse ex art. 15' },
  N2_1: { codice: 'N2.1', descrizione: 'Non soggette ad IVA - artt. da 7 a 7-septies' },
  N2_2: { codice: 'N2.2', descrizione: 'Non soggette - altri casi' },
  N3_1: { codice: 'N3.1', descrizione: 'Non imponibili - esportazioni' },
  N3_2: { codice: 'N3.2', descrizione: 'Non imponibili - cessioni intracomunitarie' },
  N3_3: { codice: 'N3.3', descrizione: 'Non imponibili - verso San Marino' },
  N3_4: { codice: 'N3.4', descrizione: 'Non imponibili - operazioni assimilate' },
  N3_5: { codice: 'N3.5', descrizione: "Non imponibili - dichiarazione d'intento" },
  N3_6: { codice: 'N3.6', descrizione: 'Non imponibili - altre operazioni' },
  N4: { codice: 'N4', descrizione: 'Esenti' },
  N5: { codice: 'N5', descrizione: 'Regime del margine / IVA non esposta' },
  N6_1: { codice: 'N6.1', descrizione: 'Inversione contabile - cessione rottami' },
  N6_2: { codice: 'N6.2', descrizione: 'Inversione contabile - cessione oro/argento' },
  N6_3: { codice: 'N6.3', descrizione: 'Inversione contabile - subappalto edilizia' },
  N6_4: { codice: 'N6.4', descrizione: 'Inversione contabile - cessione fabbricati' },
  N6_5: { codice: 'N6.5', descrizione: 'Inversione contabile - cessione cellulari' },
  N6_6: { codice: 'N6.6', descrizione: 'Inversione contabile - cessione elettronica' },
  N6_7: { codice: 'N6.7', descrizione: 'Inversione contabile - edilizia e settori connessi' },
  N6_8: { codice: 'N6.8', descrizione: 'Inversione contabile - operazioni energia' },
  N6_9: { codice: 'N6.9', descrizione: 'Inversione contabile - altri casi' },
  N7: { codice: 'N7', descrizione: 'IVA assolta in altro stato UE' },
} as const;

/** Soglia bollo virtuale */
export const SOGLIA_BOLLO = 77.47;
export const IMPORTO_BOLLO = 2.0;

/** Soglia ricavi regime forfettario */
export const SOGLIA_FORFETTARIO = 85_000;

/** Codice destinatario per privati senza PEC */
export const CODICE_SDI_PRIVATO = '0000000';
