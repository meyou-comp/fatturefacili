const { XMLParser } = require('fast-xml-parser');

// Simulate P7M binary data
const binaryPrefix = Buffer.from([0x30, 0x82, 0x05, 0x12, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x02]);
const binarySuffix = Buffer.from([0x31, 0x82, 0x01, 0x00, 0x30, 0x82]);

const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">
  <FatturaElettronicaHeader>
    <CedentePrestatore><DatiAnagrafici><Anagrafica><Denominazione>P7M Test</Denominazione></Anagrafica></DatiAnagrafici></CedentePrestatore>
    <CessionarioCommittente><DatiAnagrafici><Anagrafica><Denominazione>Cliente P7M</Denominazione></Anagrafica></DatiAnagrafici></CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali><DatiGeneraliDocumento><Numero>999</Numero></DatiGeneraliDocumento></DatiGenerali>
    <DatiBeniServizi><DettaglioLinee><NumeroLinea>1</NumeroLinea></DettaglioLinee></DatiBeniServizi>
  </FatturaElettronicaBody>
</p:FatturaElettronica>`;

const combinedBuffer = Buffer.concat([binaryPrefix, Buffer.from(xmlString, 'utf-8'), binarySuffix]);

const decoder = new TextDecoder('utf-8');
let xmlContent = decoder.decode(combinedBuffer);

// Extract XML
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

console.log("Extracted:", xmlContent.substring(0, 50) + " ... " + xmlContent.substring(xmlContent.length - 30));

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
});
const result = parser.parse(xmlContent);
console.log('Result Keys:', Object.keys(result));
