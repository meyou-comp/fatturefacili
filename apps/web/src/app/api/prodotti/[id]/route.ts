import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// GET /api/prodotti/:id — Dettaglio prodotto/servizio
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  const prodotto = await prisma.prodotto.findFirst({
    where: { id, organizationId: session.orgId },
  });

  if (!prodotto) return NextResponse.json({ error: 'Non trovato' }, { status: 404 });

  return NextResponse.json(prodotto);
}

// PUT /api/prodotti/:id — Modifica prodotto/servizio o rettifica magazzino
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.nome !== undefined) dataToUpdate.nome = body.nome;
    if (body.codice !== undefined) dataToUpdate.codice = body.codice || null;
    if (body.descrizione !== undefined) dataToUpdate.descrizione = body.descrizione || null;
    if (body.prezzoUnitario !== undefined) dataToUpdate.prezzoUnitario = Number(body.prezzoUnitario);
    if (body.aliquotaIVA !== undefined) dataToUpdate.aliquotaIVA = Number(body.aliquotaIVA);
    if (body.unitaMisura !== undefined) dataToUpdate.unitaMisura = body.unitaMisura || null;
    if (body.categoria !== undefined) dataToUpdate.categoria = body.categoria || null;
    if (body.tipo !== undefined) dataToUpdate.tipo = body.tipo;
    if (body.tracciaMagazzino !== undefined) dataToUpdate.tracciaMagazzino = Boolean(body.tracciaMagazzino);
    if (body.giacenza !== undefined) dataToUpdate.giacenza = Number(body.giacenza);
    if (body.sogliaScorta !== undefined) dataToUpdate.sogliaScorta = Number(body.sogliaScorta);

    const updated = await prisma.prodotto.update({
      where: { id, organizationId: session.orgId },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Update product error:', e);
    return NextResponse.json({ error: 'Errore durante la modifica' }, { status: 500 });
  }
}

// DELETE /api/prodotti/:id — Elimina prodotto/servizio
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  try {
    // Verifichiamo se il prodotto è già stato utilizzato in qualche fattura
    const inUse = await prisma.rigaFattura.findFirst({
      where: { prodottoId: id },
    });

    if (inUse) {
      return NextResponse.json(
        { error: 'Impossibile eliminare un prodotto già utilizzato in fattura. Disabilitalo o modificalo.' },
        { status: 409 },
      );
    }

    await prisma.prodotto.delete({
      where: { id, organizationId: session.orgId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete product error:', e);
    return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 });
  }
}
