import { z } from 'zod';
import { importoSchema } from './common.schema';

export const rigaFatturaSchema = z.object({
  descrizione: z.string().min(1, 'La descrizione è obbligatoria').max(1000),
  quantita: z.number().positive('La quantità deve essere positiva'),
  unitaMisura: z.string().max(10).optional(),
  prezzoUnitario: z.number().nonnegative(),
  sconto: z.number().min(0).max(100).optional(),
  aliquotaIVA: z.number().min(0).max(100),
  naturaIVA: z.string().max(10).optional(),
  rifNormativo: z.string().max(200).optional(),
  prodottoId: z.string().optional(),
  // Asilo nido
  meseRiferimento: z.number().int().min(1).max(12).optional(),
  annoRiferimento: z.number().int().min(2020).max(2100).optional(),
  codiceFiscaleAlunno: z.string().optional(),
});

export const createFatturaSchema = z.object({
  clienteId: z.string().min(1, 'Il cliente è obbligatorio'),
  tipoDocumento: z.enum([
    'FATTURA', 'ACCONTO_SU_FATTURA', 'ACCONTO_SU_PARCELLA',
    'NOTA_CREDITO', 'NOTA_DEBITO', 'PARCELLA',
    'FATTURA_SEMPLIFICATA', 'NOTA_CREDITO_SEMP', 'NOTA_DEBITO_SEMP',
    'AUTOFATTURA_ACQUISTI', 'AUTOFATTURA_REGOLARZ',
    'INTEGRAZIONE_ACQUISTI', 'INTEGRAZIONE_VENDITE',
    'AUTOFATTURA_REGOLARZ_2', 'FATTURA_DIFFERITA', 'FATTURA_DIFF_COMMESS',
  ]),
  dataEmissione: z.coerce.date(),
  dataScadenza: z.coerce.date().optional(),
  oggettoFattura: z.string().max(500).optional(),
  righe: z.array(rigaFatturaSchema).min(1, 'Inserire almeno una riga'),
  metodoPagamento: z.string().optional(),
  note: z.string().max(2000).optional(),
  noteInterne: z.string().max(2000).optional(),
  serieId: z.string().optional(),
  preventivoId: z.string().optional(),
  fatturaCollegataId: z.string().optional(),
  rettaId: z.string().optional(),
});

export type CreateFatturaInput = z.infer<typeof createFatturaSchema>;
export type RigaFatturaInput = z.infer<typeof rigaFatturaSchema>;
