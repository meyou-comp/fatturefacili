import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Devi effettuare l'accesso per accettare un invito" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 400 });
    }

    const invite = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invito non trovato o non valido' }, { status: 404 });
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json({ error: 'Questo invito è già stato accettato' }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: 'Questo invito è scaduto' }, { status: 400 });
    }

    // Verify if the logged in user matches the invite email
    const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!currentUser || currentUser.email !== invite.email) {
      return NextResponse.json({ error: "Questa email non corrisponde all'invito" }, { status: 403 });
    }

    // Add user to organization
    await prisma.$transaction(async (tx) => {
      // 1. Create UserOrganization link
      await tx.userOrganization.upsert({
        where: { userId_organizationId: { userId: session.userId, organizationId: invite.organizationId } },
        update: { role: invite.role },
        create: {
          userId: session.userId,
          organizationId: invite.organizationId,
          role: invite.role,
        }
      });

      // 2. Mark invite as accepted
      await tx.invitation.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' }
      });
    });

    return NextResponse.json({ success: true, organizationId: invite.organizationId });
  } catch (error: any) {
    console.error('Accept invite error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
