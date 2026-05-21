import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Pulizia
  await prisma.pagamento.deleteMany();
  await prisma.rigaFattura.deleteMany();
  await prisma.fattura.deleteMany();
  await prisma.prodotto.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.serieNumerazione.deleteMany();
  await prisma.userOrganization.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // ─── Utente demo ──────────────────────────────────
  const user = await prisma.user.create({
    data: {
      email: 'admin@fatturefacili.it',
      passwordHash: hashSync('password123', 10),
      nome: 'Giacomo',
      cognome: 'Bertolazzi',
      emailVerified: true,
    },
  });
  console.log('  ✅ Utente: admin@fatturefacili.it / password123');

  // ─── Organizzazione demo ──────────────────────────
  const org = await prisma.organization.create({
    data: {
      ragioneSociale: 'Studio Demo S.r.l.',
      partitaIva: '05159610236',
      codiceFiscale: 'BRTGCM00L19F861W',
      tipoSoggetto: 'PERSONA_GIURIDICA',
      regimeFiscale: 'ORDINARIO',
      tipoAttivita: 'LIBERO_PROFESSIONISTA',
      indirizzo: 'Via Roma 1',
      cap: '37100',
      comune: 'Verona',
      provincia: 'VR',
      email: 'info@studiodemo.it',
      pec: 'studiodemo@pec.it',
      telefono: '+39 045 1234567',
      codiceDestinatario: '0000000',
      iban: 'IT60X0542811101000000123456',
      ritenutaAcconto: false,
      bolloVirtuale: true,
      importoBollo: 2.0,
      sogliaBollo: 77.47,
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      role: 'OWNER',
    },
  });
  console.log('  ✅ Organizzazione: Studio Demo S.r.l.');

  // ─── Serie numerazione ────────────────────────────
  const serie = await prisma.serieNumerazione.create({
    data: {
      organizationId: org.id,
      nome: 'FT',
      prefisso: 'FT',
      anno: 2026,
      contatore: 4,
      lunghezzaNumero: 4,
    },
  });

  // ─── Clienti demo ─────────────────────────────────
  const clienti = await Promise.all([
    prisma.cliente.create({
      data: {
        organizationId: org.id,
        tipoCliente: 'AZIENDA',
        ragioneSociale: 'MEYOU S.r.l.',
        partitaIva: '05159610236',
        codiceFiscale: '05159610236',
        indirizzo: "quart. fra' Claudio Granzotto 33",
        cap: '37032',
        comune: 'Monteforte d\'Alpone',
        provincia: 'VR',
        pec: 'meyou@namirial.com',
        codiceDestinatario: '000000',
        email: 'info@meyou.it',
        telefono: '+39 045 9876543',
      },
    }),
    prisma.cliente.create({
      data: {
        organizationId: org.id,
        tipoCliente: 'PRIVATO',
        nome: 'Mario',
        cognome: 'Rossi',
        codiceFiscale: 'RSSMRA85M01H501Z',
        indirizzo: 'Via Garibaldi 15',
        cap: '20100',
        comune: 'Milano',
        provincia: 'MI',
        email: 'mario.rossi@email.com',
        telefono: '+39 02 1234567',
      },
    }),
    prisma.cliente.create({
      data: {
        organizationId: org.id,
        tipoCliente: 'AZIENDA',
        ragioneSociale: 'Tech Solutions S.p.A.',
        partitaIva: '12345678901',
        codiceFiscale: '12345678901',
        indirizzo: 'Corso Venezia 42',
        cap: '20121',
        comune: 'Milano',
        provincia: 'MI',
        pec: 'tech@pec.it',
        codiceDestinatario: 'A1B2C3D',
        email: 'admin@techsolutions.it',
      },
    }),
    prisma.cliente.create({
      data: {
        organizationId: org.id,
        tipoCliente: 'PROFESSIONISTA',
        nome: 'Laura',
        cognome: 'Bianchi',
        codiceFiscale: 'BNCLRA90A41A794T',
        partitaIva: '98765432109',
        indirizzo: 'Piazza San Marco 7',
        cap: '30124',
        comune: 'Venezia',
        provincia: 'VE',
        pec: 'laura.bianchi@pec.it',
        codiceDestinatario: '0000000',
        email: 'laura@bianchi.it',
      },
    }),
    prisma.cliente.create({
      data: {
        organizationId: org.id,
        tipoCliente: 'PA',
        ragioneSociale: 'Comune di Verona',
        codiceFiscale: '00215150236',
        indirizzo: 'Piazza Bra 1',
        cap: '37121',
        comune: 'Verona',
        provincia: 'VR',
        codiceDestinatario: 'UFKZ1A',
        email: 'protocollo@comune.verona.it',
        pec: 'comune.verona@legalmail.it',
      },
    }),
  ]);
  console.log(`  ✅ ${clienti.length} clienti creati`);

  // ─── Prodotti demo ────────────────────────────────
  const prodotti = await Promise.all([
    prisma.prodotto.create({
      data: {
        organizationId: org.id,
        codice: 'CONS-01',
        nome: 'Consulenza professionale',
        descrizione: 'Ora di consulenza professionale',
        prezzoUnitario: 80.0,
        aliquotaIVA: 22,
        unitaMisura: 'ore',
        categoria: 'Servizi',
      },
    }),
    prisma.prodotto.create({
      data: {
        organizationId: org.id,
        codice: 'DEV-01',
        nome: 'Sviluppo software',
        descrizione: 'Giornata di sviluppo software',
        prezzoUnitario: 450.0,
        aliquotaIVA: 22,
        unitaMisura: 'gg',
        categoria: 'Servizi',
      },
    }),
    prisma.prodotto.create({
      data: {
        organizationId: org.id,
        codice: 'PIANO-01',
        nome: 'Pianoforte Singolo e di gruppo',
        descrizione: 'Lezione di pianoforte singola e di gruppo, mese di agosto',
        prezzoUnitario: 70.0,
        aliquotaIVA: 22,
        unitaMisura: 'mese',
        categoria: 'Formazione',
        tipo: 'SERVIZIO',
        tracciaMagazzino: false,
      },
    }),
    prisma.prodotto.create({
      data: {
        organizationId: org.id,
        codice: 'KEY-RGB',
        nome: 'Tastiera Meccanica RGB',
        descrizione: 'Tastiera meccanica gaming retroilluminata switch rossi',
        prezzoUnitario: 120.0,
        aliquotaIVA: 22,
        unitaMisura: 'pz',
        categoria: 'Hardware',
        tipo: 'PRODOTTO',
        tracciaMagazzino: true,
        giacenza: 50,
        sogliaScorta: 10,
      },
    }),
  ]);
  console.log(`  ✅ ${prodotti.length} prodotti creati`);

  // ─── Fatture demo ─────────────────────────────────
  const fatture = [
    {
      numero: 'FT2026/0001',
      progressivo: 1,
      clienteId: clienti[1].id, // Mario Rossi
      tipoDocumento: 'FATTURA',
      direzione: 'USCITA',
      dataEmissione: new Date('2026-04-10'),
      stato: 'PAGATA',
      oggettoFattura: 'Lezione pianoforte marzo',
      imponibile: 70.0,
      totaleIVA: 15.4,
      totale: 85.4,
      totalePagato: 85.4,
      nettoAPagare: 85.4,
      metodoPagamento: 'POS',
      righe: [
        { ordine: 1, descrizione: 'Pianoforte Singolo e di gruppo, mese di agosto', quantita: 1, prezzoUnitario: 70, aliquotaIVA: 22, imponibile: 70, importoIVA: 15.4, totale: 85.4, prodottoId: prodotti[2].id },
      ],
    },
    {
      numero: 'FT2026/0002',
      progressivo: 2,
      clienteId: clienti[1].id, // Mario Rossi
      tipoDocumento: 'NOTA_CREDITO',
      direzione: 'USCITA',
      dataEmissione: new Date('2026-04-15'),
      stato: 'EMESSA',
      oggettoFattura: 'Nota credito parziale',
      imponibile: 50.0,
      totaleIVA: 11.0,
      totale: 61.0,
      totalePagato: 0,
      nettoAPagare: 61.0,
      metodoPagamento: 'POS',
      righe: [
        { ordine: 1, descrizione: 'Storno parziale lezione', quantita: 1, prezzoUnitario: 50, aliquotaIVA: 22, imponibile: 50, importoIVA: 11, totale: 61 },
      ],
    },
    {
      numero: 'FT2026/0003',
      progressivo: 3,
      clienteId: clienti[0].id, // MEYOU
      tipoDocumento: 'FATTURA',
      direzione: 'USCITA',
      dataEmissione: new Date('2026-04-17'),
      stato: 'EMESSA',
      oggettoFattura: 'Sviluppo piattaforma web',
      imponibile: 2250.0,
      totaleIVA: 495.0,
      totale: 2745.0,
      totalePagato: 0,
      nettoAPagare: 2745.0,
      metodoPagamento: 'BONIFICO',
      righe: [
        { ordine: 1, descrizione: 'Sviluppo software', quantita: 5, unitaMisura: 'gg', prezzoUnitario: 450, aliquotaIVA: 22, imponibile: 2250, importoIVA: 495, totale: 2745, prodottoId: prodotti[1].id },
      ],
    },
    {
      numero: 'FT2026/0004',
      progressivo: 4,
      clienteId: clienti[2].id, // Tech Solutions
      tipoDocumento: 'FATTURA',
      direzione: 'USCITA',
      dataEmissione: new Date('2026-04-20'),
      dataScadenza: new Date('2026-05-20'),
      stato: 'SCADUTA',
      oggettoFattura: 'Consulenza trimestrale',
      imponibile: 1600.0,
      totaleIVA: 352.0,
      totale: 1952.0,
      totalePagato: 0,
      nettoAPagare: 1952.0,
      metodoPagamento: 'BONIFICO',
      righe: [
        { ordine: 1, descrizione: 'Consulenza professionale', quantita: 20, unitaMisura: 'ore', prezzoUnitario: 80, aliquotaIVA: 22, imponibile: 1600, importoIVA: 352, totale: 1952, prodottoId: prodotti[0].id },
      ],
    },
  ];

  for (const f of fatture) {
    const { righe, ...fatturaData } = f;
    await prisma.fattura.create({
      data: {
        organizationId: org.id,
        serieId: serie.id,
        ...fatturaData,
        righe: {
          create: righe,
        },
      },
    });
  }
  console.log(`  ✅ ${fatture.length} fatture create`);

  // Pagamento per fattura 1
  const ft1 = await prisma.fattura.findFirst({ where: { numero: 'FT2026/0001' } });
  if (ft1) {
    await prisma.pagamento.create({
      data: {
        fatturaId: ft1.id,
        data: new Date('2026-04-12'),
        importo: 85.4,
        metodo: 'POS',
        riferimento: 'POS #1234',
      },
    });
    console.log('  ✅ 1 pagamento registrato');
  }

  console.log('\n✨ Seed completato!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
