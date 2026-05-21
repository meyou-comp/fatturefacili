import { redirect } from 'next/navigation';
import { prisma, getSession } from '@/lib/auth';
import InviteClientPage from './InviteClientPage';
import { BuildingApartment } from '@/components/icons';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Check if token exists and is valid
  const invite = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border text-center max-w-md w-full">
          <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">X</div>
          <h1 className="text-xl font-bold text-foreground mb-2">Invito non trovato</h1>
          <p className="text-sm text-muted-foreground">Questo invito non esiste o è già stato revocato.</p>
        </div>
      </div>
    );
  }

  if (invite.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border text-center max-w-md w-full">
          <div className="h-12 w-12 bg-primary/20 text-primary-dark rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">✓</div>
          <h1 className="text-xl font-bold text-foreground mb-2">Invito già accettato</h1>
          <p className="text-sm text-muted-foreground">Hai già accettato questo invito. Vai alla dashboard per visualizzare l'organizzazione.</p>
        </div>
      </div>
    );
  }

  if (new Date() > invite.expiresAt) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border text-center max-w-md w-full">
          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">!</div>
          <h1 className="text-xl font-bold text-foreground mb-2">Invito scaduto</h1>
          <p className="text-sm text-muted-foreground">Questo invito è scaduto. Richiedi all'amministratore di inviartene uno nuovo.</p>
        </div>
      </div>
    );
  }

  const session = await getSession();

  // 2. If not logged in, force login/signup
  if (!session) {
    const callbackUrl = encodeURIComponent(`/invite/${token}`);
    // Redirect to login with a special message and callback URL
    redirect(`/login?callbackUrl=${callbackUrl}&email=${encodeURIComponent(invite.email)}`);
  }

  // 3. Logged in, but different email
  const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!currentUser || currentUser.email !== invite.email) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border text-center max-w-md w-full">
          <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">!</div>
          <h1 className="text-xl font-bold text-foreground mb-2">Account errato</h1>
          <p className="text-sm text-muted-foreground">
            Questo invito è destinato a <strong>{invite.email}</strong>, ma tu hai effettuato l'accesso come <strong>{currentUser?.email}</strong>.<br/><br/>
            Esci dall'account e accedi con l'indirizzo email corretto.
          </p>
        </div>
      </div>
    );
  }

  // 4. Everything matches! Show accept button
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm mx-auto">
           <BuildingApartment className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground text-center">Fatture Facili</h2>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border text-center max-w-md w-full space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Hai ricevuto un invito da:</h1>
          <h2 className="text-2xl font-extrabold text-primary-dark mt-1">{invite.organization.ragioneSociale}</h2>
        </div>
        
        <p className="text-[14px] text-muted-foreground leading-relaxed">
          <strong>{invite.organization.ragioneSociale}</strong> ti ha invitato su Fatture Facili!<br/>
          Accetta l'invito per visualizzare tutte le informazioni di fatturazione con il ruolo di <strong>{invite.role}</strong>.
        </p>
        
        <InviteClientPage token={token} orgId={invite.organizationId} />
      </div>
    </div>
  );
}
