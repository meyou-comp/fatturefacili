'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Trash2 } from 'lucide-react';

interface Prodotto { id: string; codice: string | null; nome: string; descrizione: string | null; prezzoUnitario: number; aliquotaIVA: number; unitaMisura: string | null; categoria: string | null; }

export default function ProdottiPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', descrizione: '', codice: '', prezzoUnitario: '0', aliquotaIVA: '22', unitaMisura: '', categoria: '' });

  const load = () => { fetch('/api/prodotti').then(r => r.json()).then(d => setProdotti(d.data || [])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleCreate = async () => {
    await fetch('/api/prodotti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, prezzoUnitario: parseFloat(form.prezzoUnitario), aliquotaIVA: parseFloat(form.aliquotaIVA) }) });
    setShowForm(false); setForm({ nome: '', descrizione: '', codice: '', prezzoUnitario: '0', aliquotaIVA: '22', unitaMisura: '', categoria: '' }); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-xl font-bold tracking-tight">Prodotti</h1><p className="mt-0.5 text-[13px] text-muted-foreground">Catalogo prodotti e servizi</p></div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2 text-[13px] font-medium hover:bg-muted">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold">+</span> Nuovo Prodotto
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-[14px] font-bold">Nuovo Prodotto</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Nome *</label><input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Codice</label><input value={form.codice} onChange={e => setForm(p => ({ ...p, codice: e.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Categoria</label><input value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">Prezzo €</label><input type="number" step="0.01" value={form.prezzoUnitario} onChange={e => setForm(p => ({ ...p, prezzoUnitario: e.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">IVA %</label><select value={form.aliquotaIVA} onChange={e => setForm(p => ({ ...p, aliquotaIVA: e.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white"><option value="22">22%</option><option value="10">10%</option><option value="5">5%</option><option value="4">4%</option><option value="0">Esente</option></select></div>
            <div className="space-y-1.5"><label className="text-[12px] font-medium">U.M.</label><input value={form.unitaMisura} onChange={e => setForm(p => ({ ...p, unitaMisura: e.target.value }))} placeholder="es. ore, gg, pz" className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none" /></div>
          </div>
          <div className="flex justify-end gap-2"><button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-[13px]">Annulla</button><button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold">Salva</button></div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white">
        {loading ? <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div> : (
          <table className="w-full">
            <thead><tr className="border-b border-border"><th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Codice</th><th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Nome</th><th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">Categoria</th><th className="px-6 py-3 text-right text-[12px] font-medium text-muted-foreground">Prezzo</th><th className="px-6 py-3 text-right text-[12px] font-medium text-muted-foreground">IVA</th><th className="px-6 py-3 text-left text-[12px] font-medium text-muted-foreground">U.M.</th></tr></thead>
            <tbody>{prodotti.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30"><td className="px-6 py-4 text-[13px] font-mono text-muted-foreground">{p.codice || '—'}</td><td className="px-6 py-4 text-[13px] font-medium">{p.nome}</td><td className="px-6 py-4 text-[13px] text-muted-foreground">{p.categoria || '—'}</td><td className="px-6 py-4 text-[13px] text-right font-medium">€{p.prezzoUnitario.toFixed(2)}</td><td className="px-6 py-4 text-[13px] text-right">{p.aliquotaIVA}%</td><td className="px-6 py-4 text-[13px] text-muted-foreground">{p.unitaMisura || '—'}</td></tr>
            ))}{prodotti.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-[13px] text-muted-foreground">Nessun prodotto</td></tr>}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
