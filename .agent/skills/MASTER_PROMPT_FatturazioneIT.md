# MASTER PROMPT — FatturazioneIT Platform
## Blueprint completo per un software di fatturazione italiana full-stack

> Versione 1.1 — Target: sviluppo modulare iterativo con AI | API-first & Integrazioni
> Usa questo documento come contesto di sistema in ogni sessione di sviluppo.

---

## 0. IDENTITÀ DEL PRODOTTO

**Nome provvisorio:** FatturazioneIT (o brand a scelta)
**Posizionamento:** Software SaaS di fatturazione italiana completo, multi-profilo, con gestione di tutte le peculiarità fiscali e normative italiane — dalle fatture elettroniche SDI alle comunicazioni INPS per il Bonus Asilo Nido, dal regime forfettario alla scissione dei pagamenti.
**Target utenti:**
- Asili nido, scuole dell'infanzia, centri educativi
- Liberi professionisti (con e senza partita IVA, regime ordinario e forfettario)
- PMI e piccole imprese (SRL, SNC, ditta individuale)
- Associazioni e ONLUS
- Studi di commercialisti (modalità multi-cliente)

---

## 1. STACK TECNOLOGICO RACCOMANDATO

### Frontend
- **Framework:** React 18+ con TypeScript
- **State management:** Zustand (leggero) + React Query per server state
- **UI Component Library:** shadcn/ui + Tailwind CSS
- **Form management:** React Hook Form + Zod (validazione schemi fiscali)
- **PDF generation client-side:** @react-pdf/renderer
- **Routing:** React Router v6 (o Next.js App Router per SSR)
- **Internazionalizzazione:** i18next (IT primario, EN secondario)
- **Grafici:** Recharts

### Backend
- **Runtime:** Node.js 20+ con TypeScript
- **Framework:** Fastify (performance) o NestJS (struttura enterprise)
- **ORM:** Prisma con PostgreSQL
- **Autenticazione:** JWT + refresh token, OAuth2 (Google), 2FA opzionale
- **Coda task:** BullMQ (Redis) per invii telematici asincroni
- **Storage file:** S3-compatible (MinIO self-hosted o AWS S3)
- **Email:** Nodemailer + template React Email

### Integrazioni esterne obbligatorie
- **SDI (Sistema di Interscambio):** Aruba, Namirial, o intermediario accreditato
- **Agenzia delle Entrate:** Webservices per invio 730 precompilato
- **INPS:** Export tracciati per Bonus Asilo Nido
- **PagoPA:** Integrazione pagamenti (opzionale ma raccomandato per enti pubblici)
- **Stripe / Satispay:** Pagamenti ricevuti da clienti

### DevOps
- Docker + Docker Compose per sviluppo locale
- PostgreSQL + Redis in container
- CI/CD: GitHub Actions
- Deploy: Railway, Render, o VPS con Coolify

---

## 2. STRUTTURA DEL DATABASE (Schema Prisma — core)

```prisma
// ─── ANAGRAFICA ────────────────────────────────────────────────

model Organization {
  id                String   @id @default(cuid())
  ragioneSociale    String
  partitaIva        String?  @unique
  codiceFiscale     String   @unique
  tipoSoggetto      TipoSoggetto  // PERSONA_FISICA | PERSONA_GIURIDICA | ASSOCIAZIONE
  regimeFiscale     RegimeFiscale // ORDINARIO | FORFETTARIO | MINIMI | ENTE_NON_COMMERCIALE
  tipoAttivita      TipoAttivita  // ASILO_NIDO | LIBERO_PROFESSIONISTA | PMI | ASSOCIAZIONE | ...
  
  // Indirizzo sede legale
  indirizzo         String
  cap               String
  comune            String
  provincia         String
  paese             String   @default("IT")
  
  // Contatti
  email             String
  pec               String?
  telefono          String?
  sito              String?
  
  // SDI / Fattura Elettronica
  codiceDestinatario String?  // Codice SDI 7 caratteri
  fatturaElettronica Boolean  @default(true)
  intermediarioSDI  String?   // nome intermediario abilitato
  
  // Dati bancari
  iban              String?
  bic               String?
  intestatarioConto String?
  
  // Logo e personalizzazione
  logoUrl           String?
  coloreAccento     String?  @default("#1a56db")
  noteInFattura     String?  // testo fisso in calce
  
  // Relazioni
  users             UserOrganization[]
  clienti           Cliente[]
  fatture           Fattura[]
  preventivi        Preventivo[]
  prodotti          Prodotto[]
  serieNumeri       SerieNumerazione[]
  impostazioniFiscali ImpostazioniFiscali?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model ImpostazioniFiscali {
  id                     String   @id @default(cuid())
  organizationId         String   @unique
  organization           Organization @relation(fields: [organizationId], references: [id])
  
  // Regime forfettario
  coefficienteRedditività Decimal? // es. 0.78 per servizi
  impostaForfettaria      Decimal? // es. 0.05 o 0.15
  annoInizioRegime        Int?
  
  // Ritenuta d'acconto
  ritenutaAcconto         Boolean  @default(false)
  aliquotaRitenuta        Decimal? @default(0.20)
  
  // Cassa previdenziale
  cassaPrevidenziale      String?  // INPS_GESTIONE_SEPARATA | INPS_ARTIGIANI | CNPADC | ...
  aliquotaCassa           Decimal?
  
  // Bollo virtuale
  bolloVirtuale           Boolean  @default(false)
  importoBollo            Decimal? @default(2.00)
  sogliaBollo             Decimal? @default(77.47)
  
  // Split payment
  splitPayment            Boolean  @default(false)
  
  // Reverse charge
  reverseCharge           Boolean  @default(false)
}

model Cliente {
  id                String   @id @default(cuid())
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])
  
  tipoCliente       TipoCliente  // PRIVATO | AZIENDA | PA | PROFESSIONISTA
  ragioneSociale    String?
  nome              String?
  cognome           String?
  codiceFiscale     String?
  partitaIva        String?
  
  // Per asili nido: genitore pagante
  codiceFiscaleGenitore1  String?
  codiceFiscaleGenitore2  String?
  nomeBambino             String?
  cognomeBambino          String?
  codiceFiscaleBambino    String?
  dataNascitaBambino      DateTime?
  
  // Indirizzo
  indirizzo         String?
  cap               String?
  comune            String?
  provincia         String?
  paese             String   @default("IT")
  
  // SDI
  pec               String?
  codiceDestinatario String?
  
  // Contatti
  email             String?
  telefono          String?
  
  // Categorizzazione
  tags              String[]
  note              String?
  
  fatture           Fattura[]
  rette             Retta[]   // specifico asili nido
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// ─── FATTURAZIONE ─────────────────────────────────────────────

model SerieNumerazione {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  nome           String   // es. "Principale", "Note credito", "PA"
  prefisso       String?  // es. "FT", "NC", "PA"
  anno           Int
  contatore      Int      @default(0)
  formato        String   @default("{PREFISSO}{ANNO}/{NUMERO}")
  lunghezzaNumero Int     @default(4)  // zero-padding
  
  fatture        Fattura[]
  
  @@unique([organizationId, nome, anno])
}

model Fattura {
  id                String   @id @default(cuid())
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])
  clienteId         String
  cliente           Cliente @relation(fields: [clienteId], references: [id])
  serieId           String?
  serie             SerieNumerazione? @relation(fields: [serieId], references: [id])
  
  // Numerazione
  numero            String   // numero finale formattato es. "FT2024/0001"
  progressivo       Int      // numero progressivo grezzo
  
  // Tipo documento
  tipoDocumento     TipoDocumento
  // FATTURA | FATTURA_PA | FATTURA_ELETTRONICA | NOTA_CREDITO | NOTA_DEBITO
  // AUTOFATTURA | FATTURA_SEMPLIFICATA | PARCELLA | RICEVUTA | PROFORMA
  
  // Date
  dataEmissione     DateTime
  dataScadenza      DateTime?
  dataPagamento     DateTime?
  
  // Stato
  stato             StatoFattura
  // BOZZA | EMESSA | INVIATA_SDI | ACCETTATA_SDI | RIFIUTATA_SDI
  // PAGATA | PARZIALMENTE_PAGATA | SCADUTA | ANNULLATA | STORNATA
  
  // SDI
  xmlSDI            String?  @db.Text  // XML FatturaPA generato
  idSDI             String?  // ID assegnato da SDI
  dataInvioSDI      DateTime?
  dataEsitoSDI      DateTime?
  esitoSDI          String?  // CONSEGNATA | MANCATA_CONSEGNA | SCARTATA | etc.
  
  // Intestazione
  oggettoFattura    String?
  
  // Righe
  righe             RigaFattura[]
  
  // Totali (calcolati e persistiti)
  imponibile        Decimal  @db.Decimal(15,2)
  totaleIVA         Decimal  @db.Decimal(15,2)
  totale            Decimal  @db.Decimal(15,2)
  totalePagato      Decimal  @db.Decimal(15,2) @default(0)
  
  // Ritenuta
  importoRitenuta   Decimal? @db.Decimal(15,2)
  
  // Bollo
  importoBollo      Decimal? @db.Decimal(15,2)
  
  // Cassa previdenziale
  importoCassa      Decimal? @db.Decimal(15,2)
  
  // Pagamenti
  metodoPagamento   MetodoPagamento?
  pagamenti         Pagamento[]
  
  // Allegati
  allegati          Allegato[]
  
  // Collegamento documenti
  fatturaCollegataId String?  // per note credito
  fatturaCollegata   Fattura? @relation("FattureCollegate", fields: [fatturaCollegataId], references: [id])
  fattureCollegate   Fattura[] @relation("FattureCollegate")
  preventivoId       String?
  preventivo         Preventivo? @relation(fields: [preventivoId], references: [id])
  
  // Dati specifici asilo nido
  rettaId           String?
  retta             Retta? @relation(fields: [rettaId], references: [id])
  
  // Note e dati extra
  note              String?
  noteInterne       String?
  datiAggiuntivi    Json?   // campo flessibile per peculiarità settoriali
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model RigaFattura {
  id              String   @id @default(cuid())
  fatturaId       String
  fattura         Fattura @relation(fields: [fatturaId], references: [id], onDelete: Cascade)
  prodottoId      String?
  prodotto        Prodotto? @relation(fields: [prodottoId], references: [id])
  
  ordine          Int
  descrizione     String
  quantita        Decimal  @db.Decimal(15,4)
  unitaMisura     String?  // pz, h, gg, mese, kg, m², etc.
  prezzoUnitario  Decimal  @db.Decimal(15,4)
  sconto          Decimal? @db.Decimal(5,2)  // percentuale
  
  aliquotaIVA     Decimal  @db.Decimal(5,2)
  naturaIVA       String?  // N1-N7 per esenzioni/esclusioni
  // N1=esclusa, N2.1=non sogg., N2.2=non sogg. altri casi,
  // N3.1=non imponibile export, N3.2=non imponibile cessioni,
  // N3.3=non imponibile verso San Marino, N3.4=operazioni ass.
  // N3.5=dichiarazione d'intento, N3.6=altre non imponibili,
  // N4=esente, N5=regime del margine, N6.1-N6.9=inversione contabile,
  // N7=IVA assolta in altro stato UE
  
  rifNormativo    String?  // riferimento normativo per esenzione
  
  imponibile      Decimal  @db.Decimal(15,2)
  importoIVA      Decimal  @db.Decimal(15,2)
  totale          Decimal  @db.Decimal(15,2)
  
  // Per asili nido
  meseRiferimento Int?     // 1-12
  annoRiferimento Int?
  codiceFiscaleAlunno String?  // CF bambino (per 730)
}

model Prodotto {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  codice          String?
  nome            String
  descrizione     String?
  
  prezzoUnitario  Decimal  @db.Decimal(15,4)
  aliquotaIVA     Decimal  @db.Decimal(5,2)
  naturaIVA       String?
  unitaMisura     String?
  
  categoria       String?
  
  righe           RigaFattura[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ─── MODULO ASILO NIDO ────────────────────────────────────────

model Retta {
  id                    String   @id @default(cuid())
  organizationId        String
  clienteId             String
  cliente               Cliente @relation(fields: [clienteId], references: [id])
  
  // Bambino
  nomeBambino           String
  cognomeBambino        String
  codiceFiscaleBambino  String?
  dataNascitaBambino    DateTime?
  
  // Genitore pagante (INPS Bonus)
  codiceFiscaleGenitore String   // CF del genitore che paga (per INPS)
  nomeGenitore          String
  cognomeGenitore       String
  
  // Periodo e importo
  anno                  Int
  mese                  Int      // 1-12
  importoRetta          Decimal  @db.Decimal(15,2)
  importoBonusFruitoINPS Decimal? @db.Decimal(15,2)  // se già detratto
  importoNetto          Decimal  @db.Decimal(15,2)  // effettivamente pagato
  
  // Stato pagamento
  pagata                Boolean  @default(false)
  dataPagamento         DateTime?
  metodoPagamento       MetodoPagamento?
  
  // Comunicazione 730
  comunicata730         Boolean  @default(false)
  dataComunicazione730  DateTime?
  
  fatture               Fattura[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([clienteId, anno, mese])
}

model ComunicazioneSpeseScolastiche {
  id                    String   @id @default(cuid())
  organizationId        String
  
  anno                  Int      // anno di riferimento (rette pagate)
  dataInvio             DateTime?
  stato                 String   // BOZZA | PRONTA | INVIATA | CONFERMATA | ERRORE
  
  // Tracciato generato
  tracciato             String?  @db.Text  // CSV/XML per AdE
  nomeFile              String?
  
  righe                 RigaComunicazione730[]
  
  createdAt             DateTime @default(now())
}

model RigaComunicazione730 {
  id                            String   @id @default(cuid())
  comunicazioneId               String
  comunicazione                 ComunicazioneSpeseScolastiche @relation(fields: [comunicazioneId], references: [id])
  
  // Dati obbligatori tracciato AdE
  codiceFiscaleFiglio           String
  codiceFiscaleGenitore         String
  cognomeNomeFiglio             String
  annoNascitaFiglio             Int
  
  // Importi per mese (array o colonne separate)
  importoTotaleAnno             Decimal  @db.Decimal(15,2)
  importiMensili                Json     // { "1": 300.00, "2": 300.00, ... }
  
  // Dati struttura
  denominazioneStruttura        String
  codiceFiscaleStruttura        String
  comuneStruttura               String
  provinciaStruttura            String
}

// ─── PAGAMENTI E SCADENZARIO ──────────────────────────────────

model Pagamento {
  id              String   @id @default(cuid())
  fatturaId       String
  fattura         Fattura @relation(fields: [fatturaId], references: [id])
  
  data            DateTime
  importo         Decimal  @db.Decimal(15,2)
  metodo          MetodoPagamento
  riferimento     String?  // numero assegno, CRO bonifico, etc.
  note            String?
  
  createdAt       DateTime @default(now())
}

model Allegato {
  id              String   @id @default(cuid())
  fatturaId       String
  fattura         Fattura @relation(fields: [fatturaId], references: [id])
  
  nome            String
  tipo            String   // MIME type
  dimensione      Int      // bytes
  url             String   // S3 path
  
  createdAt       DateTime @default(now())
}

// ─── PREVENTIVI ───────────────────────────────────────────────

model Preventivo {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  clienteId       String?
  
  numero          String
  oggetto         String?
  dataEmissione   DateTime
  dataScadenza    DateTime?
  
  stato           StatoPreventivo
  // BOZZA | INVIATO | ACCETTATO | RIFIUTATO | SCADUTO | FATTURATO
  
  righe           Json
  totale          Decimal  @db.Decimal(15,2)
  note            String?
  
  fatture         Fattura[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ─── ENUMS ────────────────────────────────────────────────────

enum TipoSoggetto { PERSONA_FISICA PERSONA_GIURIDICA ASSOCIAZIONE ENTE_PUBBLICO }
enum TipoCliente { PRIVATO AZIENDA PA PROFESSIONISTA ASSOCIAZIONE }
enum TipoAttivita {
  ASILO_NIDO
  SCUOLA_INFANZIA
  CENTRO_EDUCATIVO
  LIBERO_PROFESSIONISTA
  PMI
  ARTIGIANO
  COMMERCIANTE
  ASSOCIAZIONE
  ONLUS
  STUDIO_COMMERCIALISTA
  ALTRO
}
enum RegimeFiscale {
  ORDINARIO                    // RF01
  CONTRIBUENTI_MINIMI          // RF02
  FORFETTARIO                  // RF19
  AGRICOLTURA_REDDITI_DOMINICALI // RF04
  VENDITA_SALI_TABACCHI        // RF05
  COMMERCIO_FIAMMIFERI         // RF06
  EDITORIA                     // RF07
  GESTIONE_SERVIZI_TELEFONIA   // RF08
  RIVENDITA_DOCUMENTI_TRASPORTO // RF09
  INTRATTENIMENTI_GIOCHI       // RF10
  AGENZIE_VIAGGI_TURISMO       // RF11
  AGRITURISMO                  // RF12
  VENDITE_PORTA_A_PORTA        // RF13
  RIVENDITORE_BENI_USATI       // RF14
  AGENZIE_VENDITE_ASTE_PUBBLICHE // RF15
  IVA_PER_CASSA                // RF16
  ALTRO                        // RF18
}
enum TipoDocumento {
  FATTURA              // TD01
  ACCONTO_SU_FATTURA   // TD02
  ACCONTO_SU_PARCELLA  // TD03
  NOTA_CREDITO         // TD04
  NOTA_DEBITO          // TD05
  PARCELLA             // TD06
  AUTOFATTURA_ACQUISTI // TD16
  AUTOFATTURA_REGOLARZ // TD17
  INTEGRAZIONE_ACQUISTI // TD18
  INTEGRAZIONE_VENDITE // TD19
  AUTOFATTURA_REGOLARZ_2 // TD20
  FATTURA_SEMPLIFICATA // TD07
  NOTA_CREDITO_SEMP    // TD08
  NOTA_DEBITO_SEMP     // TD09
  FATTURA_DIFFERITA    // TD24
  FATTURA_DIFF_COMMESS // TD25
}
enum StatoFattura {
  BOZZA
  EMESSA
  INVIATA_SDI
  IN_ELABORAZIONE_SDI
  ACCETTATA_SDI
  CONSEGNATA
  MANCATA_CONSEGNA
  RIFIUTATA_SDI
  IMPOSSIBILE_RECAPITO
  PAGATA
  PARZIALMENTE_PAGATA
  SCADUTA
  ANNULLATA
  STORNATA
}
enum StatoPreventivo { BOZZA INVIATO ACCETTATO RIFIUTATO SCADUTO FATTURATO }
enum MetodoPagamento {
  CONTANTI           // MP01
  ASSEGNO            // MP02
  ASSEGNO_CIRCOLARE  // MP03
  CONTANTI_BANCA     // MP04
  BONIFICO           // MP05
  VAGLIA_CAMBIALE    // MP06
  BOLLETTINO_BANC    // MP07
  CARTA_PAGAMENTO    // MP08
  RID                // MP09
  RID_UTENZE         // MP10
  RID_VELOCE         // MP11
  RIBA               // MP12
  MAV                // MP13
  QUIETANZA_ERARIO   // MP14
  GIROCONTO          // MP15
  DOMICILIAZIONE_BANC // MP16
  DOMICILIAZIONE_POST // MP17
  BOLLETTINO_POSTALE // MP18
  SEPA               // MP19
  SEPA_CORE          // MP20
  SEPA_B2B           // MP21
  TRATTENUTA         // MP22
  PAGOPA             // MP23
  SATISPAY
  ALTRO
}
```

---

## 3. ARCHITETTURA MODULI (Feature Modules)

### 3.1 Modulo Core — Fatture & Documenti
- Creazione fattura con wizard step-by-step
- Supporto tutti i tipi documento (TD01–TD25)
- Calcolo automatico: IVA, ritenuta, cassa previdenziale, bollo
- Generazione XML FatturaPA (formato 1.2.2+)
- Invio SDI via intermediario (webhook per esiti)
- PDF personalizzato con logo e layout custom
- Numerazione automatica multi-serie
- Copia/duplica documento
- Fattura da preventivo (con tracking)
- Fattura ricorrente (abbonamenti, rette mensili)

### 3.2 Modulo Anagrafica Clienti
- Ricerca codice fiscale → autocomplete dati da API AdE (Verifica CF)
- Ricerca P.IVA → VIES (validazione UE) + API registro imprese
- Profilo genitore/bambino per asili nido
- Storico documenti per cliente
- Gestione indirizzi multipli
- Import clienti da CSV/XLSX

### 3.3 Modulo Asilo Nido (Verticale Specifico)
- Gestione bambini iscritti
- Calendario mensile rette
- Generazione automatica fatture mensili da rette
- Tracking Bonus INPS (importo fruito vs retta totale)
- Export tracciato comunicazione 730 (formato AdE)
- Invio telematico spese scolastiche (Sistema Tessera Sanitaria)
- Report: rette pagate per anno/genitore/bambino
- Stampa ricevuta con CF genitore in evidenza

### 3.4 Modulo Regimi Fiscali Speciali
**Forfettario:**
- Blocco IVA automatico con nota "Operazione effettuata ai sensi art. 1, commi 54-89, L. 190/2014"
- Calcolo imposta sostitutiva
- Monitoraggio soglia ricavi (85.000€ limite)
- Alert al superamento soglia

**Ente Non Commerciale / ONLUS / APS:**
- Fatture e ricevute per attività commerciale vs istituzionale
- Esenzione IVA art. 4 DPR 633/72
- Quote associative (non sono ricavi, gestione separata)

**Split Payment (PA):**
- Flag automatico per clienti PA
- IVA a zero con indicazione "Scissione dei pagamenti"
- Riconciliazione IVA ricevuta

**Reverse Charge:**
- Gestione autofattura per acquisti intraUE
- Codici natura N6.x corretti per settore

**Associazioni Sportive Dilettantistiche (ASD):**
- Nota credito per rimborsi
- Gestione compensi sportivi (non IRPEF fino a 10.000€)

### 3.5 Modulo Scadenzario & Pagamenti
- Calendario scadenze con alert email/push
- Registrazione pagamenti parziali
- Riconciliazione bancaria (import estratto conto CSV/OFX)
- Solleciti automatici configurabili (1°, 2°, 3° sollecito)
- Export scadenzario per commercialista

### 3.6 Modulo Bollo Virtuale
- Applicazione automatica bollo (€2,00 su operazioni ≥77,47€ esenti/escluse IVA)
- Versamento periodico (ogni 4 mesi: aprile, luglio, ottobre, gennaio)
- Comunicazione F24 per versamento

### 3.7 Modulo Reporting & Analytics
- Dashboard: fatturato, incassato, da incassare, scaduto
- Grafici trend mensili/annuali
- Liquidazione IVA mensile/trimestrale (con export per F24)
- Registro IVA vendite e acquisti
- Plafond IVA (per esportatori abituali)
- Report spese deducibili per forfettari
- Export contabile (tracciato per commercialista, XML, CSV, XLSX)

### 3.8 Modulo Comunicazioni Telematiche
- **Comunicazione Spese Scolastiche (AdE):** tracciato per 730 precompilato
- **Sistema Tessera Sanitaria (STS):** per strutture sanitarie
- **Esterometro:** per operazioni con soggetti esteri (sostituito da SDI ma gestione legacy)
- **LIPE (Liquidazione IVA Periodica):** export dati

### 3.9 Modulo Multi-Azienda / Studio Commercialisti
- Profili azienda multipli da unico login
- Permessi per-azienda (lettura, scrittura, admin)
- Switch rapido azienda
- Dashboard aggregata multi-azienda

---

## 4. FLUSSI CRITICI (User Stories)

### F-001: Emissione Fattura Elettronica B2B
1. Utente crea nuova fattura → seleziona cliente (con P.IVA)
2. Sistema verifica P.IVA su VIES
3. Aggiunta righe con descrizione, quantità, prezzo, IVA
4. Sistema calcola totali (con eventuale ritenuta, cassa, bollo)
5. Anteprima PDF
6. Generazione XML FatturaPA validato
7. Invio a SDI tramite intermediario
8. Polling/webhook per esito (accettata/rifiutata)
9. Notifica email all'utente + aggiornamento stato

### F-002: Fattura Mensile Asilo Nido
1. Setup bambino con CF bambino + CF genitore pagante
2. Configurazione importo retta mensile
3. Ogni mese: generazione automatica fattura (o manuale da lista rette)
4. Fattura include in chiaro: CF genitore, CF bambino, mese di riferimento
5. Invio email al genitore con PDF
6. Registrazione pagamento
7. A gennaio: export tracciato 730 per anno precedente

### F-003: Export Comunicazione Spese Scolastiche (730)
1. Utente accede a "Comunicazioni > 730 Precompilato"
2. Seleziona anno di riferimento
3. Sistema aggrega tutte le rette pagate per ogni bambino/genitore
4. Preview tabellare con dati: CF figlio, CF genitore, importi mensili, totale anno
5. Validazione (CF validi, importi coerenti con fatture emesse)
6. Generazione file nel formato ufficiale AdE (CSV con tracciato specifico)
7. [Opzionale] Invio telematico via STS
8. Marcatura "comunicato" su ogni retta

### F-004: Gestione Forfettario
1. Setup regime: coefficiente redditività, aliquota 5% o 15%
2. Ogni fattura emessa: IVA non applicata, nota legale inserita automaticamente
3. Dashboard mostra contatore ricavi anno corrente vs soglia 85.000€
4. Alert al 75% e al 100% della soglia
5. Report annuale: ricavi × coefficiente = imponibile → imposta sostitutiva stimata

### F-005: Sollecito Pagamento
1. Fattura supera data scadenza
2. Sistema invia 1° sollecito automatico (tono cordiale) dopo X giorni configurabili
3. 2° sollecito dopo ulteriori Y giorni (tono formale)
4. 3° sollecito con riferimento a interessi di mora (D.Lgs 231/2002)
5. Log tutti i solleciti inviati per eventuale uso legale

---

## 5. NORMATIVA E PECULIARITÀ FISCALI DA GESTIRE

### 5.1 Fattura Elettronica
- Formato FatturaPA XML 1.2.2 (Allegato A del DM 55/2013)
- Obbligo per tutti i soggetti IVA dal 1/1/2019
- Eccezioni: regime di vantaggio, forfettari sotto soglia (ora tutti obbligati dal 2024)
- Conservazione sostitutiva 10 anni (obbligatoria)
- Codice destinatario "0000000" per privati senza PEC

### 5.2 Reverse Charge (Art. 17 DPR 633/72)
- Subappalti edili
- Cessioni di fabbricati
- Telefonia
- Energie, gas
- GNL (Green Certificate)
- Acquisti da soggetti non residenti

### 5.3 Split Payment (Art. 17-ter DPR 633/72)
- Solo per clienti PA
- IVA versata direttamente dallo Stato
- XML: `EsigibilitaIVA = S`

### 5.4 Bonus Asilo Nido (INPS)
- Importo massimo: fino a €3.000/anno (varia per ISEE)
- Il genitore richiede il bonus all'INPS indicando il CF della struttura
- La struttura deve emettere fattura/ricevuta con CF genitore
- Il bonus riduce la spesa effettiva (non tocca la fattura, è rimborso separato)
- Documentazione: fattura + attestazione di frequenza

### 5.5 Comunicazione Spese Scolastiche (730 Precompilato)
- Base normativa: D.Lgs. 175/2014, art. 3
- Scadenza invio: **16 marzo** dell'anno successivo
- Strutture coinvolte: asili nido pubblici e privati
- Dati da trasmettere: CF genitore, CF figlio, importo annuo pagato
- Sistema: portale STS (Sistema Tessera Sanitaria) — stesso usato per spese mediche
- Formato file: specifiche tecniche pubblicate annualmente da MEF/AdE

### 5.6 Cassa Previdenziale
- INPS Gestione Separata: 26,23% (no altri enti)
- INPS Artigiani/Commercianti: fisso + percentuale su eccedenza
- Casse private: CNPADC (dottori commercialisti), INARCASSA (ingegneri), CNF (avvocati), etc.
- In fattura: voce separata "Contributo Cassa 4%" (o altra %)
- Sulla cassa si calcola IVA

### 5.7 Ritenuta d'Acconto
- 20% per professionisti (IRPEF)
- Applicata dal committente, non dal professionista
- In fattura: indicata come "Ritenuta d'acconto 20% su [imponibile]"
- Il netto da pagare = Totale - Ritenuta

### 5.8 Bollo Virtuale
- €2,00 su operazioni esenti/escluse/non soggette IVA ≥ €77,47
- Virtuale: non si applica marca fisica, si versa periodicamente
- Periodi di versamento: aprile (gen-mar), luglio (apr-giu), ottobre (lug-set), gennaio (ott-dic)
- Codice tributo F24: 2501

### 5.9 Operazioni con Estero
- UE: VIES obbligatorio, non imponibile art. 41 DL 331/93
- Extra-UE: non imponibile art. 8 DPR 633/72
- Prestazioni di servizi UE: art. 7-ter (dove il committente è stabilito)
- Acquisti intracomunitari: autofattura + Mod. INTRA

---

## 6. ARCHITETTURA UI — STRUTTURA PAGINE

```
/ (Landing / Login)
├── /dashboard                    → Overview KPI
├── /fatture
│   ├── /fatture/nuova            → Wizard creazione
│   ├── /fatture/:id              → Dettaglio / modifica
│   └── /fatture/:id/xml          → Preview XML SDI
├── /note-credito
├── /preventivi
├── /clienti
│   ├── /clienti/nuovo
│   └── /clienti/:id
├── /prodotti
├── /scadenzario
├── /pagamenti
├── /asilo-nido
│   ├── /asilo-nido/bambini
│   ├── /asilo-nido/rette
│   └── /asilo-nido/comunicazione-730
├── /comunicazioni
│   ├── /comunicazioni/730
│   ├── /comunicazioni/sts
│   └── /comunicazioni/lipe
├── /report
│   ├── /report/iva
│   ├── /report/fatturato
│   └── /report/export-contabile
├── /impostazioni
│   ├── /impostazioni/azienda
│   ├── /impostazioni/fiscali
│   ├── /impostazioni/numerazione
│   ├── /impostazioni/sdi
│   └── /impostazioni/utenti
└── /profilo
```

---

## 7. VALIDAZIONI CRITICHE

### Codice Fiscale (CF)
```typescript
// Algoritmo di Luhn per CF italiani
function validateCodiceFiscale(cf: string): boolean {
  // 16 caratteri alfanumerici
  // Pattern: [A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}
  // Verifica carattere di controllo con tabella valori dispari/pari
}
```

### Partita IVA (P.IVA)
```typescript
function validatePartitaIva(piva: string): boolean {
  // 11 cifre, algoritmo: somma cifre pari (×2 se >9, sottrai 9) + cifre dispari
  // Ultima cifra = controllo
}
```

### Codice SDI Destinatario
```typescript
function validateCodiceSDI(codice: string): boolean {
  // 7 caratteri alfanumerici uppercase
  // "0000000" = privato senza PEC
}
```

### XML FatturaPA
- Validazione contro XSD ufficiale AdE
- Controllo lunghezze campi obbligatori
- Coerenza tra tipo documento e campi presenti
- Calcolo corretto totali (imponibili + IVA)

---

## 8. PROMPT DI SVILUPPO PER SESSIONI SUCCESSIVE

Copia questo blocco come contesto iniziale in ogni nuova sessione:

```
Sto sviluppando FatturazioneIT, un SaaS di fatturazione italiana full-stack.
Stack: React/TypeScript + Node.js/Fastify + PostgreSQL/Prisma.
Target: tutti i tipi di aziende italiane, con verticale specifico asilo nido.
Normativa: FatturaPA XML SDI, regime forfettario, split payment, reverse charge,
bollo virtuale, Bonus INPS asilo nido, comunicazione 730 AdE/STS.

Riferisciti sempre al file MASTER_PROMPT_FatturazioneIT.md per:
- Schema DB (modelli Prisma)
- Architettura moduli
- Flussi utente
- Peculiarità fiscali italiane

[TASK CORRENTE]: descrivere qui il modulo specifico da sviluppare
```

---

## 9. PRIORITÀ DI SVILUPPO (Roadmap MVP)

### Fase 1 — MVP Core (settimane 1-6)
- [ ] Auth + multi-tenant (organizationId su ogni record)
- [ ] Anagrafica clienti (con validazione CF/PIVA)
- [ ] Catalogo prodotti/servizi
- [ ] Creazione fattura manuale con calcolo automatico
- [ ] Generazione PDF professionale
- [ ] Dashboard base (fatture emesse, da incassare)
- [ ] Export Excel/CSV

### Fase 2 — Elettronica & SDI (settimane 7-10)
- [ ] Generazione XML FatturaPA valido
- [ ] Integrazione intermediario SDI (Aruba/Namirial)
- [ ] Gestione stati SDI e notifiche
- [ ] Conservazione sostitutiva

### Fase 3 — Regimi & Peculiarità (settimane 11-14)
- [ ] Modulo forfettario completo
- [ ] Split payment / reverse charge
- [ ] Ritenuta d'acconto + cassa previdenziale
- [ ] Bollo virtuale

### Fase 4 — Verticale Asilo Nido (settimane 15-18)
- [ ] Gestione bambini/rette
- [ ] Fatturazione massiva mensile
- [ ] Tracciato 730 / STS
- [ ] Report INPS Bonus Asilo Nido

### Fase 5 — Automazioni & Reporting (settimane 19-22)
- [ ] Solleciti automatici
- [ ] Riconciliazione bancaria
- [ ] Liquidazione IVA automatica
- [ ] Report commercialista

### Fase 6 — Multi-azienda & Studio (settimane 23-26)
- [ ] Multi-organization per commercialisti
- [ ] API pubblica per integrazioni
- [ ] Mobile app (React Native)

---

## 10. RIFERIMENTI NORMATIVI

- DPR 633/72 — Istituzione IVA
- DPR 322/98 — Dichiarazioni fiscali
- DM 55/2013 — Fatturazione elettronica PA
- DL 331/93 — Operazioni intracomunitarie
- D.Lgs. 127/2015 — Fatturazione elettronica privati
- D.Lgs. 175/2014, art. 3 — 730 precompilato
- L. 190/2014, commi 54-89 — Regime forfettario
- D.Lgs 231/2002 — Interessi di mora transazioni commerciali
- Circ. AdE 14/E 2019 — Chiarimenti fattura elettronica
- Specifiche tecniche FatturaPA v1.2.2 — AdE
- Portale STS (Sistema Tessera Sanitaria) — Specifiche tecniche annuali MEF
```

---

## 11. ARCHITETTURA API-FIRST & INTEGRABILITÀ

> Principio fondante: **ogni funzione della piattaforma è esposta come API**.
> La UI interna è essa stessa un client dell'API — nessuna logica esclusiva al frontend.
> Qualsiasi piattaforma esterna può replicare al 100% le stesse operazioni.

---

### 11.1 Filosofia API-First

```
┌─────────────────────────────────────────────────────┐
│                  FATTURAZIONEIT CORE                │
│                                                     │
│   ┌──────────┐    ┌─────────────────────────────┐  │
│   │ Business │    │         REST API v1          │  │
│   │  Logic   │◄───│  + GraphQL (opzionale)       │  │
│   │ (unica)  │    │  + Webhook Engine            │  │
│   └──────────┘    └──────────────┬──────────────┘  │
│                                  │                  │
└──────────────────────────────────┼──────────────────┘
                                   │
          ┌────────────────────────┼─────────────────────┐
          │                        │                      │
    ┌─────▼──────┐         ┌───────▼──────┐    ┌─────────▼─────┐
    │  UI Propria │         │ App di Terze │    │  Automazioni  │
    │  (React)   │         │    Parti     │    │ (Zapier/Make) │
    └────────────┘         └──────────────┘    └───────────────┘
```

Ogni endpoint è:
- **Versionato** (`/api/v1/`, `/api/v2/`) per retrocompatibilità
- **Documentato** automaticamente con OpenAPI 3.1 / Swagger
- **Autenticato** con OAuth2 + API Key
- **Rate-limited** per tier (Free / Pro / Enterprise)
- **Auditato** (ogni chiamata loggata con chi, quando, cosa)

---

### 11.2 Autenticazione & Autorizzazione API

#### Modalità supportate

**1. API Key (per integrazioni server-to-server)**
```http
Authorization: Bearer fk_live_xxxxxxxxxxxxxxxxxxxx
X-Organization-Id: org_abc123
```
- Generabili dal pannello impostazioni
- Scope granulari (es. `fatture:read`, `fatture:write`, `clienti:read`)
- Rotazione con periodo di grace (vecchia key valida N giorni dopo creazione nuova)
- IP whitelist opzionale

**2. OAuth2 (per app di terze parti che agiscono per conto dell'utente)**
```
Authorization Code Flow con PKCE
Scopes disponibili:
  - fatture:read         Lettura fatture
  - fatture:write        Creazione/modifica fatture
  - fatture:send         Invio a SDI
  - clienti:read         Lettura anagrafica
  - clienti:write        Gestione anagrafica
  - pagamenti:read       Lettura pagamenti
  - pagamenti:write      Registrazione pagamenti
  - report:read          Accesso a report e export
  - asilo:read           Dati rette e bambini
  - asilo:write          Gestione rette
  - comunicazioni:write  Invio 730/STS
  - settings:read        Lettura configurazione
  - settings:write       Modifica configurazione
  - webhook:manage       Gestione webhook
```

**3. JWT Session (per la UI interna)** — non esposto esternamente

#### Modello permessi (RBAC per Organization)
```typescript
enum OrgRole {
  OWNER,        // tutto
  ADMIN,        // tutto tranne billing e cancellazione org
  ACCOUNTANT,   // lettura + export, no emissione
  OPERATOR,     // emissione fatture, gestione clienti
  READONLY,     // solo lettura
  API_CLIENT,   // solo scope definiti nella API key
}
```

---

### 11.3 REST API — Endpoint Completi

Base URL: `https://api.fatturazioneit.it/v1`

#### Fatture
```
GET    /fatture                    Lista con filtri (stato, data, cliente, tipo)
POST   /fatture                    Crea fattura
GET    /fatture/:id                Dettaglio fattura
PUT    /fatture/:id                Modifica (solo in stato BOZZA)
DELETE /fatture/:id                Elimina (solo BOZZA)
POST   /fatture/:id/emetti         Passa da BOZZA a EMESSA
POST   /fatture/:id/invia-sdi      Invia a SDI
GET    /fatture/:id/xml            Scarica XML FatturaPA
GET    /fatture/:id/pdf            Scarica PDF
POST   /fatture/:id/duplica        Duplica documento
POST   /fatture/:id/storna         Crea nota credito associata
POST   /fatture/:id/pagamenti      Registra pagamento
GET    /fatture/:id/pagamenti      Lista pagamenti
GET    /fatture/:id/stato-sdi      Polling stato SDI
POST   /fatture/batch              Crea N fatture in una chiamata (max 100)
GET    /fatture/export             Export CSV/XLSX/JSON con filtri
```

#### Clienti
```
GET    /clienti                    Lista con ricerca full-text
POST   /clienti                    Crea cliente
GET    /clienti/:id                Dettaglio
PUT    /clienti/:id                Modifica
DELETE /clienti/:id                Elimina (solo se senza fatture)
GET    /clienti/:id/fatture        Fatture del cliente
GET    /clienti/cerca-cf/:cf       Lookup dati da codice fiscale (AdE)
GET    /clienti/cerca-piva/:piva   Lookup dati + VIES da P.IVA
POST   /clienti/import             Import da CSV/XLSX
```

#### Prodotti / Listino
```
GET    /prodotti
POST   /prodotti
GET    /prodotti/:id
PUT    /prodotti/:id
DELETE /prodotti/:id
POST   /prodotti/import            Import da CSV
```

#### Modulo Asilo Nido
```
GET    /asilo/bambini              Lista bambini iscritti
POST   /asilo/bambini              Registra bambino
GET    /asilo/bambini/:id
PUT    /asilo/bambini/:id
GET    /asilo/rette                Lista rette (filtro: anno, mese, stato)
POST   /asilo/rette                Crea retta
PUT    /asilo/rette/:id
POST   /asilo/rette/genera-fatture Genera fatture da rette non fatturate (batch)
GET    /asilo/rette/:id/fattura    Fattura associata alla retta
POST   /asilo/comunicazione-730/genera    Genera tracciato anno X
GET    /asilo/comunicazione-730/:anno     Preview dati 730
POST   /asilo/comunicazione-730/:anno/invia   Invio telematico STS
GET    /asilo/report/bonus-inps    Report riepilogativo INPS per anno
```

#### Scadenzario & Pagamenti
```
GET    /scadenzario                Fatture in scadenza (range date)
GET    /pagamenti                  Lista tutti i pagamenti ricevuti
POST   /pagamenti                  Registra pagamento manuale
GET    /report/liquidazione-iva    Dati liquidazione IVA (periodo)
GET    /report/fatturato           Aggregati fatturato per periodo
GET    /report/export-contabile    Export per commercialista (XML/CSV/XLSX)
```

#### Webhooks (gestione)
```
GET    /webhooks                   Lista webhook configurati
POST   /webhooks                   Registra endpoint
PUT    /webhooks/:id
DELETE /webhooks/:id
GET    /webhooks/:id/deliveries    Storico invii
POST   /webhooks/:id/test          Invia evento di test
```

#### Organizzazione & Impostazioni
```
GET    /organization               Dati organizzazione corrente
PUT    /organization               Modifica dati
GET    /organization/users         Lista utenti
POST   /organization/users/invite  Invita utente
PUT    /organization/users/:id     Modifica ruolo
DELETE /organization/users/:id     Rimuovi utente
GET    /api-keys                   Lista API key
POST   /api-keys                   Genera nuova key
DELETE /api-keys/:id               Revoca key
```

---

### 11.4 Webhook Engine

Le piattaforme esterne si iscrivono a eventi specifici. Il sistema invia HTTP POST all'URL registrato entro secondi dall'evento.

#### Catalogo eventi
```typescript
enum WebhookEvent {
  // Fatture
  "fattura.creata",
  "fattura.emessa",
  "fattura.inviata_sdi",
  "fattura.accettata_sdi",
  "fattura.rifiutata_sdi",
  "fattura.consegnata",
  "fattura.pagata",
  "fattura.scaduta",
  "fattura.stornata",

  // Clienti
  "cliente.creato",
  "cliente.modificato",
  "cliente.eliminato",

  // Asilo nido
  "retta.creata",
  "retta.pagata",
  "comunicazione_730.inviata",

  // Pagamenti
  "pagamento.registrato",

  // Sistema
  "soglia_fatturato.raggiunta",  // per forfettari (75% e 100% di 85k€)
  "scadenza.promemoria",          // N giorni prima scadenza fattura
}
```

#### Payload webhook (struttura standard)
```json
{
  "id": "evt_01HXZ...",
  "event": "fattura.accettata_sdi",
  "created_at": "2024-03-15T14:32:00Z",
  "organization_id": "org_abc123",
  "api_version": "v1",
  "data": {
    "object": "fattura",
    "id": "fat_xyz789",
    "numero": "FT2024/0042",
    "stato": "ACCETTATA_SDI",
    "totale": 1220.00,
    "cliente_id": "cli_def456"
    // ... oggetto completo
  },
  "previous_data": {
    "stato": "INVIATA_SDI"
    // solo i campi cambiati
  }
}
```

#### Sicurezza webhook
```
HMAC-SHA256 su body con secret condiviso
Header: X-FatturazioneIT-Signature: sha256=xxxx
Retry automatico: 3 tentativi (1min, 5min, 30min)
Disattivazione automatica dopo 100 fallimenti consecutivi
```

---

### 11.5 GraphQL API (opzionale — Fase avanzata)

Per integratori che necessitano query flessibili (es. dashboard custom):

```graphql
type Query {
  fatture(
    stati: [StatoFattura]
    dal: DateTime
    al: DateTime
    clienteId: ID
    limit: Int
    offset: Int
  ): FatturePaginata!

  fattura(id: ID!): Fattura

  cliente(id: ID!): Cliente

  report(
    tipo: TipoReport!
    periodo: PeriodoInput!
  ): ReportData!
}

type Mutation {
  creaFattura(input: FatturaInput!): Fattura!
  emettitattura(id: ID!): Fattura!
  registraPagamento(input: PagamentoInput!): Pagamento!
}

type Subscription {
  statoFattura(id: ID!): Fattura!  # live updates SDI
}
```

---

### 11.6 SDK Ufficiali

Da rilasciare insieme alla API pubblica:

```
@fatturazioneit/sdk-js    → Node.js / Browser (TypeScript)
fatturazioneit-python     → Python 3.9+
fatturazioneit-php        → PHP 8.1+ (Composer)
```

**Esempio SDK JS:**
```typescript
import { FatturazioneIT } from '@fatturazioneit/sdk-js';

const client = new FatturazioneIT({
  apiKey: process.env.FATTURAZIONEIT_API_KEY,
  organizationId: 'org_abc123',
});

// Crea fattura
const fattura = await client.fatture.crea({
  clienteId: 'cli_xyz',
  tipoDocumento: 'FATTURA',
  dataEmissione: new Date(),
  righe: [
    {
      descrizione: 'Consulenza strategica',
      quantita: 8,
      unitaMisura: 'h',
      prezzoUnitario: 120.00,
      aliquotaIVA: 22,
    }
  ],
});

// Invia a SDI
await client.fatture.inviaSdi(fattura.id);

// Ascolta webhook
client.webhooks.on('fattura.accettata_sdi', async (event) => {
  console.log('Fattura accettata:', event.data.numero);
});
```

---

### 11.7 Integrazioni Native (Marketplace)

Integrazioni pre-costruite e mantenute dal team:

#### Gestionali & ERP
| Piattaforma | Tipo | Cosa sincronizza |
|---|---|---|
| **Odoo** | Bidirezionale | Fatture, clienti, pagamenti |
| **Danea Easyfatt** | Import/Export | Fatture, anagrafica |
| **Fatture in Cloud** | Migrazione | Import dati storici |
| **Gestionale 1** | Bidirezionale | Ordini → fatture |
| **TeamSystem** | Export | Contabilità generale |
| **Zucchetti** | Export | Prima nota |

#### E-commerce
| Piattaforma | Tipo | Cosa fa |
|---|---|---|
| **WooCommerce** | Plugin WP | Fattura automatica da ordine |
| **Shopify** | App ufficiale | Fattura automatica da ordine |
| **Prestashop** | Modulo | Fattura da ordine |
| **Magento** | Extension | Fattura da ordine |

#### Pagamenti & Banche
| Piattaforma | Tipo | Cosa fa |
|---|---|---|
| **Stripe** | Webhook | Marca pagata su incasso |
| **Satispay Business** | Webhook | Marca pagata su incasso |
| **Nexi / Axerve** | Webhook | Riconciliazione pagamenti |
| **GoCardless** | Bidirezionale | Addebiti diretti SEPA |
| **Banca Sella** | Import OFX | Riconciliazione estratto conto |
| **N26 / Qonto / Revolut** | Import CSV | Riconciliazione estratto conto |

#### Automazioni no-code
| Piattaforma | Trigger disponibili | Azioni disponibili |
|---|---|---|
| **Zapier** | Fattura creata/pagata/scaduta, Nuovo cliente | Crea fattura, Registra pagamento, Crea cliente |
| **Make (Integromat)** | Tutti gli eventi webhook | Tutti gli endpoint API |
| **n8n** | Tutti gli eventi webhook | Tutti gli endpoint API |

#### Gestione scolastica (verticale asilo nido)
| Piattaforma | Tipo | Cosa fa |
|---|---|---|
| **Nuvola** | Bidirezionale | Iscrizioni → clienti, rette → fatture |
| **Argo Software** | Import | Bambini, rette |
| **Maestre.it** | Bidirezionale | Gestionale completo asilo |
| **ClasseViva** | Import | Anagrafica alunni |

#### Comunicazione
| Piattaforma | Tipo | Cosa fa |
|---|---|---|
| **Slack** | Notifiche | Alert fatture pagate/scadute |
| **Microsoft Teams** | Notifiche | Alert fatture pagate/scadute |
| **WhatsApp Business** | Outbound | Invio fattura PDF + link pagamento |
| **Brevo / Mailchimp** | Outbound | Solleciti email branded |

---

### 11.8 Embed Widget

Per chi vuole incorporare funzionalità nella propria app senza costruire da zero:

```html
<!-- Widget fattura rapida embeddabile -->
<script src="https://cdn.fatturazioneit.it/widget.js"></script>
<div
  data-fi-widget="nuova-fattura"
  data-fi-api-key="fk_live_xxx"
  data-fi-org="org_abc"
  data-fi-theme="light"
  data-fi-on-created="window.onFatturaCreata"
></div>
```

Componenti embed disponibili:
- `nuova-fattura` — Form creazione fattura
- `lista-fatture` — Tabella fatture con filtri
- `stato-sdi` — Badge stato SDI real-time
- `link-pagamento` — Pagina pagamento per cliente finale

---

### 11.9 White Label & OEM

Per software house che vogliono rivendere la piattaforma sotto proprio marchio:

- **DNS custom:** `fatture.tuaapp.it` → punta a FatturazioneIT
- **Logo e colori:** completamente personalizzabili
- **Email transazionali:** da dominio del partner
- **PDF fatture:** template custom del partner
- **Onboarding custom:** wizard con brand del partner
- **Prezzi:** il partner definisce i propri piani
- **API stessa:** nessuna differenza funzionale
- **SLA dedicato** per partner enterprise

---

### 11.10 Documentazione API — Standard

La documentazione pubblica è generata automaticamente da:

```yaml
# openapi.yaml (estratto)
openapi: 3.1.0
info:
  title: FatturazioneIT API
  version: 1.0.0
  description: |
    API REST completa per la fatturazione italiana.
    Supporta FatturaPA, SDI, regime forfettario, asilo nido,
    comunicazioni 730, split payment e tutti gli adempimenti fiscali italiani.
  contact:
    email: api@fatturazioneit.it
  license:
    name: Commercial
    url: https://fatturazioneit.it/api/license

servers:
  - url: https://api.fatturazioneit.it/v1
    description: Produzione
  - url: https://sandbox.api.fatturazioneit.it/v1
    description: Sandbox (dati fittizi, SDI simulato)

security:
  - BearerAuth: []
  - ApiKeyAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: Authorization
      description: "Bearer fk_live_xxxx"
```

**Strumenti:**
- Swagger UI su `https://api.fatturazioneit.it/docs`
- Postman Collection scaricabile (aggiornata ad ogni release)
- Sandbox con dati fittizi e SDI simulato
- Changelog versioni API con breaking changes segnalati 90 giorni prima
- Status page: `https://status.fatturazioneit.it`

---

### 11.11 Aggiornamento Prompt di Sessione

Versione aggiornata del blocco da incollare in ogni nuova sessione:

```
Sto sviluppando FatturazioneIT, un SaaS di fatturazione italiana API-first e full-stack.
Stack: React/TypeScript + Node.js/Fastify + PostgreSQL/Prisma.
Target: tutti i tipi di aziende italiane, con verticale specifico asilo nido.
Normativa: FatturaPA XML SDI, regime forfettario, split payment, reverse charge,
bollo virtuale, Bonus INPS asilo nido, comunicazione 730 AdE/STS.

PRINCIPIO FONDANTE: API-first. Ogni funzione è esposta via REST API v1.
Auth: OAuth2 + API Key con scope granulari.
Webhook: eventi tipizzati con payload standard e firma HMAC-SHA256.
Integrazioni native: WooCommerce, Shopify, Stripe, Zapier, Make, gestionali scolastici.
White label: supportato tramite DNS custom + branding.
SDK ufficiali: JS/TS, Python, PHP.

Riferisciti sempre al file MASTER_PROMPT_FatturazioneIT.md per:
- Schema DB (modelli Prisma)
- Architettura moduli
- Flussi utente
- Peculiarità fiscali italiane
- Endpoint API completi
- Catalogo webhook
- Integrazioni e SDK

[TASK CORRENTE]: descrivere qui il modulo specifico da sviluppare
```

---

*Documento v1.1 — aggiornare ad ogni modifica sostanziale di architettura o normativa*
