'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/shared/logo';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const cycle = searchParams.get('cycle');

  const [ragioneSociale, setRagioneSociale] = useState('');
  const [partitaIva, setPartitaIva] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ragioneSociale,
          partitaIva,
          codiceFiscale: partitaIva // In Italia la P.IVA spesso coincide col CF per le aziende, per un onboarding rapido usiamo lo stesso campo o ignoriamo il check stringente
        }),
      });

      if (!res.ok) {
        throw new Error('Errore durante il salvataggio dei dati');
      }

      // Route based on plan
      if (plan && plan !== 'BASE') {
        router.push(`/impostazioni?checkoutPlan=${plan}&checkoutCycle=${cycle || 'monthly'}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Qualcosa è andato storto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
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
          <h2 className="text-xl font-semibold text-foreground mt-2">Benvenuto a bordo!</h2>
          <p className="text-[13px] text-muted-foreground text-center">
            Per iniziare abbiamo bisogno di un paio di dettagli sulla tua attività.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="ragioneSociale">
              Ragione Sociale o Nome
            </label>
            <input
              id="ragioneSociale"
              type="text"
              value={ragioneSociale}
              onChange={(e) => setRagioneSociale(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] text-foreground outline-none transition-colors focus:border-primary-dark focus:ring-1 focus:ring-primary-dark"
              placeholder="Es. Mario Rossi SRL"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="partitaIva">
              Partita IVA / Codice Fiscale
            </label>
            <input
              id="partitaIva"
              type="text"
              value={partitaIva}
              onChange={(e) => setPartitaIva(e.target.value.toUpperCase())}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] text-foreground outline-none transition-colors focus:border-primary-dark focus:ring-1 focus:ring-primary-dark"
              placeholder="Inserisci P.IVA o CF"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-primary font-semibold text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 mt-4"
          >
            {loading ? 'Salvataggio...' : 'Continua'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OnboardingContent />
    </Suspense>
  );
}
