import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';
import { XMLParser } from 'fast-xml-parser';

const safeParseFloat = (val: any) => {
  const parsed = parseFloat(String(val || '0'));
  return isNaN(parsed) ? 0 : parsed;
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'Nessun file fornito' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    let xmlContent = decoder.decode(arrayBuffer);

    // Gestione file P7M (estrazione dell'XML dai dati binari)
    const startIndex = xmlContent.indexOf('<?xml');
    const fallbackStartIndex = xmlContent.indexOf('<p:FatturaElettronica') !== -1 ? xmlContent.indexOf('<p:FatturaElettronica') : xmlContent.indexOf('<FatturaElettronica');
    
    const actualStart = startIndex !== -1 ? startIndex : fallbackStartIndex;
    
    if (actualStart !== -1) {
      const endTags = ['</FatturaElettronica>', '</p:FatturaElettronica>', '</ns2:FatturaElettronica>', '</ns3:FatturaElettronica>'];
      let actualEnd = -1;
      let tagLength = 0;
      
      for (const tag of endTags) {
        const idx = xmlContent.lastIndexOf(tag);
        if (idx > actualEnd) {
          actualEnd = idx;
          tagLength = tag.length;
        }
      }
      
      if (actualEnd !== -1) {
        xmlContent = xmlContent.substring(actualStart, actualEnd + tagLength);
      }
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
    });
    const result = parser.parse(xmlContent);

    // Recupera la root (FatturaElettronica o altro namespace)
    const rootKey = Object.keys(result).find(key => key.includes('FatturaElettronica'));
    if (!rootKey) {
      return NextResponse.json({ error: 'Formato XML non valido per FatturaPA' }, { status: 400 });
    }

    const fatturaElettronica = result[rootKey];
    const header = fatturaElettronica.FatturaElettronicaHeader;
    const bodyObj = fatturaElettronica.FatturaElettronicaBody;
    const body = Array.isArray(bodyObj) ? bodyObj[0] : bodyObj; // Può essere array se lotti

    if (!header || !body) {
      return NextResponse.json({ error: 'Struttura FatturaPA incompleta' }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({ where: { id: session.orgId } });

    const cedente = header.CedentePrestatore?.DatiAnagrafici || {};
    const committente = header.CessionarioCommittente?.DatiAnagrafici || {};

    // Funzione di normalizzazione: rimuove spazi, punti, trattini e converte in uppercase
    const normalize = (val: string | null | undefined): string =>
      String(val || '').replace(/[\s.\-]/g, '').toUpperCase().trim();

    const cedentePIva = normalize(cedente.IdFiscaleIVA?.IdCodice);
    const cedenteCf = normalize(cedente.CodiceFiscale);
    const cedenteNome = normalize(
      cedente.Anagrafica?.Denominazione ||
      `${cedente.Anagrafica?.Nome || ''} ${cedente.Anagrafica?.Cognome || ''}`
    );

    const committentePIva = normalize(committente.IdFiscaleIVA?.IdCodice);
    const committenteCf = normalize(committente.CodiceFiscale);
    const committenteNome = normalize(
      committente.Anagrafica?.Denominazione ||
      `${committente.Anagrafica?.Nome || ''} ${committente.Anagrafica?.Cognome || ''}`
    );

    const orgPIva = normalize(org?.partitaIva);
    const orgCf = normalize(org?.codiceFiscale);
    const orgNome = normalize(org?.ragioneSociale);

    console.log('[Import XML] Org:', { piva: orgPIva, cf: orgCf, nome: orgNome });
    console.log('[Import XML] Cedente:', { piva: cedentePIva, cf: cedenteCf, nome: cedenteNome });
    console.log('[Import XML] Committente:', { piva: committentePIva, cf: committenteCf, nome: committenteNome });

    // Determina se l'organizzazione è il committente (chi riceve la fattura) o il cedente (chi la emette)
    const isCommittente =
      (orgPIva && orgPIva === committentePIva) ||
      (orgCf && orgCf === committenteCf) ||
      (orgNome && orgNome === committenteNome);

    const isCedente =
      (orgPIva && orgPIva === cedentePIva) ||
      (orgCf && orgCf === cedenteCf) ||
      (orgNome && orgNome === cedenteNome);

    console.log('[Import XML] Match:', { isCommittente, isCedente });

    let direzione: string;
    let controparteAnagrafica;
    let pIva = '';
    let cf = '';

    if (isCommittente && !isCedente) {
      // Noi siamo il committente (chi compra) → fattura passiva → è una spesa/uscita di denaro
      direzione = 'ENTRATA';
      controparteAnagrafica = cedente.Anagrafica || {};
      pIva = String(cedente.IdFiscaleIVA?.IdCodice || '').trim();
      cf = String(cedente.CodiceFiscale || '').trim();
    } else if (isCedente && !isCommittente) {
      // Noi siamo il cedente (chi vende) → fattura attiva → è un'entrata di denaro
      direzione = 'USCITA';
      controparteAnagrafica = committente.Anagrafica || {};
      pIva = String(committente.IdFiscaleIVA?.IdCodice || '').trim();
      cf = String(committente.CodiceFiscale || '').trim();
    } else {
      // Fallback: non riusciamo a determinare → default USCITA
      console.warn('[Import XML] Impossibile determinare direzione, default USCITA');
      direzione = 'USCITA';
      controparteAnagrafica = committente.Anagrafica || {};
      pIva = String(committente.IdFiscaleIVA?.IdCodice || '').trim();
      cf = String(committente.CodiceFiscale || '').trim();
    }

    console.log('[Import XML] Direzione:', direzione);



    const ragioneSociale = String(controparteAnagrafica.Denominazione || `${controparteAnagrafica.Nome || ''} ${controparteAnagrafica.Cognome || ''}`).trim() || 'Soggetto Sconosciuto';

    // Cerchiamo il cliente/fornitore esistente per PIVA o CF nell'org
    let cliente = await prisma.cliente.findFirst({
      where: {
        organizationId: session.orgId,
        OR: [
          ...(pIva ? [{ partitaIva: pIva }] : []),
          ...(cf ? [{ codiceFiscale: cf }] : []),
          { ragioneSociale }
        ]
      }
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          organizationId: session.orgId,
          tipoCliente: pIva ? 'AZIENDA' : 'PRIVATO',
          ragioneSociale: controparteAnagrafica.Denominazione || null,
          nome: controparteAnagrafica.Nome || null,
          cognome: controparteAnagrafica.Cognome || null,
          partitaIva: pIva || null,
          codiceFiscale: cf || null,
        }
      });
    }

    // Dati Generali
    const datiGenerali = body.DatiGenerali?.DatiGeneraliDocumento || {};
    const numero = typeof datiGenerali.Numero === 'string' ? datiGenerali.Numero : String(datiGenerali.Numero || 'N/D');
    const dataEmissione = datiGenerali.Data ? new Date(datiGenerali.Data) : new Date();
    const importoTotale = safeParseFloat(datiGenerali.ImportoTotaleDocumento);

    // Dati Riepilogo
    let imponibile = 0;
    let totaleIVA = 0;
    const riepilogo = body.DatiBeniServizi?.DatiRiepilogo;
    const arrayRiepilogo = Array.isArray(riepilogo) ? riepilogo : (riepilogo ? [riepilogo] : []);
    for (const r of arrayRiepilogo) {
      imponibile += safeParseFloat(r.ImponibileImporto);
      totaleIVA += safeParseFloat(r.Imposta);
    }

    // Righe
    const dettaglioLinee = body.DatiBeniServizi?.DettaglioLinee;
    const arrayLinee = Array.isArray(dettaglioLinee) ? dettaglioLinee : (dettaglioLinee ? [dettaglioLinee] : []);
    
    const righeCreate = arrayLinee.map((l: any) => {
      return {
        ordine: parseInt(l.NumeroLinea) || 1,
        descrizione: String(l.Descrizione || ''),
        quantita: safeParseFloat(l.Quantita || '1'),
        prezzoUnitario: safeParseFloat(l.PrezzoUnitario),
        imponibile: safeParseFloat(l.PrezzoTotale),
        aliquotaIVA: safeParseFloat(l.AliquotaIVA || '22'),
      };
    });

    const nuovaFattura = await prisma.fattura.create({
      data: {
        organizationId: session.orgId,
        clienteId: cliente.id,
        numero,
        progressivo: 0,
        tipoDocumento: 'FATTURA',
        direzione,
        dataEmissione,
        stato: 'BOZZA', // Salviamo in bozza per revisione
        imponibile,
        totaleIVA,
        totale: importoTotale || (imponibile + totaleIVA),
        nettoAPagare: importoTotale || (imponibile + totaleIVA),
        righe: {
          create: righeCreate
        }
      }
    });

    return NextResponse.json(nuovaFattura, { status: 201 });
  } catch (error) {
    console.error('Errore importazione XML:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Errore durante l\'importazione del file XML: ' + msg }, { status: 500 });
  }
}
