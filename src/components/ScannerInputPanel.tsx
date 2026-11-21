import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Play, Sparkles, Upload, X } from 'lucide-react';
import type { AssetClass, Timeframe } from '../types/scanner';
import { MARKET_PRESETS } from '../data/marketPresets';
import { validateScanInput } from '../utils/quantEngine';
import { optimizeChartImageFile } from '../utils/imageOptimize';

export type InputMode = 'preset' | 'image' | 'text';

interface ScannerInputPanelProps {
  inputMode: InputMode;
  onChangeMode: (mode: InputMode) => void;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  ticker: string;
  onChangeTicker: (val: string) => void;
  assetClass: AssetClass;
  onChangeAssetClass: (val: AssetClass) => void;
  timeframe: Timeframe;
  onChangeTimeframe: (val: Timeframe) => void;
  priceText: string;
  onChangePriceText: (val: string) => void;
  imagePreviewUrl: string | null;
  onImageSelected: (base64: string, mimeType: string, previewUrl: string) => void;
  onClearImage: () => void;
  isScanning: boolean;
  errorMessage: string | null;
  onRunScan: (mode: 'image' | 'text') => void;
  onLoadSampleChartDemo?: () => void;
}

const ASSET_CLASSES: AssetClass[] = ['XAUUSD', 'Forex', 'Crypto', 'Saham'];
const TIMEFRAMES: Timeframe[] = ['M15', 'H1', 'H4', 'Daily', 'Weekly'];

export const ScannerInputPanel: React.FC<ScannerInputPanelProps> = ({
  inputMode,
  onChangeMode,
  activePresetId,
  onSelectPreset,
  ticker,
  onChangeTicker,
  assetClass,
  onChangeAssetClass,
  timeframe,
  onChangeTimeframe,
  priceText,
  onChangePriceText,
  imagePreviewUrl,
  onImageSelected,
  onClearImage,
  isScanning,
  errorMessage,
  onRunScan,
  onLoadSampleChartDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLocalValidationError('Format file harus berupa gambar grafik (PNG, JPG, atau WEBP).');
      return;
    }
    setLocalValidationError(null);
    try {
      const optimized = await optimizeChartImageFile(file);
      onImageSelected(optimized.base64, optimized.mimeType, optimized.dataUrl);
    } catch {
      setLocalValidationError('Gagal membaca file gambar grafik. Silakan coba file lain.');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          onChangeMode('image');
          handleFile(file);
          break;
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveMode = inputMode === 'image' ? 'image' : 'text';
    const check = validateScanInput({
      mode: effectiveMode,
      hasImage: Boolean(imagePreviewUrl),
      ticker,
      priceText,
    });
    if (!check.valid) {
      setLocalValidationError(check.error || 'Input tidak valid.');
      return;
    }
    setLocalValidationError(null);
    onRunScan(effectiveMode);
  };

  const displayError = localValidationError || errorMessage;

  return (
    <section
      aria-label="Panel input pemindaian grafik"
      onPaste={handlePaste}
      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-[#0F1522]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
            Sumber Pemindaian Grafik
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Pilih grafik interaktif, unggah tangkapan layar, atau masukkan data harga
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Metode input pemindaian"
          className="grid w-full grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 sm:flex sm:w-auto sm:items-center dark:bg-slate-900"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'preset'}
            onClick={() => {
              setLocalValidationError(null);
              onChangeMode('preset');
            }}
            className={`truncate rounded-md px-2 py-1.5 text-center text-[11px] font-medium transition-colors sm:px-3 sm:text-xs sm:whitespace-nowrap sm:shrink-0 ${
              inputMode === 'preset'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Simulasi Grafik
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'image'}
            onClick={() => {
              setLocalValidationError(null);
              onChangeMode('image');
            }}
            className={`truncate rounded-md px-2 py-1.5 text-center text-[11px] font-medium transition-colors sm:px-3 sm:text-xs sm:whitespace-nowrap sm:shrink-0 ${
              inputMode === 'image'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Upload Gambar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'text'}
            onClick={() => {
              setLocalValidationError(null);
              onChangeMode('text');
            }}
            className={`truncate rounded-md px-2 py-1.5 text-center text-[11px] font-medium transition-colors sm:px-3 sm:text-xs sm:whitespace-nowrap sm:shrink-0 ${
              inputMode === 'text'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Data Harga / Teks
          </button>
        </div>
      </div>

      {inputMode === 'preset' && (
        <div className="mt-4">
          <p className="mb-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            Instrumen &amp; Pola Institusional Siap Uji
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {MARKET_PRESETS.map((preset) => {
              const selected = preset.id === activePresetId;
              const signal = preset.scanResult.primaryPattern.signal;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                    selected
                      ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {preset.label}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        signal === 'BULLISH'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {signal}
                    </span>
                  </div>
                  <span className="mt-1 text-xs text-slate-600 line-clamp-1 dark:text-slate-300">
                    {preset.scanResult.primaryPattern.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {inputMode === 'image' && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`relative rounded-lg border border-dashed p-5 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                : 'border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              id="chart-upload-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {imagePreviewUrl ? (
              <div className="space-y-3">
                <div className="relative mx-auto max-h-64 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <img
                    src={imagePreviewUrl}
                    alt="Pratinjau grafik yang diunggah"
                    className="mx-auto max-h-64 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={onClearImage}
                    aria-label="Hapus gambar grafik"
                    className="absolute top-2 right-2 rounded-md bg-slate-900/80 p-1.5 text-white hover:bg-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gambar siap dipindai. Tambahkan petunjuk opsional di bawah jika ticker/timeframe terpotong.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <ImagePlus className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Seret screenshot grafik ke sini, tempel (Ctrl+V), atau pilih file
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mendukung grafik TradingView, MetaTrader, Stockbit, atau Binance (PNG, JPG, WEBP)
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Pilih Gambar Grafik
                  </button>
                  {onLoadSampleChartDemo && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalValidationError(null);
                        onLoadSampleChartDemo();
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-600/30 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                    >
                      Contoh Screenshot + Visualisasi
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="img-ticker"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Ticker (Opsional)
              </label>
              <input
                id="img-ticker"
                type="text"
                value={ticker}
                onChange={(e) => onChangeTicker(e.target.value)}
                placeholder="Contoh: XAUUSD"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="img-asset-class"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Kelas Aset
              </label>
              <select
                id="img-asset-class"
                value={assetClass}
                onChange={(e) => onChangeAssetClass(e.target.value as AssetClass)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {ASSET_CLASSES.map((ac) => (
                  <option key={ac} value={ac}>
                    {ac}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="img-timeframe"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Timeframe
              </label>
              <select
                id="img-timeframe"
                value={timeframe}
                onChange={(e) => onChangeTimeframe(e.target.value as Timeframe)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {displayError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              {displayError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isScanning}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memindai Struktur Grafik...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Pindai Gambar Grafik
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {inputMode === 'text' && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="text-ticker"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Simbol Aset / Ticker
              </label>
              <input
                id="text-ticker"
                type="text"
                value={ticker}
                onChange={(e) => onChangeTicker(e.target.value)}
                placeholder="XAUUSD / BTCUSDT / BBCA"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="text-asset-class"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Kelas Aset
              </label>
              <select
                id="text-asset-class"
                value={assetClass}
                onChange={(e) => onChangeAssetClass(e.target.value as AssetClass)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {ASSET_CLASSES.map((ac) => (
                  <option key={ac} value={ac}>
                    {ac}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="text-timeframe"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Timeframe
              </label>
              <select
                id="text-timeframe"
                value={timeframe}
                onChange={(e) => onChangeTimeframe(e.target.value as Timeframe)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="text-price-context"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Data Harga / OHLC / Deskripsi Struktur Pasar
            </label>
            <textarea
              id="text-price-context"
              rows={3}
              value={priceText}
              onChange={(e) => onChangePriceText(e.target.value)}
              placeholder="Contoh: XAUUSD H4 membentuk Inverse H&S, Left Shoulder 2630, Head sweep ke 2608, Right Shoulder 2629, Neckline 2652 baru saja ditembus close H4..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {displayError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              {displayError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onChangeTicker('ETHUSDT');
                onChangeAssetClass('Crypto');
                onChangeTimeframe('H4');
                onChangePriceText(
                  'ETHUSDT H4 membentuk Falling Wedge pasca koreksi dari 3.420 ke 2.980. Upper resistance menurun di 3.120, lower support di 3.010, terjadi bullish divergence RSI dan volume spike mulai menembus 3.125.'
                );
                setLocalValidationError(null);
              }}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Isi Contoh Data ETHUSDT
            </button>

            <button
              type="submit"
              disabled={isScanning}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menganalisis Struktur...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Jalankan Pemindaian AI
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
