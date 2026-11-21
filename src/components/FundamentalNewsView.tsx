import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  History,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import {
  FUNDAMENTAL_FORMULAS,
  HISTORICAL_NEWS_ROLEPLAYS,
  MACRO_INDICATORS,
} from '../data/fundamentalData';
import {
  computeRoleplayStats,
  evaluateMacroRelease,
  evaluateRoleplayChoice,
  validateCustomNewsInput,
} from '../utils/fundamentalEngine';
import type {
  CustomNewsAnalysisResult,
  MacroIndicatorId,
  RoleplayAnswerRecord,
} from '../types/fundamental';
import type { AssetClass, SignalDirection } from '../types/scanner';

type NewsSubTab = 'simulator' | 'roleplay' | 'analyzer';

const ROLEPLAY_STORAGE_KEY = 'quantscan_roleplay_progress_v1';
const ASSET_FILTERS: Array<'Semua' | AssetClass> = ['Semua', 'XAUUSD', 'Forex', 'Crypto', 'Saham'];

const CUSTOM_NEWS_PRESETS: Array<{ label: string; text: string }> = [
  {
    label: 'CPI AS Melonjak',
    text: 'US CPI YoY dirilis naik ke 3.6% lebih tinggi dari perkiraan pasar 3.2%, sementara Core CPI tetap bertahan di 3.8%. Imbal hasil obligasi AS 10 tahun melonjak melewati 4.55% dan DXY menembus 105.50.',
  },
  {
    label: 'DXY Breakout',
    text: 'Indeks Dolar AS (DXY) menembus resistance harian 106.00 setelah pernyataan pejabat The Fed yang menegaskan suku bunga perlu bertahan tinggi lebih lama hingga inflasi benar-benar mendekati target 2%.',
  },
  {
    label: 'Fed Pangkas Bunga',
    text: 'The Fed memangkas suku bunga acuan sebesar 50 bps lebih besar dari perkiraan 25 bps disertai proyeksi Dot Plot yang lebih dovish untuk dua kuartal mendatang.',
  },
];

function loadInitialRoleplayProgress(): RoleplayAnswerRecord[] {
  try {
    const raw = localStorage.getItem(ROLEPLAY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

const DirectionTag: React.FC<{ direction: SignalDirection; compact?: boolean }> = ({
  direction,
  compact = false,
}) => {
  const styles =
    direction === 'BULLISH'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
      : direction === 'BEARISH'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
        : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

  const Icon =
    direction === 'BULLISH' ? TrendingUp : direction === 'BEARISH' ? TrendingDown : Minus;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-mono font-semibold whitespace-nowrap shrink-0 ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${styles}`}
    >
      <Icon className="h-3 w-3" />
      {direction}
    </span>
  );
};

export const FundamentalNewsView: React.FC = () => {
  const [subTab, setSubTab] = useState<NewsSubTab>('simulator');

  // Sub-tab 1: Simulator & Rumus
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<MacroIndicatorId>('US_CPI');
  const activeIndicator = useMemo(
    () => MACRO_INDICATORS.find((m) => m.id === selectedIndicatorId) ?? MACRO_INDICATORS[0],
    [selectedIndicatorId]
  );
  const [forecastInput, setForecastInput] = useState<number>(MACRO_INDICATORS[0].defaultForecast);
  const [actualInput, setActualInput] = useState<number>(MACRO_INDICATORS[0].defaultActual);
  const [formulaFilter, setFormulaFilter] = useState<'Semua' | AssetClass>('Semua');

  const handleSelectIndicator = (id: MacroIndicatorId) => {
    const found = MACRO_INDICATORS.find((m) => m.id === id);
    if (!found) return;
    setSelectedIndicatorId(id);
    setForecastInput(found.defaultForecast);
    setActualInput(found.defaultActual);
  };

  const simulation = useMemo(
    () =>
      evaluateMacroRelease({
        indicator: activeIndicator,
        forecast: Number.isFinite(forecastInput) ? forecastInput : activeIndicator.defaultForecast,
        actual: Number.isFinite(actualInput) ? actualInput : activeIndicator.defaultActual,
      }),
    [activeIndicator, forecastInput, actualInput]
  );

  const filteredFormulas = useMemo(() => {
    if (formulaFilter === 'Semua') return FUNDAMENTAL_FORMULAS;
    return FUNDAMENTAL_FORMULAS.filter((rule) =>
      rule.assetImpacts.some((imp) => imp.assetClass === formulaFilter)
    );
  }, [formulaFilter]);

  // Sub-tab 2: Roleplay Historis
  const [roleplayFilter, setRoleplayFilter] = useState<'Semua' | AssetClass>('Semua');
  const filteredRoleplays = useMemo(() => {
    if (roleplayFilter === 'Semua') return HISTORICAL_NEWS_ROLEPLAYS;
    return HISTORICAL_NEWS_ROLEPLAYS.filter((item) => item.assetClass === roleplayFilter);
  }, [roleplayFilter]);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    HISTORICAL_NEWS_ROLEPLAYS[0].id
  );
  const [roleplayRecords, setRoleplayRecords] = useState<RoleplayAnswerRecord[]>(
    loadInitialRoleplayProgress
  );

  useEffect(() => {
    try {
      localStorage.setItem(ROLEPLAY_STORAGE_KEY, JSON.stringify(roleplayRecords));
    } catch {
      // ignore storage errors
    }
  }, [roleplayRecords]);

  useEffect(() => {
    if (!filteredRoleplays.some((item) => item.id === selectedScenarioId) && filteredRoleplays[0]) {
      setSelectedScenarioId(filteredRoleplays[0].id);
    }
  }, [filteredRoleplays, selectedScenarioId]);

  const activeScenario = useMemo(
    () =>
      filteredRoleplays.find((s) => s.id === selectedScenarioId) ??
      filteredRoleplays[0] ??
      HISTORICAL_NEWS_ROLEPLAYS[0],
    [filteredRoleplays, selectedScenarioId]
  );

  const activeRecord = useMemo(
    () => roleplayRecords.find((r) => r.scenarioId === activeScenario.id),
    [roleplayRecords, activeScenario.id]
  );

  const roleplayStats = useMemo(
    () => computeRoleplayStats(roleplayRecords, HISTORICAL_NEWS_ROLEPLAYS.length),
    [roleplayRecords]
  );

  const handleChooseRoleplayAction = (choice: SignalDirection) => {
    const result = evaluateRoleplayChoice(activeScenario, choice);
    setRoleplayRecords((prev) => [
      result,
      ...prev.filter((item) => item.scenarioId !== activeScenario.id),
    ]);
  };

  const handleNextScenario = () => {
    const idx = filteredRoleplays.findIndex((s) => s.id === activeScenario.id);
    if (idx === -1 || filteredRoleplays.length === 0) return;
    const nextIdx = (idx + 1) % filteredRoleplays.length;
    setSelectedScenarioId(filteredRoleplays[nextIdx].id);
  };

  const handleResetRoleplayProgress = () => {
    setRoleplayRecords([]);
    try {
      localStorage.removeItem(ROLEPLAY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Sub-tab 3: Bedah Berita AI
  const [customNewsText, setCustomNewsText] = useState<string>(CUSTOM_NEWS_PRESETS[0].text);
  const [isAnalyzingNews, setIsAnalyzingNews] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [customAnalysis, setCustomAnalysis] = useState<CustomNewsAnalysisResult | null>(null);

  const handleAnalyzeCustomNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateCustomNewsInput(customNewsText);
    if (!check.valid) {
      setNewsError(check.error || 'Teks berita belum valid.');
      return;
    }

    setIsAnalyzingNews(true);
    setNewsError(null);

    try {
      const response = await fetch('/api/news-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsText: customNewsText }),
      });

      const data = await response.json();
      if (!response.ok) {
        setNewsError(data.error || 'Gagal menganalisis berita di server.');
        return;
      }

      setCustomAnalysis(data as CustomNewsAnalysisResult);
    } catch {
      setNewsError('Gagal terhubung ke layanan analisis berita server (/api/news-analyze).');
    } finally {
      setIsAnalyzingNews(false);
    }
  };

  const deltaPrefix = simulation.surpriseDelta > 0 ? '+' : '';

  return (
    <section aria-label="Menu News Fundamental dan Rumus Makro" className="space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Rumus News Fundamental &amp; Roleplay Makro
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Pahami rumus korelasi DXY, inflasi CPI, dan suku bunga bank sentral, lalu uji keputusan Anda lewat studi kasus historis.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Mode News Fundamental"
          className="grid w-full grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 sm:flex sm:w-auto dark:bg-slate-900"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'simulator'}
            onClick={() => setSubTab('simulator')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'simulator'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="h-3.5 w-3.5 hidden sm:inline" />
            Rumus &amp; Simulator
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'roleplay'}
            onClick={() => setSubTab('roleplay')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'roleplay'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5 hidden sm:inline" />
            Roleplay Historis
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'analyzer'}
            onClick={() => setSubTab('analyzer')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'analyzer'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 hidden sm:inline" />
            Bedah Berita AI
          </button>
        </div>
      </div>

      {/* TAB 1: RUMUS & SIMULATOR */}
      {subTab === 'simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
            {/* Left: Interactive Simulator Controls */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-5 dark:border-slate-800 dark:bg-[#0F1522]">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Simulator Kejutan Data (Actual vs Forecast)
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Pilih indikator makro, lalu ubah angka Forecast &amp; Actual untuk melihat rantai reaksinya secara langsung.
                </p>
              </div>

              <div>
                <label
                  htmlFor="macro-indicator-select"
                  className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Indikator Makro / Bank Sentral
                </label>
                <select
                  id="macro-indicator-select"
                  value={selectedIndicatorId}
                  onChange={(e) => handleSelectIndicator(e.target.value as MacroIndicatorId)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {MACRO_INDICATORS.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="macro-forecast"
                    className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Perkiraan / Forecast ({activeIndicator.unit})
                  </label>
                  <input
                    id="macro-forecast"
                    type="number"
                    step="any"
                    value={forecastInput}
                    onChange={(e) => setForecastInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="macro-actual"
                    className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Hasil Rilis / Actual ({activeIndicator.unit})
                  </label>
                  <input
                    id="macro-actual"
                    type="number"
                    step="any"
                    value={actualInput}
                    onChange={(e) => setActualInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Skenario Uji Cepat:
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeIndicator.quickScenarios.map((sc) => {
                    const isMatch =
                      Math.abs(forecastInput - sc.forecast) < 0.001 &&
                      Math.abs(actualInput - sc.actual) < 0.001;
                    return (
                      <button
                        key={sc.label}
                        type="button"
                        onClick={() => {
                          setForecastInput(sc.forecast);
                          setActualInput(sc.actual);
                        }}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isMatch
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/15 dark:text-blue-300'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Live Simulation Output */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-7 dark:border-slate-800 dark:bg-[#0F1522]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {simulation.indicator.name} · Surprise Delta{' '}
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {deltaPrefix}
                      {simulation.surpriseDelta}
                      {simulation.indicator.unit}
                    </span>
                  </p>
                  <h3 className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white">
                    {simulation.rateExpectation}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Bias DXY:</span>
                  <DirectionTag direction={simulation.dxyBias} />
                </div>
              </div>

              {/* Mechanism Chain */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#0B0F17]">
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Alur Sebab-Akibat Makro
                </p>
                <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                  {simulation.mechanismChain.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-600 font-mono text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Easy Summary */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 text-xs leading-relaxed text-slate-800 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-slate-200">
                <strong className="font-semibold text-blue-700 dark:text-blue-300">
                  Ringkasan Mudah Dipahami:{' '}
                </strong>
                {simulation.easySummary}
              </div>

              {/* 4-Asset Impact Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {simulation.assetImpacts.map((imp) => (
                  <div
                    key={imp.asset}
                    className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0B0F17]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {imp.asset}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {imp.assetClass} · {imp.horizon}
                        </p>
                      </div>
                      <DirectionTag direction={imp.direction} compact />
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {imp.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formula Matrix */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Matriks Rumus Korelasi Fundamental
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aturan baku hubungan antar-indikator yang menjadi kompas utama sebelum membaca struktur teknikal.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Filter aset rumus"
                className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-900"
              >
                {ASSET_FILTERS.map((ac) => (
                  <button
                    key={ac}
                    type="button"
                    role="tab"
                    aria-selected={formulaFilter === ac}
                    onClick={() => setFormulaFilter(ac)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      formulaFilter === ac
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {ac}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredFormulas.map((rule) => (
                <article
                  key={rule.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F1522]"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                        Pemicu: {rule.triggerCondition}
                      </p>
                      <h3 className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white">
                        {rule.title}
                      </h3>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-[#0B0F17] dark:text-slate-100">
                      {rule.formulaEquation}
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {rule.primaryMechanism}
                    </p>

                    <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {rule.assetImpacts.map((imp) => (
                        <div
                          key={`${rule.id}-${imp.asset}`}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {imp.asset}{' '}
                            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                              ({imp.horizon})
                            </span>
                          </span>
                          <DirectionTag direction={imp.direction} compact />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">Inti Sederhana: </strong>
                      {rule.easySummary}
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                      <strong>Catatan Pengecualian: </strong>
                      {rule.cautionNote}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLEPLAY BERITA HISTORIS */}
      {subTab === 'roleplay' && (
        <div className="space-y-6">
          {/* Stats & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0F1522]">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Kasus Diselesaikan: </span>
                <strong
                  data-testid="roleplay-completed-count"
                  className="font-mono font-bold tabular-nums text-slate-900 dark:text-white"
                >
                  {roleplayStats.completedCount} / {HISTORICAL_NEWS_ROLEPLAYS.length}
                </strong>
              </div>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Akurasi Keputusan: </span>
                <strong
                  data-testid="roleplay-accuracy"
                  className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400"
                >
                  {roleplayStats.accuracyPercent}%
                </strong>
              </div>
              {roleplayRecords.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetRoleplayProgress}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Skor
                </button>
              )}
            </div>

            <div
              role="tablist"
              aria-label="Filter aset roleplay"
              className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-900"
            >
              {ASSET_FILTERS.map((ac) => (
                <button
                  key={ac}
                  type="button"
                  role="tab"
                  aria-selected={roleplayFilter === ac}
                  onClick={() => setRoleplayFilter(ac)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    roleplayFilter === ac
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {ac}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
            {/* Left: Case Selector List */}
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 xl:col-span-4 dark:border-slate-800 dark:bg-[#0F1522]">
              <h2 className="mb-2 font-display text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Daftar Kasus Sejarah Pasar ({filteredRoleplays.length})
              </h2>
              {filteredRoleplays.map((scenario) => {
                const record = roleplayRecords.find((r) => r.scenarioId === scenario.id);
                const isSelected = scenario.id === activeScenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:border-blue-500/60 dark:bg-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0B0F17] dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {scenario.assetClass} · {scenario.indicatorTag}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">
                          {scenario.title}
                        </p>
                      </div>
                      {record && (
                        <CheckCircle2
                          aria-label={record.isCorrect ? 'Benar' : 'Selesai'}
                          className={`h-4 w-4 shrink-0 ${
                            record.isCorrect ? 'text-emerald-500' : 'text-amber-500'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Active Roleplay Briefing + Decision + Outcome */}
            <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-8 dark:border-slate-800 dark:bg-[#0F1522]">
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {activeScenario.periodLabel} · Fokus: {activeScenario.targetInstrument}
                </p>
                <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                  {activeScenario.title}
                </h2>
              </div>

              {/* Economic Data Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0B0F17]">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sebelumnya (Prev)</p>
                  <p className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                    {activeScenario.previousValue}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0B0F17]">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Perkiraan (Fcst)</p>
                  <p className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                    {activeScenario.forecastValue}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-500/30 dark:bg-blue-500/10">
                  <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    Hasil Aktual (Act)
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-200">
                    {activeScenario.actualValue}
                  </p>
                </div>
              </div>

              {/* Pre-release brief */}
              <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Situasi Pasar Saat Rilis:
                </p>
                <p>{activeScenario.preReleaseBrief}</p>
              </div>

              {/* Question & Action Choices */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#0B0F17]">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {activeScenario.questionPrompt}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {(
                    [
                      {
                        dir: 'BULLISH' as SignalDirection,
                        label: 'BULLISH / BUY',
                        sub: 'Harga cenderung naik',
                      },
                      {
                        dir: 'BEARISH' as SignalDirection,
                        label: 'BEARISH / SELL',
                        sub: 'Harga cenderung turun',
                      },
                      {
                        dir: 'NETRAL' as SignalDirection,
                        label: 'NETRAL / TUNGGU',
                        sub: 'Waspada whipsaw / priced-in',
                      },
                    ] as const
                  ).map((opt) => {
                    const isChosen = activeRecord?.chosenAction === opt.dir;
                    const isCorrectChoice =
                      activeRecord && opt.dir === activeScenario.correctAction;
                    let btnClass =
                      'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500';
                    if (activeRecord) {
                      if (isCorrectChoice) {
                        btnClass =
                          'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-200';
                      } else if (isChosen && !activeRecord.isCorrect) {
                        btnClass =
                          'border-rose-500 bg-rose-50 text-rose-800 dark:border-rose-500 dark:bg-rose-500/15 dark:text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={opt.dir}
                        type="button"
                        onClick={() => handleChooseRoleplayAction(opt.dir)}
                        className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${btnClass}`}
                      >
                        <p className="font-mono text-xs font-bold">{opt.label}</p>
                        <p className="mt-0.5 text-[11px] opacity-80">{opt.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Outcome Reveal & Easy Summary */}
              {activeRecord && (
                <div
                  data-testid="roleplay-outcome-panel"
                  className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#0B0F17]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          activeRecord.isCorrect
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {activeRecord.isCorrect
                          ? 'Tepat! Analisis Anda searah dengan reaksi historis.'
                          : `Belum tepat — Reaksi historis sebenarnya adalah ${activeScenario.correctAction}.`}
                      </span>
                    </div>
                    <DirectionTag direction={activeScenario.correctAction} compact />
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <strong className="text-slate-900 dark:text-white">Dampak Harga Nyata: </strong>
                    {activeScenario.historicalOutcome.priceMoveSummary}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                        1. Apa yang Terjadi
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {activeScenario.historicalOutcome.whatHappened}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                        2. Mengapa Pasar Bereaksi Demikian
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {activeScenario.historicalOutcome.whyMarketReacted}
                      </p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 dark:border-blue-500/25 dark:bg-blue-500/10">
                      <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                        3. Pelajaran Praktis (Ringkas)
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                        {activeScenario.historicalOutcome.practicalLesson}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextScenario}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Lanjut Kasus Berikutnya
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BEDAH BERITA AI */}
      {subTab === 'analyzer' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
          <form
            onSubmit={handleAnalyzeCustomNews}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-5 dark:border-slate-800 dark:bg-[#0F1522]"
          >
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Bedah Berita Makro dengan AI
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tempelkan teks rilis berita ekonomi atau angka DXY/CPI/Fed Rate terbaru untuk diubah menjadi ringkasan sebab-akibat per aset.
              </p>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Contoh Cepat:
              </p>
              <div className="flex flex-wrap gap-2">
                {CUSTOM_NEWS_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setCustomNewsText(preset.text);
                      setNewsError(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="custom-news-textarea"
                className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Teks Berita atau Angka Rilis Data
              </label>
              <textarea
                id="custom-news-textarea"
                rows={5}
                value={customNewsText}
                onChange={(e) => setCustomNewsText(e.target.value)}
                placeholder="Contoh: US CPI keluar di 3.5% lebih tinggi dari perkiraan 3.1%..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {newsError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
              >
                {newsError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzingNews}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isAnalyzingNews ? 'Membedah Berita...' : 'Analisis Berita'}
            </button>
          </form>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-7 dark:border-slate-800 dark:bg-[#0F1522]">
            {isAnalyzingNews ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-20 w-full rounded bg-slate-100 dark:bg-slate-800/70" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 rounded bg-slate-100 dark:bg-slate-800/70" />
                  <div className="h-24 rounded bg-slate-100 dark:bg-slate-800/70" />
                </div>
              </div>
            ) : customAnalysis ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {customAnalysis.rateExpectation}
                    </p>
                    <h3 className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white">
                      {customAnalysis.headlineSummary}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">DXY:</span>
                    <DirectionTag direction={customAnalysis.dxyBias} compact />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#0B0F17]">
                  <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Rantai Transmisi Dampak
                  </p>
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                    {customAnalysis.mechanismChain.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-600 font-mono text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 text-xs leading-relaxed text-slate-800 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-slate-200">
                  <strong className="font-semibold text-blue-700 dark:text-blue-300">
                    Ringkasan Mudah Dipahami:{' '}
                  </strong>
                  {customAnalysis.easySummary}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {customAnalysis.assetImpacts.map((imp) => (
                    <div
                      key={imp.asset}
                      className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0B0F17]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {imp.asset}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {imp.horizon}
                          </p>
                        </div>
                        <DirectionTag direction={imp.direction} compact />
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {imp.reason}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  <strong>Catatan Risiko: </strong>
                  {customAnalysis.cautionNote}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Siap Membedah Rilis Berita Makro
                </p>
                <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                  Pilih salah satu contoh cepat atau tempelkan berita terbaru di sisi kiri, lalu klik &ldquo;Analisis Berita&rdquo; untuk mendapatkan ringkasan dampak ke DXY, XAUUSD, Forex, Crypto, dan Saham.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
