import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { orgId } = await req.json();
    if (!orgId) {
      return NextResponse.json({ error: 'ID organizzazione mancante' }, { status: 400 });
    }

    // Verify the user actually has access to this organization
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.userId,
          organizationId: orgId,
        },
      },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'Accesso negato a questa organizzazione' }, { status: 403 });
    }

    // Update the session cookie with the new organization ID and role
    await setSessionCookie({
      userId: session.userId,
      email: session.email,
      orgId: orgId,
      role: userOrg.role,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Switch org error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
