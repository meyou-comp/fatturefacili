import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

export default function TerminiPage() {
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Termini e Condizioni di Utilizzo del Servizio Fatture Facili</h1>
        
        <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            Il presente contratto definisce i termini e le condizioni per l'accesso e l'utilizzo della piattaforma software denominata "Fatture Facili", fornita da MEYOU Srl. L'accettazione del presente accordo è necessaria per l'attivazione e la fruizione dei servizi offerti.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 1 - Definizioni e Parti del Contratto</h2>
          <p>
            <strong>1.1. Fornitore:</strong> MEYOU Srl, con sede legale in Via fra' Claudio Granzotto 33, Monteforte d'Alpone (VR), P.IVA e C.F. 05159610236, indirizzo email: team@meyou.company e PEC meyou@namirialpec.it.<br/><br/>
            <strong>1.2. Cliente:</strong> Il soggetto (professionista o impresa) che richiede l'attivazione del Servizio compilando il modulo di registrazione e accettando i presenti Termini e Condizioni.<br/><br/>
            <strong>1.3. Servizio:</strong> La Web-App "Mobile-First" denominata Fatture Facili, dedicata alla generazione di file XML per il Sistema di Interscambio (SdI), alla gestione della firma digitale, della marca da bollo virtuale e al monitoraggio delle soglie del regime forfettario.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 2 - Oggetto del Servizio</h2>
          <p>
            <strong>2.1.</strong> MEYOU Srl concede al Cliente il diritto non esclusivo e non trasferibile di utilizzare il software Fatture Facili in modalità Software as a Service (SaaS).<br/><br/>
            <strong>2.2.</strong> Le funzionalità principali includono: generazione e invio di fatture elettroniche nel formato XML, cruscotto di monitoraggio del fatturato, gestione automatizzata della cassa previdenziale e dell'imposta di bollo, portale dedicato per l'accesso protetto da parte del commercialista del Cliente.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 3 - Registrazione e Account</h2>
          <p>
            <strong>3.1.</strong> Per utilizzare il Servizio, il Cliente deve creare un account fornendo dati veritieri e completi (nome, cognome, indirizzo, email, data e luogo di nascita, documento d'identità, dati bancari).<br/><br/>
            <strong>3.2.</strong> Le credenziali di accesso sono strettamente personali e il Cliente è l'unico responsabile della loro custodia e dell'attività svolta tramite il proprio account.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 4 - Obblighi e Responsabilità del Cliente</h2>
          <p>
            <strong>4.1.</strong> Il Cliente è l'unico responsabile della correttezza e della completezza dei dati inseriti nelle fatture emesse tramite il Servizio. MEYOU Srl non effettua alcun controllo di merito sulla legittimità fiscale delle operazioni documentate.<br/><br/>
            <strong>4.2.</strong> Il Cliente si impegna a utilizzare il Servizio nel rispetto della normativa italiana in materia fiscale e di fatturazione elettronica (D.L. n. 36/2022 e successive modifiche).
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 5 - Durata, Corrispettivo e Recesso</h2>
          <p>
            <strong>5.1.</strong> Il contratto ha la durata indicata nel piano di abbonamento scelto dal Cliente (mensile o annuale) a decorrere dalla data di attivazione.<br/><br/>
            <strong>5.2.</strong> Il corrispettivo per il Servizio è determinato dal listino prezzi pubblicato sul sito fatturefacili.com al momento dell'acquisto. Il mancato pagamento del corrispettivo comporta la sospensione immediata dell'accesso alle funzionalità di invio.<br/><br/>
            <strong>5.3.</strong> Entrambe le parti possono recedere dal contratto con preavviso di 30 giorni prima della scadenza naturale dell'abbonamento.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 6 - Limitazioni di Responsabilità di MEYOU Srl</h2>
          <p>
            <strong>6.1.</strong> MEYOU Srl non sarà responsabile per eventuali danni derivanti da: errori nei dati trasmessi dal Cliente, malfunzionamenti del Sistema di Interscambio (SdI), o sospensioni del servizio dovute a manutenzione programmata o cause di forza maggiore.<br/><br/>
            <strong>6.2.</strong> In ogni caso, la responsabilità complessiva di MEYOU Srl nei confronti del Cliente non potrà eccedere l'importo corrisposto dal Cliente per il servizio nell'ultimo anno contrattuale.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 7 - Trattamento dei Dati Personali</h2>
          <p>
            <strong>7.1.</strong> I dati personali del Cliente e quelli dei terzi inseriti in piattaforma saranno trattati in conformità al Regolamento UE 2016/679 (GDPR). Il Titolare del trattamento è MEYOU Srl.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Articolo 8 - Legge Applicabile e Foro Competente</h2>
          <p>
            <strong>8.1.</strong> Il presente contratto è regolato dalla legge italiana.<br/><br/>
            <strong>8.2.</strong> Per qualsiasi controversia relativa all'interpretazione o esecuzione del presente contratto sarà esclusivamente competente il Foro di Verona, salvo i casi in cui il Cliente agisca in qualità di Consumatore ai sensi del Codice del Consumo.
          </p>
          
          <p className="text-sm mt-8 pt-8 border-t border-border">
            Data di ultima modifica: 21/05/2026<br/><br/>
            <strong>MEYOU Srl</strong><br/>
            Via fra' Claudio Granzotto 33, Monteforte d'Alpone (VR)<br/>
            P.IVA e CF: 05159610236<br/>
            team@meyou.company<br/>
            meyou@namirialpec.it
          </p>
        </div>
      </main>
    </div>
  );
}
