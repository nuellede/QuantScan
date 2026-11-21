import React, { useMemo, useState } from 'react';
import { ExternalLink, Search, Trash2 } from 'lucide-react';
import type { ChartScanResult, SignalDirection } from '../types/scanner';

interface ScanHistoryViewProps {
  history: ChartScanResult[];
  onSelectScan: (scan: ChartScanResult) => void;
  onDeleteScan: (id: string) => void;
  onGoToScanner: () => void;
}

const SIGNAL_FILTERS: Array<'Semua' | SignalDirection> = [
  'Semua',
  'BULLISH',
  'BEARISH',
  'NETRAL',
];

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  history,
  onSelectScan,
  onDeleteScan,
  onGoToScanner,
}) => {
  const [search, setSearch] = useState('');
  const [signalFilter, setSignalFilter] = useState<'Semua' | SignalDirection>('Semua');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return history.filter((item) => {
      const matchSig =
        signalFilter === 'Semua' || item.primaryPattern.signal === signalFilter;
      const matchQ =
        !q ||
        item.ticker.toLowerCase().includes(q) ||
        item.primaryPattern.name.toLowerCase().includes(q) ||
        item.assetClass.toLowerCase().includes(q);
      return matchSig && matchQ;
    });
  }, [history, search, signalFilter]);

  return (
    <section aria-label="Riwayat Pemindaian Chart Pattern" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Riwayat Pemindaian ({history.length})
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Arsip pemindaian pola grafik beserta level Entry, Stop Loss, dan proyeksi Risk-to-Reward.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <label htmlFor="history-search" className="sr-only">
              Cari riwayat pemindaian
            </label>
            <input
              id="history-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter ticker atau pola..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter arah sinyal"
            className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-900"
          >
            {SIGNAL_FILTERS.map((sig) => (
              <button
                key={sig}
                type="button"
                role="tab"
                aria-selected={signalFilter === sig}
                onClick={() => setSignalFilter(sig)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  signalFilter === sig
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#0F1522]">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {history.length === 0
              ? 'Belum ada riwayat pemindaian tersimpan.'
              : 'Tidak ada hasil riwayat yang cocok dengan filter saat ini.'}
          </p>
          <button
            type="button"
            onClick={onGoToScanner}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Mulai Pemindaian Baru
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F1522]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Instrumen</th>
                <th className="px-4 py-3 font-medium">Pola Utama</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sinyal</th>
                <th className="px-4 py-3 text-right font-medium">Akurasi</th>
                <th className="px-4 py-3 text-right font-medium">R:R</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {item.ticker}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.assetClass} · {item.timeframe}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {item.primaryPattern.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.marketTrend}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                    {item.primaryPattern.status}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <span
                      className={
                        item.primaryPattern.signal === 'BULLISH'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.primaryPattern.signal === 'BEARISH'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      {item.primaryPattern.signal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                    {item.primaryPattern.accuracyPercent}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-blue-600 dark:text-blue-400">
                    {item.tradingPlan.riskRewardText}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectScan(item)}
                        aria-label={`Buka hasil scan ${item.ticker} ${item.primaryPattern.name}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Buka
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteScan(item.id)}
                        aria-label={`Hapus riwayat ${item.ticker} ${item.primaryPattern.name}`}
                        className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
