import React, { useRef, useState } from 'react';
import { Download, Eye, EyeOff, MoveVertical, RotateCcw } from 'lucide-react';
import type { ChartScanResult, VisualImageOverlay } from '../types/scanner';
import {
  clampPercent,
  deriveImageOverlayFromPlan,
  formatPriceByAsset,
} from '../utils/quantEngine';

interface UploadedChartOverlayProps {
  scan: ChartScanResult;
  onUpdateOverlay: (overlay: VisualImageOverlay) => void;
}

type DragTarget = 'entryYPct' | 'stopLossYPct' | 'tp1YPct' | 'tp2YPct' | null;

export const UploadedChartOverlay: React.FC<UploadedChartOverlayProps> = ({
  scan,
  onUpdateOverlay,
}) => {
  const [showPatternLayer, setShowPatternLayer] = useState(true);
  const [showExecutionLayer, setShowExecutionLayer] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!scan.imagePreviewDataUrl) return null;

  const overlay = deriveImageOverlayFromPlan(scan);
  const levels = overlay.executionLevels;
  const num = scan.tradingPlan.numeric;

  const strokeColor = (tone: 'accent' | 'bullish' | 'bearish' | 'neutral') => {
    if (tone === 'bullish') return '#16A34A';
    if (tone === 'bearish') return '#DC2626';
    if (tone === 'accent') return '#2563EB';
    return '#D97706';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCalibrating || !dragTarget || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.height <= 0) return;
    const rawYPct = ((e.clientY - rect.top) / rect.height) * 100;
    const nextY = clampPercent(rawYPct, 4, 96);

    const updated: VisualImageOverlay = {
      ...overlay,
      executionLevels: {
        ...levels,
        [dragTarget]: nextY,
        ...(dragTarget === 'stopLossYPct' ? { invalidationYPct: nextY } : {}),
      },
    };
    onUpdateOverlay(updated);
  };

  const handleResetOverlay = () => {
    const reset = deriveImageOverlayFromPlan({
      ...scan,
      visualOverlay: scan.visualOverlay
        ? {
            ...scan.visualOverlay,
            executionLevels: {
              entryYPct: 0,
              stopLossYPct: 0,
              tp1YPct: 0,
              tp2YPct: 0,
              invalidationYPct: 0,
              zoneStartXPct: 56,
              zoneEndXPct: 92,
            },
          }
        : undefined,
    });
    onUpdateOverlay(reset);
  };

  const handleDownloadAnnotated = () => {
    const previewUrl = scan.imagePreviewDataUrl;
    if (!previewUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 1040;
      const h = img.naturalHeight || 560;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);

      const px = (pct: number) => (pct / 100) * w;
      const py = (pct: number) => (pct / 100) * h;

      if (showPatternLayer) {
        overlay.zones.forEach((z) => {
          const x = Math.min(px(z.x1Pct), px(z.x2Pct));
          const y = Math.min(py(z.y1Pct), py(z.y2Pct));
          const zw = Math.abs(px(z.x2Pct) - px(z.x1Pct));
          const zh = Math.abs(py(z.y2Pct) - py(z.y1Pct));
          ctx.fillStyle =
            z.tone === 'bullish'
              ? 'rgba(22, 163, 74, 0.16)'
              : z.tone === 'bearish'
                ? 'rgba(220, 38, 38, 0.16)'
                : 'rgba(217, 119, 6, 0.16)';
          ctx.fillRect(x, y, zw, zh);
          ctx.strokeStyle = strokeColor(z.tone);
          ctx.setLineDash([5, 4]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, zw, zh);
          ctx.setLineDash([]);
        });

        overlay.patternLines.forEach((line) => {
          ctx.beginPath();
          ctx.moveTo(px(line.x1Pct), py(line.y1Pct));
          ctx.lineTo(px(line.x2Pct), py(line.y2Pct));
          ctx.strokeStyle = 'rgba(11, 15, 23, 0.75)';
          ctx.lineWidth = 5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(px(line.x1Pct), py(line.y1Pct));
          ctx.lineTo(px(line.x2Pct), py(line.y2Pct));
          ctx.strokeStyle = strokeColor(line.color);
          ctx.lineWidth = 2.5;
          if (line.style === 'dashed') ctx.setLineDash([7, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        overlay.patternPoints.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(px(pt.xPct), py(pt.yPct), 5, 0, Math.PI * 2);
          ctx.fillStyle = strokeColor(pt.tone);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = 'bold 11px sans-serif';
          const tw = ctx.measureText(pt.label).width + 10;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.fillRect(px(pt.xPct) - tw / 2, py(pt.yPct) - 22, tw, 16);
          ctx.fillStyle = '#F8FAFC';
          ctx.fillText(pt.label, px(pt.xPct) - tw / 2 + 5, py(pt.yPct) - 10);
        });
      }

      if (showExecutionLayer) {
        const zx1 = px(levels.zoneStartXPct);
        const zx2 = px(levels.zoneEndXPct);
        const zw = Math.max(40, zx2 - zx1);

        // Reward Zone (Entry <-> TP2)
        const yEntry = py(levels.entryYPct);
        const yTp2 = py(levels.tp2YPct);
        ctx.fillStyle = 'rgba(22, 163, 74, 0.14)';
        ctx.fillRect(zx1, Math.min(yEntry, yTp2), zw, Math.abs(yTp2 - yEntry));

        // Risk Zone (Entry <-> SL)
        const ySl = py(levels.stopLossYPct);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.14)';
        ctx.fillRect(zx1, Math.min(yEntry, ySl), zw, Math.abs(ySl - yEntry));

        const execLines = [
          { label: 'TP2', y: yTp2, price: num.tp2Price, color: '#16A34A', dashed: true },
          { label: 'TP1', y: py(levels.tp1YPct), price: num.tp1Price, color: '#22C55E', dashed: true },
          { label: 'ENTRY', y: yEntry, price: num.entryPrice, color: '#2563EB', dashed: false },
          { label: 'SL', y: ySl, price: num.stopLossPrice, color: '#DC2626', dashed: true },
        ];

        execLines.forEach((lvl) => {
          ctx.beginPath();
          ctx.moveTo(zx1, lvl.y);
          ctx.lineTo(zx2, lvl.y);
          ctx.strokeStyle = lvl.color;
          ctx.lineWidth = 2;
          if (lvl.dashed) ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          const priceText = lvl.price
            ? `${lvl.label} ${formatPriceByAsset(lvl.price, scan.assetClass, scan.ticker)}`
            : lvl.label;
          ctx.font = 'bold 11px monospace';
          const badgeW = ctx.measureText(priceText).width + 14;
          const bx = Math.min(w - badgeW - 6, zx2 - badgeW);
          ctx.fillStyle = lvl.color;
          ctx.fillRect(bx, lvl.y - 9, badgeW, 18);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(priceText, bx + 7, lvl.y + 4);
        });
      }

      const link = document.createElement('a');
      link.download = `QuantScan-${scan.ticker}-${scan.timeframe}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = previewUrl;
  };

  const executionItems: Array<{
    key: DragTarget;
    label: string;
    yPct: number;
    price: number;
    color: string;
    dashed: boolean;
  }> = [
    {
      key: 'tp2YPct',
      label: 'TP2',
      yPct: levels.tp2YPct,
      price: num.tp2Price,
      color: '#16A34A',
      dashed: true,
    },
    {
      key: 'tp1YPct',
      label: 'TP1',
      yPct: levels.tp1YPct,
      price: num.tp1Price,
      color: '#22C55E',
      dashed: true,
    },
    {
      key: 'entryYPct',
      label: 'ENTRY',
      yPct: levels.entryYPct,
      price: num.entryPrice,
      color: '#2563EB',
      dashed: false,
    },
    {
      key: 'stopLossYPct',
      label: 'SL',
      yPct: levels.stopLossYPct,
      price: num.stopLossPrice,
      color: '#DC2626',
      dashed: true,
    },
  ];

  const zoneX1 = Math.min(levels.zoneStartXPct, levels.zoneEndXPct);
  const zoneWidth = Math.max(18, Math.abs(levels.zoneEndXPct - levels.zoneStartXPct));

  return (
    <div
      data-testid="uploaded-chart-overlay"
      className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F1522]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
          <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
            {scan.ticker}
          </span>
          <span className="text-slate-400">·</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">{scan.timeframe}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 dark:text-slate-300">
            {scan.primaryPattern.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPatternLayer((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              showPatternLayer
                ? 'border-blue-600/30 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            {showPatternLayer ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Pola Grafik
          </button>

          <button
            type="button"
            onClick={() => setShowExecutionLayer((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              showExecutionLayer
                ? 'border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            Rencana Eksekusi
          </button>

          <button
            type="button"
            onClick={() => setIsCalibrating((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isCalibrating
                ? 'border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            <MoveVertical className="h-3.5 w-3.5" />
            {isCalibrating ? 'Selesai Geser' : 'Geser Level'}
          </button>

          {isCalibrating && (
            <button
              type="button"
              onClick={handleResetOverlay}
              title="Reset posisi level otomatis"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadAnnotated}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            Unduh PNG
          </button>
        </div>
      </div>

      <div className="p-2 sm:p-3">
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragTarget(null)}
          onPointerLeave={() => setDragTarget(null)}
          className={`relative w-full overflow-hidden rounded-lg border border-slate-200 bg-[#0B0F17] select-none dark:border-slate-800 ${
            isCalibrating ? 'cursor-ns-resize' : ''
          }`}
        >
          <img
            src={scan.imagePreviewDataUrl}
            alt={`Grafik ${scan.ticker} dengan overlay pola ${scan.primaryPattern.name} dan rencana eksekusi`}
            className="block h-auto w-full object-contain"
            draggable={false}
          />

          {/* SVG Vector Annotation Layer mapped 1:1 to percentage coordinates */}
          <svg
            viewBox="0 0 1000 560"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* Layer 1: Pattern Zones, Trendlines & Pivot Nodes */}
            {showPatternLayer && (
              <g>
                {overlay.zones.map((z, idx) => {
                  const x = Math.min(z.x1Pct, z.x2Pct) * 10;
                  const y = Math.min(z.y1Pct, z.y2Pct) * 5.6;
                  const w = Math.max(20, Math.abs(z.x2Pct - z.x1Pct) * 10);
                  const h = Math.max(16, Math.abs(z.y2Pct - z.y1Pct) * 5.6);
                  const fill =
                    z.tone === 'bullish'
                      ? 'rgba(22, 163, 74, 0.16)'
                      : z.tone === 'bearish'
                        ? 'rgba(220, 38, 38, 0.16)'
                        : 'rgba(217, 119, 6, 0.16)';
                  const stroke = strokeColor(z.tone);
                  return (
                    <g key={`zone-${idx}`}>
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      <rect
                        x={x}
                        y={Math.min(540, y + h + 4)}
                        width={Math.min(240, z.label.length * 6.5 + 14)}
                        height={18}
                        rx="3"
                        fill="rgba(15, 23, 42, 0.85)"
                      />
                      <text
                        x={x + 7}
                        y={Math.min(553, y + h + 16)}
                        fill="#E2E8F0"
                        fontSize="10.5"
                        fontWeight="600"
                      >
                        {z.label}
                      </text>
                    </g>
                  );
                })}

                {overlay.patternLines.map((line, idx) => {
                  const x1 = line.x1Pct * 10;
                  const y1 = line.y1Pct * 5.6;
                  const x2 = line.x2Pct * 10;
                  const y2 = line.y2Pct * 5.6;
                  const color = strokeColor(line.color);
                  const midX = (x1 + x2) / 2;
                  const midY = line.style === 'solid' ? Math.min(y1, y2) - 10 : Math.max(y1, y2) + 18;
                  const labelW = Math.min(220, line.label.length * 6.5 + 14);
                  return (
                    <g key={`line-${idx}`}>
                      {/* Contrast halo */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(11, 15, 23, 0.78)"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth="2.5"
                        strokeDasharray={line.style === 'dashed' ? '8 5' : undefined}
                        strokeLinecap="round"
                      />
                      <rect
                        x={midX - labelW / 2}
                        y={Math.max(6, Math.min(534, midY - 12))}
                        width={labelW}
                        height={18}
                        rx="3"
                        fill="rgba(15, 23, 42, 0.88)"
                        stroke={color}
                        strokeWidth="0.8"
                      />
                      <text
                        x={midX}
                        y={Math.max(18, Math.min(546, midY))}
                        textAnchor="middle"
                        fill="#F8FAFC"
                        fontSize="10.5"
                        fontWeight="600"
                      >
                        {line.label}
                      </text>
                    </g>
                  );
                })}

                {overlay.patternPoints.map((pt, idx) => {
                  const cx = pt.xPct * 10;
                  const cy = pt.yPct * 5.6;
                  const color = strokeColor(pt.tone);
                  const w = Math.max(30, pt.label.length * 7 + 12);
                  return (
                    <g key={`pt-${idx}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5.5"
                        fill={color}
                        stroke="#FFFFFF"
                        strokeWidth="1.8"
                      />
                      <rect
                        x={cx - w / 2}
                        y={Math.max(6, cy - 26)}
                        width={w}
                        height={17}
                        rx="3"
                        fill="rgba(15, 23, 42, 0.9)"
                      />
                      <text
                        x={cx}
                        y={Math.max(18, cy - 14)}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Layer 2: Execution Plan Risk/Reward Shaded Boxes & Horizontal Levels */}
            {showExecutionLayer && (
              <g>
                {/* Reward zone (Entry -> TP2) */}
                <rect
                  x={zoneX1 * 10}
                  y={Math.min(levels.entryYPct, levels.tp2YPct) * 5.6}
                  width={zoneWidth * 10}
                  height={Math.max(4, Math.abs(levels.tp2YPct - levels.entryYPct) * 5.6)}
                  fill="rgba(22, 163, 74, 0.16)"
                />
                {/* Risk zone (Entry -> SL) */}
                <rect
                  x={zoneX1 * 10}
                  y={Math.min(levels.entryYPct, levels.stopLossYPct) * 5.6}
                  width={zoneWidth * 10}
                  height={Math.max(4, Math.abs(levels.stopLossYPct - levels.entryYPct) * 5.6)}
                  fill="rgba(220, 38, 38, 0.16)"
                />

                {executionItems.map((lvl) => {
                  const y = lvl.yPct * 5.6;
                  const xStart = zoneX1 * 10;
                  const xEnd = (zoneX1 + zoneWidth) * 10;
                  const priceLabel = lvl.price
                    ? `${lvl.label} ${formatPriceByAsset(lvl.price, scan.assetClass, scan.ticker)}`
                    : lvl.label;
                  const badgeW = Math.max(76, priceLabel.length * 7.2 + 16);
                  const badgeX = Math.min(994 - badgeW, xEnd - badgeW);
                  return (
                    <g key={lvl.label}>
                      <line
                        x1={xStart}
                        y1={y}
                        x2={xEnd}
                        y2={y}
                        stroke={lvl.color}
                        strokeWidth="2"
                        strokeDasharray={lvl.dashed ? '6 4' : undefined}
                      />
                      <rect
                        x={badgeX}
                        y={Math.max(2, Math.min(538, y - 10))}
                        width={badgeW}
                        height={20}
                        rx="3"
                        fill={lvl.color}
                      />
                      <text
                        x={badgeX + 8}
                        y={Math.max(15, Math.min(551, y + 3.5))}
                        fill="#FFFFFF"
                        fontSize="10.5"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="700"
                      >
                        {priceLabel}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Interactive Draggable Handles in Calibration Mode */}
          {showExecutionLayer &&
            isCalibrating &&
            executionItems.map((lvl) => (
              <button
                key={`drag-${lvl.label}`}
                type="button"
                aria-label={`Geser posisi level ${lvl.label}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDragTarget(lvl.key);
                }}
                style={{ top: `${lvl.yPct}%`, left: `${zoneX1}%`, width: `${zoneWidth}%` }}
                className="absolute -translate-y-1/2 cursor-ns-resize py-2 focus:outline-none"
              >
                <span className="sr-only">Geser {lvl.label}</span>
              </button>
            ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {isCalibrating
              ? 'Mode kalibrasi aktif: seret garis ENTRY / SL / TP1 / TP2 secara vertikal agar sejajar dengan skala harga screenshot.'
              : 'Pola terdeteksi dan zona Risk/Reward Rencana Eksekusi ditampilkan langsung di atas grafik.'}
          </span>
          <span className="font-mono">
            R:R {scan.tradingPlan.riskRewardText}
          </span>
        </div>
      </div>
    </div>
  );
};
