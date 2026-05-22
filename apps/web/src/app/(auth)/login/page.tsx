'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Sincronizza l'autenticazione con il backend (Prisma)
      await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userCredential.user.email })
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Credenziali non valide o errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Sincronizza l'autenticazione con il backend (Prisma)
      await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userCredential.user.email,
          nome: userCredential.user.displayName
        })
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Errore durante l\'accesso con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-[13px] font-bold text-foreground shadow-sm transition-all hover:bg-white hover:scale-105 border border-black/5">
        <ArrowLeft className="h-4 w-4" /> Torna alla Home
      </Link>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="https://firebasestorage.googleapis.com/v0/b/fatture-facili-2ce2b.firebasestorage.app/o/0520.mp4?alt=media&token=6a0e32d5-eb92-4b88-b4a0-d45d2d6a3dab" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent"></div>

      <div className="relative z-10 w-full max-w-[400px] space-y-8 rounded-2xl bg-white p-6 sm:p-10 shadow-xl border border-white/50">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-8 w-auto" />
          <p className="text-[13px] text-muted-foreground">Accedi al tuo account</p>
        </div>

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

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] text-foreground outline-none transition-colors focus:border-primary-dark focus:ring-1 focus:ring-primary-dark"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-primary font-semibold text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-muted-foreground text-[11px] font-medium uppercase">oppure</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white font-semibold text-[13px] text-foreground transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Accedi con Google
        </button>

        <p className="text-center text-[12px] text-muted-foreground">
          Non hai un account?{' '}
          <a href="/register" className="font-medium text-primary-dark hover:underline">
            Registrati
          </a>
        </p>
      </div>
    </div>
  );
}
