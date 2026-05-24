import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token e password sono richiesti' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La password deve contenere almeno 8 caratteri' }, { status: 400 });
    }

    // Trova il token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Token non valido o scaduto' }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      // Elimina il token scaduto per pulizia
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ error: 'Il token è scaduto. Richiedine uno nuovo.' }, { status: 400 });
    }

    // Hash della nuova password
    const passwordHash = await bcrypt.hash(password, 12);

    // Aggiorna la password dell'utente
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash }
    });

    // Elimina TUTTI i token di reset per questo utente (sicurezza aggiuntiva)
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId }
    });

    // Nota: L'utente usa anche Firebase Auth, ma qui si usa solo Prisma per il backend syncato.
    // L'autenticazione vera con email/password avviene tramite custom session (vedi libs/auth.ts) o firebase se usato assieme,
    // ma la gestione standard next/firebase richiede aggiornamento anche lato firebase se l'utente accede tramite firebase email.
    // Per ora aggiorniamo lato Prisma.

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Errore reset password:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
