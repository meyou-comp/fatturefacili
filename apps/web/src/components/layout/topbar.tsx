'use client';

import { useState } from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { BellIcon, NotificationFill } from '@/components/icons';

interface TopbarProps {
  user?: {
    nome: string;
    cognome: string;
    email: string;
    role: string;
    organizations?: { id: string; ragioneSociale: string; role: string }[];
    organization?: { id: string; ragioneSociale: string } | null;
  } | null;
}

export function Topbar({ user }: TopbarProps) {
  const initials = user
    ? `${user.nome.charAt(0)}${user.cognome.charAt(0)}`.toUpperCase()
    : 'FF';
  const displayName = user ? `${user.nome.toLowerCase()}${user.cognome.toLowerCase()}` : 'utente';
  const role = user?.role === 'OWNER' ? 'Admin' : user?.role || 'Utente';

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === user?.organization?.id) return;
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/switch-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        setSwitching(false);
      }
    } catch (e) {
      console.error(e);
      setSwitching(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between gap-4 px-8">
      {/* Selettore Organizzazione a Sinistra */}
      <div className="flex items-center">
        {user?.organizations && user.organizations.length > 1 ? (
          <div className="relative">
            <button
              onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
              disabled={switching}
              className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              <span className="truncate max-w-[200px]">
                {switching ? 'Cambio in corso...' : user?.organization?.ragioneSociale || 'Seleziona Azienda'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {isOrgMenuOpen && !switching && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-border">
                <div className="px-3 py-2 border-b border-border bg-muted/20">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground">Le tue aziende</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {user.organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        setIsOrgMenuOpen(false);
                        handleSwitchOrg(org.id);
                      }}
                      className={`flex w-full flex-col items-start px-4 py-3 text-left transition-colors hover:bg-muted/50 ${org.id === user?.organization?.id ? 'bg-primary/5' : ''}`}
                    >
                      <span className={`text-sm font-medium ${org.id === user?.organization?.id ? 'text-primary-dark' : 'text-foreground'}`}>
                        {org.ragioneSociale}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Ruolo: {org.role === 'OWNER' ? 'Admin' : org.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center px-3 py-1.5 text-sm font-semibold text-foreground">
            {user?.organization?.ragioneSociale || 'La mia Azienda'}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors bg-[#ABF88D] hover:bg-[#9BE37D] text-black"
          aria-label="Notifiche"
          id="notifications-button"
        >
          {isNotificationsOpen ? (
            <NotificationFill className="h-[18px] w-[18px]" />
          ) : (
            <BellIcon className="h-[18px] w-[18px]" />
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-[#F7F7F7]/50">
              <h3 className="text-[13px] font-bold text-foreground">Notifiche</h3>
            </div>
            <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
              <BellIcon className="h-6 w-6 text-muted-foreground/30" />
              <p className="text-[12px] text-muted-foreground">Non ci sono nuove notifiche al momento.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold text-foreground">
            {displayName}
          </span>
          <span className="text-[11px] text-muted-foreground">{role}</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 focus:outline-none"
            title="Menu Utente"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <Link
                href="/impostazioni"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4" />
                Impostazioni
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
