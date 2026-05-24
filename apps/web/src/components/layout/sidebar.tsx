'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';
import type { IconComponent } from '@/components/icons';
import {
  DashboardIcon, DashboardIconFill,
  ClientiIcon, ClientiIconFill,
  FattureIcon, FattureIconFill,
  ScadenzarioIcon, ScadenzarioIconFill,
  ProdottiIcon, ProdottiIconFill,
  MagazzIcon, MagazzIconFill,
  OrgIcon, OrgIconFill,
  ImpostazioniIcon, ImpostazioniIconFill,
  AssistenzaIcon, AssistenzaIconFill,
  ScuolaIcon, ScuolaIconFill,
  CreditCardIcon, CreditCardIconFill,
} from '@/components/icons';

interface NavItem {
  name: string;
  href: string;
  icon: IconComponent;
  iconFill: IconComponent;
}

const mainNav: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon, iconFill: DashboardIconFill },
  { name: 'Clienti', href: '/clienti', icon: ClientiIcon, iconFill: ClientiIconFill },
  { name: 'Fatture', href: '/fatture', icon: FattureIcon, iconFill: FattureIconFill },
  { name: 'Scadenzario', href: '/scadenzario', icon: ScadenzarioIcon, iconFill: ScadenzarioIconFill },
  { name: 'Prodotti', href: '/prodotti', icon: ProdottiIcon, iconFill: ProdottiIconFill },
  { name: 'Magazzino', href: '/magazzino', icon: MagazzIcon, iconFill: MagazzIconFill },
  { name: 'Invio 730 / Scuola', href: '/adempimenti-scuola', icon: ScuolaIcon, iconFill: ScuolaIconFill },
  { name: 'Organizzazione', href: '/organizzazione', icon: OrgIcon, iconFill: OrgIconFill },
];

const bottomNav: NavItem[] = [
  { name: 'Gestisci il tuo piano', href: '/impostazioni', icon: CreditCardIcon, iconFill: CreditCardIconFill },
  { name: 'Assistenza', href: 'mailto:team@meyou.company', icon: AssistenzaIcon, iconFill: AssistenzaIconFill },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + '/');

    // Usa iconFill quando attivo, icon quando normale
    const Icon = isActive ? item.iconFill : item.icon;

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground/70 hover:bg-muted hover:text-foreground',
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span>{item.name}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-[var(--sidebar-width)] flex-col bg-[#F7F7F7]">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 pt-2">
        <ul className="space-y-0.5">
          {mainNav.map(renderItem)}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-border px-3 py-3">
        <ul className="space-y-0.5">
          {bottomNav.map(renderItem)}
        </ul>
      </div>
    </aside>
  );
}
