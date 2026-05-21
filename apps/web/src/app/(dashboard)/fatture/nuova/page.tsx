'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface RigaForm { descrizione: string; quantita: number; unitaMisura: string; prezzoUnitario: number; aliquotaIVA: number; sconto: number; prodottoId: string; }
interface Cliente { id: string; ragioneSociale: string | null; nome: string | null; cognome: string | null; }
interface Prodotto { id: string; nome: string; prezzoUnitario: number; aliquotaIVA: number; unitaMisura: string | null; }

const emptyRiga = (): RigaForm => ({ descrizione: '', quantita: 1, unitaMisura: '', prezzoUnitario: 0, aliquotaIVA: 22, sconto: 0, prodottoId: '' });
const calcRiga = (r: RigaForm) => { const imp = Math.round(r.quantita * r.prezzoUnitario * (1 - r.sconto / 100) * 100) / 100; const iva = Math.round(imp * r.aliquotaIVA / 100 * 100) / 100; return { imponibile: imp, iva, totale: Math.round((imp + iva) * 100) / 100 }; };
const clientName = (c: Cliente) => c.ragioneSociale || [c.nome, c.cognome].filter(Boolean).join(' ');

export default function NuovaFatturaPage() {
  const router = useRouter();
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('FATTURA');
  const [dataEmissione, setDataEmissione] = useState(new Date().toISOString().split('T')[0]);
  const [dataScadenza, setDataScadenza] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('BONIFICO');
  const [oggettoFattura, setOggettoFattura] = useState('');
  const [cup, setCup] = useState('');
  const [note, setNote] = useState('');
  const [isRettaScolastica, setIsRettaScolastica] = useState(false);
  const [alunnoNomeCognome, setAlunnoNomeCognome] = useState('');
  const [alunnoCodiceFiscale, setAlunnoCodiceFiscale] = useState('');
  const [righe, setRighe] = useState<RigaForm[]>([emptyRiga()]);

  useEffect(() => {
    fetch('/api/clienti?limit=200').then(r => r.json()).then(d => setClienti(d.data || []));
    fetch('/api/prodotti').then(r => r.json()).then(d => setProdotti(d.data || []));
  }, []);

  const updateRiga = useCallback((i: number, field: string, value: string | number) => {
    setRighe(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }, []);

  const selectProdotto = (i: number, pid: string) => {
    const p = prodotti.find(pr => pr.id === pid);
    if (p) setRighe(prev => prev.map((r, idx) => idx === i ? { ...r, prodottoId: pid, descrizione: p.nome, prezzoUnitario: p.prezzoUnitario, aliquotaIVA: p.aliquotaIVA, unitaMisura: p.unitaMisura || '' } : r));
  };

  const totals = righe.reduce((a, r) => { const c = calcRiga(r); return { imponibile: a.imponibile + c.imponibile, iva: a.iva + c.iva, totale: a.totale + c.totale }; }, { imponibile: 0, iva: 0, totale: 0 });

  const handleSubmit = async (asBozza: boolean) => {
    setError('');
    if (!clienteId) { setError('Seleziona un cliente'); return; }
    if (righe.every(r => !r.descrizione)) { setError('Aggiungi almeno una riga'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/fatture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId,
          tipoDocumento,
          dataEmissione,
          dataScadenza: dataScadenza || null,
          metodoPagamento,
          oggettoFattura,
          note,
          isRettaScolastica,
          alunnoNomeCognome: isRettaScolastica ? alunnoNomeCognome : null,
          alunnoCodiceFiscale: isRettaScolastica ? alunnoCodiceFiscale : null,
          cup: cup || null,
          stato: asBozza ? 'BOZZA' : 'EMESSA',
          righe: righe.filter(r => r.descrizione)
        })
      });
      if (!res.ok) { setError((await res.json()).error || 'Errore'); return; }
      const fattura = await res.json();
      router.push(`/fatture/${fattura.id}`);
    } catch { setError('Errore di connessione'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fatture" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
        <div><h1 className="text-xl font-bold tracking-tight text-foreground">Nuova Fattura</h1><p className="mt-0.5 text-[13px] text-muted-foreground">Crea una nuova fattura</p></div>
      </div>
      <div className="max-w-4xl space-y-6">
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}
        {/* Header */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-[14px] font-bold">Intestazione</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5"><label className="text-[12px] font-medium">Cliente *</label><select value={clienteId} onChange={e => setClienteId(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white"><option value="">Seleziona...</option>{clienti.map(c => <option key={c.id} value={c.id}>{clientName(c)}</option>)}</select></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Tipo</label><select value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white"><option value="FATTURA">Fattura</option><option value="NOTA_CREDITO">Nota di Credito</option><option value="PARCELLA">Parcella</option></select></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Pagamento</label><select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white"><option value="BONIFICO">Bonifico</option><option value="CONTANTI">Contanti</option><option value="CARTA_PAGAMENTO">POS</option><option value="SEPA">SEPA</option></select></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Data Emissione</label><input type="date" value={dataEmissione} onChange={e => setDataEmissione(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Data Scadenza</label><input type="date" value={dataScadenza} onChange={e => setDataScadenza(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Codice CUP</label><input value={cup} onChange={e => setCup(e.target.value.toUpperCase())} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" placeholder="CUP (opzionale)" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Oggetto</label><input value={oggettoFattura} onChange={e => setOggettoFattura(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" placeholder="es. Consulenza maggio" /></div>
          </div>
        </div>
        {/* Righe */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-[14px] font-bold">Righe</h2><button type="button" onClick={() => setRighe(p => [...p, emptyRiga()])} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-muted"><Plus className="h-3.5 w-3.5" /> Aggiungi</button></div>
          {righe.map((riga, i) => { const c = calcRiga(riga); return (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex gap-3"><div className="flex-1 space-y-1"><label className="text-[11px] font-medium text-muted-foreground">Prodotto</label><select value={riga.prodottoId} onChange={e => selectProdotto(i, e.target.value)} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] outline-none bg-white"><option value="">Manuale</option>{prodotti.map(p => <option key={p.id} value={p.id}>{p.nome} — €{p.prezzoUnitario}</option>)}</select></div>{righe.length > 1 && <button type="button" onClick={() => setRighe(p => p.filter((_, idx) => idx !== i))} className="mt-5 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</div>
              <div className="space-y-1"><label className="text-[11px] font-medium text-muted-foreground">Descrizione *</label><input value={riga.descrizione} onChange={e => updateRiga(i, 'descrizione', e.target.value)} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] outline-none" /></div>
              <div className="grid grid-cols-5 gap-3">
                <div className="space-y-1"><label className="text-[11px] text-muted-foreground">Qtà</label><input type="number" min="0" step="0.01" value={riga.quantita} onChange={e => updateRiga(i, 'quantita', parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] outline-none text-right" /></div>
                <div className="space-y-1"><label className="text-[11px] text-muted-foreground">Prezzo</label><input type="number" min="0" step="0.01" value={riga.prezzoUnitario} onChange={e => updateRiga(i, 'prezzoUnitario', parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] outline-none text-right" /></div>
                <div className="space-y-1"><label className="text-[11px] text-muted-foreground">IVA</label><select value={riga.aliquotaIVA} onChange={e => updateRiga(i, 'aliquotaIVA', parseFloat(e.target.value))} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] outline-none bg-white"><option value="22">22%</option><option value="10">10%</option><option value="5">5%</option><option value="4">4%</option><option value="0">0%</option></select></div>
                <div className="space-y-1"><label className="text-[11px] text-muted-foreground">Sconto %</label><input type="number" min="0" max="100" value={riga.sconto} onChange={e => updateRiga(i, 'sconto', parseFloat(e.target.value) || 0)} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] outline-none text-right" /></div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Totale</label>
                  <input type="number" step="0.01" value={c.totale.toFixed(2)} onChange={e => {
                    const newTotale = parseFloat(e.target.value) || 0;
                    const newPrezzo = newTotale / (1 + riga.aliquotaIVA / 100) / riga.quantita / (1 - riga.sconto / 100);
                    updateRiga(i, 'prezzoUnitario', Math.round(newPrezzo * 10000) / 10000);
                  }} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] outline-none text-right font-semibold bg-white focus:bg-muted" />
                </div>
              </div>
            </div>
          ); })}
        </div>
        {/* Riepilogo */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-[14px] font-bold mb-4">Riepilogo</h2>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Imponibile</span><span className="font-medium">€{totals.imponibile.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IVA</span><span className="font-medium">€{totals.iva.toFixed(2)}</span></div>
            <div className="border-t border-border pt-2 flex justify-between text-base"><span className="font-bold">Totale</span><span className="font-bold">€{totals.totale.toFixed(2)}</span></div>
          </div>
        </div>
        {/* Dati Scolastici / Bonus INPS */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRettaScolastica"
              checked={isRettaScolastica}
              onChange={(e) => setIsRettaScolastica(e.target.checked)}
              className="h-4 w-4 rounded text-primary cursor-pointer"
            />
            <label htmlFor="isRettaScolastica" className="text-[13px] font-bold text-foreground cursor-pointer">
              Questo documento è una Retta Scolastica (Asilo Nido / Spese Scolastiche detraibili)
            </label>
          </div>

          {isRettaScolastica && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-foreground">Nome e Cognome Alunno (Figlio) *</label>
                <input
                  required={isRettaScolastica}
                  value={alunnoNomeCognome}
                  onChange={(e) => setAlunnoNomeCognome(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none"
                  placeholder="Nome e cognome del bambino/figlio"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-foreground">Codice Fiscale Alunno *</label>
                <input
                  required={isRettaScolastica}
                  value={alunnoCodiceFiscale}
                  onChange={(e) => setAlunnoCodiceFiscale(e.target.value.toUpperCase())}
                  className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none"
                  placeholder="Codice Fiscale a 16 caratteri"
                  maxLength={16}
                />
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-4"><h2 className="text-[14px] font-bold">Note</h2><textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none resize-none" /></div>
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/fatture" className="rounded-lg border border-border px-5 py-2.5 text-[13px] font-medium hover:bg-muted">Annulla</Link>
          <button onClick={() => handleSubmit(true)} disabled={loading} className="rounded-lg border border-border px-5 py-2.5 text-[13px] font-medium hover:bg-muted disabled:opacity-50">Salva Bozza</button>
          <button onClick={() => handleSubmit(false)} disabled={loading} className="rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">Emetti Fattura</button>
        </div>
      </div>
    </div>
  );
}
