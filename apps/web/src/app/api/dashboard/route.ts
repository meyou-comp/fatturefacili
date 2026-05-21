import { NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

interface FatturaRow { totale: number; totalePagato: number; nettoAPagare: number; }

// GET /api/dashboard — KPI aggregati
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  const orgId = session.orgId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Fatture del mese corrente
  const fattureThisMonth = await prisma.fattura.findMany({
    where: {
      organizationId: orgId,
      dataEmissione: { gte: startOfMonth },
      stato: { not: 'ANNULLATA' },
    },
  });

  // Fatture del mese scorso
  const fattureLastMonth = await prisma.fattura.findMany({
    where: {
      organizationId: orgId,
      dataEmissione: { gte: startOfLastMonth, lte: endOfLastMonth },
      stato: { not: 'ANNULLATA' },
    },
  });

  // Calcoli
  const fatturatoMese = fattureThisMonth.reduce((s: number, f: FatturaRow) => s + f.totale, 0);
  const fatturatoMesePrec = fattureLastMonth.reduce((s: number, f: FatturaRow) => s + f.totale, 0);
  const variazioneFatturato = fatturatoMesePrec > 0
    ? Math.round(((fatturatoMese - fatturatoMesePrec) / fatturatoMesePrec) * 1000) / 10
    : 0;

  // Fatture incassate (totalePagato)
  const incassato = fattureThisMonth.reduce((s: number, f: FatturaRow) => s + f.totalePagato, 0);
  const incassatoPrec = fattureLastMonth.reduce((s: number, f: FatturaRow) => s + f.totalePagato, 0);
  const varIncassato = incassatoPrec > 0
    ? Math.round(((incassato - incassatoPrec) / incassatoPrec) * 1000) / 10
    : 0;

  // Da incassare
  const tutteFatture = await prisma.fattura.findMany({
    where: {
      organizationId: orgId,
      stato: { in: ['EMESSA', 'PARZIALMENTE_PAGATA', 'SCADUTA'] },
    },
  });
  const daIncassare = tutteFatture.reduce(
    (s: number, f: FatturaRow) => s + (f.nettoAPagare - f.totalePagato),
    0,
  );

  // Conteggio fatture mese
  const numFattureMese = fattureThisMonth.length;
  const numFattureMesePrec = fattureLastMonth.length;

  // Ultime fatture
  const ultimeFatture = await prisma.fattura.findMany({
    where: { organizationId: orgId },
    include: {
      cliente: { select: { ragioneSociale: true, nome: true, cognome: true } },
    },
    orderBy: { dataEmissione: 'desc' },
    take: 10,
  });

  return NextResponse.json({
    fatturato: {
      value: Math.round(fatturatoMese * 100) / 100,
      change: variazioneFatturato,
    },
    incassato: {
      value: Math.round(incassato * 100) / 100,
      change: varIncassato,
    },
    daIncassare: {
      value: Math.round(daIncassare * 100) / 100,
      count: tutteFatture.length,
    },
    numFatture: {
      value: numFattureMese,
      change: numFattureMese - numFattureMesePrec,
    },
    ultimeFatture,
  });
}
