import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const { id } = await params;

  const fattura = await prisma.fattura.findFirst({
    where: { id, organizationId: session.orgId },
    include: {
      cliente: true,
      organization: true,
      righe: { orderBy: { ordine: 'asc' } },
      pagamenti: { orderBy: { data: 'desc' } },
    },
  });

  if (!fattura) return NextResponse.json({ error: 'Fattura non trovata' }, { status: 404 });
  return NextResponse.json(fattura);
}

export async function DELETE(
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
    return NextResponse.json({ error: 'Solo le bozze possono essere eliminate' }, { status: 409 });
  }

  await prisma.fattura.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
