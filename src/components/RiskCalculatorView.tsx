import React, { useEffect, useState } from 'react';
import type { AssetClass, ChartScanResult, SignalDirection } from '../types/scanner';
import {
  calculatePositionSize,
  calculateRiskReward,
} from '../utils/quantEngine';

interface RiskCalculatorViewProps {
  activeScan: ChartScanResult;
}

const ASSET_CLASSES: AssetClass[] = ['XAUUSD', 'Forex', 'Crypto', 'Saham'];

export const RiskCalculatorView: React.FC<RiskCalculatorViewProps> = ({ activeScan }) => {
  const [assetClass, setAssetClass] = useState<AssetClass>(activeScan.assetClass);
  const [direction, setDirection] = useState<SignalDirection>(
    activeScan.primaryPattern.signal === 'BEARISH' ? 'BEARISH' : 'BULLISH'
  );
  const [equity, setEquity] = useState<number>(activeScan.assetClass === 'Saham' ? 100000000 : 10000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(activeScan.tradingPlan.numeric.entryPrice);
  const [stopLossPrice, setStopLossPrice] = useState<number>(
    activeScan.tradingPlan.numeric.stopLossPrice
  );
  const [tp1Price, setTp1Price] = useState<number>(activeScan.tradingPlan.numeric.tp1Price);
  const [tp2Price, setTp2Price] = useState<number>(activeScan.tradingPlan.numeric.tp2Price);

  useEffect(() => {
    setAssetClass(activeScan.assetClass);
    setDirection(activeScan.primaryPattern.signal === 'BEARISH' ? 'BEARISH' : 'BULLISH');
    setEquity(activeScan.assetClass === 'Saham' ? 100000000 : 10000);
    setEntryPrice(activeScan.tradingPlan.numeric.entryPrice);
    setStopLossPrice(activeScan.tradingPlan.numeric.stopLossPrice);
    setTp1Price(activeScan.tradingPlan.numeric.tp1Price);
    setTp2Price(activeScan.tradingPlan.numeric.tp2Price);
  }, [activeScan]);

  const rr = calculateRiskReward(entryPrice, stopLossPrice, tp1Price, tp2Price, direction);
  const pos = calculatePositionSize({
    accountEquity: equity,
    riskPercent,
    entryPrice,
    stopLossPrice,
    assetClass,
  });

  const currencyPrefix = assetClass === 'Saham' ? 'Rp ' : '$';
  const potentialTp1Profit = pos.riskAmount * rr.rrTp1;
  const potentialTp2Profit = pos.riskAmount * rr.rrTp2;

  return (
    <section aria-label="Kalkulator Risk-to-Reward dan Ukuran Posisi" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kalkulator Risk-to-Reward &amp; Ukuran Posisi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Tersinkronisasi dengan hasil pemindaian aktif ({activeScan.ticker} · {activeScan.timeframe}) untuk manajemen risiko terukur.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
          {(['BULLISH', 'BEARISH'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => setDirection(dir)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                direction === dir
                  ? dir === 'BULLISH'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {dir === 'BULLISH' ? 'Long / Buy' : 'Short / Sell'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7 dark:border-slate-800 dark:bg-[#0F1522]">
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Parameter Akun &amp; Level Eksekusi
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="calc-asset"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Kelas Aset
              </label>
              <select
                id="calc-asset"
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as AssetClass)}
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
                htmlFor="calc-equity"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Modal Akun ({currencyPrefix.trim()})
              </label>
              <input
                id="calc-equity"
                type="number"
                min="1"
                step="any"
                value={equity}
                onChange={(e) => setEquity(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="calc-risk-pct"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Risiko per Trade (%)
              </label>
              <input
                id="calc-risk-pct"
                type="number"
                min="0.1"
                max="20"
                step="0.25"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="calc-entry"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Harga Entry
              </label>
              <input
                id="calc-entry"
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="calc-sl"
                className="mb-1 block text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                Harga Stop Loss (SL)
              </label>
              <input
                id="calc-sl"
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="calc-tp1"
                className="mb-1 block text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                Take Profit 1 (Konservatif)
              </label>
              <input
                id="calc-tp1"
                type="number"
                step="any"
                value={tp1Price}
                onChange={(e) => setTp1Price(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="calc-tp2"
                className="mb-1 block text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                Take Profit 2 (Measured Move)
              </label>
              <input
                id="calc-tp2"
                type="number"
                step="any"
                value={tp2Price}
                onChange={(e) => setTp2Price(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {!rr.isValidDirection && (
            <div
              role="alert"
              className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            >
              Peringatan struktur: Posisi Stop Loss dan Take Profit tidak konsisten dengan arah{' '}
              {direction === 'BULLISH' ? 'Long / Buy' : 'Short / Sell'}.
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 dark:border-slate-800 dark:bg-[#0F1522]">
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Output Ukuran Posisi &amp; Payoff
          </h2>

          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/25 dark:bg-blue-500/10">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Rekomendasi Ukuran Posisi ({pos.unitLabel})
            </p>
            <p
              data-testid="calculated-position-size"
              className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white"
            >
              {pos.formattedSize}
            </p>
          </div>

          <dl className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Nominal Risiko Maksimal</dt>
              <dd className="font-mono font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                -{currencyPrefix}
                {pos.riskAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Jarak Stop Loss</dt>
              <dd className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                {pos.stopDistance} ({pos.stopDistancePercent}%)
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Risk-to-Reward TP1</dt>
              <dd className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                1 : {rr.rrTp1.toFixed(2)} (+{currencyPrefix}
                {potentialTp1Profit.toLocaleString('en-US', { maximumFractionDigits: 2 })})
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Risk-to-Reward TP2 (Full)</dt>
              <dd className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                1 : {rr.rrTp2.toFixed(2)} (+{currencyPrefix}
                {potentialTp2Profit.toLocaleString('en-US', { maximumFractionDigits: 2 })})
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};
