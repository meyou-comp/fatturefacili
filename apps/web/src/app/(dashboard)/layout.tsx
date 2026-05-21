import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="ml-[var(--sidebar-width)] flex flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-8 pb-8">{children}</main>
      </div>
    </div>
  );
}
