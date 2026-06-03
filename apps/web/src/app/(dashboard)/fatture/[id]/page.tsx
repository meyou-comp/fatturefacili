'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, CreditCard, Trash2, Copy, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { generateFatturaPDF } from '@/lib/pdf-generator';

interface Fattura {
  id: string; numero: string; tipoDocumento: string; stato: string; dataEmissione: string; dataScadenza: string | null;
  imponibile: number; totaleIVA: number; totale: number; nettoAPagare: number; totalePagato: number;
  importoRitenuta: number | null; importoBollo: number | null; importoCassa: number | null;
  metodoPagamento: string | null; oggettoFattura: string | null; note: string | null;
  cliente: { ragioneSociale: string | null; nome: string | null; cognome: string | null; partitaIva: string | null; codiceFiscale: string | null; indirizzo: string | null; cap: string | null; comune: string | null; provincia: string | null; paese: string | null; };
  organization: { ragioneSociale: string; partitaIva: string | null; codiceFiscale: string; indirizzo: string; cap: string; comune: string; provincia: string; piano: string; logoUrl: string | null; coloreAccento: string | null; iban: string | null; bic: string | null; intestatarioConto: string | null; };
  righe: Array<{ id: string; ordine: number; descrizione: string; quantita: number; prezzoUnitario: number; aliquotaIVA: number; sconto: number | null; imponibile: number; importoIVA: number; totale: number; }>;
  pagamenti: Array<{ id: string; data: string; importo: number; metodo: string; riferimento: string | null; }>;
}

const statoBadge: Record<string, { bg: string; text: string }> = {
  BOZZA: { bg: 'bg-gray-100', text: 'text-gray-600' }, EMESSA: { bg: 'bg-blue-50', text: 'text-blue-600' },
  PAGATA: { bg: 'bg-primary/30', text: 'text-success-foreground' }, PARZIALMENTE_PAGATA: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  SCADUTA: { bg: 'bg-red-50', text: 'text-red-600' },
};

export default function FatturaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [fattura, setFattura] = useState<Fattura | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPagamento, setShowPagamento] = useState(false);
  const [pagImporto, setPagImporto] = useState('');
  const [pagMetodo, setPagMetodo] = useState('BONIFICO');

  const load = () => {
    fetch(`/api/fatture/${params.id}`).then(r => r.json()).then(d => { if (d.id) setFattura(d); }).finally(() => setLoading(false));
  };
  useEffect(load, [params.id]);

  const emetti = async () => {
    await fetch(`/api/fatture/${params.id}/emetti`, { method: 'POST' });
    load();
  };

  const registraPagamento = async () => {
    await fetch(`/api/fatture/${params.id}/pagamenti`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ importo: parseFloat(pagImporto), metodo: pagMetodo }) });
    setShowPagamento(false); setPagImporto(''); load();
  };

  const elimina = async () => {
    if (!confirm('Eliminare questa bozza?')) return;
    await fetch(`/api/fatture/${params.id}`, { method: 'DELETE' });
    router.push('/fatture');
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!fattura) return <div className="text-center py-20 text-muted-foreground">Fattura non trovata</div>;

  const badge = statoBadge[fattura.stato] || statoBadge.BOZZA;
  const clientName = fattura.cliente.ragioneSociale || [fattura.cliente.nome, fattura.cliente.cognome].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/fatture" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <div className="flex items-center gap-3"><h1 className="text-xl font-bold">{fattura.numero}</h1><span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', badge.bg, badge.text)}>{fattura.stato.replace(/_/g, ' ')}</span></div>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{fattura.oggettoFattura || fattura.tipoDocumento}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['EMESSA', 'PARZIALMENTE_PAGATA', 'PAGATA', 'SCADUTA'].includes(fattura.stato) && (
            <>
              <a href={`/api/fatture/${params.id}/xml`} download className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-[13px] font-medium hover:bg-muted"><FileText className="h-4 w-4" /> XML</a>
              <button onClick={() => generateFatturaPDF(fattura)} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-[13px] font-medium hover:bg-muted"><Download className="h-4 w-4" /> PDF Cortesia</button>
            </>
          )}
          {fattura.stato === 'BOZZA' && <button onClick={emetti} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"><Send className="h-4 w-4" /> Emetti</button>}
          {['EMESSA', 'PARZIALMENTE_PAGATA', 'SCADUTA'].includes(fattura.stato) && <button onClick={() => setShowPagamento(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"><CreditCard className="h-4 w-4" /> Registra Pagamento</button>}
          {fattura.stato === 'BOZZA' && <button onClick={elimina} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Elimina</button>}
        </div>
      </div>

      {/* Pagamento modal */}
      {showPagamento && (
        <div className="rounded-xl border border-primary bg-primary/10 p-6 space-y-4">
          <h2 className="text-[14px] font-bold">Registra Pagamento</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Importo €</label><input type="number" step="0.01" value={pagImporto} onChange={e => setPagImporto(e.target.value)} placeholder={String(fattura.nettoAPagare - fattura.totalePagato)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Metodo</label><select value={pagMetodo} onChange={e => setPagMetodo(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white"><option value="BONIFICO">Bonifico</option><option value="CONTANTI">Contanti</option><option value="CARTA_PAGAMENTO">POS</option></select></div>
            <div className="flex items-end gap-2"><button onClick={registraPagamento} className="h-10 rounded-lg bg-primary px-4 text-[13px] font-semibold">Conferma</button><button onClick={() => setShowPagamento(false)} className="h-10 rounded-lg border border-border px-4 text-[13px]">Annulla</button></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Cliente */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-3">
          <h2 className="text-[12px] font-medium text-muted-foreground">CLIENTE</h2>
          <p className="text-[14px] font-bold">{clientName}</p>
          {fattura.cliente.partitaIva && <p className="text-[12px] text-muted-foreground">P.IVA: {fattura.cliente.partitaIva}</p>}
          {fattura.cliente.codiceFiscale && <p className="text-[12px] text-muted-foreground">CF: {fattura.cliente.codiceFiscale}</p>}
        </div>
        {/* Dates */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-3">
          <h2 className="text-[12px] font-medium text-muted-foreground">DATE</h2>
          <p className="text-[13px]"><span className="text-muted-foreground">Emissione:</span> {new Date(fattura.dataEmissione).toLocaleDateString('it-IT')}</p>
          {fattura.dataScadenza && <p className="text-[13px]"><span className="text-muted-foreground">Scadenza:</span> {new Date(fattura.dataScadenza).toLocaleDateString('it-IT')}</p>}
          <p className="text-[13px]"><span className="text-muted-foreground">Pagamento:</span> {fattura.metodoPagamento || '—'}</p>
        </div>
        {/* Totali */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-2">
          <h2 className="text-[12px] font-medium text-muted-foreground">TOTALI</h2>
          <div className="text-2xl font-bold">€{fattura.totale.toFixed(2)}</div>
          <div className="text-[12px] text-muted-foreground">Pagato: €{fattura.totalePagato.toFixed(2)} / €{fattura.nettoAPagare.toFixed(2)}</div>
          {fattura.totalePagato > 0 && fattura.totalePagato < fattura.nettoAPagare && (
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${(fattura.totalePagato / fattura.nettoAPagare) * 100}%` }} /></div>
          )}
        </div>
      </div>

      {/* Righe */}
      <div className="rounded-xl border border-border bg-white">
        <div className="px-6 py-4"><h2 className="text-[14px] font-bold">Righe Fattura</h2></div>
        <table className="w-full">
          <thead><tr className="border-t border-border"><th className="px-6 py-2 text-left text-[11px] font-medium text-muted-foreground">#</th><th className="px-6 py-2 text-left text-[11px] font-medium text-muted-foreground">Descrizione</th><th className="px-6 py-2 text-right text-[11px] font-medium text-muted-foreground">Qtà</th><th className="px-6 py-2 text-right text-[11px] font-medium text-muted-foreground">Prezzo</th><th className="px-6 py-2 text-right text-[11px] font-medium text-muted-foreground">IVA</th><th className="px-6 py-2 text-right text-[11px] font-medium text-muted-foreground">Totale</th></tr></thead>
          <tbody>{fattura.righe.map(r => (
            <tr key={r.id} className="border-t border-border"><td className="px-6 py-3 text-[12px] text-muted-foreground">{r.ordine}</td><td className="px-6 py-3 text-[13px]">{r.descrizione}</td><td className="px-6 py-3 text-[13px] text-right">{r.quantita}</td><td className="px-6 py-3 text-[13px] text-right">€{r.prezzoUnitario.toFixed(2)}</td><td className="px-6 py-3 text-[13px] text-right">{r.aliquotaIVA}%</td><td className="px-6 py-3 text-[13px] font-medium text-right">€{r.totale.toFixed(2)}</td></tr>
          ))}</tbody>
        </table>
        <div className="border-t border-border px-6 py-4 space-y-1 text-[13px]">
          <div className="flex justify-end gap-12"><span className="text-muted-foreground">Imponibile</span><span className="font-medium w-24 text-right">€{fattura.imponibile.toFixed(2)}</span></div>
          <div className="flex justify-end gap-12"><span className="text-muted-foreground">IVA</span><span className="font-medium w-24 text-right">€{fattura.totaleIVA.toFixed(2)}</span></div>
          {fattura.importoBollo && <div className="flex justify-end gap-12"><span className="text-muted-foreground">Bollo</span><span className="font-medium w-24 text-right">€{fattura.importoBollo.toFixed(2)}</span></div>}
          {fattura.importoRitenuta && <div className="flex justify-end gap-12"><span className="text-muted-foreground">Ritenuta</span><span className="font-medium w-24 text-right text-red-600">-€{fattura.importoRitenuta.toFixed(2)}</span></div>}
          <div className="flex justify-end gap-12 border-t border-border pt-2 text-base"><span className="font-bold">Netto a pagare</span><span className="font-bold w-24 text-right">€{fattura.nettoAPagare.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Pagamenti */}
      {fattura.pagamenti.length > 0 && (
        <div className="rounded-xl border border-border bg-white"><div className="px-6 py-4"><h2 className="text-[14px] font-bold">Pagamenti</h2></div>
          <table className="w-full"><thead><tr className="border-t border-border"><th className="px-6 py-2 text-left text-[11px] font-medium text-muted-foreground">Data</th><th className="px-6 py-2 text-left text-[11px] font-medium text-muted-foreground">Metodo</th><th className="px-6 py-2 text-left text-[11px] font-medium text-muted-foreground">Rif.</th><th className="px-6 py-2 text-right text-[11px] font-medium text-muted-foreground">Importo</th></tr></thead>
            <tbody>{fattura.pagamenti.map(p => (
              <tr key={p.id} className="border-t border-border"><td className="px-6 py-3 text-[13px]">{new Date(p.data).toLocaleDateString('it-IT')}</td><td className="px-6 py-3 text-[13px]">{p.metodo}</td><td className="px-6 py-3 text-[13px] text-muted-foreground">{p.riferimento || '—'}</td><td className="px-6 py-3 text-[13px] font-medium text-right text-success-foreground">€{p.importo.toFixed(2)}</td></tr>
            ))}</tbody></table></div>
      )}
    </div>
  );
}
