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
    const xmlContent = decoder.decode(arrayBuffer);

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

    // Estrarre Cliente (CessionarioCommittente o CedentePrestatore se passiva, assumiamo attiva/passiva generica)
    // Per un'importazione generica, prendiamo il CedentePrestatore come Fornitore e CessionarioCommittente come Cliente.
    // In questo caso importiamo la fattura con il Cliente = CessionarioCommittente
    const committente = header.CessionarioCommittente?.DatiAnagrafici || {};
    const anagraficaCommittente = committente.Anagrafica || {};
    const pIva = committente.IdFiscaleIVA?.IdCodice || '';
    const cf = committente.CodiceFiscale || '';
    const ragioneSociale = anagraficaCommittente.Denominazione || `${anagraficaCommittente.Nome || ''} ${anagraficaCommittente.Cognome || ''}`.trim() || 'Cliente Sconosciuto';

    // Cerchiamo il cliente esistente per PIVA o CF nell'org
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
          ragioneSociale: anagraficaCommittente.Denominazione || null,
          nome: anagraficaCommittente.Nome || null,
          cognome: anagraficaCommittente.Cognome || null,
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
        direzione: 'USCITA', // O ENTRATA a seconda del senso. Default uscita.
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
