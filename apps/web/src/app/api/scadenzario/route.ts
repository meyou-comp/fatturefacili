import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// GET /api/scadenzario — Recupera tutte le scadenze legate alle fatture
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'TUTTE'; // TUTTE, SCADUTE, PROSSIME, PAGATE

  try {
    // Troviamo tutte le fatture (escluse le bozze) legate all'organizzazione dell'utente
    const queryConditions: any = {
      organizationId: session.orgId,
      stato: { not: 'BOZZA' },
    };

    const now = new Date();

    if (filter === 'SCADUTE') {
      queryConditions.stato = { not: 'PAGATA' };
      queryConditions.dataScadenza = { lt: now };
    } else if (filter === 'PROSSIME') {
      queryConditions.stato = { not: 'PAGATA' };
      queryConditions.dataScadenza = { gte: now };
    } else if (filter === 'PAGATE') {
      queryConditions.stato = 'PAGATA';
    }

    const fatture = await prisma.fattura.findMany({
      where: queryConditions,
      include: {
        cliente: {
          select: {
            nome: true,
            cognome: true,
            ragioneSociale: true,
          },
        },
      },
      orderBy: {
        dataScadenza: 'asc',
      },
    });

    // Calcolo KPI per lo Scadenzario
    // 1. Totale Scaduto (Overdue)
    const scaduteDb = await prisma.fattura.findMany({
      where: {
        organizationId: session.orgId,
        stato: { notIn: ['BOZZA', 'PAGATA'] },
        dataScadenza: { lt: now },
      },
    });
    const totaleScaduto = scaduteDb.reduce((acc, f) => acc + (f.nettoAPagare - f.totalePagato), 0);

    // 2. In Scadenza (Prossimi 30 giorni)
    const trentaGiorniDopo = new Date();
    trentaGiorniDopo.setDate(trentaGiorniDopo.getDate() + 30);
    const inScadenzaDb = await prisma.fattura.findMany({
      where: {
        organizationId: session.orgId,
        stato: { notIn: ['BOZZA', 'PAGATA'] },
        dataScadenza: { gte: now, lte: trentaGiorniDopo },
      },
    });
    const totaleInScadenza = inScadenzaDb.reduce((acc, f) => acc + (f.nettoAPagare - f.totalePagato), 0);

    // 3. Totale da riscuotere complessivo (Unpaid total)
    const tuttiSospesiDb = await prisma.fattura.findMany({
      where: {
        organizationId: session.orgId,
        stato: { notIn: ['BOZZA', 'PAGATA'] },
      },
    });
    const totaleDaRiscuotere = tuttiSospesiDb.reduce((acc, f) => acc + (f.nettoAPagare - f.totalePagato), 0);

    return NextResponse.json({
      data: fatture,
      kpi: {
        totaleScaduto,
        totaleInScadenza,
        totaleDaRiscuotere,
      },
    });
  } catch (e) {
    console.error('Error fetching scadenzario:', e);
    return NextResponse.json({ error: 'Errore durante il recupero delle scadenze' }, { status: 500 });
  }
}
