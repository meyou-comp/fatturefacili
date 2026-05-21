import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // e.g. "user_ckq..." or "inv_ckq..."
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    // Check permissions
    const currentUser = await prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId: session.userId, organizationId: session.orgId } }
    });

    if (!currentUser || (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 });
    }

    if (id.startsWith('inv_')) {
      const dbId = id.replace('inv_', '');
      await prisma.invitation.delete({
        where: { id: dbId, organizationId: session.orgId }
      });
    } else if (id.startsWith('user_')) {
      const dbId = id.replace('user_', '');
      
      // Prevent deleting the OWNER or yourself
      const targetUser = await prisma.userOrganization.findUnique({
        where: { id: dbId }
      });
      
      if (!targetUser || targetUser.organizationId !== session.orgId) {
        return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
      }
      
      if (targetUser.role === 'OWNER') {
        return NextResponse.json({ error: 'Impossibile rimuovere il proprietario' }, { status: 400 });
      }
      
      if (targetUser.userId === session.userId) {
         return NextResponse.json({ error: 'Non puoi rimuovere te stesso da qui' }, { status: 400 });
      }

      await prisma.userOrganization.delete({
        where: { id: dbId }
      });
    } else {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE collaborator error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
