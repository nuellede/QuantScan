import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Check,
  Copy,
  Loader2,
  Minus,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { AiAdvisorResponse, ChartScanResult } from '../types/scanner';
import {
  formatScanReportMarkdown,
  getAssetMarketContext,
} from '../utils/quantEngine';

interface ScanResultPanelProps {
  scan: ChartScanResult;
  isLoading: boolean;
  onOpenCalculator: (scan: ChartScanResult) => void;
}

const ADVISOR_QUICK_PROMPTS = [
  {
    label: 'Cek Risiko News & DXY',
    question:
      'Bagaimana sensitivitas setup grafik ini terhadap pergerakan DXY, rilis CPI, atau kebijakan suku bunga?',
  },
  {
    label: 'Validasi SL & Liquidity',
    question:
      'Apakah penempatan Stop Loss saat ini sudah cukup aman dari liquidity sweep atau false breakout?',
  },
  {
    label: 'Skenario Jika Invalidasi',
    question:
      'Jika harga menembus level invalidasi, apa rencana cadangan atau pembalikan arah yang masuk akal?',
  },
];

export const ScanResultPanel: React.FC<ScanResultPanelProps> = ({
  scan,
  isLoading,
  onOpenCalculator,
}) => {
  const [copied, setCopied] = useState(false);
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [advisorResponse, setAdvisorResponse] = useState<AiAdvisorResponse | null>(null);

  useEffect(() => {
    setAdvisorResponse(null);
    setAdvisorError(null);
    setAdvisorQuestion('');
  }, [scan.id]);

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Memuat hasil pemindaian chart pattern"
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F1522]"
      >
        <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
        </div>
        <div className="h-36 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
      </div>
    );
  }

  const assetContext = getAssetMarketContext(scan.assetClass);
  const { signal } = scan.primaryPattern;

  const SignalIcon =
    signal === 'BULLISH'
      ? ArrowUpRight
      : signal === 'BEARISH'
        ? ArrowDownRight
        : Minus;

  const signalColorClass =
    signal === 'BULLISH'
      ? 'text-emerald-600 dark:text-emerald-400'
      : signal === 'BEARISH'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-amber-600 dark:text-amber-400';

  const handleCopyMarkdown = async () => {
    const md = formatScanReportMarkdown(scan);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const askAdvisor = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (trimmed.length < 6) {
      setAdvisorError('Tuliskan pertanyaan spesifik minimal 6 karakter mengenai setup grafik ini.');
      return;
    }

    setAdvisorLoading(true);
    setAdvisorError(null);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          scan: {
            ticker: scan.ticker,
            assetClass: scan.assetClass,
            timeframe: scan.timeframe,
            marketTrend: scan.marketTrend,
            primaryPattern: scan.primaryPattern,
            secondaryConfluence: scan.secondaryConfluence,
            tradingPlan: scan.tradingPlan,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAdvisorError(data.error || 'Gagal mendapatkan evaluasi dari Asisten AI.');
        return;
      }

      setAdvisorResponse(data as AiAdvisorResponse);
    } catch {
      setAdvisorError('Gagal terhubung ke layanan Asisten AI (/api/ai-advisor).');
    } finally {
      setAdvisorLoading(false);
    }
  };

  return (
    <article
      data-testid="scan-result-panel"
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F1522]"
    >
      {/* Header matching FORMAT OUTPUT WAJIB */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
            HASIL PEMINDAIAN CHART PATTERN
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            <span>
              Aset / Instrumen:{' '}
              <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                {scan.ticker}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <span>
              Timeframe:{' '}
              <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                {scan.timeframe}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <span>
              Tren Utama:{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {scan.marketTrend}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenCalculator(scan)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Calculator className="h-3.5 w-3.5" />
            Hitung Lot
          </button>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Tersalin' : 'Salin Laporan'}
          </button>
        </div>
      </div>

      {/* Section 1: Pola Terdeteksi */}
      <section className="space-y-3">
        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
          Pola Terdeteksi
        </h3>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1. Pola Utama ({scan.primaryPattern.category})
              </p>
              <p className="mt-0.5 font-display text-base font-bold text-slate-900 dark:text-white">
                {scan.primaryPattern.name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Status: </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {scan.primaryPattern.status}
                </span>
              </div>
              <div className={`inline-flex items-center gap-1 font-bold ${signalColorClass}`}>
                <SignalIcon className="h-4 w-4" />
                <span>{signal}</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Tingkat Akurasi Struktur
              </span>
              <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                {scan.primaryPattern.accuracyPercent}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500"
                style={{ width: `${scan.primaryPattern.accuracyPercent}%` }}
              />
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">
              Analisis Detail:{' '}
            </strong>
            {scan.primaryPattern.detailAnalysis}
          </p>

          <p className="mt-2.5 border-t border-slate-200 pt-2.5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">
              2. Pola Sekunder / Konfluensi:{' '}
            </strong>
            {scan.secondaryConfluence}
          </p>
        </div>
      </section>

      {/* Section 2: Rencana Eksekusi (Trading Plan) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
            Rencana Eksekusi (Trading Plan)
          </h3>
          <span className="font-mono text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
            Estimasi R:R {scan.tradingPlan.riskRewardText}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Area Entry (Konfirmasi)
            </p>
            <p className="mt-1 font-mono text-xs font-semibold leading-relaxed text-slate-900 dark:text-white">
              {scan.tradingPlan.entryArea}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
              Stop Loss (SL)
            </p>
            <p className="mt-1 font-mono text-xs font-semibold leading-relaxed text-slate-900 dark:text-white">
              {scan.tradingPlan.stopLossText}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Take Profit 1 (TP1 - Konservatif)
            </p>
            <p className="mt-1 font-mono text-xs font-semibold leading-relaxed text-slate-900 dark:text-white">
              {scan.tradingPlan.tp1Text}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Take Profit 2 (TP2 - Measured Move)
            </p>
            <p className="mt-1 font-mono text-xs font-semibold leading-relaxed text-slate-900 dark:text-white">
              {scan.tradingPlan.tp2Text}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <strong className="font-semibold">Skenario Invalidasi (Batal): </strong>
            <span>{scan.tradingPlan.invalidationText}</span>
          </div>
        </div>
      </section>

      {/* Asset-Specific Context */}
      <section className="rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {assetContext.title}
        </p>
        {scan.marketContextNote && (
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {scan.marketContextNote}
          </p>
        )}
        <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
          {assetContext.rules.map((rule, i) => (
            <li key={i} className="leading-relaxed">
              · {rule}
            </li>
          ))}
        </ul>
      </section>

      {/* Section 4: Asisten AI Eksekusi (Contextual AI Advisor) */}
      <section
        aria-label="Asisten AI Eksekusi Setup"
        className="space-y-3 rounded-lg border border-blue-200/80 bg-blue-50/40 p-4 dark:border-blue-500/25 dark:bg-blue-500/5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Asisten AI Eksekusi ({scan.ticker})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Validasi &amp; Konfluensi Lanjutan
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ADVISOR_QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={advisorLoading}
              onClick={() => {
                setAdvisorQuestion(item.question);
                void askAdvisor(item.question);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-300"
            >
              {item.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void askAdvisor(advisorQuestion);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="ai-advisor-input" className="sr-only">
            Tanyakan evaluasi AI untuk setup ini
          </label>
          <input
            id="ai-advisor-input"
            type="text"
            value={advisorQuestion}
            onChange={(e) => setAdvisorQuestion(e.target.value)}
            placeholder={`Tanya AI tentang setup ${scan.ticker} (contoh: aman entry sekarang?)`}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={advisorLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            {advisorLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Tanya AI
          </button>
        </form>

        {advisorError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          >
            {advisorError}
          </div>
        )}

        {advisorResponse && (
          <div
            data-testid="ai-advisor-result"
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-[#0B0F17]"
          >
            <div>
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Evaluasi Langsung AI
              </p>
              <p className="mt-1 leading-relaxed text-slate-800 dark:text-slate-200">
                {advisorResponse.directAnswer}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2.5 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                Konfluensi Makro &amp; Likuiditas
              </p>
              <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                {advisorResponse.confluenceNote}
              </p>
            </div>

            {advisorResponse.executionChecklist.length > 0 && (
              <div className="border-t border-slate-100 pt-2.5 dark:border-slate-800">
                <p className="mb-1.5 text-[11px] font-bold text-slate-900 dark:text-white">
                  Checklist Sebelum Eksekusi
                </p>
                <ol className="space-y-1 text-slate-600 dark:text-slate-300">
                  {advisorResponse.executionChecklist.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="border-t border-slate-100 pt-2.5 text-[11px] text-amber-700 dark:border-slate-800 dark:text-amber-300">
              <strong>Skenario Cadangan: </strong>
              {advisorResponse.alternativeScenario}
            </div>
          </div>
        )}
      </section>

      {/* Mandatory Disclaimer */}
      <footer className="flex items-start gap-2 border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p>
          <strong>Disclaimer:</strong> Analisis ini dihasilkan oleh AI berdasarkan probabilitas
          pola teknikal historis dan bukan merupakan saran keuangan mutlak (Financial Advice).
          Selalu terapkan manajemen risiko yang ketat.
        </p>
      </footer>
    </article>
  );
};
