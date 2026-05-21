import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// GET /api/clienti — lista con ricerca e paginazione
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const where = {
    organizationId: session.orgId,
    ...(search
      ? {
          OR: [
            { ragioneSociale: { contains: search } },
            { nome: { contains: search } },
            { cognome: { contains: search } },
            { partitaIva: { contains: search } },
            { codiceFiscale: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.cliente.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

// POST /api/clienti — crea nuovo cliente
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  try {
    const body = await req.json();
    const cliente = await prisma.cliente.create({
      data: {
        organizationId: session.orgId,
        tipoCliente: body.tipoCliente || 'PRIVATO',
        ragioneSociale: body.ragioneSociale || null,
        nome: body.nome || null,
        cognome: body.cognome || null,
        codiceFiscale: body.codiceFiscale || null,
        partitaIva: body.partitaIva || null,
        indirizzo: body.indirizzo || null,
        cap: body.cap || null,
        comune: body.comune || null,
        provincia: body.provincia || null,
        paese: body.paese || 'IT',
        pec: body.pec || null,
        codiceDestinatario: body.codiceDestinatario || null,
        email: body.email || null,
        telefono: body.telefono || null,
        note: body.note || null,
      },
    });
    return NextResponse.json(cliente, { status: 201 });
  } catch (e) {
    console.error('Create client error:', e);
    return NextResponse.json({ error: 'Errore creazione cliente' }, { status: 500 });
  }
}
