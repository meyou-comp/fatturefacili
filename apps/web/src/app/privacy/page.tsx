import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo className="h-6 w-auto" />
          </Link>
          <Link href="/" className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Torna alla Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            Noi di Fatture Facili abbiamo a cuore la protezione della tua privacy. Così come la trasparenza su come vengono raccolte ed utilizzate le informazioni che ti riguardano. Abbiamo perciò redatto il seguente documento (privacy policy), con lo scopo di rendere l’argomento nel maggior modo comprensibile a tutti, ed evitando, dove possibile, riferimenti di legge e citazioni di normative per privilegiare la comprensione delle misure di sicurezza adottate nel trattamento dei dati personali di tutti gli utenti.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Chi è il titolare del trattamento?</h2>
          <p>
            Il Titolare del trattamento è il soggetto che determina le finalità e mezzi del trattamento dei dati personali. MEYOU Srl, in persona del suo legale rappresentante p.t., con sede in via fra' Claudio Granzotto 33, Monteforte d'Alpone (VR), opera come Titolare del Trattamento ed è contattabile, per comunicazioni inerenti alla presente informativa, compreso l’esercizio dei diritti indicati nella stessa, all’indirizzo <strong>team@meyou.company</strong>.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Responsabile della protezione dei dati</h2>
          <p>
            Il responsabile della protezione dei dati è una figura esperta che collabora alla protezione dei tuoi dati. È altrimenti nominato DPO, Data Protection Officer, e potrai contattarlo, per qualsiasi richiesta sul tema, all’indirizzo <strong>team@meyou.company</strong>.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Quali dati verranno trattati?</h2>
          <p>
            Quando crei il tuo account ed usufruisci dei nostri servizi, effettuiamo un trattamento dei tuoi dati personali. Il tipo di informazioni raccolte e gestite dipende dai servizi richiesti e possono essere, per esempio:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>nome e cognome</li>
            <li>indirizzo</li>
            <li>indirizzo email</li>
            <li>data di nascita e luogo di nascita</li>
            <li>numero di telefono</li>
            <li>documento d'identità o patente</li>
            <li>indirizzo IP e log degli eventi</li>
            <li>dati bancari</li>
            <li>account nome o nickname</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Come usiamo i dati raccolti?</h2>
          <p>
            Per poterti permettere di utilizzare i nostri servizi, ma anche per adempiere agli obblighi imposti da disposizioni di legge e regolamenti, ed anche per eseguire le richieste di assistenza tecnica che ci puoi inoltrare.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Con chi condividiamo queste informazioni?</h2>
          <p>
            Comunichiamo le tue informazioni a soggetti terzi, situati all'interno e all'esterno dell'Unione Europea, che svolgono attività funzionali a quelle dei servizi da te richiesti o per rispondere ad un obbligo di legge. Per esempio: terzi fornitori di servizi di assistenza e consulenza, società di servizi informatici, istituti di credito, Autorità competenti.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Trasferimento dei dati</h2>
          <p>
            Condividiamo con fornitori di servizi di hosting e telefonia di dati su server negli Stati Uniti e in Europa per ospitare le informazioni che raccogliamo. Nel farlo adottiamo le migliori misure tecniche di sicurezza per proteggere i tuoi dati stipulando clausole contrattuali nel rispetto delle disposizioni di legge della Commissione Europea.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Quali sono i tuoi diritti?</h2>
          <p>
            Puoi esercitare in ogni momento il diritto di accedere ai propri dati, rettificarli, trasferirli ed eliminarli. Hai il diritto di opporti e limitare l’elaborazione dei dati secondo il GDPR. Puoi esercitare i tuoi diritti scrivendo a <strong>team@meyou.company</strong>.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Contattaci</h2>
          <p>
            Se hai domande o dubbi su come gestiamo le tue informazioni, contattaci:<br/>
            <strong>MEYOU Srl</strong><br/>
            Via fra' Claudio Granzotto 33, Monteforte d'Alpone (VR)<br/>
            P.IVA e CF: 05159610236<br/>
            team@meyou.company<br/>
            meyou@namirialpec.it
          </p>
          
          <p className="text-sm mt-8 pt-8 border-t border-border">
            Data di ultima modifica: 21/05/2026
          </p>
        </div>
      </main>
    </div>
  );
}
