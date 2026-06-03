'use client';

import { useEffect, useState, useRef } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { FilterBar } from '@/components/shared/filter-bar';
import { cn } from '@/lib/utils';

interface Fattura {
  id: string;
  numero: string;
  totale: number;
  nettoAPagare: number;
  stato: string;
  tipoDocumento: string;
  dataEmissione: string;
  metodoPagamento: string | null;
  cliente: { ragioneSociale: string | null; nome: string | null; cognome: string | null };
}

const statoBadge: Record<string, { bg: string; text: string }> = {
  BOZZA: { bg: 'bg-gray-100', text: 'text-gray-600' },
  EMESSA: { bg: 'bg-blue-50', text: 'text-blue-600' },
  PAGATA: { bg: 'bg-primary/30', text: 'text-success-foreground' },
  PARZIALMENTE_PAGATA: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  SCADUTA: { bg: 'bg-red-50', text: 'text-red-600' },
  ANNULLATA: { bg: 'bg-gray-100', text: 'text-gray-400' },
};

function clientName(c: Fattura['cliente']) {
  return c.ragioneSociale || [c.nome, c.cognome].filter(Boolean).join(' ') || '—';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function FatturePage() {
  const [fatture, setFatture] = useState<Fattura[]>([]);
  const [loading, setLoading] = useState(true);
  const [fatturaToDelete, setFatturaToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFatture = () => {
    setLoading(true);
    fetch('/api/fatture')
      .then((r) => r.json())
      .then((d) => setFatture(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFatture();
  }, []);

  const handleDelete = async () => {
    if (!fatturaToDelete) return;
    try {
      const res = await fetch(`/api/fatture/${fatturaToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setFatture((prev) => prev.filter((f) => f.id !== fatturaToDelete));
      } else {
        const err = await res.json();
        alert(err.error || 'Errore durante l\\'eliminazione');
      }
    } catch (e) {
      console.error(e);
      alert('Errore durante l\\'eliminazione');
    } finally {
      setFatturaToDelete(null);
    }
  };

  const handleImportXML = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/fatture/import-xml', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchFatture();
      } else {
        const err = await res.json();
        alert(err.error || 'Errore importazione XML');
      }
    } catch (e) {
      console.error(e);
      alert('Errore importazione XML');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fatture"
        subtitle="Gestisci le tue fatture e documenti fiscali"
        ctaLabel="Nuova Fattura"
        ctaHref="/fatture/nuova"
        ctaId="create-invoice-button"
      />

      <FilterBar />

      <div className="rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold text-foreground">Lista Fatture</h2>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept=".xml" 
              hidden 
              ref={fileInputRef} 
              onChange={handleImportXML} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {isUploading ? 'Caricamento...' : 'Importa XML'}
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              Scarica XLS
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Rilasciata a</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Numero</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Data</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Stato</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Importo</th>
                <th className="px-6 py-3 text-right text-[12px] font-medium text-muted-foreground">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {fatture.map((inv) => {
                const badge = statoBadge[inv.stato] || statoBadge.BOZZA;
                const isNeg = inv.tipoDocumento === 'NOTA_CREDITO';
                const importo = isNeg ? -inv.totale : inv.totale;
                return (
                  <tr key={inv.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/fatture/${inv.id}`}>
                    <td className="px-6 py-4 text-[13px] text-foreground">{clientName(inv.cliente)}</td>
                    <td className="px-6 py-4 text-[13px] font-mono text-foreground">{inv.numero}</td>
                    <td className="px-6 py-4 text-[13px] text-foreground">{formatDate(inv.dataEmissione)}</td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold', badge.bg, badge.text)}>
                        {inv.stato.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-block rounded-full px-3 py-1 text-[12px] font-semibold', !isNeg ? 'bg-primary/30 text-success-foreground' : 'bg-red-100 text-red-600')}>
                        {importo >= 0 ? '+' : ''}{importo.toFixed(2).replace('.', ',')} €
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.stato === 'BOZZA' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFatturaToDelete(inv.id);
                          }}
                          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Elimina fattura"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {fatture.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[13px] text-muted-foreground">Nessuna fattura trovata</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale di conferma eliminazione */}
      {fatturaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-bold text-foreground">Sei sicuro?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Vuoi davvero eliminare questa fattura? L'operazione è irreversibile.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFatturaToDelete(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
