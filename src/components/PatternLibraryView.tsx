import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { PatternCatalogItem, PatternCategory } from '../types/scanner';
import { PATTERNS_CATALOG } from '../data/patternsCatalog';

interface PatternLibraryViewProps {
  onLoadPatternToScanner: (item: PatternCatalogItem) => void;
}

const CATEGORIES: Array<'Semua' | PatternCategory> = [
  'Semua',
  'Reversal',
  'Continuation',
  'Harmonic & SMC',
];

export const PatternLibraryView: React.FC<PatternLibraryViewProps> = ({
  onLoadPatternToScanner,
}) => {
  const [category, setCategory] = useState<'Semua' | PatternCategory>('Semua');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PATTERNS_CATALOG.filter((item) => {
      const matchCat = category === 'Semua' || item.category === category;
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.smcConfluenceTip.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [category, query]);

  return (
    <section aria-label="Pustaka Pola Grafik Institusional" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Database Pola Grafik &amp; Konfluensi SMC
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Referensi validasi struktur, tanda volume, dan proyeksi measured move untuk pemindaian manual maupun AI.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <label htmlFor="pattern-search" className="sr-only">
              Cari pola grafik
            </label>
            <input
              id="pattern-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari pola (contoh: Gartley, Cup)..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter kategori pola"
            className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-900"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                onClick={() => setCategory(cat)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0F1522]">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Tidak ada pola yang cocok dengan pencarian &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('Semua');
            }}
            className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const pathD = item.svgPath.pricePoints
              .map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'} ${x} ${y}`)
              .join(' ');

            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0F1522]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {item.category} · Akurasi Historis {item.reliability}
                      </p>
                      <h2 className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h2>
                    </div>
                  </div>

                  {/* Schematic SVG diagram */}
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-[#0B0F17]">
                    <svg
                      viewBox="0 0 100 96"
                      className="h-28 w-full"
                      aria-hidden="true"
                    >
                      {item.svgPath.structureLines.map((line, i) => (
                        <line
                          key={i}
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke="#2563EB"
                          strokeWidth="1.4"
                          strokeDasharray={line.dashed ? '3 3' : undefined}
                        />
                      ))}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={
                          item.bias === 'BEARISH'
                            ? '#DC2626'
                            : item.bias === 'BULLISH'
                              ? '#16A34A'
                              : '#94A3B8'
                        }
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>

                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    <p>
                      <strong className="text-slate-900 dark:text-slate-200">Volume: </strong>
                      {item.volumeSignature}
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-slate-200">Measured Move: </strong>
                      {item.measuredMoveRule}
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-slate-200">Konfluensi SMC: </strong>
                      {item.smcConfluenceTip}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Contoh: {item.sampleInput.ticker} · {item.sampleInput.timeframe}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLoadPatternToScanner(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Muat ke Scanner
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
