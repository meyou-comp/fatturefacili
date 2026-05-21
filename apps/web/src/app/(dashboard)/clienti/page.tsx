'use client';

import { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';

interface Cliente {
  id: string;
  ragioneSociale: string | null;
  nome: string | null;
  cognome: string | null;
  partitaIva: string | null;
  codiceFiscale: string | null;
  indirizzo: string | null;
  comune: string | null;
  pec: string | null;
  codiceDestinatario: string | null;
  email: string | null;
}

function clientName(c: Cliente) {
  return c.ragioneSociale || [c.nome, c.cognome].filter(Boolean).join(' ') || '—';
}

export default function ClientiPage() {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClienti = (q: string = '') => {
    setLoading(true);
    fetch(`/api/clienti?search=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setClienti(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClienti(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchClienti(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clienti"
        subtitle="Anagrafica clienti e contatti"
        ctaLabel="Nuovo Cliente"
        ctaHref="/clienti/nuovo"
        ctaId="create-client-button"
      />

      <div className="flex items-center rounded-xl border border-border bg-white p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca per nome, P.IVA, CF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg bg-transparent pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
            id="client-search"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold text-foreground">Cliente</h2>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            Scarica XLS
          </button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Nome</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">P.IVA</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Indirizzo</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">PEC</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">SDI</th>
              </tr>
            </thead>
            <tbody>
              {clienti.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-border transition-colors hover:bg-muted/30 cursor-pointer"
                  onClick={() => window.location.href = `/clienti/${c.id}`}
                >
                  <td className="px-6 py-4 text-[13px] font-medium text-foreground">{clientName(c)}</td>
                  <td className="px-6 py-4 text-[13px] text-foreground">{c.partitaIva || '—'}</td>
                  <td className="max-w-[220px] truncate px-6 py-4 text-[13px] text-foreground">
                    {[c.indirizzo, c.comune].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-foreground">{c.pec || c.email || '—'}</td>
                  <td className="px-6 py-4 text-[13px] text-foreground">{c.codiceDestinatario || '—'}</td>
                </tr>
              ))}
              {clienti.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-muted-foreground">
                    Nessun cliente trovato
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
