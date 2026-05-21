'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    tipoCliente: 'AZIENDA',
    ragioneSociale: '',
    nome: '',
    cognome: '',
    codiceFiscale: '',
    partitaIva: '',
    indirizzo: '',
    cap: '',
    comune: '',
    provincia: '',
    pec: '',
    codiceDestinatario: '',
    email: '',
    telefono: '',
    note: '',
  });

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/clienti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Errore');
        return;
      }

      router.push('/clienti');
    } catch {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const isAzienda = form.tipoCliente === 'AZIENDA' || form.tipoCliente === 'PA';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clienti" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Nuovo Cliente</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Aggiungi un nuovo cliente all&apos;anagrafica</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}

        {/* Tipo cliente */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-foreground">Tipo Cliente</h2>
          <div className="flex gap-3">
            {(['PRIVATO', 'AZIENDA', 'PROFESSIONISTA', 'PA'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => set('tipoCliente', tipo)}
                className={`rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors ${
                  form.tipoCliente === tipo ? 'border-primary bg-primary/20 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {tipo === 'PA' ? 'Pubblica Amm.' : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dati anagrafici */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-foreground">Dati Anagrafici</h2>
          <div className="grid grid-cols-2 gap-4">
            {isAzienda && (
              <div className="col-span-2 space-y-1.5">
                <label className="text-[12px] font-medium text-foreground">Ragione Sociale *</label>
                <input value={form.ragioneSociale} onChange={(e) => set('ragioneSociale', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" required />
              </div>
            )}
            {!isAzienda && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Nome *</label>
                  <input value={form.nome} onChange={(e) => set('nome', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Cognome *</label>
                  <input value={form.cognome} onChange={(e) => set('cognome', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" required />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Codice Fiscale</label>
              <input value={form.codiceFiscale} onChange={(e) => set('codiceFiscale', e.target.value.toUpperCase())} maxLength={16} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Partita IVA</label>
              <input value={form.partitaIva} onChange={(e) => set('partitaIva', e.target.value.replace(/\D/g, ''))} maxLength={11} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark" />
            </div>
          </div>
        </div>

        {/* Indirizzo */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-foreground">Indirizzo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Indirizzo</label>
              <input value={form.indirizzo} onChange={(e) => set('indirizzo', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">CAP</label>
              <input value={form.cap} onChange={(e) => set('cap', e.target.value.replace(/\D/g, ''))} maxLength={5} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Comune</label>
              <input value={form.comune} onChange={(e) => set('comune', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Provincia</label>
              <input value={form.provincia} onChange={(e) => set('provincia', e.target.value.toUpperCase())} maxLength={2} className="h-10 w-28 rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark" />
            </div>
          </div>
        </div>

        {/* Contatti e SDI */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-foreground">Contatti &amp; SDI</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Telefono</label>
              <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">PEC</label>
              <input type="email" value={form.pec} onChange={(e) => set('pec', e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Codice SDI</label>
              <input value={form.codiceDestinatario} onChange={(e) => set('codiceDestinatario', e.target.value.toUpperCase())} maxLength={7} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark" placeholder="0000000" />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-foreground">Note</h2>
          <textarea value={form.note} onChange={(e) => set('note', e.target.value)} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-primary-dark resize-none" />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/clienti" className="rounded-lg border border-border px-5 py-2.5 text-[13px] font-medium hover:bg-muted">
            Annulla
          </Link>
          <button type="submit" disabled={loading} className="rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {loading ? 'Salvataggio...' : 'Salva Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
