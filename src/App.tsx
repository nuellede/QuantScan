import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { TopNav, type ActiveTab } from './components/TopNav';
import { InteractiveChart } from './components/InteractiveChart';
import { UploadedChartOverlay } from './components/UploadedChartOverlay';
import { ScannerInputPanel, type InputMode } from './components/ScannerInputPanel';
import { ScanResultPanel } from './components/ScanResultPanel';
import { PatternLibraryView } from './components/PatternLibraryView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { RiskCalculatorView } from './components/RiskCalculatorView';
import { FundamentalNewsView } from './components/FundamentalNewsView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MARKET_PRESETS } from './data/marketPresets';
import { buildSampleUploadedChartDemo } from './utils/chartScreenshotDemo';
import type {
  AssetClass,
  ChartScanResult,
  PatternCatalogItem,
  Timeframe,
  VisualImageOverlay,
} from './types/scanner';

const HISTORY_STORAGE_KEY = 'quantscan_history_v1';

function loadInitialHistory(): ChartScanResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return MARKET_PRESETS.map((p) => p.scanResult);
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');

  const [inputMode, setInputMode] = useState<InputMode>('preset');
  const [activePresetId, setActivePresetId] = useState<string>(MARKET_PRESETS[0].id);
  const [activeScan, setActiveScan] = useState<ChartScanResult>(MARKET_PRESETS[0].scanResult);

  const [ticker, setTicker] = useState<string>('XAUUSD');
  const [assetClass, setAssetClass] = useState<AssetClass>('XAUUSD');
  const [timeframe, setTimeframe] = useState<Timeframe>('H4');
  const [priceText, setPriceText] = useState<string>('');

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [history, setHistory] = useState<ChartScanResult[]>(loadInitialHistory);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore storage quota issues
    }
  }, [history]);

  const activePreset =
    MARKET_PRESETS.find((p) => p.id === activePresetId) ?? MARKET_PRESETS[0];

  const handleSelectPreset = (presetId: string) => {
    const found = MARKET_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setActivePresetId(found.id);
    setActiveScan(found.scanResult);
    setScanError(null);
  };

  const handleRunScan = async (mode: 'image' | 'text') => {
    setIsScanning(true);
    setScanError(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          ticker,
          assetClass,
          timeframe,
          priceText,
          imageBase64: mode === 'image' ? imageBase64 : undefined,
          imageMimeType: mode === 'image' ? imageMimeType : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setScanError(data.error || 'Pemindaian gagal dijalankan oleh server.');
        return;
      }

      const result: ChartScanResult = {
        ...data,
        imagePreviewDataUrl: mode === 'image' ? imagePreviewUrl ?? undefined : undefined,
      };
      setActiveScan(result);
      setHistory((prev) => [result, ...prev.filter((item) => item.id !== result.id)]);
    } catch {
      setScanError('Gagal terhubung ke layanan pemindaian server (/api/scan).');
    } finally {
      setIsScanning(false);
    }
  };

  const handleNewScan = () => {
    setActiveTab('scanner');
    setInputMode('image');
    setScanError(null);
  };

  const handleLoadPatternToScanner = (item: PatternCatalogItem) => {
    setTicker(item.sampleInput.ticker);
    setAssetClass(item.sampleInput.assetClass);
    setTimeframe(item.sampleInput.timeframe);
    setPriceText(item.sampleInput.priceText);
    setInputMode('text');
    setActiveTab('scanner');
    setScanError(null);
  };

  const handleSelectHistoryScan = (scan: ChartScanResult) => {
    const matchingPreset = MARKET_PRESETS.find((p) => p.scanResult.id === scan.id);
    if (matchingPreset) {
      setActivePresetId(matchingPreset.id);
      setInputMode('preset');
    } else if (scan.sourceType === 'image') {
      setInputMode('image');
      if (scan.imagePreviewDataUrl) {
        setImagePreviewUrl(scan.imagePreviewDataUrl);
      }
    } else {
      setInputMode('text');
      setTicker(scan.ticker);
      setAssetClass(scan.assetClass);
      setTimeframe(scan.timeframe);
    }
    setActiveScan(scan);
    setActiveTab('scanner');
  };

  const handleDeleteHistoryScan = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadSampleChartDemo = () => {
    const demo = buildSampleUploadedChartDemo();
    if (!demo.dataUrl) return;
    setImageBase64(demo.base64);
    setImageMimeType('image/png');
    setImagePreviewUrl(demo.dataUrl);
    setTicker(demo.scanResult.ticker);
    setAssetClass(demo.scanResult.assetClass);
    setTimeframe(demo.scanResult.timeframe);
    setActiveScan(demo.scanResult);
    setScanError(null);
  };

  const handleUpdateImageOverlay = (overlay: VisualImageOverlay) => {
    setActiveScan((prev) => {
      const updated = { ...prev, visualOverlay: overlay };
      setHistory((hist) =>
        hist.map((item) => (item.id === updated.id ? updated : item))
      );
      return updated;
    });
  };

  const showInteractiveCandles =
    activeScan.sourceType === 'preset' &&
    activePreset.scanResult.id === activeScan.id;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F17] dark:text-slate-100">
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewScan={handleNewScan}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {/* Workspace Control Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span>Quantitative Technical Scanner</span>
            <span aria-hidden="true" className="mx-2 text-slate-400">
              ·
            </span>
            <span>Forex · XAUUSD · Crypto · Saham IDX/US</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-800 dark:bg-[#0F1522] dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {isDark ? 'Mode Terang' : 'Mode Gelap'}
            </button>
          </div>
        </div>

        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <ScannerInputPanel
              inputMode={inputMode}
              onChangeMode={setInputMode}
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
              ticker={ticker}
              onChangeTicker={setTicker}
              assetClass={assetClass}
              onChangeAssetClass={setAssetClass}
              timeframe={timeframe}
              onChangeTimeframe={setTimeframe}
              priceText={priceText}
              onChangePriceText={setPriceText}
              imagePreviewUrl={imagePreviewUrl}
              onImageSelected={(base64, mimeType, previewUrl) => {
                setImageBase64(base64);
                setImageMimeType(mimeType);
                setImagePreviewUrl(previewUrl);
              }}
              onClearImage={() => {
                setImageBase64(null);
                setImagePreviewUrl(null);
              }}
              isScanning={isScanning}
              errorMessage={scanError}
              onRunScan={handleRunScan}
              onLoadSampleChartDemo={handleLoadSampleChartDemo}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
              <div className="xl:col-span-7">
                {showInteractiveCandles ? (
                  <InteractiveChart
                    ticker={activePreset.scanResult.ticker}
                    assetClass={activePreset.scanResult.assetClass}
                    timeframe={activePreset.scanResult.timeframe}
                    candles={activePreset.candles}
                    geometryLines={activePreset.geometryLines}
                    geometryZones={activePreset.geometryZones}
                    tradingPlan={activePreset.scanResult.tradingPlan.numeric}
                    signal={activePreset.scanResult.primaryPattern.signal}
                  />
                ) : activeScan.imagePreviewDataUrl ? (
                  <UploadedChartOverlay
                    scan={activeScan}
                    onUpdateOverlay={handleUpdateImageOverlay}
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F1522]">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2 text-xs dark:border-slate-800">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeScan.ticker} · {activeScan.timeframe}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Ringkasan Level Harga Terstruktur
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Entry</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">
                          {activeScan.tradingPlan.numeric.entryPrice || '-'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Stop Loss</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                          {activeScan.tradingPlan.numeric.stopLossPrice || '-'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">TP1</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {activeScan.tradingPlan.numeric.tp1Price || '-'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">TP2</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {activeScan.tradingPlan.numeric.tp2Price || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-5">
                <ScanResultPanel
                  scan={activeScan}
                  isLoading={isScanning}
                  onOpenCalculator={(scan) => {
                    setActiveScan(scan);
                    setActiveTab('calculator');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <PatternLibraryView onLoadPatternToScanner={handleLoadPatternToScanner} />
        )}

        {activeTab === 'history' && (
          <ScanHistoryView
            history={history}
            onSelectScan={handleSelectHistoryScan}
            onDeleteScan={handleDeleteHistoryScan}
            onGoToScanner={() => setActiveTab('scanner')}
          />
        )}

        {activeTab === 'calculator' && <RiskCalculatorView activeScan={activeScan} />}

        {activeTab === 'news' && <FundamentalNewsView />}
      </main>
      <OfflineIndicator />
    </div>
  );
}
