import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMeasuredMove,
  calculatePositionSize,
  calculateRiskReward,
  clampPercent,
  deriveImageOverlayFromPlan,
  formatScanReportMarkdown,
  getAssetMarketContext,
  inferAssetClassFromTicker,
  validateScanInput,
} from './quantEngine';
import type { ChartScanResult } from '../types/scanner';

test('calculateRiskReward computes bullish R:R ratios accurately', () => {
  const res = calculateRiskReward(2650, 2630, 2680, 2700, 'BULLISH');
  assert.equal(res.isValidDirection, true);
  assert.equal(res.riskPerUnit, 20);
  assert.equal(res.rrTp1, 1.5);
  assert.equal(res.rrTp2, 2.5);
});

test('calculateRiskReward flags invalid bearish SL below entry', () => {
  const res = calculateRiskReward(1.085, 1.08, 1.075, 1.07, 'BEARISH');
  assert.equal(res.isValidDirection, false);
});

test('calculatePositionSize computes XAUUSD lots and Saham IDX shares accurately', () => {
  const xau = calculatePositionSize({
    accountEquity: 10000,
    riskPercent: 1,
    entryPrice: 2650,
    stopLossPrice: 2630,
    assetClass: 'XAUUSD',
  });
  assert.equal(xau.riskAmount, 100);
  assert.equal(xau.stopDistance, 20);
  assert.equal(xau.units, 0.05);

  const idx = calculatePositionSize({
    accountEquity: 100000000,
    riskPercent: 1,
    entryPrice: 10200,
    stopLossPrice: 9950,
    assetClass: 'Saham',
  });
  assert.equal(idx.riskAmount, 1000000);
  assert.equal(idx.units, 4000);
  assert.ok(idx.formattedSize.includes('40 Lot IDX'));
});

test('calculateMeasuredMove projects 0.618 conservative and 1.0 full move targets', () => {
  const bullMove = calculateMeasuredMove(100, 80, 100, 'BULLISH');
  assert.equal(bullMove.height, 20);
  assert.equal(bullMove.tp1Conservative, 112.36);
  assert.equal(bullMove.tp2FullMove, 120);

  const bearMove = calculateMeasuredMove(100, 80, 80, 'BEARISH');
  assert.equal(bearMove.tp2FullMove, 60);
});

test('validateScanInput enforces non-empty ticker and descriptive price context', () => {
  assert.equal(
    validateScanInput({ mode: 'image', hasImage: false, ticker: '', priceText: '' }).valid,
    false
  );
  assert.equal(
    validateScanInput({ mode: 'text', hasImage: false, ticker: '', priceText: 'long enough description' }).valid,
    false
  );
  assert.equal(
    validateScanInput({ mode: 'text', hasImage: false, ticker: 'BTCUSDT', priceText: 'Symmetrical triangle near 91500' }).valid,
    true
  );
});

test('inferAssetClassFromTicker and getAssetMarketContext match institutional rules', () => {
  assert.equal(inferAssetClassFromTicker('XAUUSD'), 'XAUUSD');
  assert.equal(inferAssetClassFromTicker('BTCUSDT'), 'Crypto');
  assert.equal(inferAssetClassFromTicker('EURUSD'), 'Forex');
  assert.equal(inferAssetClassFromTicker('BBCA'), 'Saham');

  const xauCtx = getAssetMarketContext('XAUUSD');
  assert.ok(xauCtx.rules[0].includes('false breakout'));
});

test('formatScanReportMarkdown outputs required Indonesian headers and disclaimer', () => {
  const sample: ChartScanResult = {
    id: 'test-1',
    createdAt: '2026-11-18T00:00:00Z',
    sourceType: 'preset',
    assetClass: 'XAUUSD',
    ticker: 'XAUUSD',
    timeframe: 'H4',
    marketTrend: 'Bullish',
    primaryPattern: {
      name: 'Inverse Head and Shoulders',
      category: 'Reversal',
      status: 'Valid Breakout',
      signal: 'BULLISH',
      accuracyPercent: 84,
      detailAnalysis: 'Penembusan neckline 2652 dengan candle close H4 solid.',
    },
    secondaryConfluence: 'Liquidity Sweep di area 2618 + Bullish OB H4',
    marketContextNote: 'Waspadai wick sesi New York.',
    tradingPlan: {
      entryArea: '2654.00 (Retest Neckline)',
      stopLossText: '2628.00 (Di bawah Right Shoulder)',
      tp1Text: '2685.00',
      tp2Text: '2718.00',
      riskRewardText: '1 : 2.46',
      invalidationText: 'Pola dianggap gagal apabila harga menembus dan bertahan di bawah level 2628.00.',
      numeric: {
        entryPrice: 2654,
        stopLossPrice: 2628,
        tp1Price: 2685,
        tp2Price: 2718,
        invalidationPrice: 2628,
        riskRewardRatio: 2.46,
      },
    },
  };

  const md = formatScanReportMarkdown(sample);
  assert.ok(md.includes('## 🔍 HASIL PEMINDAIAN CHART PATTERN'));
  assert.ok(md.includes('### 📊 Pola Terdeteksi'));
  assert.ok(md.includes('### 🎯 Rencana Eksekusi (Trading Plan)'));
  assert.ok(md.includes('⚠️ Disclaimer:'));
});

test('clampPercent and deriveImageOverlayFromPlan map prices proportionally and preserve explicit visual coordinates', () => {
  assert.equal(clampPercent(120, 5, 95), 95);
  assert.equal(clampPercent(-10, 5, 95), 5);

  const withoutOverlay: ChartScanResult = {
    id: 'img-1',
    createdAt: '2026-11-18T00:00:00Z',
    sourceType: 'image',
    assetClass: 'XAUUSD',
    ticker: 'XAUUSD',
    timeframe: 'H4',
    marketTrend: 'Bullish',
    primaryPattern: {
      name: 'Ascending Triangle',
      category: 'Continuation',
      status: 'Valid Breakout',
      signal: 'BULLISH',
      accuracyPercent: 84,
      detailAnalysis: 'Breakout resistance.',
    },
    secondaryConfluence: 'Bullish OB',
    marketContextNote: 'Waspadai wick.',
    tradingPlan: {
      entryArea: '2660',
      stopLossText: '2630',
      tp1Text: '2690',
      tp2Text: '2720',
      riskRewardText: '1 : 2.00',
      invalidationText: 'Bawah 2630',
      numeric: {
        entryPrice: 2660,
        stopLossPrice: 2630,
        tp1Price: 2690,
        tp2Price: 2720,
        invalidationPrice: 2630,
        riskRewardRatio: 2,
      },
    },
  };

  const derived = deriveImageOverlayFromPlan(withoutOverlay);
  assert.ok(derived.executionLevels.tp2YPct < derived.executionLevels.tp1YPct);
  assert.ok(derived.executionLevels.tp1YPct < derived.executionLevels.entryYPct);
  assert.ok(derived.executionLevels.entryYPct < derived.executionLevels.stopLossYPct);

  const withExplicit: ChartScanResult = {
    ...withoutOverlay,
    visualOverlay: {
      patternLines: [
        { label: 'Resistance', x1Pct: 12, y1Pct: 35, x2Pct: 80, y2Pct: 35, style: 'solid', color: 'accent' },
      ],
      patternPoints: [
        { label: 'Breakout', xPct: 72, yPct: 34, tone: 'bullish' },
      ],
      zones: [],
      executionLevels: {
        entryYPct: 36,
        stopLossYPct: 65,
        tp1YPct: 22,
        tp2YPct: 12,
        invalidationYPct: 67,
        zoneStartXPct: 62,
        zoneEndXPct: 92,
      },
    },
  };

  const preserved = deriveImageOverlayFromPlan(withExplicit);
  assert.equal(preserved.patternLines.length, 1);
  assert.equal(preserved.patternPoints[0].label, 'Breakout');
  assert.equal(preserved.executionLevels.entryYPct, 36);
});
