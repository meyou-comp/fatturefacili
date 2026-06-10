'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import RealismButton from '@/components/ui/shiny-borders-button';

/* ── Logo SVG ─────────────────────────────────────────────── */
function LogoSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="125" height="26" viewBox="0 0 125 26" fill="none">
      <rect x="67" width="58" height="26" rx="6" fill="#335525"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M88.4222 9.21623C91.0981 9.21632 92.7873 10.6618 92.7874 12.9286V20.803H90.9776V18.8424H90.9337C90.2536 20.1456 88.8056 21 87.27 21C85.0001 20.9999 83.4756 19.6312 83.4754 17.5835C83.4754 15.6342 84.9784 14.4075 87.6107 14.2542L90.8787 14.0674V13.1154C90.8787 11.7246 89.9575 10.892 88.3782 10.8919C86.9087 10.8919 85.9874 11.5817 85.7459 12.6986H83.9031C84.0348 10.7275 85.7242 9.21623 88.4222 9.21623ZM87.8296 15.7321C86.2942 15.8306 85.4171 16.5103 85.4171 17.5835C85.4173 18.6675 86.3271 19.3792 87.6978 19.3793C89.4965 19.3793 90.8787 18.1197 90.8787 16.4769V15.5461L87.8296 15.7321Z" fill="#ABF88D"/>
      <path d="M99.8941 9.21623C102.746 9.21623 104.446 11.0997 104.687 13.1476H102.822C102.548 11.9102 101.583 10.8919 99.9051 10.8919C97.931 10.8919 96.5931 12.5237 96.5931 15.1081C96.5931 17.7583 97.9529 19.3243 99.9271 19.3243C101.484 19.3243 102.505 18.5027 102.834 17.1338H104.709C104.412 19.4008 102.504 21 99.9161 21C96.7574 20.9999 94.6514 18.7768 94.6514 15.1081C94.6514 11.5161 96.7464 9.21629 99.8941 9.21623Z" fill="#ABF88D"/>
      <path d="M82.7368 6.97233H77.3442V6.98018C76.7509 6.98024 76.1816 7.2158 75.762 7.63475C75.3424 8.05371 75.1067 8.62215 75.1067 9.21466V12.2057H82.1152V13.9583H75.1067V20.803H73.1328V9.12126H73.1352C73.1593 8.03984 73.5989 7.00741 74.3666 6.24085C75.1478 5.46093 76.2044 5.0197 77.3081 5.0102L82.7368 5.00942V6.97233Z" fill="#ABF88D"/>
      <path d="M108.471 20.803H106.563V9.41322H108.471V20.803Z" fill="#ABF88D"/>
      <path d="M113.056 20.803H111.148V5H113.056V20.803Z" fill="#ABF88D"/>
      <path d="M117.64 20.803H115.732V9.41322H117.64V20.803Z" fill="#ABF88D"/>
      <path d="M107.517 5.13107C108.175 5.13107 108.712 5.65691 108.713 6.31384C108.713 6.95998 108.175 7.49662 107.517 7.49662C106.87 7.49661 106.332 6.95998 106.332 6.31384C106.332 5.65691 106.87 5.13108 107.517 5.13107Z" fill="#ABF88D"/>
      <path d="M116.686 5.13107C117.344 5.13107 117.882 5.65691 117.882 6.31384C117.882 6.95998 117.344 7.49661 116.686 7.49662C116.039 7.49662 115.501 6.95998 115.501 6.31384C115.502 5.65691 116.039 5.13107 116.686 5.13107Z" fill="#ABF88D"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.2894 9.20681C17.9653 9.2069 19.6545 10.6524 19.6546 12.9192V20.7936H17.8448V18.833H17.8008C17.1209 20.1363 15.6727 20.9906 14.1372 20.9906C11.8671 20.9905 10.3426 19.6212 10.3426 17.5733C10.3427 15.6242 11.8456 14.398 14.4779 14.2448L17.7459 14.058V13.1052C17.7458 11.7146 16.8246 10.8825 15.2454 10.8825C13.7758 10.8825 12.8544 11.5722 12.6131 12.6892H10.7703C10.902 10.718 12.5914 9.20681 15.2894 9.20681ZM14.6968 15.7227C13.1615 15.8212 12.2844 16.5002 12.2842 17.5733C12.2842 18.6574 13.1942 19.3698 14.565 19.3699C16.3637 19.3699 17.7459 18.1102 17.7459 16.4675V15.5366L14.6968 15.7227Z" fill="black"/>
      <path d="M37.4876 16.4565C37.4876 18.3071 38.3544 19.3038 40.12 19.3039C41.9735 19.3039 43.0929 18.0337 43.0929 16.0955V9.40381H45.0009V20.7936H43.191V18.9429H43.1471C42.467 20.2568 41.2828 20.9905 39.5282 20.9906C37.0385 20.9906 35.5798 19.3808 35.5797 16.7963V9.40381H37.4876V16.4565Z" fill="black"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M58.4694 9.20681C61.5513 9.20681 63.4492 11.441 63.4492 14.8907V15.6136H55.2665V15.7227C55.2665 17.902 56.5503 19.3369 58.6013 19.3369C60.0488 19.3368 61.1125 18.6032 61.4306 17.5302H63.3064C62.9773 19.5231 61.0469 20.9905 58.5573 20.9906C55.289 20.9906 53.3037 18.7237 53.3036 15.1426C53.3036 11.6054 55.3217 9.20684 58.4694 9.20681ZM58.4365 10.8605C56.6487 10.8605 55.3982 12.2294 55.2775 14.1239H61.4746C61.4306 12.2184 60.2352 10.8605 58.4365 10.8605Z" fill="black"/>
      <path d="M24.6007 9.40381H26.8162V10.9696H24.6007V17.7382C24.6007 18.7784 25.0396 19.249 26.0157 19.249C26.2349 19.249 26.6735 19.2167 26.8053 19.1948V20.7936C26.5749 20.8483 26.0485 20.8807 25.599 20.8807C23.5041 20.8807 22.6927 20.0266 22.6927 17.8363V10.9696H20.9928V9.40381H22.6927V6.65525H24.6007V9.40381Z" fill="black"/>
      <path d="M31.3793 9.40381H33.5941V10.9696H31.3793V17.7382C31.3793 18.7783 31.8176 19.2489 32.7935 19.249C33.0126 19.249 33.451 19.2167 33.5831 19.1948V20.7936C33.3526 20.8483 32.8262 20.8807 32.3768 20.8807C30.2821 20.8806 29.4706 20.0265 29.4706 17.8363V10.9696H27.7706V9.40381H29.4706V6.65525H31.3793V9.40381Z" fill="black"/>
      <path d="M9.60089 6.96213H4.21142V6.97076C3.61805 6.97082 3.04879 7.20637 2.6292 7.62533C2.2096 8.04431 1.97389 8.61272 1.97386 9.20524V12.1963H8.98244V13.9489H1.97386V20.7936H0V9.11184H0.00235451C0.0264235 8.0304 0.46603 6.99801 1.23376 6.23143C2.01426 5.45222 3.06956 5.01109 4.17218 5.00078L9.60089 5V6.96213Z" fill="black"/>
      <path d="M52.0864 9.20681C52.4153 9.20683 52.7004 9.26183 52.8539 9.28372V11.1344C52.7004 11.0797 52.2943 11.0245 51.8336 11.0245C50.3532 11.0247 49.3881 12.0872 49.3881 13.6969V20.7936H47.4794V9.40381H49.2782V11.2655H49.3222C49.6952 10.0061 50.7484 9.20681 52.0864 9.20681Z" fill="black"/>
    </svg>
  );
}

export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const sfPro = "var(--font-sfpro), Inter, sans-serif";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let paused = false;
    let raf: number;
    
    // Auto loop by scrolling right
    const step = () => {
      if (!paused && el) {
        el.scrollLeft += 1; // slightly faster loop
        // Reset when we reach the end of the first set (since we duplicate the list)
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    
    return () => { 
      cancelAnimationFrame(raf); 
      el.removeEventListener('mouseenter', pause); 
      el.removeEventListener('mouseleave', resume); 
    };
  }, []);

  const cards = [
    { title: 'Invia e ricevi fatture', desc: 'Gestisci la fiscalità in maniera semplice come dovrebbe.', img: '/Simple.svg' },
    { title: 'Monitora la situazione', desc: "Vedi l'overview completa della tua attività da un'unica dashboard.", img: '/Feature Graph Container.svg' },
    { title: 'Fattura convenientemente', desc: 'Il servizio più facile e conveniente sul mercato.', img: '/Fatturaconvenientemente.svg' },
    { title: 'Gruppi e Collaborazioni', desc: 'Collabora con il tuo team e con il tuo commercialista.', img: '/gruppiecollaborazione.svg' },
    { title: 'Importa fatture in un\'attimo', desc: 'Importa i documenti fiscali dal tuo vecchio provider.', img: '/SemiCirle.svg' },
  ];

  // Duplicate for seamless infinite loop
  const loopingCards = [...cards, ...cards];

  const plans = [
    { id: 'BASE', name: 'Solo', price: 'Free', features: ['20 Fatture / anno', 'Nessun gruppo', 'Fatture Standard', 'Supporto standard'] },
    { id: 'START', name: 'Start', price: billingCycle === 'monthly' ? '1,69€ / mese' : '17,99€ / anno', savings: billingCycle === 'annual' ? "risparmi l'11%!" : null, features: ['100 Fatture / anno', 'Gruppo (3 persone)', 'Fatture Custom', 'Supporto standard'] },
    { id: 'PRO', name: 'Pro', price: billingCycle === 'monthly' ? '3,69€ / mese' : '27,99€ / anno', savings: billingCycle === 'annual' ? "risparmi il 36%!" : null, features: ['Fatture illimitate', 'Gruppo (10 persone)', 'Modulo Magazzino', 'Supporto prioritario'] },
  ];

  return (
    // No bg-white on the root so the video behind can be seen!
    <div className="min-h-screen text-black antialiased selection:bg-[#ABF88D] selection:text-black">

      {/* ─── HERO ───────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden pb-20 md:pb-28 min-h-[90vh] z-0 bg-white">
        {/* Video BG */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <video autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source src="https://firebasestorage.googleapis.com/v0/b/fatture-facili-2ce2b.firebasestorage.app/o/0520.mp4?alt=media&token=6a0e32d5-eb92-4b88-b4a0-d45d2d6a3dab" type="video/mp4" />
          </video>
          {/* Sfumatura bianca in overlay per blendare */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none" />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mx-auto max-w-7xl px-6 pt-6">
            <div
              className="mx-auto flex max-w-xl items-center justify-between px-5 shadow-sm"
              style={{ height: 66, borderRadius: 24, border: '1px solid rgba(0,0,0,0.20)', background: '#FFF' }}
            >
              <LogoSVG />
              <Link href="/waitlist">
                <RealismButton 
                  text="Unisciti alla Waitlist" 
                  className="px-4 h-[38px]" 
                  innerClassName="text-[13px] font-medium" 
                />
              </Link>
            </div>
          </div>

          {/* Title + CTA */}
          <div className="mx-auto max-w-7xl px-6 text-center pt-16 md:pt-24">
            <h1 className="mx-auto max-w-4xl text-black leading-[1.08]" style={{ fontFamily: sfPro, fontSize: 64, fontWeight: 400 }}>
              Il Software di fatturazione<br />per ogni tasca
            </h1>
            <p className="mx-auto mt-6 max-w-xl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: 'rgba(0,0,0,0.7)' }}>
              Fattura in tranquillità con piani flessibili e<br className="hidden sm:inline" /> un&apos;interfaccia da professionisti.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Link href="/waitlist">
                <RealismButton 
                  text="Unisciti alla Waitlist" 
                  className="px-6 h-[50px]" 
                  innerClassName="text-[15px] font-bold" 
                />
              </Link>
              <a href="#pricing" className="flex items-center justify-center bg-[#ABF88D] text-[#335525] hover:opacity-90 transition-all font-bold text-[15px]" style={{ height: 50, width: 130, borderRadius: 14 }}>
                Costi
              </a>
            </div>

            <div className="mx-auto mt-24 inline-flex items-center gap-2 rounded-full border border-dashed border-[#335525]/40 bg-white/50 px-4 py-1.5 text-[11px] font-bold text-[#335525]/90 tracking-wide uppercase backdrop-blur-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              Scorri per scoprire
            </div>
          </div>
        </div>
      </section>

      {/* ─── FUNZIONALITÀ ───────────────────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 style={{ fontFamily: sfPro, fontSize: 36, fontWeight: 600 }} className="text-black tracking-tight">Funzionalità</h2>
          <p className="mx-auto mt-4 max-w-3xl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 400, color: 'rgba(0,0,0,0.7)' }}>
            Fatture Facili è un servizio web adattabile a diverse esigenze, dalle aziende strutturate ai piccoli professionisti. Perfetto sia se cerchi un servizio semplice e conveniente per emettere fatture sia per chi vuole una piattaforma completa ed efficiente.
          </p>
        </div>

        {/* Edge-to-edge carousel with top/bottom padding to prevent clipping on hover scale */}
        <div ref={scrollRef} className="mt-12 flex gap-4 overflow-x-hidden pl-4 py-8" style={{ scrollbarWidth: 'none' }}>
          {loopingCards.map((card, idx) => (
            <div
              key={`${card.title}-${idx}`}
              className="flex-shrink-0 relative rounded-[20px] bg-[#335525] p-6 text-left text-white flex flex-col justify-end transition-transform duration-300 hover:scale-[1.04]"
              style={{ width: 300, height: 380 }}
            >
              {/* Graphic background mapped edge-to-edge in the top portion */}
              <div className="absolute top-0 left-0 right-0 bottom-[100px] overflow-hidden rounded-t-[20px] flex items-center justify-center p-4">
                <img src={card.img} alt="" className="w-full h-full object-contain pointer-events-none" />
              </div>
              
              {/* Text content at bottom */}
              <div className="relative z-10 mt-auto pt-4">
                <h3 className="text-[14px] font-extrabold text-white">{card.title}</h3>
                <p className="mt-1 text-[11px] text-[#ABF88D] font-medium leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BRAND SPLIT BANNER ─────────────────────────── */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden border-t border-b border-black/10 bg-white">
        <div className="bg-[#ABF88D] p-12 md:p-20 flex items-center">
          <h2 className="text-[40px] text-black leading-[1.12]" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', fontWeight: 400 }}>
            Aiutiamo professionisti e PMI italiane a{' '}
            <span style={{ fontWeight: 600 }}>semplificare la fatturazione</span>{' '}
            con la tecnologia
          </h2>
        </div>
        <div className="relative min-h-[350px] md:min-h-full">
          <Image src="/workspace_billing.png" alt="Workspace" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white text-center">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mt-12 mb-8 max-w-[950px] mx-auto gap-4">
            <h2 style={{ fontFamily: sfPro, fontSize: 36, fontWeight: 600 }} className="text-black tracking-tight">Piani di abbonamento</h2>
            
            {/* Billing Toggle */}
            <div className="flex items-center gap-1 rounded-full border border-black/10 bg-[#F7F7F7] p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-bold transition-all",
                  billingCycle === 'monthly' ? "bg-white text-black shadow-sm" : "text-black/60 hover:text-black"
                )}
              >
                Mensile
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-bold transition-all",
                  billingCycle === 'annual' ? "bg-[#ABF88D] text-black shadow-sm" : "text-black/60 hover:text-black"
                )}
              >
                Annuale
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-[950px] mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-[20px] border border-black bg-white flex flex-col h-full hover:-translate-y-1 transition-all overflow-hidden shadow-sm">
                <div className="p-8 pb-6 text-left">
                  {/* Plan name + price */}
                  <h3 style={{ fontFamily: sfPro, fontSize: 32, fontWeight: 400 }} className="text-black">{plan.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p style={{ fontFamily: sfPro, fontSize: 20, fontWeight: 600 }} className="text-black">{plan.price}</p>
                    {plan.savings && <span className="text-[#335525] bg-[#ABF88D]/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">{plan.savings}</span>}
                  </div>
                </div>

                {/* Divider edge-to-edge */}
                <div className="w-full border-t border-black" />

                <div className="p-8 pt-6 flex flex-col justify-between flex-1 text-left">
                  {/* Features */}
                  <ul className="space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-[14px] text-black font-medium">
                        <img src="/icons/CheckGreen.svg" alt="✓" className="h-6 w-6 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 flex justify-center">
                    <Link
                      href="/waitlist"
                      className="flex items-center justify-center text-[13px] font-bold text-black hover:opacity-90 transition-all"
                      style={{ width: 191, height: 40, padding: '8px 10px', borderRadius: 10, background: '#ABF88D', gap: 8 }}
                    >
                      Unisciti alla Waitlist
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom plan */}
          <div className="mt-8 max-w-[950px] mx-auto rounded-[20px] border border-black bg-white p-6 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between hover:-translate-y-1 transition-all shadow-sm">
            <div className="text-left">
              <h4 style={{ fontFamily: sfPro, fontSize: 32, fontWeight: 400 }} className="text-black">Custom</h4>
              <p style={{ fontFamily: sfPro, fontSize: 18, fontWeight: 600 }} className="text-black mt-1">Facci sapere quello che cerchi ;)</p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                href="/waitlist"
                className="flex items-center justify-center text-[13px] font-bold text-black hover:opacity-90 transition-all"
                style={{ width: 191, height: 40, padding: '8px 10px', borderRadius: 10, background: '#ABF88D', gap: 8 }}
              >
                Unisciti alla Waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="pt-20 pb-20 text-black" style={{ background: 'radial-gradient(105.34% 50% at 50% 0%, #ABF88D 0%, #FFF 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <LogoSVG />
            <p className="leading-relaxed text-black" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400 }}>
              Copyright © 2026 MeYou Srl (05159610239)<br />
              Quartiere Fra&apos; G. Gianrotto 33, 37032<br />
              Monteforte d&apos;Alpone (VR)
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600 }} className="mb-5">User Protection</h4>
            <ul className="space-y-3" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400 }}>
              <li><Link href="/privacy" className="hover:opacity-70 transition-opacity">Privacy Policy</Link></li>
              <li><Link href="/termini" className="hover:opacity-70 transition-opacity">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600 }} className="mb-5">Contact</h4>
            <ul className="space-y-3" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400 }}>
              <li><a href="mailto:team@meyou.company" className="underline hover:opacity-70 transition-opacity">team@meyou.company</a></li>
              <li>+39 366 193 1030</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600 }} className="mb-5">Follow Us</h4>
            <ul className="space-y-3" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400 }}>
              <li><a href="#" className="hover:opacity-70 transition-opacity">Instagram</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
