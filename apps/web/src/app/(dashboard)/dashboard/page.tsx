'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { FilterBar } from '@/components/shared/filter-bar';
import { cn } from '@/lib/utils';
import {
  KpiIncassatoIcon,
  KpiFatturatoIcon,
  KpiDaIncassareIcon,
  KpiNumFattureIcon,
} from '@/components/icons';

interface DashboardData {
  fatturato: { value: number; change: number };
  incassato: { value: number; change: number };
  daIncassare: { value: number; count: number };
  numFatture: { value: number; change: number };
  ultimeFatture: Array<{
    id: string;
    numero: string;
    totale: number;
    nettoAPagare: number;
    dataEmissione: string;
    stato: string;
    tipoDocumento: string;
    metodoPagamento: string | null;
    cliente: { ragioneSociale: string | null; nome: string | null; cognome: string | null };
  }>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function clientName(c: { ragioneSociale: string | null; nome: string | null; cognome: string | null }) {
  return c.ragioneSociale || [c.nome, c.cognome].filter(Boolean).join(' ') || '—';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data
    ? [
        {
          label: 'Fatture Incassate',
          value: formatCurrency(data.incassato.value),
          change: `+${data.incassato.change}%`,
          changeLabel: 'dal mese prec.',
          icon: KpiIncassatoIcon,
        },
        {
          label: 'Fatture Pagate',
          value: formatCurrency(data.fatturato.value),
          change: `+${data.fatturato.change}%`,
          changeLabel: 'dal mese prec.',
          icon: KpiFatturatoIcon,
        },
        {
          label: 'Fatture da Incassare',
          value: formatCurrency(data.daIncassare.value),
          change: `${data.daIncassare.count}`,
          changeLabel: 'fatture aperte',
          icon: KpiDaIncassareIcon,
        },
        {
          label: 'Fatture',
          value: String(data.numFatture.value),
          change: `+${data.numFatture.change}`,
          changeLabel: 'dal mese prec.',
          icon: KpiNumFattureIcon,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Panoramica delle attività"
        ctaLabel="Nuova Fattura"
        ctaHref="/fatture/nuova"
        ctaId="new-invoice-button"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="h-10 w-10" />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              <span className="font-medium text-success-foreground">
                {stat.change}
              </span>{' '}
              {stat.changeLabel}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <FilterBar />

      {/* Invoice table */}
      <div className="rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold text-foreground">Lista Fatture</h2>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            Scarica XLS
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-t border-border">
              <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Rilasciata a</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Descrizione</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Data</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Tipo</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Importo</th>
            </tr>
          </thead>
          <tbody>
            {data?.ultimeFatture.map((inv) => {
              const isNegative = inv.tipoDocumento === 'NOTA_CREDITO';
              const importo = isNegative ? -inv.totale : inv.totale;
              return (
                <tr key={inv.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/fatture/${inv.id}`}>
                  <td className="px-6 py-4 text-[13px] text-foreground">
                    {clientName(inv.cliente)}
                  </td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-[13px] text-foreground">
                    {inv.numero}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-foreground">
                    {formatDate(inv.dataEmissione)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-foreground">
                    {inv.metodoPagamento || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block rounded-full px-3 py-1 text-[12px] font-semibold',
                        !isNegative
                          ? 'bg-primary/30 text-success-foreground'
                          : 'bg-red-100 text-red-600',
                      )}
                    >
                      {importo >= 0 ? '+' : ''}{importo.toFixed(2).replace('.', ',')} €
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!data?.ultimeFatture || data.ultimeFatture.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-muted-foreground">
                  Nessuna fattura trovata
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
