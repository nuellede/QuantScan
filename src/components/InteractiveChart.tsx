import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type {
  AssetClass,
  CandlePoint,
  ChartGeometryLine,
  ChartGeometryZone,
  TradingPlanNumeric,
} from '../types/scanner';
import { formatPriceByAsset } from '../utils/quantEngine';

interface InteractiveChartProps {
  ticker: string;
  assetClass: AssetClass;
  timeframe: string;
  candles: CandlePoint[];
  geometryLines: ChartGeometryLine[];
  geometryZones: ChartGeometryZone[];
  tradingPlan: TradingPlanNumeric;
  signal: 'BULLISH' | 'BEARISH' | 'NETRAL';
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  ticker,
  assetClass,
  timeframe,
  candles,
  geometryLines,
  geometryZones,
  tradingPlan,
  signal,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showLevels, setShowLevels] = useState(true);

  if (candles.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#0E1420] dark:text-slate-400">
        Data candlestick belum tersedia untuk instrumen ini.
      </div>
    );
  }

  const width = 880;
  const height = 400;
  const padLeft = 18;
  const padRight = 96;
  const padTop = 22;
  const chartBottom = 305;
  const volTop = 320;
  const volBottom = 372;

  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  if (showLevels) {
    if (tradingPlan.entryPrice > 0) allPrices.push(tradingPlan.entryPrice);
    if (tradingPlan.stopLossPrice > 0) allPrices.push(tradingPlan.stopLossPrice);
    if (tradingPlan.tp1Price > 0) allPrices.push(tradingPlan.tp1Price);
    if (tradingPlan.tp2Price > 0) allPrices.push(tradingPlan.tp2Price);
  }

  const rawMin = Math.min(...allPrices);
  const rawMax = Math.max(...allPrices);
  const padding = (rawMax - rawMin) * 0.08 || rawMax * 0.01;
  const minPrice = rawMin - padding;
  const maxPrice = rawMax + padding;
  const priceSpan = maxPrice - minPrice || 1;

  const maxVol = Math.max(...candles.map((c) => c.volume)) || 1;
  const plotWidth = width - padLeft - padRight;
  const stepX = plotWidth / candles.length;
  const candleWidth = Math.max(6, Math.min(16, stepX * 0.62));

  const xForIndex = (idx: number) => padLeft + idx * stepX + stepX / 2;
  const yForPrice = (price: number) =>
    padTop + ((maxPrice - price) / priceSpan) * (chartBottom - padTop);

  const activeCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1];

  const gridTicks = Array.from({ length: 5 }, (_, i) => {
    const ratio = i / 4;
    const price = maxPrice - ratio * priceSpan;
    const y = padTop + ratio * (chartBottom - padTop);
    return { price, y };
  });

  const strokeForTone = (tone: ChartGeometryLine['color']) => {
    if (tone === 'bullish') return '#16A34A';
    if (tone === 'bearish') return '#DC2626';
    if (tone === 'accent') return '#2563EB';
    return '#D97706';
  };

  const levelMarkers = showLevels
    ? [
        { label: 'TP2', price: tradingPlan.tp2Price, color: '#16A34A' },
        { label: 'TP1', price: tradingPlan.tp1Price, color: '#22C55E' },
        { label: 'ENTRY', price: tradingPlan.entryPrice, color: '#2563EB' },
        { label: 'SL', price: tradingPlan.stopLossPrice, color: '#DC2626' },
      ].filter((m) => m.price > 0)
    : [];

  return (
    <div
      data-testid="interactive-chart"
      className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F1522]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
            {ticker}
          </span>
          <span className="text-slate-400">·</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">{timeframe}</span>
          <span className="text-slate-400">·</span>
          <div className="flex items-center gap-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
            <span>
              O <strong className="font-semibold text-slate-900 dark:text-white">{formatPriceByAsset(activeCandle.open, assetClass, ticker)}</strong>
            </span>
            <span>
              H <strong className="font-semibold text-slate-900 dark:text-white">{formatPriceByAsset(activeCandle.high, assetClass, ticker)}</strong>
            </span>
            <span>
              L <strong className="font-semibold text-slate-900 dark:text-white">{formatPriceByAsset(activeCandle.low, assetClass, ticker)}</strong>
            </span>
            <span>
              C{' '}
              <strong
                className={`font-semibold ${
                  activeCandle.close >= activeCandle.open
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatPriceByAsset(activeCandle.close, assetClass, ticker)}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOverlay((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              showOverlay
                ? 'border-blue-600/30 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {showOverlay ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Geometri Pola
          </button>
          <button
            type="button"
            onClick={() => setShowLevels((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              showLevels
                ? 'border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Level Entry/SL/TP
          </button>
        </div>
      </div>

      <div className="relative p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full select-none"
          role="img"
          aria-label={`Grafik candlestick ${ticker} timeframe ${timeframe}`}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Gridlines & Right Price Axis (skip label if a level badge sits within 16px) */}
          {gridTicks.map((tick, i) => {
            const overlapsBadge = levelMarkers.some(
              (m) => Math.abs(yForPrice(m.price) - tick.y) < 16
            );
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={tick.y}
                  x2={width - padRight}
                  y2={tick.y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800/90"
                  strokeWidth="1"
                />
                {!overlapsBadge && (
                  <text
                    x={width - padRight + 8}
                    y={tick.y + 4}
                    className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
                  >
                    {formatPriceByAsset(tick.price, assetClass, ticker)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Pattern Zones (OB / FVG / Liquidity Sweep) */}
          {showOverlay &&
            geometryZones.map((zone, idx) => {
              const x1 = xForIndex(zone.startIndex) - candleWidth / 2;
              const x2 = xForIndex(zone.endIndex) + candleWidth / 2;
              const yTop = yForPrice(zone.topPrice);
              const yBottom = yForPrice(zone.bottomPrice);
              const rectBottom = Math.max(yTop, yBottom);
              const fillClass =
                zone.tone === 'bullish'
                  ? 'fill-emerald-500/12 stroke-emerald-500/40'
                  : zone.tone === 'bearish'
                    ? 'fill-rose-500/12 stroke-rose-500/40'
                    : 'fill-amber-500/12 stroke-amber-500/40';
              return (
                <g key={idx}>
                  <rect
                    x={x1}
                    y={Math.min(yTop, yBottom)}
                    width={Math.max(12, x2 - x1)}
                    height={Math.max(8, Math.abs(yBottom - yTop))}
                    className={fillClass}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={Math.min(chartBottom - 4, rectBottom + 12)}
                    textAnchor="middle"
                    className="fill-slate-600 font-sans text-[9.5px] font-medium dark:fill-slate-300"
                  >
                    {zone.label}
                  </text>
                </g>
              );
            })}

          {/* Horizontal Entry / SL / TP1 / TP2 Lines */}
          {levelMarkers.map((lvl) => {
            const y = yForPrice(lvl.price);
            if (y < padTop - 8 || y > chartBottom + 8) return null;
            return (
              <g key={lvl.label}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={lvl.color}
                  strokeWidth="1.2"
                  strokeDasharray={lvl.label === 'ENTRY' ? 'none' : '4 4'}
                  opacity="0.85"
                />
                <rect
                  x={width - padRight + 4}
                  y={y - 9}
                  width={88}
                  height={18}
                  rx={3}
                  fill={lvl.color}
                />
                <text
                  x={width - padRight + 9}
                  y={y + 3.5}
                  fill="#FFFFFF"
                  className="font-mono text-[9.5px] font-semibold"
                >
                  {lvl.label} {formatPriceByAsset(lvl.price, assetClass, ticker)}
                </text>
              </g>
            );
          })}

          {/* Pattern Trendlines & Necklines */}
          {showOverlay &&
            geometryLines.map((line, idx) => {
              const x1 = xForIndex(line.x1Index);
              const y1 = yForPrice(line.y1);
              const x2 = xForIndex(line.x2Index);
              const y2 = yForPrice(line.y2);
              const color = strokeForTone(line.color);
              const placeAbove = line.style === 'solid';
              const labelY = placeAbove
                ? Math.min(y1, y2) - 8
                : Math.max(y1, y2) + 12;
              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray={line.style === 'dashed' ? '5 4' : undefined}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={Math.min(chartBottom - 4, Math.max(padTop + 10, labelY))}
                    textAnchor="middle"
                    fill={color}
                    className="font-sans text-[9.5px] font-semibold"
                  >
                    {line.label}
                  </text>
                </g>
              );
            })}

          {/* Candlesticks & Volume Bars */}
          {candles.map((c, idx) => {
            const cx = xForIndex(idx);
            const isBull = c.close >= c.open;
            const bodyTop = yForPrice(Math.max(c.open, c.close));
            const bodyBottom = yForPrice(Math.min(c.open, c.close));
            const bodyHeight = Math.max(2, bodyBottom - bodyTop);
            const wickTop = yForPrice(c.high);
            const wickBottom = yForPrice(c.low);
            const color = isBull ? '#16A34A' : '#DC2626';

            const volHeight = Math.max(2, (c.volume / maxVol) * (volBottom - volTop));
            const volY = volBottom - volHeight;
            const isHovered = hoverIndex === idx;

            return (
              <g key={idx}>
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={volBottom}
                    stroke="currentColor"
                    className="text-slate-400/50 dark:text-slate-500/50"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
                <line
                  x1={cx}
                  y1={wickTop}
                  x2={cx}
                  y2={wickBottom}
                  stroke={color}
                  strokeWidth="1.5"
                />
                <rect
                  x={cx - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx="1"
                  opacity={isHovered ? 1 : 0.92}
                />
                <rect
                  x={cx - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={volHeight}
                  fill={color}
                  opacity={isHovered ? 0.65 : 0.32}
                  rx="1"
                />
                {/* Invisible hover hit column */}
                <rect
                  x={cx - stepX / 2}
                  y={padTop}
                  width={stepX}
                  height={volBottom - padTop}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              </g>
            );
          })}

          {/* Volume baseline & X-axis labels */}
          <line
            x1={padLeft}
            y1={volTop - 6}
            x2={width - padRight}
            y2={volTop - 6}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="1"
          />
          <text
            x={padLeft}
            y={volTop + 8}
            className="fill-slate-400 font-sans text-[9.5px] dark:fill-slate-500"
          >
            Volume
          </text>
          {candles
            .filter((_, idx) => idx % 5 === 0 || idx === candles.length - 1)
            .map((c) => {
              const origIdx = candles.indexOf(c);
              return (
                <text
                  key={c.time}
                  x={xForIndex(origIdx)}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[9.5px] dark:fill-slate-400"
                >
                  {c.time}
                </text>
              );
            })}
        </svg>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-2 pt-2 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <span>
            Bias Arah:{' '}
            <strong
              className={
                signal === 'BULLISH'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : signal === 'BEARISH'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-amber-600 dark:text-amber-400'
              }
            >
              {signal}
            </strong>
          </span>
          <span>Arahkan kursor pada candle untuk inspeksi OHLC &amp; Volume</span>
        </div>
      </div>
    </div>
  );
};
