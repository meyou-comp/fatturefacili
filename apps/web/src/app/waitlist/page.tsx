'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import { submitWaitlistAction } from './actions';

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

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  // Questa è la chiave SITE (pubblica) di Turnstile.
  // Devi assicurarti che NEXT_PUBLIC_TURNSTILE_SITE_KEY sia nel tuo .env.local
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Dummy key for testing locally if not set

  const sfPro = "var(--font-sfpro), Inter, sans-serif";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    // Controlla che il token sia stato generato
    if (!turnstileToken) {
      setStatus('error');
      setErrorMessage("Per favore, completa la verifica anti-bot.");
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    try {
      // Invia tutto al server
      const res = await submitWaitlistAction(email, turnstileToken);
      
      if (res.success) {
        setStatus('success');
        setEmail('');
      } else {
        console.error("Errore server action:", res.error);
        setStatus('error');
        setErrorMessage(res.error || "Si è verificato un errore misterioso.");
      }
    } catch (error) {
      console.error("Error adding to waitlist", error);
      setStatus('error');
      setErrorMessage("Impossibile connettersi al server. Riprova più tardi.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black antialiased selection:bg-[#ABF88D] selection:text-black flex flex-col">
      {/* Header */}
      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <div
          className="mx-auto flex max-w-xl items-center justify-center px-5 shadow-sm"
          style={{ height: 66, borderRadius: 24, border: '1px solid rgba(0,0,0,0.20)', background: '#FFF' }}
        >
          <Link href="/">
            <LogoSVG />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-20 relative">
        <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center overflow-hidden z-0">
          <div className="w-[800px] h-[800px] bg-[#ABF88D] opacity-[0.08] blur-[100px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md text-center">
          {status === 'success' ? (
            <div className="bg-white border border-[#335525]/20 rounded-3xl p-10 shadow-lg animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#ABF88D] text-[#335525] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 style={{ fontFamily: sfPro }} className="text-3xl font-semibold mb-3">Sei in lista!</h2>
              <p className="text-black/70 mb-6">Grazie per il tuo interesse. Ti avviseremo non appena Fatture Facili riaprirà i battenti.</p>
              <button
                onClick={() => { setStatus('idle'); setTurnstileToken(null); }}
                className="text-[14px] font-bold text-black hover:opacity-70 transition-all underline"
              >
                Registra un'altra email
              </button>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl p-8 sm:p-10 shadow-xl">
              <h1 style={{ fontFamily: sfPro }} className="text-[40px] font-medium leading-[1.1] mb-4">
                Unisciti alla <br /> <span className="font-semibold text-[#335525]">Waitlist</span>
              </h1>
              <p className="text-black/60 mb-8 text-[15px]">
                Stiamo lavorando per migliorare la piattaforma. Lascia la tua email e sarai tra i primi a poter accedere.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="text-left">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Il tuo indirizzo email..."
                    className="w-full px-5 py-4 rounded-[14px] border border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#ABF88D] focus:border-[#ABF88D] transition-all"
                    required
                    disabled={status === 'loading'}
                  />
                </div>
                
                <div className="flex justify-center my-2">
                  <Turnstile 
                    siteKey={siteKey}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setErrorMessage('');
                    }}
                    onError={() => setErrorMessage("Errore Turnstile. Ricarica la pagina.")}
                    options={{ theme: 'light' }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={status === 'loading' || !turnstileToken}
                  className="w-full flex items-center justify-center bg-[#ABF88D] text-[#335525] hover:opacity-90 transition-all font-bold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ height: 54, borderRadius: 14 }}
                >
                  {status === 'loading' ? 'Salvataggio in corso...' : 'Iscriviti ora'}
                </button>

                {status === 'error' && (
                  <p className="text-red-500 text-[13px] font-medium mt-2">{errorMessage}</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Simple Footer */}
      <div className="text-center pb-8 pt-4">
        <p className="text-black/40 text-[13px]">
          © {new Date().getFullYear()} MeYou Srl. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
}
