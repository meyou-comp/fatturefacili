import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// POST /api/fatture/:id/pagamenti — registra pagamento
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  const fattura = await prisma.fattura.findFirst({
    where: { id, organizationId: session.orgId },
  });

  if (!fattura) return NextResponse.json({ error: 'Non trovata' }, { status: 404 });

  const body = await req.json();
  const importo = Number(body.importo);

  if (!importo || importo <= 0) {
    return NextResponse.json({ error: 'Importo non valido' }, { status: 400 });
  }

  const pagamento = await prisma.pagamento.create({
    data: {
      fatturaId: id,
      data: new Date(body.data || new Date()),
      importo,
      metodo: body.metodo || 'BONIFICO',
      riferimento: body.riferimento || null,
      note: body.note || null,
    },
  });

  // Aggiorna totale pagato e stato
  const newTotalePagato = Math.round((fattura.totalePagato + importo) * 100) / 100;
  const nuovoStato =
    newTotalePagato >= fattura.nettoAPagare
      ? 'PAGATA'
      : newTotalePagato > 0
        ? 'PARZIALMENTE_PAGATA'
        : fattura.stato;

  await prisma.fattura.update({
    where: { id },
    data: {
      totalePagato: newTotalePagato,
      stato: nuovoStato,
      dataPagamento: nuovoStato === 'PAGATA' ? new Date() : null,
    },
  });

  return NextResponse.json(pagamento, { status: 201 });
}
