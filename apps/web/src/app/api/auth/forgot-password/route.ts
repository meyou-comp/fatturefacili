import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_123');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email mancante' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Per sicurezza, non riveliamo se l'utente esiste o meno
    if (!user) {
      return NextResponse.json({ success: true, message: 'Se l\'email è registrata riceverai un link' });
    }

    // Genera token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 ora di validità

    // Salva token su DB
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // Tentativo di invio email con Resend
    const { data, error } = await resend.emails.send({
      from: 'Fatture Facili <noreply@fatturefacili.com>',
      to: [email],
      subject: 'Reimposta la tua password',
      html: `
        <h2>Richiesta di ripristino password</h2>
        <p>Ciao ${user.nome},</p>
        <p>Hai richiesto di reimpostare la tua password. Clicca sul link seguente (valido per 1 ora):</p>
        <p><a href="${resetLink}">Reimposta Password</a></p>
        <p>Se non hai richiesto il ripristino, ignora questa email.</p>
      `
    });

    if (error) {
      console.error('Errore invio email reset password:', error);
    }

    return NextResponse.json({ success: true, resetLink });
  } catch (error: any) {
    console.error('Errore forgot password:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
