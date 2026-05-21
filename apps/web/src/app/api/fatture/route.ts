import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// GET /api/fatture
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const stato = url.searchParams.get('stato') || '';
  const direzione = url.searchParams.get('direzione') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const where: Record<string, unknown> = { organizationId: session.orgId };

  if (stato) where.stato = stato;
  if (direzione) where.direzione = direzione;
  if (search) {
    where.OR = [
      { numero: { contains: search } },
      { oggettoFattura: { contains: search } },
      { cliente: { ragioneSociale: { contains: search } } },
      { cliente: { cognome: { contains: search } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.fattura.findMany({
      where,
      include: {
        cliente: { select: { id: true, ragioneSociale: true, nome: true, cognome: true } },
      },
      orderBy: { dataEmissione: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.fattura.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

// POST /api/fatture — crea nuova fattura
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  try {
    const body = await req.json();

    // Calcola totali dalle righe
    let imponibile = 0;
    let totaleIVA = 0;
    const righe = (body.righe || []).map((r: Record<string, unknown>, i: number) => {
      const qty = Number(r.quantita) || 1;
      const prezzo = Number(r.prezzoUnitario) || 0;
      const sconto = Number(r.sconto) || 0;
      const aliquotaIVA = Number(r.aliquotaIVA) || 22;

      const rigaImponibile = Math.round((qty * prezzo * (1 - sconto / 100)) * 100) / 100;
      const rigaIVA = Math.round((rigaImponibile * aliquotaIVA / 100) * 100) / 100;
      const rigaTotale = Math.round((rigaImponibile + rigaIVA) * 100) / 100;

      imponibile += rigaImponibile;
      totaleIVA += rigaIVA;

      return {
        ordine: i + 1,
        descrizione: String(r.descrizione || ''),
        quantita: qty,
        unitaMisura: (r.unitaMisura as string) || null,
        prezzoUnitario: prezzo,
        sconto,
        aliquotaIVA,
        naturaIVA: (r.naturaIVA as string) || null,
        imponibile: rigaImponibile,
        importoIVA: rigaIVA,
        totale: rigaTotale,
        prodottoId: (r.prodottoId as string) || null,
      };
    });

    imponibile = Math.round(imponibile * 100) / 100;
    totaleIVA = Math.round(totaleIVA * 100) / 100;

    // Bollo virtuale
    const org = await prisma.organization.findUnique({ where: { id: session.orgId } });
    let importoBollo: number | null = null;
    if (org?.bolloVirtuale && imponibile > (org.sogliaBollo || 77.47)) {
      // Bollo si applica solo se la fattura ha IVA esente (naturaIVA presente)
      const hasNaturaIVA = righe.some((r: { naturaIVA: string | null }) => r.naturaIVA);
      if (hasNaturaIVA) {
        importoBollo = org.importoBollo || 2.0;
      }
    }

    // Ritenuta d'acconto
    let importoRitenuta: number | null = null;
    if (org?.ritenutaAcconto) {
      importoRitenuta = Math.round(imponibile * (org.aliquotaRitenuta || 0.20) * 100) / 100;
    }

    // Cassa previdenziale
    let importoCassa: number | null = null;
    if (org?.cassaPrevidenziale && org.aliquotaCassa) {
      importoCassa = Math.round(imponibile * org.aliquotaCassa * 100) / 100;
    }

    const totale = Math.round((imponibile + totaleIVA + (importoBollo || 0) + (importoCassa || 0)) * 100) / 100;
    const nettoAPagare = Math.round((totale - (importoRitenuta || 0)) * 100) / 100;

    // Numero progressivo (bozza = temp)
    const isBozza = body.stato === 'BOZZA' || !body.stato;
    let numero = 'BOZZA';
    let progressivo = 0;

    if (!isBozza) {
      // Assegna numero definitivo
      const currentYear = new Date().getFullYear();
      const serie = await prisma.serieNumerazione.findFirst({
        where: { organizationId: session.orgId, anno: currentYear },
      });
      if (serie) {
        const newCount = serie.contatore + 1;
        await prisma.serieNumerazione.update({
          where: { id: serie.id },
          data: { contatore: newCount },
        });
        progressivo = newCount;
        numero = `${serie.prefisso || 'FT'}${currentYear}/${String(newCount).padStart(serie.lunghezzaNumero, '0')}`;
      }
    }

    const fattura = await prisma.fattura.create({
      data: {
        organizationId: session.orgId,
        clienteId: body.clienteId,
        numero,
        progressivo,
        tipoDocumento: body.tipoDocumento || 'FATTURA',
        direzione: body.direzione || 'USCITA',
        dataEmissione: new Date(body.dataEmissione || new Date()),
        dataScadenza: body.dataScadenza ? new Date(body.dataScadenza) : null,
        stato: isBozza ? 'BOZZA' : 'EMESSA',
        oggettoFattura: body.oggettoFattura || null,
        imponibile,
        totaleIVA,
        totale,
        nettoAPagare,
        importoBollo,
        importoRitenuta,
        importoCassa,
        metodoPagamento: body.metodoPagamento || null,
        note: body.note || null,
        alunnoNomeCognome: body.alunnoNomeCognome || null,
        alunnoCodiceFiscale: body.alunnoCodiceFiscale || null,
        isRettaScolastica: Boolean(body.isRettaScolastica),
        righe: { create: righe },
      },
      include: { righe: true, cliente: true },
    });

    // Se la fattura viene emessa direttamente (non bozza), decrementa giacenza prodotti tracciati
    if (!isBozza) {
      for (const riga of righe) {
        if (riga.prodottoId) {
          const prod = await prisma.prodotto.findUnique({ where: { id: riga.prodottoId } });
          if (prod && prod.tipo === 'PRODOTTO' && prod.tracciaMagazzino) {
            await prisma.prodotto.update({
              where: { id: riga.prodottoId },
              data: { giacenza: { decrement: riga.quantita } },
            });
          }
        }
      }
    }

    return NextResponse.json(fattura, { status: 201 });
  } catch (e) {
    console.error('Create fattura error:', e);
    return NextResponse.json({ error: 'Errore creazione fattura' }, { status: 500 });
  }
}
