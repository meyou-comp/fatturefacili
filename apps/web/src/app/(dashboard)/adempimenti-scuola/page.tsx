'use client';

import { useEffect, useState } from 'react';
import { Download, CheckCircle2, ShieldAlert, FileSpreadsheet, Building2, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';

interface SchoolFeeRecord {
  genitoreCF: string;
  genitoreNome: string;
  alunnoCF: string;
  alunnoNome: string;
  importoTotale: number;
  numeroDocumenti: number;
  documenti: string[];
}

interface SchoolFeeData {
  anno: number;
  data: SchoolFeeRecord[];
  kpi: {
    totaleDichiarato: number;
    genitoriCoinvolti: number;
    documentiTrasmessi: number;
  };
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
}

export default function AdempimentiScuolaPage() {
  const [data, setData] = useState<SchoolFeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [anno, setAnno] = useState(new Date().getFullYear());
  
  // Simulation states
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulateStep, setSimulateStep] = useState(0);

  const loadData = () => {
    setLoading(true);
    fetch(`/api/adempimenti/spese-scolastiche?anno=${anno}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [anno]);

  const handleDownloadCsv = () => {
    window.open(`/api/adempimenti/spese-scolastiche?anno=${anno}&format=csv`, '_blank');
  };

  const handleSimulateTransmission = () => {
    setShowSimulateModal(true);
    setSimulateStep(1);
    setTimeout(() => {
      setSimulateStep(2);
      setTimeout(() => {
        setSimulateStep(3);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <PageHeader 
          title="Spese Scolastiche & 730 Precompilato"
          subtitle="Gestisci la comunicazione annuale all'Agenzia delle Entrate per le rette degli asili nido e scuole d'infanzia."
        />

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-muted-foreground">Anno Fiscale:</label>
          <select
            value={anno}
            onChange={(e) => setAnno(parseInt(e.target.value))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-[13px] font-bold outline-none focus:border-primary-dark"
          >
            <option value="2027">2027</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Warning/Info nursery context */}
      <div className="rounded-xl border border-yellow-100 bg-yellow-50/50 p-4 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-[13px] font-bold text-yellow-800">Bonus Asilo Nido (INPS) &amp; Agenzia delle Entrate</h3>
          <p className="text-[12px] text-yellow-700 leading-relaxed">
            Per consentire ai genitori di richiedere correttamente il **Bonus Asilo Nido INPS** e beneficiare del **730 precompilato**,
            assicurati che ogni fattura emessa abbia la spunta *&ldquo;Retta Scolastica&rdquo;* attiva e contenga il **Codice Fiscale dell&apos;alunno/figlio**
            e del genitore pagante. Il sistema estrarrà automaticamente i pagamenti andati a buon fine (Fatture in stato *PAGATA*).
          </p>
        </div>
      </div>

      {/* KPI Widgets */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          {/* Totale Dichiarato */}
          <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-primary-dark">Rette Totali Pagate</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(data.kpi.totaleDichiarato)}
              </p>
              <p className="text-[11px] text-muted-foreground">Volume detraibile dai genitori nel {anno}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center">
              <Image src="/icons/DocumentsGreen.svg" alt="Rette Pagate" width={40} height={40} />
            </div>
          </div>

          {/* Genitori Dichiarati */}
          <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-foreground">Genitori / Paganti</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {data.kpi.genitoriCoinvolti}
              </p>
              <p className="text-[11px] text-muted-foreground">Posizioni fiscali da comunicare</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center">
              <Image src="/icons/PeopleBlue.svg" alt="Genitori" width={40} height={40} />
            </div>
          </div>

          {/* Documenti Rilevati */}
          <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-foreground">Documenti Comunicati</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {data.kpi.documentiTrasmessi}
              </p>
              <p className="text-[11px] text-muted-foreground">Fatture pagate tracciate</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center">
              <Image src="/icons/ReceiptBlue.svg" alt="Documenti" width={40} height={40} />
            </div>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="rounded-xl border border-border bg-white overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-[14px] font-bold text-foreground">Elenco Raggruppato Posizioni Fiscali</h2>
            <p className="text-[11px] text-muted-foreground">Dati pronti per la trasmissione telematica all&apos;Agenzia delle Entrate.</p>
          </div>
          
          <div className="flex gap-2">
            <button
              disabled={!data || data.data.length === 0}
              onClick={handleDownloadCsv}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-semibold hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Esporta Tracciato CSV
            </button>
            <button
              disabled={!data || data.data.length === 0}
              onClick={handleSimulateTransmission}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              Invia all&apos;Agenzia delle Entrate
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#F7F7F7]/30">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground">Genitore Pagante</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground">C.F. Genitore</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground">Figlio / Beneficiario</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground">C.F. Figlio</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground">Importo Totale</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-muted-foreground">Documenti ({anno})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/10">
                    <td className="px-4 py-3.5 whitespace-nowrap text-[13px] font-bold text-foreground">{r.genitoreNome}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-[12px] font-mono text-muted-foreground">{r.genitoreCF}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-[13px] font-bold text-foreground">{r.alunnoNome}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-[12px] font-mono text-muted-foreground">{r.alunnoCF || 'Non inserito'}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right text-[13px] font-bold text-foreground">{formatCurrency(r.importoTotale)}</td>
                    <td className="px-4 py-3.5 text-center text-[11px] text-muted-foreground max-w-[200px] truncate" title={r.documenti.join(', ')}>
                      <span className="inline-block bg-gray-100 rounded-full px-2 py-0.5 font-bold text-foreground mr-1.5">{r.numeroDocumenti}</span>
                      {r.documenti.join(', ')}
                    </td>
                  </tr>
                ))}
                {(!data || data.data.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                      Nessun pagamento di rette scolastiche registrato nell&apos;anno {anno}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SIMULATE TRANSMISSION MODAL */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-5 w-5 text-primary-dark" />
                Trasmissione Agenzia delle Entrate
              </h2>
            </div>

            <div className="space-y-4 py-2">
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    simulateStep >= 1 ? "bg-primary text-foreground" : "bg-gray-100 text-gray-400"
                  )}>
                    {simulateStep > 1 ? <CheckCircle2 className="h-4 w-4 text-foreground" /> : '1'}
                  </div>
                  <span className={cn("text-[13px]", simulateStep >= 1 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    Generazione tracciato record precompilato 730
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    simulateStep >= 2 ? "bg-primary text-foreground" : "bg-gray-100 text-gray-400"
                  )}>
                    {simulateStep > 2 ? <CheckCircle2 className="h-4 w-4 text-foreground" /> : '2'}
                  </div>
                  <span className={cn("text-[13px]", simulateStep >= 2 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    Firma digitale del documento e crittografia dati
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    simulateStep >= 3 ? "bg-[#335525] text-white" : "bg-gray-100 text-gray-400"
                  )}>
                    {simulateStep >= 3 ? '✓' : '3'}
                  </div>
                  <span className={cn("text-[13px]", simulateStep >= 3 ? "font-semibold text-[#335525]" : "text-muted-foreground")}>
                    Invio completato al canale telematico Entratel!
                  </span>
                </div>
              </div>

              {simulateStep === 3 && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-[12px] text-green-800">
                  La trasmissione è stata completata con successo! Riceverai il file delle ricevute telematiche (protocollo Sogei) direttamente nel tuo cassetto fiscale entro 24 ore.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                disabled={simulateStep < 3}
                onClick={() => setShowSimulateModal(false)}
                className="rounded-lg bg-primary px-5 py-2 text-[12px] font-bold text-primary-foreground disabled:opacity-50"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
