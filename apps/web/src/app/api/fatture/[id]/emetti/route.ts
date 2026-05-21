import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// POST /api/fatture/:id/emetti — emette fattura (BOZZA → EMESSA)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  const fattura = await prisma.fattura.findFirst({
    where: { id, organizationId: session.orgId },
  });

  if (!fattura) return NextResponse.json({ error: 'Non trovata' }, { status: 404 });
  if (fattura.stato !== 'BOZZA') {
    return NextResponse.json({ error: 'Solo le bozze possono essere emesse' }, { status: 409 });
  }

  // Assegna numero progressivo
  const currentYear = new Date().getFullYear();
  const serie = await prisma.serieNumerazione.findFirst({
    where: { organizationId: session.orgId, anno: currentYear },
  });

  let numero = fattura.numero;
  let progressivo = fattura.progressivo;

  if (serie) {
    const newCount = serie.contatore + 1;
    await prisma.serieNumerazione.update({
      where: { id: serie.id },
      data: { contatore: newCount },
    });
    progressivo = newCount;
    numero = `${serie.prefisso || 'FT'}${currentYear}/${String(newCount).padStart(serie.lunghezzaNumero, '0')}`;
  }

  const updated = await prisma.fattura.update({
    where: { id },
    data: {
      stato: 'EMESSA',
      numero,
      progressivo,
      dataEmissione: new Date(),
    },
  });

  // Aggiorna Magazzino per i prodotti fisici tracciati
  const righe = await prisma.rigaFattura.findMany({
    where: { fatturaId: id },
  });

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

  return NextResponse.json(updated);
}
