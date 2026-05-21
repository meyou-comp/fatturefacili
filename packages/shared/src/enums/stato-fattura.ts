// ──── Stato Fattura ──────────────────────────────────────
export const StatoFattura = {
  BOZZA: 'BOZZA',
  EMESSA: 'EMESSA',
  INVIATA_SDI: 'INVIATA_SDI',
  IN_ELABORAZIONE_SDI: 'IN_ELABORAZIONE_SDI',
  ACCETTATA_SDI: 'ACCETTATA_SDI',
  CONSEGNATA: 'CONSEGNATA',
  MANCATA_CONSEGNA: 'MANCATA_CONSEGNA',
  RIFIUTATA_SDI: 'RIFIUTATA_SDI',
  IMPOSSIBILE_RECAPITO: 'IMPOSSIBILE_RECAPITO',
  PAGATA: 'PAGATA',
  PARZIALMENTE_PAGATA: 'PARZIALMENTE_PAGATA',
  SCADUTA: 'SCADUTA',
  ANNULLATA: 'ANNULLATA',
  STORNATA: 'STORNATA',
} as const;
export type StatoFattura = (typeof StatoFattura)[keyof typeof StatoFattura];

/** Label italiano */
export const STATO_FATTURA_LABELS: Record<StatoFattura, string> = {
  BOZZA: 'Bozza',
  EMESSA: 'Emessa',
  INVIATA_SDI: 'Inviata a SDI',
  IN_ELABORAZIONE_SDI: 'In elaborazione SDI',
  ACCETTATA_SDI: 'Accettata da SDI',
  CONSEGNATA: 'Consegnata',
  MANCATA_CONSEGNA: 'Mancata consegna',
  RIFIUTATA_SDI: 'Rifiutata da SDI',
  IMPOSSIBILE_RECAPITO: 'Impossibilità di recapito',
  PAGATA: 'Pagata',
  PARZIALMENTE_PAGATA: 'Parzialmente pagata',
  SCADUTA: 'Scaduta',
  ANNULLATA: 'Annullata',
  STORNATA: 'Stornata',
};

/** Colori badge per stato (Tailwind) */
export const STATO_FATTURA_COLORS: Record<StatoFattura, { bg: string; text: string }> = {
  BOZZA: { bg: 'bg-gray-100', text: 'text-gray-700' },
  EMESSA: { bg: 'bg-blue-100', text: 'text-blue-700' },
  INVIATA_SDI: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  IN_ELABORAZIONE_SDI: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ACCETTATA_SDI: { bg: 'bg-green-100', text: 'text-green-700' },
  CONSEGNATA: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  MANCATA_CONSEGNA: { bg: 'bg-orange-100', text: 'text-orange-700' },
  RIFIUTATA_SDI: { bg: 'bg-red-100', text: 'text-red-700' },
  IMPOSSIBILE_RECAPITO: { bg: 'bg-red-100', text: 'text-red-700' },
  PAGATA: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PARZIALMENTE_PAGATA: { bg: 'bg-amber-100', text: 'text-amber-700' },
  SCADUTA: { bg: 'bg-red-100', text: 'text-red-700' },
  ANNULLATA: { bg: 'bg-gray-100', text: 'text-gray-500' },
  STORNATA: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

// ──── Stato Preventivo ──────────────────────────────────
export const StatoPreventivo = {
  BOZZA: 'BOZZA',
  INVIATO: 'INVIATO',
  ACCETTATO: 'ACCETTATO',
  RIFIUTATO: 'RIFIUTATO',
  SCADUTO: 'SCADUTO',
  FATTURATO: 'FATTURATO',
} as const;
export type StatoPreventivo = (typeof StatoPreventivo)[keyof typeof StatoPreventivo];
