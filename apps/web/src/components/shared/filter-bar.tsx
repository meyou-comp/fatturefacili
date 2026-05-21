'use client';

import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FilterBarProps {
  onSearch?: (value: string) => void;
  showDirectionFilter?: boolean;
  showDropdown?: boolean;
}

export function FilterBar({
  onSearch,
  showDirectionFilter = true,
  showDropdown = true,
}: FilterBarProps) {
  const [activeTab, setActiveTab] = useState<'tutte' | 'entrata' | 'uscita'>(
    'tutte',
  );

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-2">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cerca per descrizione o categoria..."
          className="h-9 w-full rounded-lg bg-transparent pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
          onChange={(e) => onSearch?.(e.target.value)}
          id="search-input"
        />
      </div>

      {showDirectionFilter && (
        <div className="flex items-center rounded-lg border border-border">
          {(['tutte', 'entrata', 'uscita'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 text-[13px] font-medium capitalize transition-colors',
                tab === 'tutte' && 'rounded-l-lg',
                tab === 'uscita' && 'rounded-r-lg',
                activeTab === tab
                  ? 'bg-white text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab === 'tutte' ? 'Tutte' : tab === 'entrata' ? 'Entrata' : 'Uscita'}
            </button>
          ))}
        </div>
      )}

      {showDropdown && (
        <div className="relative">
          <button className="flex items-center gap-6 rounded-lg border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted">
            Tutti
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
