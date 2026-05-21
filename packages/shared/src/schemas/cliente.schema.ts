import { z } from 'zod';
import { codiceFiscaleSchema, partitaIvaSchema, codiceSDISchema, pecSchema } from './common.schema';

export const createClienteSchema = z.object({
  tipoCliente: z.enum(['PRIVATO', 'AZIENDA', 'PA', 'PROFESSIONISTA', 'ASSOCIAZIONE']),
  ragioneSociale: z.string().max(200).optional(),
  nome: z.string().max(100).optional(),
  cognome: z.string().max(100).optional(),
  codiceFiscale: codiceFiscaleSchema.optional(),
  partitaIva: partitaIvaSchema.optional(),
  indirizzo: z.string().max(200).optional(),
  cap: z.string().length(5).regex(/^\d{5}$/).optional(),
  comune: z.string().max(100).optional(),
  provincia: z.string().length(2).optional(),
  paese: z.string().length(2).default('IT'),
  pec: pecSchema.optional(),
  codiceDestinatario: codiceSDISchema.optional(),
  email: z.string().email().optional(),
  telefono: z.string().max(20).optional(),
  tags: z.array(z.string()).default([]),
  note: z.string().max(2000).optional(),
  // Campi asilo nido
  codiceFiscaleGenitore1: codiceFiscaleSchema.optional(),
  codiceFiscaleGenitore2: codiceFiscaleSchema.optional(),
  nomeBambino: z.string().max(100).optional(),
  cognomeBambino: z.string().max(100).optional(),
  codiceFiscaleBambino: codiceFiscaleSchema.optional(),
  dataNascitaBambino: z.coerce.date().optional(),
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;

export const updateClienteSchema = createClienteSchema.partial();
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
