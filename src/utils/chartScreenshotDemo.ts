import type { ChartScanResult } from '../types/scanner';
import { MARKET_PRESETS } from '../data/marketPresets';

/**
 * Generates a realistic TradingView-style dark candlestick screenshot PNG data URL
 * from the XAUUSD H4 preset so users can immediately test or preview uploaded-chart
 * visual annotations (detected pattern + execution plan) without needing an external file.
 */
export function buildSampleUploadedChartDemo(): {
  dataUrl: string;
  base64: string;
  scanResult: ChartScanResult;
} {
  const preset = MARKET_PRESETS[0];
  const candles = preset.candles;
  const width = 1040;
  const height = 560;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      dataUrl: '',
      base64: '',
      scanResult: preset.scanResult,
    };
  }

  // TradingView-style clean dark background
  ctx.fillStyle = '#131722';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 24;
  const padRight = 92;
  const padTop = 44;
  const padBottom = 46;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const minPrice = 2600;
  const maxPrice = 2725;
  const priceSpan = maxPrice - minPrice;

  const yForPrice = (p: number) => padTop + ((maxPrice - p) / priceSpan) * plotH;
  const stepX = plotW / (candles.length + 4); // leave breathing room on right for projection
  const xForIdx = (i: number) => padLeft + i * stepX + stepX / 2;

  // Gridlines & price axis
  ctx.strokeStyle = '#1E222D';
  ctx.lineWidth = 1;
  ctx.font = '12px monospace';
  ctx.fillStyle = '#787B86';
  for (let p = 2600; p <= 2720; p += 20) {
    const y = yForPrice(p);
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.fillText(p.toFixed(2), width - padRight + 10, y + 4);
  }

  // Top-left chart watermark header (authentic terminal screenshot style)
  ctx.fillStyle = '#D1D4DC';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('XAUUSD · 4H · OANDA', 24, 26);

  // Candlesticks
  const candleW = Math.max(8, stepX * 0.58);
  candles.forEach((c, idx) => {
    const cx = xForIdx(idx);
    const isBull = c.close >= c.open;
    const color = isBull ? '#089981' : '#F23645';

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, yForPrice(c.high));
    ctx.lineTo(cx, yForPrice(c.low));
    ctx.stroke();

    const yOpen = yForPrice(c.open);
    const yClose = yForPrice(c.close);
    const bodyTop = Math.min(yOpen, yClose);
    const bodyH = Math.max(2, Math.abs(yClose - yOpen));
    ctx.fillStyle = color;
    ctx.fillRect(cx - candleW / 2, bodyTop, candleW, bodyH);
  });

  // Right border & bottom time ticks
  ctx.strokeStyle = '#2A2E39';
  ctx.beginPath();
  ctx.moveTo(width - padRight, 0);
  ctx.lineTo(width - padRight, height - padBottom);
  ctx.moveTo(0, height - padBottom);
  ctx.lineTo(width, height - padBottom);
  ctx.stroke();

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1] || '';

  const xPct = (idx: number) => Number(((xForIdx(idx) / width) * 100).toFixed(2));
  const yPct = (p: number) => Number(((yForPrice(p) / height) * 100).toFixed(2));

  const annotatedScan: ChartScanResult = {
    ...preset.scanResult,
    id: `uploaded-demo-${Date.now()}`,
    sourceType: 'image',
    imagePreviewDataUrl: dataUrl,
    visualOverlay: {
      patternLines: [
        {
          label: 'Neckline 2652.00',
          x1Pct: xPct(8),
          y1Pct: yPct(2652),
          x2Pct: xPct(31),
          y2Pct: yPct(2652),
          style: 'solid',
          color: 'accent',
        },
        {
          label: 'LS → Head',
          x1Pct: xPct(7),
          y1Pct: yPct(2631),
          x2Pct: xPct(15),
          y2Pct: yPct(2612),
          style: 'dashed',
          color: 'bullish',
        },
        {
          label: 'Head → RS',
          x1Pct: xPct(15),
          y1Pct: yPct(2612),
          x2Pct: xPct(23),
          y2Pct: yPct(2629),
          style: 'dashed',
          color: 'bullish',
        },
      ],
      patternPoints: [
        { label: 'LS', xPct: xPct(7), yPct: yPct(2631), tone: 'neutral' },
        { label: 'Head', xPct: xPct(15), yPct: yPct(2612), tone: 'bullish' },
        { label: 'RS', xPct: xPct(23), yPct: yPct(2629), tone: 'bullish' },
        { label: 'Breakout', xPct: xPct(27), yPct: yPct(2657), tone: 'accent' },
      ],
      zones: [
        {
          label: 'Liquidity Sweep + H4 Demand',
          x1Pct: xPct(13),
          y1Pct: yPct(2622),
          x2Pct: xPct(17),
          y2Pct: yPct(2607),
          tone: 'bullish',
        },
      ],
      executionLevels: {
        entryYPct: yPct(2654),
        stopLossYPct: yPct(2624.5),
        tp1YPct: yPct(2692),
        tp2YPct: yPct(2716),
        invalidationYPct: yPct(2624.5),
        zoneStartXPct: xPct(26),
        zoneEndXPct: 90,
      },
    },
  };

  return { dataUrl, base64, scanResult: annotatedScan };
}
