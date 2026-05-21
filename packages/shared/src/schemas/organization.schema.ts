import { z } from 'zod';
import { codiceFiscaleSchema, partitaIvaSchema, codiceSDISchema, ibanSchema, pecSchema } from './common.schema';

export const createOrganizationSchema = z.object({
  ragioneSociale: z.string().min(1).max(200),
  partitaIva: partitaIvaSchema.optional(),
  codiceFiscale: codiceFiscaleSchema,
  tipoSoggetto: z.enum(['PERSONA_FISICA', 'PERSONA_GIURIDICA', 'ASSOCIAZIONE', 'ENTE_PUBBLICO']),
  regimeFiscale: z.enum([
    'ORDINARIO', 'CONTRIBUENTI_MINIMI', 'FORFETTARIO',
    'AGRICOLTURA_REDDITI_DOMINICALI', 'VENDITA_SALI_TABACCHI',
    'COMMERCIO_FIAMMIFERI', 'EDITORIA', 'GESTIONE_SERVIZI_TELEFONIA',
    'RIVENDITA_DOCUMENTI_TRASPORTO', 'INTRATTENIMENTI_GIOCHI',
    'AGENZIE_VIAGGI_TURISMO', 'AGRITURISMO', 'VENDITE_PORTA_A_PORTA',
    'RIVENDITORE_BENI_USATI', 'AGENZIE_VENDITE_ASTE_PUBBLICHE',
    'IVA_PER_CASSA', 'ALTRO',
  ]),
  tipoAttivita: z.enum([
    'ASILO_NIDO', 'SCUOLA_INFANZIA', 'CENTRO_EDUCATIVO',
    'LIBERO_PROFESSIONISTA', 'PMI', 'ARTIGIANO', 'COMMERCIANTE',
    'ASSOCIAZIONE', 'ONLUS', 'STUDIO_COMMERCIALISTA', 'ALTRO',
  ]),
  indirizzo: z.string().min(1).max(200),
  cap: z.string().length(5).regex(/^\d{5}$/),
  comune: z.string().min(1).max(100),
  provincia: z.string().length(2),
  paese: z.string().length(2).default('IT'),
  email: z.string().email(),
  pec: pecSchema.optional(),
  telefono: z.string().max(20).optional(),
  sito: z.string().url().optional(),
  codiceDestinatario: codiceSDISchema.optional(),
  iban: ibanSchema.optional(),
  bic: z.string().max(11).optional(),
  intestatarioConto: z.string().max(200).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
