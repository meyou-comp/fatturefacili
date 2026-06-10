const { XMLParser } = require('fast-xml-parser');

const xmlContent = `
<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>01234567890</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>1</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>0000000</CodiceDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>01234567890</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Fornitore S.p.A.</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <CodiceFiscale>RSSMRA80A01H501Z</CodiceFiscale>
        <Anagrafica>
          <Nome>Mario</Nome>
          <Cognome>Rossi</Cognome>
        </Anagrafica>
      </DatiAnagrafici>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>2026-06-03</Data>
        <Numero>123/A</Numero>
        <ImportoTotaleDocumento>122.00</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>Servizio di consulenza</Descrizione>
        <PrezzoUnitario>100.00</PrezzoUnitario>
        <PrezzoTotale>100.00</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      <DatiRiepilogo>
        <AliquotaIVA>22.00</AliquotaIVA>
        <ImponibileImporto>100.00</ImponibileImporto>
        <Imposta>22.00</Imposta>
      </DatiRiepilogo>
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
`;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
});
const result = parser.parse(xmlContent);
console.log('Result Keys:', Object.keys(result));

const rootKey = Object.keys(result).find(key => key.includes('FatturaElettronica'));
if (!rootKey) {
  console.log('Formato XML non valido per FatturaPA');
  process.exit(1);
}

const fatturaElettronica = result[rootKey];
const header = fatturaElettronica?.FatturaElettronicaHeader;
const bodyObj = fatturaElettronica?.FatturaElettronicaBody;
const body = Array.isArray(bodyObj) ? bodyObj[0] : bodyObj; 

console.log('Header?', !!header);
console.log('Body?', !!body);

const committente = header?.CessionarioCommittente?.DatiAnagrafici || {};
const anagraficaCommittente = committente.Anagrafica || {};
const pIva = committente.IdFiscaleIVA?.IdCodice || '';
const cf = committente.CodiceFiscale || '';
const ragioneSociale = anagraficaCommittente.Denominazione || (anagraficaCommittente.Nome || '') + ' ' + (anagraficaCommittente.Cognome || '');

console.log('PIVA:', pIva);
console.log('CF:', cf);
console.log('Ragione Sociale:', ragioneSociale);

const datiGenerali = body?.DatiGenerali?.DatiGeneraliDocumento || {};
const numero = typeof datiGenerali.Numero === 'string' ? datiGenerali.Numero : String(datiGenerali.Numero || 'N/D');
const dataEmissione = datiGenerali.Data ? new Date(datiGenerali.Data) : new Date();
const importoTotale = parseFloat(datiGenerali.ImportoTotaleDocumento || '0');

console.log('Numero:', numero, 'Data:', dataEmissione, 'Totale:', importoTotale);

console.log('Success');
