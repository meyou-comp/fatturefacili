import { SignJWT, jwtVerify } from 'jose';
import { hashSync, compareSync } from 'bcryptjs';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

// ─── Prisma singleton ───────────────────────────────────────

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ─── JWT ────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fatturefacili-dev-secret-change-in-prod',
);
const COOKIE_NAME = 'ff_session';

export interface SessionPayload {
  userId: string;
  email: string;
  orgId: string;
  role: string;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Session helpers ────────────────────────────────────────

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Password helpers ───────────────────────────────────────

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

// ─── User + Org helpers ─────────────────────────────────────

export async function getSessionUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      organizations: {
        include: { organization: true },
      },
    },
  });

  if (!user) return null;

  const currentOrg = user.organizations.find(
    (uo: { organizationId: string }) => uo.organizationId === session.orgId,
  );

  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    cognome: user.cognome,
    avatar: user.avatar,
    orgId: session.orgId,
    role: session.role,
    organization: currentOrg?.organization || null,
    organizations: user.organizations.map((uo) => ({
      id: uo.organization.id,
      ragioneSociale: uo.organization.ragioneSociale,
      role: uo.role,
    })),
  };
}
