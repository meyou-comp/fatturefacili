'use client';

import { useEffect, useState } from 'react';
import { Package, Briefcase, Search, ArrowUpDown, Plus, Minus, Settings, Save, X, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Prodotto {
  id: string;
  codice: string | null;
  nome: string;
  descrizione: string | null;
  prezzoUnitario: number;
  aliquotaIVA: number;
  unitaMisura: string | null;
  categoria: string | null;
  tipo: string; // PRODOTTO, SERVIZIO
  tracciaMagazzino: boolean;
  giacenza: number;
  sogliaScorta: number;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
}

export default function MagazzinoPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'ALL' | 'PRODOTTO' | 'SERVIZIO' | 'SOTTO_SCORTA'>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Prodotto | null>(null);
  
  // Modals / Quick edits state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRettificaModal, setShowRettificaModal] = useState(false);
  const [rettificaQty, setRettificaQty] = useState('0');
  const [rettificaMode, setRettificaMode] = useState<'IMPOSTA' | 'AGGIUNGI' | 'SOTTRAI'>('AGGIUNGI');

  const [form, setForm] = useState({
    nome: '',
    codice: '',
    descrizione: '',
    prezzoUnitario: '0',
    aliquotaIVA: '22',
    unitaMisura: 'pz',
    categoria: '',
    tipo: 'PRODOTTO',
    tracciaMagazzino: true,
    giacenza: '0',
    sogliaScorta: '0',
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/prodotti')
      .then((r) => r.json())
      .then((d) => setProdotti(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/prodotti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        prezzoUnitario: parseFloat(form.prezzoUnitario) || 0,
        aliquotaIVA: parseFloat(form.aliquotaIVA) || 22,
        giacenza: parseFloat(form.giacenza) || 0,
        sogliaScorta: parseFloat(form.sogliaScorta) || 0,
        tracciaMagazzino: form.tipo === 'PRODOTTO' ? form.tracciaMagazzino : false,
      }),
    });
    setShowAddModal(false);
    resetForm();
    loadData();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    await fetch(`/api/prodotti/${selectedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        prezzoUnitario: parseFloat(form.prezzoUnitario) || 0,
        aliquotaIVA: parseFloat(form.aliquotaIVA) || 22,
        giacenza: parseFloat(form.giacenza) || 0,
        sogliaScorta: parseFloat(form.sogliaScorta) || 0,
        tracciaMagazzino: form.tipo === 'PRODOTTO' ? form.tracciaMagazzino : false,
      }),
    });
    setShowEditModal(false);
    setSelectedProduct(null);
    resetForm();
    loadData();
  };

  const handleRettifica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const qty = parseFloat(rettificaQty) || 0;
    let newGiacenza = selectedProduct.giacenza;

    if (rettificaMode === 'IMPOSTA') {
      newGiacenza = qty;
    } else if (rettificaMode === 'AGGIUNGI') {
      newGiacenza += qty;
    } else if (rettificaMode === 'SOTTRAI') {
      newGiacenza -= qty;
    }

    await fetch(`/api/prodotti/${selectedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ giacenza: newGiacenza }),
    });

    setShowRettificaModal(false);
    setSelectedProduct(null);
    setRettificaQty('0');
    loadData();
  };

  const openEdit = (p: Prodotto) => {
    setSelectedProduct(p);
    setForm({
      nome: p.nome,
      codice: p.codice || '',
      descrizione: p.descrizione || '',
      prezzoUnitario: String(p.prezzoUnitario),
      aliquotaIVA: String(p.aliquotaIVA),
      unitaMisura: p.unitaMisura || 'pz',
      categoria: p.categoria || '',
      tipo: p.tipo,
      tracciaMagazzino: p.tracciaMagazzino,
      giacenza: String(p.giacenza),
      sogliaScorta: String(p.sogliaScorta),
    });
    setShowEditModal(true);
  };

  const openRettifica = (p: Prodotto) => {
    setSelectedProduct(p);
    setRettificaMode('AGGIUNGI');
    setRettificaQty('0');
    setShowRettificaModal(true);
  };

  const resetForm = () => {
    setForm({
      nome: '',
      codice: '',
      descrizione: '',
      prezzoUnitario: '0',
      aliquotaIVA: '22',
      unitaMisura: 'pz',
      categoria: '',
      tipo: 'PRODOTTO',
      tracciaMagazzino: true,
      giacenza: '0',
      sogliaScorta: '0',
    });
  };

  // KPIs
  const sottoScortaCount = prodotti.filter(p => p.tipo === 'PRODOTTO' && p.tracciaMagazzino && p.giacenza <= p.sogliaScorta).length;
  const valoreMagazzino = prodotti.reduce((acc, p) => p.tipo === 'PRODOTTO' && p.tracciaMagazzino ? acc + (p.giacenza * p.prezzoUnitario) : acc, 0);
  const articoliTotali = prodotti.length;

  // Filters
  const filteredProdotti = prodotti.filter((p) => {
    const matchesSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || (p.codice || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (tipoFilter === 'PRODOTTO') return p.tipo === 'PRODOTTO';
    if (tipoFilter === 'SERVIZIO') return p.tipo === 'SERVIZIO';
    if (tipoFilter === 'SOTTO_SCORTA') return p.tipo === 'PRODOTTO' && p.tracciaMagazzino && p.giacenza <= p.sogliaScorta;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Magazzino &amp; Prodotti</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Gestisci articoli fisici a magazzino, catalogo servizi, livelli di stock e rettifiche veloci.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2 text-[13px] font-medium hover:bg-muted"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold">+</span> Nuovo Articolo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Sotto Scorta */}
        <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-red-600">Sotto Scorta / Finiti</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{sottoScortaCount}</p>
            <p className="text-[11px] text-muted-foreground">Articoli che richiedono riassortimento</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center">
            <Image src="/icons/WarningRed.svg" alt="Sotto scorta" width={40} height={40} />
          </div>
        </div>

        {/* Valore Magazzino */}
        <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-primary-dark">Valore Stimato Magazzino</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(valoreMagazzino)}</p>
            <p className="text-[11px] text-muted-foreground">Valutazione basata su giacenza * prezzo unitario</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center">
            <Image src="/icons/MoneyGreen.svg" alt="Valore Stimato" width={40} height={40} />
          </div>
        </div>

        {/* Articoli a Catalogo */}
        <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-muted-foreground">Articoli a Catalogo</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{articoliTotali}</p>
            <p className="text-[11px] text-muted-foreground">Prodotti fisici e servizi censiti a sistema</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center">
            <Image src="/icons/WorkBlue.svg" alt="Articoli" width={40} height={40} />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-xl border border-border bg-white p-1">
          {([
            { id: 'ALL', label: 'Tutti gli articoli' },
            { id: 'PRODOTTO', label: 'Prodotti Fisici' },
            { id: 'SERVIZIO', label: 'Servizi / Prestazioni' },
            { id: 'SOTTO_SCORTA', label: 'Sotto Scorta' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTipoFilter(t.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors',
                tipoFilter === t.id ? 'bg-primary/20 text-foreground' : 'text-muted-foreground hover:bg-[#F7F7F7]'
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
            placeholder="Cerca per nome o codice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-4 text-[13px] outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[#F7F7F7]/55">
                <th className="px-6 py-3.5 text-left text-[12px] font-semibold text-muted-foreground">Codice / Cat.</th>
                <th className="px-6 py-3.5 text-left text-[12px] font-semibold text-muted-foreground">Articolo</th>
                <th className="px-6 py-3.5 text-center text-[12px] font-semibold text-muted-foreground">Tipo</th>
                <th className="px-6 py-3.5 text-center text-[12px] font-semibold text-muted-foreground">Giacenza / Stock</th>
                <th className="px-6 py-3.5 text-right text-[12px] font-semibold text-muted-foreground">Prezzo Unitario</th>
                <th className="px-6 py-3.5 text-right text-[12px] font-semibold text-muted-foreground">Valore Totale</th>
                <th className="px-6 py-3.5 text-center text-[12px] font-semibold text-muted-foreground">Rettifica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProdotti.map((p) => {
                const isPhysical = p.tipo === 'PRODOTTO';
                const isUnderStock = isPhysical && p.tracciaMagazzino && p.giacenza <= p.sogliaScorta;
                const isOutOfStock = isPhysical && p.tracciaMagazzino && p.giacenza <= 0;
                
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    {/* Codice / Categoria */}
                    <td className="px-6 py-4 whitespace-nowrap text-[12px]">
                      <div className="font-mono text-foreground font-semibold">{p.codice || '—'}</div>
                      <div className="text-muted-foreground">{p.categoria || 'Senza Categoria'}</div>
                    </td>

                    {/* Articolo */}
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-bold text-foreground">{p.nome}</div>
                      {p.descrizione && <div className="text-[11px] text-muted-foreground max-w-[240px] truncate">{p.descrizione}</div>}
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border',
                        isPhysical ? 'bg-[#F7F7F7] text-foreground border-border' : 'bg-primary/20 text-foreground border-primary/30'
                      )}>
                        {isPhysical ? <Package className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                        {isPhysical ? 'Prodotto Fisico' : 'Servizio / Tariffa'}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {!isPhysical || !p.tracciaMagazzino ? (
                        <span className="text-[12px] text-muted-foreground">Senza scorte</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className={cn(
                            'inline-block px-2 py-0.5 rounded-full text-[12px] font-bold border',
                            isOutOfStock ? 'bg-red-50 text-red-600 border-red-200' :
                            isUnderStock ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                            'bg-primary/30 text-success-foreground border-primary-dark/20'
                          )}>
                            {p.giacenza} {p.unitaMisura || 'pz'}
                          </span>
                          {isUnderStock && (
                            <span className="text-[9px] text-red-500 font-semibold mt-0.5">
                              {isOutOfStock ? 'Esaurito!' : 'Sotto scorta!'} (Soglia: {p.sogliaScorta})
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Prezzo unitario */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[13px] font-bold text-foreground">
                      {formatCurrency(p.prezzoUnitario)}
                    </td>

                    {/* Valore Totale */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[13px] font-bold text-foreground">
                      {isPhysical && p.tracciaMagazzino ? formatCurrency(p.giacenza * p.prezzoUnitario) : '—'}
                    </td>

                    {/* Azione Rettifica */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isPhysical && p.tracciaMagazzino && (
                          <button
                            onClick={() => openRettifica(p)}
                            className="inline-flex h-8 px-2.5 items-center gap-1 rounded-lg border border-border hover:bg-muted text-[11px] font-bold text-foreground transition-colors"
                            title="Rettifica Giacenza Magazzino"
                          >
                            Rettifica
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                          title="Modifica Articolo"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProdotti.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-muted-foreground">
                    Nessun articolo trovato a magazzino.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* QUICK ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Nuovo Articolo / Servizio</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 hover:bg-[#F7F7F7]"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Tipo Articolo</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, tipo: 'PRODOTTO' }))}
                      className={cn("flex-1 h-9 rounded-lg border text-[12px] font-semibold", form.tipo === 'PRODOTTO' ? 'bg-primary/20 border-primary text-foreground' : 'border-border text-muted-foreground hover:bg-[#F7F7F7]')}
                    >
                      Prodotto Fisico
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, tipo: 'SERVIZIO' }))}
                      className={cn("flex-1 h-9 rounded-lg border text-[12px] font-semibold", form.tipo === 'SERVIZIO' ? 'bg-primary/20 border-primary text-foreground' : 'border-border text-muted-foreground hover:bg-[#F7F7F7]')}
                    >
                      Servizio / Prestazione
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Codice Articolo</label>
                  <input value={form.codice} onChange={e => setForm(p => ({ ...p, codice: e.target.value.toUpperCase() }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] font-mono outline-none" placeholder="es. SKU-100" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Categoria</label>
                  <input value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none" placeholder="es. Hardware" />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Nome Articolo *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none" />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Descrizione</label>
                  <textarea value={form.descrizione} onChange={e => setForm(p => ({ ...p, descrizione: e.target.value }))} rows={2} className="w-full rounded-lg border border-border px-3 py-1.5 text-[12px] outline-none resize-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Prezzo Vendita (€) *</label>
                  <input type="number" step="0.01" required value={form.prezzoUnitario} onChange={e => setForm(p => ({ ...p, prezzoUnitario: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none text-right font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Aliquota IVA %</label>
                  <select value={form.aliquotaIVA} onChange={e => setForm(p => ({ ...p, aliquotaIVA: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] bg-white outline-none">
                    <option value="22">22%</option>
                    <option value="10">10%</option>
                    <option value="5">5%</option>
                    <option value="4">4%</option>
                    <option value="0">Esente</option>
                  </select>
                </div>

                {form.tipo === 'PRODOTTO' && (
                  <>
                    <div className="col-span-2 flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="tracciaMagazzino"
                        checked={form.tracciaMagazzino}
                        onChange={e => setForm(p => ({ ...p, tracciaMagazzino: e.target.checked }))}
                        className="h-4 w-4 rounded text-primary"
                      />
                      <label htmlFor="tracciaMagazzino" className="text-[12px] font-semibold text-foreground cursor-pointer">Abilita tracciamento giacenza a magazzino</label>
                    </div>

                    {form.tracciaMagazzino && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-foreground">Giacenza Iniziale</label>
                          <input type="number" value={form.giacenza} onChange={e => setForm(p => ({ ...p, giacenza: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none text-right font-bold text-success-foreground" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-foreground">Soglia Scorta Minima</label>
                          <input type="number" value={form.sogliaScorta} onChange={e => setForm(p => ({ ...p, sogliaScorta: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none text-right font-bold text-red-500" />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-border px-4 py-2 text-[12px]">Annulla</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-[12px] font-bold text-primary-foreground hover:opacity-90">Crea Articolo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Modifica Articolo / Servizio</h2>
              <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 hover:bg-[#F7F7F7]"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Codice Articolo</label>
                  <input value={form.codice} onChange={e => setForm(p => ({ ...p, codice: e.target.value.toUpperCase() }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] font-mono outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Categoria</label>
                  <input value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none" />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Nome Articolo *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none" />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Descrizione</label>
                  <textarea value={form.descrizione} onChange={e => setForm(p => ({ ...p, descrizione: e.target.value }))} rows={2} className="w-full rounded-lg border border-border px-3 py-1.5 text-[12px] outline-none resize-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Prezzo Vendita (€) *</label>
                  <input type="number" step="0.01" required value={form.prezzoUnitario} onChange={e => setForm(p => ({ ...p, prezzoUnitario: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none text-right font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Aliquota IVA %</label>
                  <select value={form.aliquotaIVA} onChange={e => setForm(p => ({ ...p, aliquotaIVA: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-2 text-[12px] bg-white outline-none">
                    <option value="22">22%</option>
                    <option value="10">10%</option>
                    <option value="5">5%</option>
                    <option value="4">4%</option>
                    <option value="0">Esente</option>
                  </select>
                </div>

                {form.tipo === 'PRODOTTO' && form.tracciaMagazzino && (
                  <div className="col-span-2 grid grid-cols-2 gap-3 bg-[#F7F7F7] p-3 rounded-lg border border-border">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Giacenza Attuale</label>
                      <input type="number" value={form.giacenza} onChange={e => setForm(p => ({ ...p, giacenza: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none text-right font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Soglia Scorta Minima</label>
                      <input type="number" value={form.sogliaScorta} onChange={e => setForm(p => ({ ...p, sogliaScorta: e.target.value }))} className="h-9 w-full rounded-lg border border-border px-3 text-[12px] outline-none text-right font-bold text-red-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg border border-border px-4 py-2 text-[12px]">Annulla</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-[12px] font-bold text-primary-foreground hover:opacity-90">Salva Modifiche</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RETTIFICA MODAL */}
      {showRettificaModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Rettifica Magazzino</h2>
              <button onClick={() => setShowRettificaModal(false)} className="rounded-lg p-1 hover:bg-[#F7F7F7]"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-1 pb-2">
              <div className="text-[13px] font-bold text-foreground">{selectedProduct.nome}</div>
              <div className="text-[11px] text-muted-foreground">Giacenza attuale: <span className="font-semibold text-foreground">{selectedProduct.giacenza} {selectedProduct.unitaMisura || 'pz'}</span></div>
            </div>

            <form onSubmit={handleRettifica} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Tipo di Rettifica</label>
                <div className="flex gap-2">
                  {(['AGGIUNGI', 'SOTTRAI', 'IMPOSTA'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRettificaMode(mode)}
                      className={cn(
                        "flex-1 h-8 rounded-lg border text-[11px] font-semibold transition-colors",
                        rettificaMode === mode ? 'bg-primary/20 border-primary text-foreground' : 'border-border text-muted-foreground hover:bg-[#F7F7F7]'
                      )}
                    >
                      {mode === 'AGGIUNGI' ? 'Carica (+)' : mode === 'SOTTRAI' ? 'Scarica (-)' : 'Imposta'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Quantità Rettifica</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={rettificaQty}
                  onChange={e => setRettificaQty(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border px-3 text-[14px] font-bold text-center outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setShowRettificaModal(false)} className="rounded-lg border border-border px-4 py-2 text-[12px]">Annulla</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-[12px] font-bold text-primary-foreground hover:opacity-90">Applica</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
