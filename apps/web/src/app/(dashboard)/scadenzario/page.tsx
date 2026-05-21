'use client';

import { useEffect, useState } from 'react';
import { Calendar, Search, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Fattura {
  id: string;
  numero: string;
  totale: number;
  nettoAPagare: number;
  totalePagato: number;
  stato: string;
  dataEmissione: string;
  dataScadenza: string | null;
  cliente: {
    ragioneSociale: string | null;
    nome: string | null;
    cognome: string | null;
  };
}

interface ScadenzarioData {
  data: Fattura[];
  kpi: {
    totaleScaduto: number;
    totaleInScadenza: number;
    totaleDaRiscuotere: number;
  };
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getScadenzaStato(f: Fattura) {
  if (f.stato === 'PAGATA') {
    return { label: 'Pagata', style: 'bg-primary/20 text-success-foreground border-primary/30' };
  }

  if (!f.dataScadenza) {
    return { label: 'Nessuna data', style: 'bg-gray-100 text-gray-500 border-gray-200' };
  }

  const scad = new Date(f.dataScadenza);
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  scad.setHours(0, 0, 0, 0);

  const diffTime = scad.getTime() - oggi.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const rtf = new Intl.RelativeTimeFormat('it', { numeric: 'auto' });
    return {
      label: `Scaduta ${rtf.format(diffDays, 'day')}`,
      style: 'bg-red-50 text-red-600 border-red-100 font-semibold animate-pulse',
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return { label: 'Scade oggi!', style: 'bg-yellow-50 text-yellow-600 border-yellow-200 font-semibold' };
  }

  if (diffDays <= 7) {
    return { label: `In scadenza tra ${diffDays} gg`, style: 'bg-yellow-50/60 text-yellow-600 border-yellow-100' };
  }

  return { label: `Scade tra ${diffDays} giorni`, style: 'bg-gray-50 text-gray-600 border-gray-200' };
}

export default function ScadenzarioPage() {
  const [data, setData] = useState<ScadenzarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'TUTTE' | 'SCADUTE' | 'PROSSIME' | 'PAGATE'>('TUTTE');
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    fetch(`/api/scadenzario?filter=${filter}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const clientName = (f: Fattura) => {
    return f.cliente.ragioneSociale || [f.cliente.nome, f.cliente.cognome].filter(Boolean).join(' ') || '—';
  };

  const filteredFatture = data?.data.filter((f) => {
    const nome = clientName(f).toLowerCase();
    const num = f.numero.toLowerCase();
    const term = search.toLowerCase();
    return nome.includes(term) || num.includes(term);
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Scadenzario</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Monitora lo stato dei pagamenti, le scadenze imminenti e i solleciti dei documenti emessi.
        </p>
      </div>

      {/* KPI Widgets */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          {/* Scaduto */}
          <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-red-600">Scaduto Complessivo</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(data.kpi.totaleScaduto)}
              </p>
              <p className="text-[11px] text-muted-foreground">Fatture scadute e non pagate</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center">
              <Image src="/icons/WarningRed.svg" alt="Scaduto" width={40} height={40} />
            </div>
          </div>

          {/* In Scadenza */}
          <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-yellow-600">In Scadenza (30 gg)</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(data.kpi.totaleInScadenza)}
              </p>
              <p className="text-[11px] text-muted-foreground">Da riscuotere nei prossimi 30 giorni</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center">
              <Image src="/icons/ClockYellow.svg" alt="In Scadenza" width={40} height={40} />
            </div>
          </div>

          {/* Totale Sospeso */}
          <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-primary-dark">Sospeso Totale</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(data.kpi.totaleDaRiscuotere)}
              </p>
              <p className="text-[11px] text-muted-foreground">Tutte le fatture non ancora saldate</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center">
              <Image src="/icons/MoneyGreen.svg" alt="Sospeso" width={40} height={40} />
            </div>
          </div>
        </div>
      )}

      {/* Filtri & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-xl border border-border bg-white p-1">
          {([
            { id: 'TUTTE', label: 'Tutte le scadenze' },
            { id: 'SCADUTE', label: 'Scadute' },
            { id: 'PROSSIME', label: 'Prossime' },
            { id: 'PAGATE', label: 'Pagate' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors',
                filter === t.id ? 'bg-primary/20 text-foreground' : 'text-muted-foreground hover:bg-[#F7F7F7]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca cliente o n° fattura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-4 text-[13px] outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark"
          />
        </div>
      </div>

      {/* Deadline Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[#F7F7F7]/55">
                <th className="px-6 py-3.5 text-left text-[12px] font-semibold text-muted-foreground">Scadenza</th>
                <th className="px-6 py-3.5 text-left text-[12px] font-semibold text-muted-foreground">Cliente</th>
                <th className="px-6 py-3.5 text-left text-[12px] font-semibold text-muted-foreground">N. Documento</th>
                <th className="px-6 py-3.5 text-left text-[12px] font-semibold text-muted-foreground">Stato Scadenza</th>
                <th className="px-6 py-3.5 text-right text-[12px] font-semibold text-muted-foreground">Residuo / Totale</th>
                <th className="px-6 py-3.5 text-center text-[12px] font-semibold text-muted-foreground">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFatture.map((f) => {
                const stato = getScadenzaStato(f);
                const residuo = f.nettoAPagare - f.totalePagato;
                return (
                  <tr
                    key={f.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/fatture/${f.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className={cn('h-4 w-4', stato.isOverdue ? 'text-red-500' : 'text-muted-foreground')} />
                        <span className={cn('text-[13px] font-medium', stato.isOverdue ? 'text-red-600 font-bold' : 'text-foreground')}>
                          {formatDate(f.dataScadenza)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[13px] font-semibold text-foreground">{clientName(f)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[12px] text-muted-foreground">
                      {f.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-block rounded-full border px-2.5 py-0.5 text-[11px]', stato.style)}>
                        {stato.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-bold text-foreground">
                          {formatCurrency(residuo > 0 ? residuo : f.totale)}
                        </span>
                        {residuo > 0 && f.totalePagato > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            su un totale di {formatCurrency(f.totale)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted/60 transition-colors">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredFatture.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-muted-foreground">
                    Nessuna scadenza trovata.
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
