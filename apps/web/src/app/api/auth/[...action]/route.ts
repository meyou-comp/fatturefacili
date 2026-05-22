import { NextRequest, NextResponse } from 'next/server';
import {
  prisma,
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSession,
  getSession,
} from '@/lib/auth';

// POST /api/auth/login
async function login(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatori' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: { organization: true },
          take: 1,
        },
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 },
      );
    }

    const org = user.organizations[0];
    if (!org) {
      return NextResponse.json(
        { error: 'Nessuna organizzazione associata' },
        { status: 403 },
      );
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      orgId: org.organizationId,
      role: org.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
      },
      organization: {
        id: org.organization.id,
        ragioneSociale: org.organization.ragioneSociale,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// POST /api/auth/register
async function register(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, nome, cognome, ragioneSociale, partitaIva, codiceFiscale } = body;

    if (!email || !password || !nome || !cognome || !ragioneSociale || !codiceFiscale) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        nome,
        cognome,
        emailVerified: false,
      },
    });

    const org = await prisma.organization.create({
      data: {
        ragioneSociale,
        partitaIva: partitaIva || null,
        codiceFiscale,
        tipoSoggetto: partitaIva ? 'PERSONA_GIURIDICA' : 'PERSONA_FISICA',
        regimeFiscale: 'ORDINARIO',
        tipoAttivita: 'ALTRO',
        indirizzo: '',
        cap: '',
        comune: '',
        provincia: '',
        email,
      },
    });

    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'OWNER',
      },
    });

    // Serie numerazione default
    await prisma.serieNumerazione.create({
      data: {
        organizationId: org.id,
        nome: 'FT',
        prefisso: 'FT',
        anno: new Date().getFullYear(),
        contatore: 0,
        lunghezzaNumero: 4,
      },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      orgId: org.id,
      role: 'OWNER',
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// POST /api/auth/firebase-sync
async function firebaseSync(req: NextRequest) {
  try {
    const { email, nome, cognome } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email mancante' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { organizations: true }
    });

    let orgId = '';
    let role = 'OWNER';

    if (!user) {
      // Create user and default organization
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: 'FIREBASE_AUTH', // dummy password
          nome: nome || 'Utente',
          cognome: cognome || '',
          emailVerified: true,
        },
        include: { organizations: true }
      });

      const org = await prisma.organization.create({
        data: {
          ragioneSociale: 'La mia Azienda',
          codiceFiscale: `DUMMY-${user.id.substring(0, 10)}`,
          tipoSoggetto: 'PERSONA_FISICA',
          regimeFiscale: 'ORDINARIO',
          tipoAttivita: 'ALTRO',
          indirizzo: '',
          cap: '',
          comune: '',
          provincia: '',
          email,
        },
      });
      orgId = org.id;

      await prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: 'OWNER',
        },
      });

      await prisma.serieNumerazione.create({
        data: {
          organizationId: org.id,
          nome: 'FT',
          prefisso: 'FT',
          anno: new Date().getFullYear(),
          contatore: 0,
          lunghezzaNumero: 4,
        },
      });
    } else {
      const uo = await prisma.userOrganization.findFirst({
        where: { userId: user.id }
      });
      if (uo) {
        orgId = uo.organizationId;
        role = uo.role;
      }
    }

    if (orgId) {
      await setSessionCookie({
        userId: user.id,
        email: user.email,
        orgId: orgId,
        role: role,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error('Firebase sync error:', e);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// POST /api/auth/logout
async function logout() {
  await clearSession();
  return NextResponse.json({ success: true });
}

// GET /api/auth/me
async function me() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, nome: true, cognome: true, avatar: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.orgId },
    select: { id: true, ragioneSociale: true, partitaIva: true },
  });

  return NextResponse.json({ user, organization: org, role: session.role });
}

// ─── Route handler ──────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> },
) {
  const { action } = await params;
  const route = action[0];

  switch (route) {
    case 'login':
      return login(req);
    case 'register':
      return register(req);
    case 'logout':
      return logout();
    case 'firebase-sync':
      return firebaseSync(req);
    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> },
) {
  const { action } = await params;
  const route = action[0];

  switch (route) {
    case 'me':
      return me();
    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
