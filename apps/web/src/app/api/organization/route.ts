import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// GET /api/organization — Recupera l'organizzazione dell'utente corrente
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.orgId },
  });

  if (!organization) {
    return NextResponse.json({ error: 'Organizzazione non trovata' }, { status: 404 });
  }

  return NextResponse.json(organization);
}

// PUT /api/organization — Aggiorna i dati dell'organizzazione
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Rimuoviamo campi protetti che non devono essere modificati arbitrariamente o che causerebbero errori
    const { id, createdAt, updatedAt, ...updatableFields } = body;

    // Converte stringhe vuote in null per i campi opzionali (soprattutto per campi @unique)
    if (updatableFields.partitaIva === '') updatableFields.partitaIva = null;
    if (updatableFields.pec === '') updatableFields.pec = null;
    if (updatableFields.telefono === '') updatableFields.telefono = null;
    if (updatableFields.sito === '') updatableFields.sito = null;
    if (updatableFields.iban === '') updatableFields.iban = null;
    if (updatableFields.bic === '') updatableFields.bic = null;
    if (updatableFields.intestatarioConto === '') updatableFields.intestatarioConto = null;
    if (updatableFields.codiceDestinatario === '') updatableFields.codiceDestinatario = null;

    // Convertiamo eventuali stringhe numeriche in Float
    if (updatableFields.coefficienteRedd !== undefined) {
      updatableFields.coefficienteRedd = updatableFields.coefficienteRedd ? parseFloat(updatableFields.coefficienteRedd) : null;
    }
    if (updatableFields.impostaForfettaria !== undefined) {
      updatableFields.impostaForfettaria = updatableFields.impostaForfettaria ? parseFloat(updatableFields.impostaForfettaria) : null;
    }
    if (updatableFields.aliquotaRitenuta !== undefined) {
      updatableFields.aliquotaRitenuta = updatableFields.aliquotaRitenuta ? parseFloat(updatableFields.aliquotaRitenuta) : null;
    }
    if (updatableFields.aliquotaCassa !== undefined) {
      updatableFields.aliquotaCassa = updatableFields.aliquotaCassa ? parseFloat(updatableFields.aliquotaCassa) : null;
    }
    if (updatableFields.importoBollo !== undefined) {
      updatableFields.importoBollo = updatableFields.importoBollo ? parseFloat(updatableFields.importoBollo) : null;
    }
    if (updatableFields.sogliaBollo !== undefined) {
      updatableFields.sogliaBollo = updatableFields.sogliaBollo ? parseFloat(updatableFields.sogliaBollo) : null;
    }
    if (updatableFields.annoInizioRegime !== undefined) {
      updatableFields.annoInizioRegime = updatableFields.annoInizioRegime ? parseInt(updatableFields.annoInizioRegime) : null;
    }

    const updated = await prisma.organization.update({
      where: { id: session.orgId },
      data: updatableFields,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error('Update organization error:', e);
    return NextResponse.json({ error: e.message || 'Errore durante l\'aggiornamento dei dati' }, { status: 500 });
  }
}
