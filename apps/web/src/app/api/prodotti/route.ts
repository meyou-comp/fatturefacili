import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const tipo = url.searchParams.get('tipo') || ''; // PRODOTTO or SERVIZIO
  const sottoScorta = url.searchParams.get('sottoScorta') === 'true';

  const where: any = {
    organizationId: session.orgId,
  };

  if (search) {
    where.OR = [
      { nome: { contains: search } },
      { codice: { contains: search } },
    ];
  }

  if (tipo) {
    where.tipo = tipo;
  }

  if (sottoScorta) {
    where.tracciaMagazzino = true;
    where.giacenza = {
      lt: prisma.prodotto.fields.sogliaScorta, // In SQLite we can just filter using Prisma's lt check
    };
  }

  let data = await prisma.prodotto.findMany({
    where,
    orderBy: { nome: 'asc' },
  });

  // Se sottoScorta è attivo, filtriamo in js per sicurezza in caso di SQLite type mapping
  if (sottoScorta) {
    data = data.filter(p => p.tracciaMagazzino && p.giacenza <= p.sogliaScorta);
  }

  return NextResponse.json({ data, total: data.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  const body = await req.json();
  const prodotto = await prisma.prodotto.create({
    data: {
      organizationId: session.orgId,
      codice: body.codice || null,
      nome: body.nome,
      descrizione: body.descrizione || null,
      prezzoUnitario: Number(body.prezzoUnitario) || 0,
      aliquotaIVA: Number(body.aliquotaIVA) || 22,
      naturaIVA: body.naturaIVA || null,
      unitaMisura: body.unitaMisura || null,
      categoria: body.categoria || null,
      tipo: body.tipo || 'PRODOTTO',
      tracciaMagazzino: body.tracciaMagazzino !== undefined ? Boolean(body.tracciaMagazzino) : false,
      giacenza: Number(body.giacenza) || 0,
      sogliaScorta: Number(body.sogliaScorta) || 0,
    },
  });

  return NextResponse.json(prodotto, { status: 201 });
}
