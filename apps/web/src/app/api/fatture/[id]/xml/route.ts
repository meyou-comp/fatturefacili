import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const orgId = session ? session.orgId : 'org_id_non_esistente'; // Bypass temporaneo
    const { id } = await params;

  const fattura = await prisma.fattura.findFirst({
    where: { id },
    include: {
      cliente: true,
      organization: true,
      righe: { orderBy: { ordine: 'asc' } },
      pagamenti: { orderBy: { data: 'desc' } },
    },
  });

  if (!fattura) return NextResponse.json({ error: 'Fattura non trovata' }, { status: 404 });

  const org = fattura.organization;
  const cliente = fattura.cliente;

  // Questa è una versione Semplificata dello Standard FatturaPA.
  // In una vera implementazione di fatturazione elettronica in Italia,
  // l'XML richiede molti più dettagli fiscali, certificati e tag precisi.
  const versioneFattura = cliente.tipoCliente === 'PA' ? 'FPA12' : 'FPR12';

  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="${versioneFattura}" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>${org.partitaIva || org.codiceFiscale}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${fattura.progressivo}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${cliente.codiceDestinatario || '0000000'}</CodiceDestinatario>
      ${cliente.pec ? `<PECDestinatario>${cliente.pec}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${org.partitaIva || org.codiceFiscale}</IdCodice>
        </IdFiscaleIVA>
        <CodiceFiscale>${org.codiceFiscale}</CodiceFiscale>
        <Anagrafica>
          <Denominazione>${org.ragioneSociale}</Denominazione>
        </Anagrafica>
        <RegimeFiscale>${org.regimeFiscale === 'FORFETTARIO' ? 'RF19' : 'RF01'}</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${org.indirizzo}</Indirizzo>
        <CAP>${org.cap}</CAP>
        <Comune>${org.comune}</Comune>
        <Provincia>${org.provincia}</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${cliente.partitaIva ? `
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${cliente.partitaIva}</IdCodice>
        </IdFiscaleIVA>
        ` : ''}
        ${cliente.codiceFiscale ? `<CodiceFiscale>${cliente.codiceFiscale}</CodiceFiscale>` : ''}
        <Anagrafica>
          <Denominazione>${cliente.ragioneSociale || `${cliente.nome} ${cliente.cognome}`}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${cliente.indirizzo || 'Indirizzo Sconosciuto'}</Indirizzo>
        <CAP>${cliente.cap || '00000'}</CAP>
        <Comune>${cliente.comune || 'Comune Sconosciuto'}</Comune>
        <Provincia>${cliente.provincia || 'XX'}</Provincia>
        <Nazione>${cliente.paese || 'IT'}</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${new Date(fattura.dataEmissione).toISOString().split('T')[0]}</Data>
        <Numero>${fattura.numero}</Numero>
        <ImportoTotaleDocumento>${fattura.nettoAPagare.toFixed(2)}</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      ${fattura.righe.map((r, i) => `
      <DettaglioLinee>
        <NumeroLinea>${i + 1}</NumeroLinea>
        <Descrizione>${r.descrizione}</Descrizione>
        <Quantita>${r.quantita.toFixed(2)}</Quantita>
        <PrezzoUnitario>${r.prezzoUnitario.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${r.totale.toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>${r.aliquotaIVA.toFixed(2)}</AliquotaIVA>
      </DettaglioLinee>
      `).join('')}
      <DatiRiepilogo>
        <AliquotaIVA>22.00</AliquotaIVA>
        <ImponibileImporto>${fattura.imponibile.toFixed(2)}</ImponibileImporto>
        <Imposta>${fattura.totaleIVA.toFixed(2)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
  `.trim();

  return new NextResponse(xmlData, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': 'attachment; filename="IT' + (org.partitaIva || org.codiceFiscale) + '_' + fattura.progressivo + '.xml"',
    },
  });
  } catch (error: any) {
    console.error('XML Generation Error:', error);
    return NextResponse.json({ debug_error: error.message, stack: error.stack }, { status: 200 });
  }
}
