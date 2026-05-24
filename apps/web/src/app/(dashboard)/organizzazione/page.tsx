'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle2, UserPlus, Trash2, Palette, Image as ImageIcon, UploadCloud, Copy } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { BuildingApartment, BuildingFill, CreditCardIcon, CreditCardIconFill, UsersIcon, UsersIconFill } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '@/lib/utils';

export default function OrganizzazionePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profilo' | 'banca' | 'collaboratori' | 'aspetto'>('profilo');
  const [userRole, setUserRole] = useState('');

  // Form State
  const [form, setForm] = useState({
    ragioneSociale: '',
    partitaIva: '',
    codiceFiscale: '',
    tipoSoggetto: 'PERSONA_GIURIDICA',
    regimeFiscale: 'ORDINARIO',
    tipoAttivita: 'ALTRO',
    indirizzo: '',
    cap: '',
    comune: '',
    provincia: '',
    paese: 'IT',
    email: '',
    pec: '',
    telefono: '',
    sito: '',
    iban: '',
    bic: '',
    intestatarioConto: '',
    logoUrl: '',
    coloreAccento: '#335525',
    piano: 'BASE',
  });

  // Collaborators States
  const [collabEmail, setCollabEmail] = useState('');
  const [collabRole, setCollabRole] = useState<'ADMIN' | 'OPERATOR' | 'ACCOUNTANT' | 'READONLY'>('ACCOUNTANT');
  const [collabs, setCollabs] = useState<any[]>([]);
  const [collabSuccess, setCollabSuccess] = useState('');
  const [inviteLinkState, setInviteLinkState] = useState('');
  const [collabLoading, setCollabLoading] = useState(false);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const loadCollaborators = async () => {
    try {
      setLoadingCollabs(true);
      const res = await fetch('/api/organization/collaborators');
      if (res.ok) {
        const data = await res.json();
        setCollabs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCollabs(false);
    }
  };

  useEffect(() => {
    // Caricamento ruolo
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.role) setUserRole(data.role);
      })
      .catch(console.error);

    // Caricamento profilo
    fetch('/api/organization')
      .then((res) => {
        if (!res.ok) throw new Error('Impossibile caricare i dati dell\'organizzazione');
        return res.json();
      })
      .then((data) => {
        const mappedForm = { ...form } as any;
        Object.keys(form).forEach((key) => {
          const val = data[key];
          if (val !== null && val !== undefined) {
            mappedForm[key] = String(val);
          }
        });
        setForm(mappedForm);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    loadCollaborators();
  }, []);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore durante il salvataggio');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabEmail) return;
    
    setCollabLoading(true);
    setError('');
    try {
      const res = await fetch('/api/organization/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: collabEmail, role: collabRole })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setCollabSuccess(`Invito creato correttamente per ${collabEmail}! Se l'email non arriva, condividi il link qui sotto.`);
      setInviteLinkState(data.inviteLink || '');
      setCollabEmail('');
      loadCollaborators();
      // setTimeout(() => setCollabSuccess(''), 3000); // Do not clear success message so user can copy link

    } catch (err: any) {
      setError(err.message);
    } finally {
      setCollabLoading(false);
    }
  };

  const handleRemoveCollaborator = async (id: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo utente o invito?')) return;
    
    try {
      const res = await fetch(`/api/organization/collaborators/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Errore durante la rimozione');
      
      loadCollaborators();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const tabs = [
    { id: 'profilo', label: 'Profilo & Anagrafica', icon: BuildingApartment, iconFill: BuildingFill },
    { id: 'banca', label: 'Banca & Pagamenti', icon: CreditCardIcon, iconFill: CreditCardIconFill },
    { id: 'collaboratori', label: 'Collaboratori & Commercialista', icon: UsersIcon, iconFill: UsersIconFill },
    { id: 'aspetto', label: 'Aspetto Documenti', icon: Palette, iconFill: Palette },
  ] as const;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (form.piano === 'BASE') {
      alert("Il caricamento del logo personalizzato è disponibile solo nei piani START e PRO.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Il logo non deve superare i 2MB.");
      return;
    }

    try {
      setUploadingLogo(true);
      const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(prev => ({ ...prev, logoUrl: url }));
    } catch (err: any) {
      console.error(err);
      setError("Errore durante l'upload del logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="La mia Organizzazione"
        subtitle="Gestisci l'anagrafica della tua attività, i dati bancari e regola gli accessi per soci o per il tuo commercialista."
      />

      <div className="flex gap-6 items-start">
        {/* Navigation Tabs (Sidebar style) */}
        <div className="w-64 shrink-0 flex flex-col gap-1 rounded-xl border border-border bg-white p-2">
          {tabs.map((tab) => {
            const Icon = activeTab === tab.id ? tab.iconFill : tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-primary/20 text-foreground'
                    : 'text-muted-foreground hover:bg-[#F7F7F7] hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground')} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 rounded-xl border border-border bg-white p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-[13px] text-success-foreground font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Modifiche salvate con successo!
            </div>
          )}

          {/* TAB 1: Profilo */}
          {activeTab === 'profilo' && (
            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-foreground border-b border-border pb-2">Informazioni Aziendali</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Ragione Sociale / Nome e Cognome *</label>
                  <input
                    type="text"
                    required
                    value={form.ragioneSociale}
                    onChange={(e) => handleChange('ragioneSociale', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Partita IVA</label>
                  <input
                    type="text"
                    value={form.partitaIva}
                    onChange={(e) => handleChange('partitaIva', e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Codice Fiscale *</label>
                  <input
                    type="text"
                    required
                    value={form.codiceFiscale}
                    onChange={(e) => handleChange('codiceFiscale', e.target.value.toUpperCase())}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Tipo Soggetto</label>
                  <select
                    value={form.tipoSoggetto}
                    onChange={(e) => handleChange('tipoSoggetto', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white focus:border-primary-dark"
                  >
                    <option value="PERSONA_GIURIDICA">Società (Persona Giuridica)</option>
                    <option value="PERSONA_FISICA">Ditta Individuale / Libero Professionista</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Tipologia Attività</label>
                  <select
                    value={form.tipoAttivita}
                    onChange={(e) => handleChange('tipoAttivita', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none bg-white focus:border-primary-dark"
                  >
                    <option value="ALTRO">Generica / Altro</option>
                    <option value="ASILO_NIDO">Asilo Nido / Scuola d&apos;infanzia</option>
                    <option value="LIBERO_PROFESSIONISTA">Professionista / Consulente</option>
                  </select>
                </div>
              </div>

              <h3 className="text-[14px] font-bold text-foreground border-b border-border pb-2 pt-4">Sede Legale</h3>
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-4 space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Indirizzo *</label>
                  <input
                    type="text"
                    required
                    value={form.indirizzo}
                    onChange={(e) => handleChange('indirizzo', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">CAP *</label>
                  <input
                    type="text"
                    required
                    value={form.cap}
                    onChange={(e) => handleChange('cap', e.target.value.replace(/\D/g, ''))}
                    maxLength={5}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Comune *</label>
                  <input
                    type="text"
                    required
                    value={form.comune}
                    onChange={(e) => handleChange('comune', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Prov. *</label>
                  <input
                    type="text"
                    required
                    value={form.provincia}
                    onChange={(e) => handleChange('provincia', e.target.value.toUpperCase())}
                    maxLength={2}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Paese</label>
                  <input
                    type="text"
                    required
                    value={form.paese}
                    onChange={(e) => handleChange('paese', e.target.value.toUpperCase())}
                    maxLength={2}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark"
                  />
                </div>
              </div>

              <h3 className="text-[14px] font-bold text-foreground border-b border-border pb-2 pt-4">Contatti</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Email di contatto *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Telefono</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Banca & Pagamenti */}
          {activeTab === 'banca' && (
            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-foreground border-b border-border pb-2">Coordinate Bancarie</h3>
              <p className="text-[11px] text-muted-foreground">
                Questi dati verranno stampati automaticamente nel piè di pagina delle fatture per consentire il pagamento tramite bonifico.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">IBAN</label>
                  <input
                    type="text"
                    value={form.iban}
                    onChange={(e) => handleChange('iban', e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="IT00X0000000000000000000000"
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Codice BIC / SWIFT</label>
                  <input
                    type="text"
                    value={form.bic}
                    onChange={(e) => handleChange('bic', e.target.value.toUpperCase())}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] font-mono outline-none focus:border-primary-dark"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-foreground">Intestatario Conto</label>
                  <input
                    type="text"
                    value={form.intestatarioConto}
                    onChange={(e) => handleChange('intestatarioConto', e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-primary-dark"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Collaboratori & Commercialista */}
          {activeTab === 'collaboratori' && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-[14px] font-bold text-foreground">Gestione Collaboratori e Commercialista</h3>
                <p className="text-[11px] text-muted-foreground">
                  Invita soci, dipendenti o il tuo commercialista ad accedere a questo spazio di fatturazione con permessi mirati.
                </p>
              </div>

              {collabSuccess && (
                <div className="flex flex-col gap-2 rounded-lg bg-green-50 px-4 py-3 animate-fade-in border border-green-200">
                  <div className="flex items-center gap-2 text-[13px] text-green-800 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    {collabSuccess}
                  </div>
                  {inviteLinkState && (
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="text" 
                        readOnly 
                        value={inviteLinkState} 
                        className="flex-1 h-8 px-2 text-[11px] font-mono bg-white border border-green-200 rounded outline-none text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLinkState);
                          alert('Link copiato negli appunti!');
                        }}
                        className="flex items-center gap-1.5 h-8 px-3 bg-white border border-green-200 rounded text-[11px] font-bold text-green-800 hover:bg-green-100 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        Copia Link
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Invito Form (solo per OWNER o ADMIN) */}
              {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                <div className="rounded-xl border border-border bg-[#F7F7F7]/30 p-4 space-y-4">
                  <h4 className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-primary-dark" />
                    Invita Nuovo Utente
                  </h4>
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-foreground font-semibold">Email Collaboratore</label>
                      <input
                        type="email"
                        value={collabEmail}
                        onChange={(e) => setCollabEmail(e.target.value)}
                        placeholder="es. nome@soci.it"
                        className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary-dark"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-foreground font-semibold">Ruolo di Accesso</label>
                      <select
                        value={collabRole}
                        onChange={(e) => setCollabRole(e.target.value as any)}
                        className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary-dark font-semibold"
                      >
                        <option value="ADMIN">ADMIN (Accesso Completo)</option>
                        <option value="OPERATOR">OPERATORE (Fatture e Magazzino)</option>
                        <option value="ACCOUNTANT">COMMERCIALISTA (Solo lettura ed Export)</option>
                        <option value="READONLY">READ-ONLY (Solo visualizzazione)</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCollaborator}
                      disabled={collabLoading}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-[12px] font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
                    >
                      {collabLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Invia Invito'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Elenco Utenti */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-foreground">Utenti con accesso a questo spazio</h4>
                {loadingCollabs ? (
                  <div className="flex h-20 items-center justify-center border border-border rounded-xl">
                     <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : collabs.length === 0 ? (
                  <div className="text-center p-6 border border-border rounded-xl text-[13px] text-muted-foreground">
                    Nessun utente aggiunto
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-xl bg-white overflow-hidden">
                    {collabs.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold text-foreground">{c.nome}</p>
                          <span className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
                            c.stato === 'ATTIVO' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800 animate-pulse"
                          )}>
                            {c.stato === 'ATTIVO' ? 'Attivo' : 'In attesa'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">{c.email}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="inline-block rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-foreground bg-[#F7F7F7]">
                            {c.ruolo === 'OWNER' && 'PROPRIETARIO'}
                            {c.ruolo === 'ADMIN' && 'AMMINISTRATORE'}
                            {c.ruolo === 'OPERATOR' && 'OPERATORE'}
                            {c.ruolo === 'ACCOUNTANT' && '📁 COMMERCIALISTA'}
                            {c.ruolo === 'READONLY' && 'SOLO LETTURA'}
                          </span>
                        </div>

                        {(userRole === 'OWNER' || userRole === 'ADMIN') && c.ruolo !== 'OWNER' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(c.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            title="Revoca accesso"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Aspetto Documenti */}
          {activeTab === 'aspetto' && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-[14px] font-bold text-foreground">Personalizzazione Documenti</h3>
                <p className="text-[11px] text-muted-foreground">
                  Modifica l'aspetto dei tuoi documenti in PDF, come preventivi e fatture di cortesia.
                </p>
              </div>

              {form.piano === 'BASE' && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-[13px] text-orange-800">
                  <strong>Funzionalità Premium:</strong> La personalizzazione del logo e del colore è disponibile solo nei piani <strong>START</strong> e <strong>PRO</strong>.
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-foreground">Logo Aziendale</label>
                  <p className="text-[11px] text-muted-foreground">
                    Carica il logo della tua azienda. Formati supportati: PNG, JPG (max 2MB).
                  </p>
                  
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-[#F7F7F7] flex items-center justify-center">
                      {form.logoUrl ? (
                        <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={form.piano === 'BASE' || uploadingLogo}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={cn(
                          "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-[12px] font-bold transition-colors hover:bg-gray-50",
                          (form.piano === 'BASE' || uploadingLogo) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        Carica Logo
                      </label>
                      {form.logoUrl && (
                        <button
                          type="button"
                          onClick={() => handleChange('logoUrl', '')}
                          disabled={form.piano === 'BASE'}
                          className="ml-3 text-[11px] font-semibold text-red-500 hover:text-red-700"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-foreground">Colore Principale</label>
                  <p className="text-[11px] text-muted-foreground">
                    Scegli il colore che verrà utilizzato per l'intestazione e gli elementi grafici del PDF.
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="color"
                      value={form.coloreAccento || '#335525'}
                      onChange={(e) => handleChange('coloreAccento', e.target.value)}
                      disabled={form.piano === 'BASE'}
                      className="h-10 w-16 cursor-pointer rounded border border-border bg-white p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="text-[13px] font-mono font-medium text-foreground uppercase border border-border rounded-lg px-3 py-2 bg-[#F7F7F7]">
                      {form.coloreAccento || '#335525'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {activeTab !== 'collaboratori' && (
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salva Impostazioni
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
