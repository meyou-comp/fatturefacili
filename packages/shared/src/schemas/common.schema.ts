import { z } from 'zod';

/** Schema validazione Codice Fiscale italiano (16 caratteri) */
export const codiceFiscaleSchema = z
  .string()
  .length(16, 'Il codice fiscale deve essere di 16 caratteri')
  .regex(
    /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/i,
    'Formato codice fiscale non valido',
  )
  .transform((v) => v.toUpperCase());

/** Schema validazione Partita IVA italiana (11 cifre) */
export const partitaIvaSchema = z
  .string()
  .length(11, 'La partita IVA deve essere di 11 cifre')
  .regex(/^\d{11}$/, 'La partita IVA deve contenere solo cifre');

/** Schema codice SDI destinatario (7 caratteri alfanumerici) */
export const codiceSDISchema = z
  .string()
  .length(7, 'Il codice SDI deve essere di 7 caratteri')
  .regex(/^[A-Z0-9]{7}$/i, 'Formato codice SDI non valido')
  .transform((v) => v.toUpperCase());

/** Schema IBAN */
export const ibanSchema = z
  .string()
  .min(15)
  .max(34)
  .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/i, 'Formato IBAN non valido')
  .transform((v) => v.toUpperCase().replace(/\s/g, ''));

/** Schema PEC (email con validazione base) */
export const pecSchema = z.string().email('Formato PEC non valido');

/** Schema importo monetario (2 decimali) */
export const importoSchema = z
  .number()
  .multipleOf(0.01, "L'importo deve avere al massimo 2 decimali")
  .nonnegative("L'importo non può essere negativo");
