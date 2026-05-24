'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Si è verificato un errore o l\'email non è registrata.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
      <Link href="/login" className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-[13px] font-bold text-foreground shadow-sm transition-all hover:bg-white hover:scale-105 border border-black/5">
        <ArrowLeft className="h-4 w-4" /> Torna al Login
      </Link>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      >
        <source src="https://firebasestorage.googleapis.com/v0/b/fatture-facili-2ce2b.firebasestorage.app/o/0520.mp4?alt=media&token=6a0e32d5-eb92-4b88-b4a0-d45d2d6a3dab" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent"></div>

      <div className="relative z-10 w-full max-w-[400px] space-y-8 rounded-2xl bg-white p-6 sm:p-10 shadow-xl border border-white/50">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-8 w-auto" />
          <p className="text-[13px] text-muted-foreground text-center">Inserisci la tua email per reimpostare la password</p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg bg-green-50 px-4 py-3 text-[13px] text-green-800 font-semibold border border-green-200">
              Se l'email è registrata, riceverai a breve un link ufficiale da Firebase per reimpostare la tua password.
            </div>
            <Link href="/login" className="inline-block text-[13px] font-bold text-primary-dark hover:underline mt-4">
              Torna al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] text-foreground outline-none transition-colors focus:border-primary-dark focus:ring-1 focus:ring-primary-dark"
                placeholder="nome@azienda.it"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-primary font-semibold text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Invio in corso...' : 'Invia Link di Reset'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
