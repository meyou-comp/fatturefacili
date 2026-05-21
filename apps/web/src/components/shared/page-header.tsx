import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaId?: string;
}

export function PageHeader({ title, subtitle, ctaLabel, ctaHref, ctaId }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          id={ctaId}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <Plus className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
          </span>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
