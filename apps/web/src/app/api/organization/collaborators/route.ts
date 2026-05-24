import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';
import { Resend } from 'resend';
import InviteEmail from '@/emails/InviteEmail';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_123');

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const activeUsers = await prisma.userOrganization.findMany({
      where: { organizationId: session.orgId },
      include: { user: true },
    });

    const pendingInvites = await prisma.invitation.findMany({
      where: { organizationId: session.orgId, status: 'PENDING' },
    });

    const mappedActive = activeUsers.map(u => ({
      id: `user_${u.id}`,
      dbId: u.id,
      type: 'user',
      nome: `${u.user.nome} ${u.user.cognome}`.trim(),
      email: u.user.email,
      ruolo: u.role,
      stato: 'ATTIVO',
    }));

    const mappedPending = pendingInvites.map(i => ({
      id: `inv_${i.id}`,
      dbId: i.id,
      type: 'invite',
      nome: i.email.split('@')[0],
      email: i.email,
      ruolo: i.role,
      stato: 'IN_ATTESA',
    }));

    return NextResponse.json([...mappedActive, ...mappedPending]);
  } catch (error: any) {
    console.error('GET collaborators error:', error);
    return NextResponse.json({ error: 'Errore durante il recupero dei collaboratori' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    // Check if the current user has permission (OWNER or ADMIN)
    const currentUser = await prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId: session.userId, organizationId: session.orgId } },
      include: { organization: true }
    });

    if (!currentUser || (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // Check if user is already in the organization
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const alreadyInOrg = await prisma.userOrganization.findUnique({
        where: { userId_organizationId: { userId: existingUser.id, organizationId: session.orgId } }
      });
      if (alreadyInOrg) {
        return NextResponse.json({ error: 'L\'utente è già parte dell\'organizzazione' }, { status: 400 });
      }
    }

    // Generate token and expiration (7 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Upsert invitation (in case they were invited before but it expired/was deleted)
    const invite = await prisma.invitation.upsert({
      where: { email_organizationId: { email, organizationId: session.orgId } },
      update: { token, role, status: 'PENDING', expiresAt },
      create: { email, organizationId: session.orgId, role, token, expiresAt },
    });

    // Send email using Resend
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const inviteLink = `${appUrl}/invite/${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Fatture Facili <invites@fatturefacili.com>', // MUST BE VERIFIED DOMAIN IN RESEND
      to: [email],
      subject: `Invito a collaborare su ${currentUser.organization.ragioneSociale}`,
      react: InviteEmail({
        organizationName: currentUser.organization.ragioneSociale,
        inviteLink
      }) as any, // Cast needed due to some react-email type conflicts with Next15
    });

    if (error) {
      console.error('Resend error:', error);
      // We don't fail the request completely if Resend is not configured yet,
      // just log it so the user knows.
    }

    return NextResponse.json({ success: true, inviteId: invite.id, inviteLink });
  } catch (error: any) {
    console.error('POST invite error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
