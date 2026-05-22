'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function GestisciPianoContent() {
  const searchParams = useSearchParams();
  const checkoutPlan = searchParams.get('checkoutPlan');
  const checkoutCycle = searchParams.get('checkoutCycle') as 'monthly' | 'annual' | null;
  const hasTriggeredCheckout = useRef(false);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [org, setOrg] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(checkoutCycle || 'monthly');

  useEffect(() => {
    fetch('/api/organization')
      .then((res) => {
        if (!res.ok) throw new Error('Impossibile caricare le impostazioni');
        return res.json();
      })
      .then((data) => {
        setOrg(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (priceId: string, planId: string) => {
    if (!priceId) {
      alert("ID Prezzo mancante. Configura Stripe nel file .env");
      return;
    }
    
    setLoadingAction(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Errore durante la creazione del checkout');
      }
    } catch (e) {
      console.error(e);
      alert('Errore di connessione a Stripe');
    } finally {
      setLoadingAction(null);
    }
  };

  useEffect(() => {
    if (!loading && checkoutPlan && checkoutPlan !== 'BASE' && !hasTriggeredCheckout.current) {
      hasTriggeredCheckout.current = true;
      const priceId = billingCycle === 'monthly'
        ? (checkoutPlan === 'START' ? process.env.NEXT_PUBLIC_STRIPE_START_MONTHLY_PRICE_ID : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID)
        : (checkoutPlan === 'START' ? process.env.NEXT_PUBLIC_STRIPE_START_ANNUAL_PRICE_ID : process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID);
        
      if (priceId) {
        handleCheckout(priceId as string, checkoutPlan);
      }
    }
  }, [loading, checkoutPlan, billingCycle]);

  const handlePortal = async (actionId: string) => {
    setLoadingAction(actionId);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Nessun abbonamento attivo trovato');
      }
    } catch (e) {
      console.error(e);
      alert('Errore di connessione a Stripe');
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pianoAttuale = org?.piano || 'BASE';
  const hasStripeCustomer = !!org?.stripeCustomerId;

  const plans = [
    {
      id: 'BASE',
      name: 'Solo',
      badge: 'Free',
      features: ['20 Fatture / anno', 'Nessun gruppo', 'Fatture Standard', 'Supporto standard'],
      priceId: null,
      priceLabel: 'Piano attuale',
    },
    {
      id: 'START',
      name: 'Start',
      badge: billingCycle === 'monthly' ? '1,69€ / mese' : '17,99€ / anno',
      savings: billingCycle === 'annual' ? "risparmi l'11%!" : null,
      features: ['100 Fatture / anno', 'Gruppo (3 persone)', 'Fatture Custom', 'Supporto standard'],
      priceId: billingCycle === 'monthly' 
        ? process.env.NEXT_PUBLIC_STRIPE_START_MONTHLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_START_ANNUAL_PRICE_ID,
      priceLabel: 'Passa a Start',
    },
    {
      id: 'PRO',
      name: 'Pro',
      badge: billingCycle === 'monthly' ? '3,69€ / mese' : '27,99€ / anno',
      savings: billingCycle === 'annual' ? "risparmi il 36%!" : null,
      features: ['Fatture illimitate', 'Gruppo (10 persone)', 'Modulo Magazzino', 'Supporto prioritario'],
      priceId: billingCycle === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
      priceLabel: 'Passa a Pro',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      <PageHeader
        title="Gestisci Abbonamento"
        subtitle="Visualizza il tuo piano attuale, aggiorna il metodo di pagamento e gestisci le tue fatture di abbonamento."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Colonna Sinistra (Larghezza 7/12) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Box: Piano attuale */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[14px] font-bold text-muted-foreground">Piano attuale</span>
              <h2 className="text-4xl text-foreground" style={{ fontFamily: "'SF Pro Display', sans-serif", fontWeight: 400 }}>
                {pianoAttuale === 'BASE' ? 'Solo' : pianoAttuale === 'START' ? 'Start' : 'Pro'}
              </h2>
              <p className="text-[15px] font-bold text-foreground mt-1">
                {pianoAttuale === 'BASE' ? 'Free' : 'Premium'}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full sm:w-auto z-10">
              {pianoAttuale === 'BASE' ? (
                <button 
                  onClick={() => handleCheckout(plans[1].priceId as string, 'upgrade')}
                  disabled={loadingAction === 'upgrade'}
                  className="w-full sm:w-48 rounded-xl bg-[#ABF88D] px-6 py-3.5 text-[14px] font-bold text-black shadow-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                >
                  {loadingAction === 'upgrade' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Esegui Upgrade'}
                </button>
              ) : (
                <button 
                  onClick={() => handlePortal('manage-plan')}
                  disabled={loadingAction === 'manage-plan'}
                  className="w-full sm:w-48 rounded-xl bg-[#ABF88D] px-6 py-3.5 text-[14px] font-bold text-black shadow-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                >
                  {loadingAction === 'manage-plan' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gestisci Piano'}
                </button>
              )}

              {hasStripeCustomer && pianoAttuale !== 'BASE' && (
                <button 
                  onClick={() => handlePortal('cancel')}
                  disabled={loadingAction === 'cancel'}
                  className="w-full sm:w-48 rounded-xl border border-border bg-[#F7F7F7] px-6 py-3.5 text-[14px] font-bold text-foreground hover:bg-gray-100 transition-colors flex justify-center items-center gap-2"
                >
                  {loadingAction === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Annulla Abbonamento'}
                </button>
              )}
            </div>
          </div>

          {/* Box: Metodo di pagamento */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-white p-8 space-y-6">
            <h3 className="text-[18px] font-bold text-foreground">
              Metodo di pagamento
            </h3>
            
            {hasStripeCustomer ? (
               <div className="flex items-center justify-between p-5 rounded-2xl border border-border bg-white shadow-sm">
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-20 bg-white rounded-xl border border-border flex items-center justify-center shadow-sm">
                     {/* Fake Mastercard Logo (in a real app, fetched from Stripe Portal) */}
                     <div className="flex items-center -space-x-2">
                       <div className="h-6 w-6 rounded-full bg-red-500 opacity-80 mix-blend-multiply"></div>
                       <div className="h-6 w-6 rounded-full bg-[#f69e1b] opacity-80 mix-blend-multiply"></div>
                     </div>
                   </div>
                   <div>
                     <p className="text-[14px] font-bold text-foreground">Mastercard terminante con ****</p>
                     <p className="text-[13px] text-muted-foreground">Scade il **/**</p>
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => handlePortal('modify-card')}
                   disabled={loadingAction === 'modify-card'}
                   className="text-[14px] font-bold text-[#ABF88D] hover:text-[#90da75] transition-colors"
                 >
                   Modifica
                 </button>
               </div>
            ) : (
               <div className="flex items-center justify-center p-6 rounded-2xl border border-dashed border-border bg-[#F7F7F7]">
                 <p className="text-[13px] text-muted-foreground font-medium text-center">Nessun metodo di pagamento salvato.<br/>Fai l&apos;upgrade per impostare una carta.</p>
               </div>
            )}

            <div className="flex items-center gap-3 rounded-xl bg-blue-50/50 p-4 border border-blue-100/50">
              <Zap className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-[13px] text-blue-800/80 font-medium">
                I pagamenti sono gestiti in modo sicuro tramite <strong>Stripe</strong>. Non salviamo i dati completi della tua carta sui nostri server.
              </p>
            </div>
          </div>
        </div>

        {/* Colonna Destra (Larghezza 5/12) */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-foreground">I nostri piani</h3>
            
            {/* Billing Toggle */}
            <div className="flex items-center gap-1 rounded-full border border-border bg-[#F7F7F7] p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-bold transition-all",
                  billingCycle === 'monthly' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensile
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-bold transition-all",
                  billingCycle === 'annual' ? "bg-[#ABF88D] text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annuale
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {plans.map(p => {
              const isCurrent = pianoAttuale === p.id;
              
              return (
                <div 
                  key={p.id} 
                  className={cn(
                    "rounded-[20px] border-[1.5px] p-6 transition-all",
                    isCurrent 
                      ? "border-[#ABF88D] bg-[#F7FFF5]" 
                      : "border-border bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex flex-col gap-1 mb-5">
                    <h4 className="text-[22px] text-foreground" style={{ fontFamily: "'SF Pro Display', sans-serif", fontWeight: 400 }}>{p.name}</h4>
                    <span className="font-bold text-[14px] text-foreground flex items-center gap-2">
                      {p.badge} 
                      {p.savings && <span className="text-[#335525] bg-[#ABF88D]/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">{p.savings}</span>}
                    </span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-[14px] font-medium text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-[#ABF88D] fill-[#335525]" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  
                  {isCurrent ? (
                    <button disabled className="w-full rounded-xl bg-black/5 px-4 py-3.5 text-[14px] font-bold text-foreground/50 cursor-default">
                      Piano attuale
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleCheckout(p.priceId as string, p.id)}
                      disabled={loadingAction === p.id}
                      className="w-full rounded-xl bg-[#ABF88D] px-4 py-3.5 text-[14px] font-bold text-black hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                    >
                      {loadingAction === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : p.priceLabel}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GestisciPianoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <GestisciPianoContent />
    </Suspense>
  );
}
