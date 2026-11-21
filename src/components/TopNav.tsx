import React from 'react';

export type ActiveTab = 'scanner' | 'library' | 'history' | 'calculator' | 'news';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewScan: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'scanner', label: 'Scanner' },
  { id: 'library', label: 'Pustaka Pola' },
  { id: 'history', label: 'Riwayat' },
  { id: 'calculator', label: 'Kalkulator R:R' },
  { id: 'news', label: 'News & Rumus' },
];

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onSelectTab, onNewScan }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B0F17]/95">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <a
          href="#scanner"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('scanner');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-slate-50"
        >
          QuantScan
        </a>

        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'text-slate-950 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-blue-600 dark:bg-blue-500"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewScan}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Scan Baru
          </button>
        </div>
      </div>

      <nav
        aria-label="Navigasi seluler"
        className="flex md:hidden items-center justify-between gap-2 overflow-x-auto border-t border-slate-200 px-3 py-2 dark:border-slate-800"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 py-1 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 underline underline-offset-4'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
