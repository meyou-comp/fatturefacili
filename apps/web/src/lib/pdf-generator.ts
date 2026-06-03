import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definiamo un tipo base per evitare problemi di compilazione
interface FatturaPDFData {
  numero: string;
  dataEmissione: string;
  dataScadenza: string | null;
  totale: number;
  imponibile: number;
  totaleIVA: number;
  nettoAPagare: number;
  importoBollo: number | null;
  importoRitenuta: number | null;
  cliente: {
    ragioneSociale: string | null;
    nome: string | null;
    cognome: string | null;
    partitaIva: string | null;
    codiceFiscale: string | null;
    indirizzo: string | null;
    cap: string | null;
    comune: string | null;
    provincia: string | null;
  };
  organization: {
    ragioneSociale: string;
    partitaIva: string | null;
    codiceFiscale: string;
    indirizzo: string;
    cap: string;
    comune: string;
    provincia: string;
    piano: string;
    logoUrl: string | null;
    coloreAccento: string | null;
    iban: string | null;
    bic: string | null;
    intestatarioConto: string | null;
  };
  righe: Array<{
    descrizione: string;
    quantita: number;
    prezzoUnitario: number;
    aliquotaIVA: number;
    totale: number;
  }>;
}

export async function generateFatturaPDF(fattura: FatturaPDFData) {
  if (!fattura || !fattura.organization) {
    alert("I dati dell'organizzazione non sono stati caricati correttamente. Prova a ricaricare la pagina.");
    return;
  }

  const doc = new jsPDF();
  const org = fattura.organization;
  const cliente = fattura.cliente;
  
  // Font settings
  doc.setFont('helvetica');

  // Helper to load image as base64
  const getBase64ImageFromUrl = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No ctx');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  // Determina la logica di branding
  const isBasePlan = org.piano === 'BASE';
  const logoUrl = isBasePlan ? '/FattureFaciliLogo.png' : (org.logoUrl || null);
  const coloreAccento = isBasePlan ? '#335525' : (org.coloreAccento || '#335525');

  // Intestazione / Logo
  let logoY = 22; // Offset iniziale per il testo successivo se non c'è logo
  try {
    if (logoUrl) {
      const base64Img = await getBase64ImageFromUrl(logoUrl);
      if (isBasePlan) {
        // Alto al centro per il piano BASE, rimpicciolito (36x8 circa) per non sgranare troppo
        doc.addImage(base64Img, 'PNG', 105 - 18, 10, 36, 8);
        logoY = 22; // Il logo base è piccolo, non serve spingere giù i testi
      } else {
        // A sinistra per gli altri
        doc.addImage(base64Img, 'PNG', 14, 10, 40, 15);
        logoY = 32;
      }
    } else {
      doc.setFontSize(20);
      doc.setTextColor(coloreAccento);
      doc.text(org.ragioneSociale, 14, 22);
    }
  } catch (e) {
    console.warn("Impossibile caricare il logo", e);
    doc.setFontSize(20);
    doc.setTextColor(coloreAccento);
    doc.text(org.ragioneSociale, 14, 22);
  }

  doc.setTextColor('#000000'); // Reset colore testo

  // Dati Organizzazione
  doc.setFontSize(10);
  doc.text(org.indirizzo, 14, logoY + 8);
  doc.text(`${org.cap} ${org.comune} (${org.provincia})`, 14, logoY + 13);
  if (org.partitaIva) doc.text(`P.IVA: ${org.partitaIva}`, 14, logoY + 18);
  doc.text(`CF: ${org.codiceFiscale}`, 14, logoY + 23);

  // Titolo Documento, allineato rigorosamente a destra
  doc.setFontSize(16);
  doc.setTextColor(coloreAccento);
  doc.text(`FATTURA N. ${fattura.numero}`, 196, logoY, { align: 'right' });
  doc.setTextColor('#000000');
  
  doc.setFontSize(10);
  doc.text(`Data Emissione: ${new Date(fattura.dataEmissione).toLocaleDateString('it-IT')}`, 196, logoY + 8, { align: 'right' });
  if (fattura.dataScadenza) {
    doc.text(`Data Scadenza: ${new Date(fattura.dataScadenza).toLocaleDateString('it-IT')}`, 196, logoY + 13, { align: 'right' });
  }

  // Dati Cliente
  doc.setFontSize(12);
  doc.text('Spett.le', 14, 60);
  doc.setFontSize(10);
  const clientName = cliente.ragioneSociale || [cliente.nome, cliente.cognome].filter(Boolean).join(' ');
  doc.text(clientName, 14, 65);
  if (cliente.indirizzo) doc.text(cliente.indirizzo, 14, 70);
  if (cliente.cap && cliente.comune) doc.text(`${cliente.cap} ${cliente.comune} (${cliente.provincia})`, 14, 75);
  if (cliente.partitaIva) doc.text(`P.IVA: ${cliente.partitaIva}`, 14, 80);
  if (cliente.codiceFiscale) doc.text(`CF: ${cliente.codiceFiscale}`, 14, 85);

  // Tabella Righe
  autoTable(doc, {
    startY: 95,
    head: [['Descrizione', 'Qtà', 'Prezzo', 'IVA', 'Totale']],
    body: fattura.righe.map(r => [
      r.descrizione,
      r.quantita.toString(),
      `€ ${r.prezzoUnitario.toFixed(2)}`,
      `${r.aliquotaIVA}%`,
      `€ ${r.totale.toFixed(2)}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: coloreAccento }, // Colore personalizzato
    columnStyles: {
      0: { cellWidth: 'auto' }, // Descrizione
      1: { halign: 'center', minCellWidth: 15 }, // Qtà
      2: { halign: 'right', minCellWidth: 25 }, // Prezzo
      3: { halign: 'center', minCellWidth: 15 }, // IVA
      4: { halign: 'right', minCellWidth: 30 } // Totale
    },
  });

  // Totali
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.text(`Imponibile:`, 160, finalY, { align: 'right' });
  doc.text(`€ ${fattura.imponibile.toFixed(2)}`, 195, finalY, { align: 'right' });
  
  doc.text(`Totale IVA:`, 160, finalY + 7, { align: 'right' });
  doc.text(`€ ${fattura.totaleIVA.toFixed(2)}`, 195, finalY + 7, { align: 'right' });

  let offset = 14;
  if (fattura.importoBollo) {
    doc.text(`Bollo:`, 160, finalY + offset, { align: 'right' });
    doc.text(`€ ${fattura.importoBollo.toFixed(2)}`, 195, finalY + offset, { align: 'right' });
    offset += 7;
  }
  
  if (fattura.importoRitenuta) {
    doc.text(`Ritenuta:`, 160, finalY + offset, { align: 'right' });
    doc.text(`-€ ${fattura.importoRitenuta.toFixed(2)}`, 195, finalY + offset, { align: 'right' });
    offset += 7;
  }

  doc.setFontSize(12);
  doc.text(`Totale Documento:`, 160, finalY + offset, { align: 'right' });
  doc.text(`€ ${fattura.nettoAPagare.toFixed(2)}`, 195, finalY + offset, { align: 'right' });

  // Dettagli di Pagamento (in basso a sinistra)
  if (org.iban) {
    let payY = finalY;
    doc.setFontSize(10);
    doc.setTextColor(coloreAccento);
    doc.text('Coordinate Bancarie per il Pagamento:', 14, payY);
    doc.setTextColor('#000000');
    doc.text(`IBAN: ${org.iban}`, 14, payY + 6);
    if (org.bic) {
      doc.text(`BIC/SWIFT: ${org.bic}`, 14, payY + 11);
      if (org.intestatarioConto) {
        doc.text(`Intestatario: ${org.intestatarioConto}`, 14, payY + 16);
      }
    } else if (org.intestatarioConto) {
      doc.text(`Intestatario: ${org.intestatarioConto}`, 14, payY + 11);
    }
  }

  // Branding Footer per Piano BASE
  if (isBasePlan) {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    // Dato che non possiamo renderizzare un file .svg facilmente senza convertirlo prima in canvas o png,
    // usiamo testo formattato
    doc.text('Fattura generata con fatturefacili.com', doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
  }

  // Download del PDF
  doc.save(`Fattura_${fattura.numero}.pdf`);
}
