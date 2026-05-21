import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  const cliente = await prisma.cliente.findFirst({
    where: { id, organizationId: session.orgId },
    include: { fatture: { orderBy: { dataEmissione: 'desc' }, take: 10 } },
  });

  if (!cliente) return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const cliente = await prisma.cliente.updateMany({
    where: { id, organizationId: session.orgId },
    data: body,
  });

  if (cliente.count === 0) return NextResponse.json({ error: 'Non trovato' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  // Check fatture collegate
  const fatture = await prisma.fattura.count({
    where: { clienteId: id, organizationId: session.orgId },
  });
  if (fatture > 0) {
    return NextResponse.json(
      { error: 'Impossibile eliminare: il cliente ha fatture collegate' },
      { status: 409 },
    );
  }

  await prisma.cliente.deleteMany({ where: { id, organizationId: session.orgId } });
  return NextResponse.json({ success: true });
}
