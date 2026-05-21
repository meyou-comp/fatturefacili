import { NextRequest, NextResponse } from 'next/server';
import { prisma, getSession } from '@/lib/auth';

// GET /api/adempimenti/spese-scolastiche — Estrae i dati per il 730 Precompilato
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const anno = parseInt(searchParams.get('anno') || String(new Date().getFullYear()));
  const exportFormat = searchParams.get('format'); // 'csv' o null

  try {
    // 1. Troviamo tutte le fatture pagate di tipo retta scolastica nell'anno fiscale selezionato
    const startDate = new Date(`${anno}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${anno}-12-12T23:59:59.999Z`); // fine anno

    const fatture = await prisma.fattura.findMany({
      where: {
        organizationId: session.orgId,
        isRettaScolastica: true,
        stato: 'PAGATA',
        dataPagamento: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        cliente: {
          select: {
            nome: true,
            cognome: true,
            ragioneSociale: true,
            codiceFiscale: true,
            indirizzo: true,
            cap: true,
            comune: true,
            provincia: true,
          },
        },
      },
      orderBy: {
        dataPagamento: 'asc',
      },
    });

    // 2. Raggruppiamo i pagamenti per genitore + alunno per l'invio telematico
    const records: Record<string, {
      genitoreCF: string;
      genitoreNome: string;
      alunnoCF: string;
      alunnoNome: string;
      importoTotale: number;
      numeroDocumenti: number;
      documenti: string[];
    }> = {};

    for (const f of fatture) {
      const genitoreCF = f.cliente.codiceFiscale || '';
      const genitoreNome = f.cliente.ragioneSociale || [f.cliente.nome, f.cliente.cognome].filter(Boolean).join(' ') || 'Genitore Incognito';
      const alunnoCF = f.alunnoCodiceFiscale || '';
      const alunnoNome = f.alunnoNomeCognome || 'Alunno Incognito';

      const key = `${genitoreCF}_${alunnoCF}`;

      if (!records[key]) {
        records[key] = {
          genitoreCF,
          genitoreNome,
          alunnoCF,
          alunnoNome,
          importoTotale: 0,
          numeroDocumenti: 0,
          documenti: [],
        };
      }

      records[key].importoTotale += f.totalePagato;
      records[key].numeroDocumenti += 1;
      records[key].documenti.push(`${f.numero} del ${new Date(f.dataEmissione).toLocaleDateString('it-IT')}`);
    }

    const data = Object.values(records);

    // Se l'utente richiede l'esportazione in CSV
    if (exportFormat === 'csv') {
      let csvContent = '\uFEFF'; // BOM per Excel
      csvContent += 'Codice Fiscale Genitore (Pagante);Nominativo Genitore;Codice Fiscale Alunno (Beneficiario);Nominativo Alunno;Importo Totale Detraibile;Numero Rette Pagate;Dettaglio Documenti\n';

      data.forEach((r) => {
        csvContent += `"${r.genitoreCF}";"${r.genitoreNome.replace(/"/g, '""')}";"${r.alunnoCF}";"${r.alunnoNome.replace(/"/g, '""')}";${r.importoTotale.toFixed(2)};${r.numeroDocumenti};"${r.documenti.join(', ')}"\n`;
      });

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=Comunicazione_Spese_Scolastiche_${anno}.csv`,
        },
      });
    }

    // Altrimenti ritorna JSON
    return NextResponse.json({
      anno,
      data,
      kpi: {
        totaleDichiarato: data.reduce((acc, r) => acc + r.importoTotale, 0),
        genitoriCoinvolti: data.length,
        documentiTrasmessi: fatture.length,
      },
    });
  } catch (e) {
    console.error('Error generating school fee communication:', e);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
