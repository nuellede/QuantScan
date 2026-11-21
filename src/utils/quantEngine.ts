import type {
  AssetClass,
  ChartScanResult,
  ExecutionLevelsPct,
  SignalDirection,
  Timeframe,
  VisualImageOverlay,
} from '../types/scanner';

export interface RiskRewardCalculation {
  riskPerUnit: number;
  rewardTp1PerUnit: number;
  rewardTp2PerUnit: number;
  rrTp1: number;
  rrTp2: number;
  isValidDirection: boolean;
}

export function calculateRiskReward(
  entry: number,
  stopLoss: number,
  tp1: number,
  tp2: number,
  direction: SignalDirection
): RiskRewardCalculation {
  if (
    !Number.isFinite(entry) ||
    !Number.isFinite(stopLoss) ||
    !Number.isFinite(tp1) ||
    !Number.isFinite(tp2) ||
    entry <= 0 ||
    stopLoss <= 0
  ) {
    return {
      riskPerUnit: 0,
      rewardTp1PerUnit: 0,
      rewardTp2PerUnit: 0,
      rrTp1: 0,
      rrTp2: 0,
      isValidDirection: false,
    };
  }

  const riskPerUnit = Math.abs(entry - stopLoss);
  if (riskPerUnit === 0) {
    return {
      riskPerUnit: 0,
      rewardTp1PerUnit: 0,
      rewardTp2PerUnit: 0,
      rrTp1: 0,
      rrTp2: 0,
      isValidDirection: false,
    };
  }

  let isValidDirection = true;
  if (direction === 'BULLISH') {
    isValidDirection = stopLoss < entry && tp1 > entry && tp2 >= tp1;
  } else if (direction === 'BEARISH') {
    isValidDirection = stopLoss > entry && tp1 < entry && tp2 <= tp1;
  }

  const rewardTp1PerUnit = Math.abs(tp1 - entry);
  const rewardTp2PerUnit = Math.abs(tp2 - entry);

  return {
    riskPerUnit: Number(riskPerUnit.toFixed(6)),
    rewardTp1PerUnit: Number(rewardTp1PerUnit.toFixed(6)),
    rewardTp2PerUnit: Number(rewardTp2PerUnit.toFixed(6)),
    rrTp1: Number((rewardTp1PerUnit / riskPerUnit).toFixed(2)),
    rrTp2: Number((rewardTp2PerUnit / riskPerUnit).toFixed(2)),
    isValidDirection,
  };
}

export interface PositionSizeInput {
  accountEquity: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  assetClass: AssetClass;
}

export interface PositionSizeOutput {
  riskAmount: number;
  stopDistance: number;
  stopDistancePercent: number;
  units: number;
  formattedSize: string;
  unitLabel: string;
}

export function calculatePositionSize(input: PositionSizeInput): PositionSizeOutput {
  const { accountEquity, riskPercent, entryPrice, stopLossPrice, assetClass } = input;
  if (
    !Number.isFinite(accountEquity) ||
    !Number.isFinite(riskPercent) ||
    !Number.isFinite(entryPrice) ||
    !Number.isFinite(stopLossPrice) ||
    accountEquity <= 0 ||
    riskPercent <= 0 ||
    entryPrice <= 0 ||
    stopLossPrice <= 0
  ) {
    return {
      riskAmount: 0,
      stopDistance: 0,
      stopDistancePercent: 0,
      units: 0,
      formattedSize: '0',
      unitLabel: 'Unit',
    };
  }

  const riskAmount = (accountEquity * riskPercent) / 100;
  const stopDistance = Math.abs(entryPrice - stopLossPrice);
  const stopDistancePercent = (stopDistance / entryPrice) * 100;

  if (stopDistance <= 0) {
    return {
      riskAmount: Number(riskAmount.toFixed(2)),
      stopDistance: 0,
      stopDistancePercent: 0,
      units: 0,
      formattedSize: '0',
      unitLabel: 'Unit',
    };
  }

  const rawUnits = riskAmount / stopDistance;

  if (assetClass === 'XAUUSD') {
    const lots = rawUnits / 100;
    return {
      riskAmount: Number(riskAmount.toFixed(2)),
      stopDistance: Number(stopDistance.toFixed(2)),
      stopDistancePercent: Number(stopDistancePercent.toFixed(2)),
      units: Number(lots.toFixed(2)),
      formattedSize: `${lots.toFixed(2)} Lot (XAU)`,
      unitLabel: 'Lot Standar (100 oz)',
    };
  }

  if (assetClass === 'Forex') {
    const isJpy = entryPrice > 50;
    const contractUnits = 100000;
    const pipValueApprox = isJpy ? rawUnits / contractUnits : rawUnits / contractUnits;
    const lots = Math.max(0.01, Number(pipValueApprox.toFixed(2)));
    return {
      riskAmount: Number(riskAmount.toFixed(2)),
      stopDistance: Number(stopDistance.toFixed(isJpy ? 3 : 5)),
      stopDistancePercent: Number(stopDistancePercent.toFixed(2)),
      units: lots,
      formattedSize: `${lots.toFixed(2)} Lot (FX)`,
      unitLabel: 'Lot Standar (100k)',
    };
  }

  if (assetClass === 'Saham') {
    const shares = Math.floor(rawUnits);
    const lotsIdx = Math.floor(shares / 100);
    return {
      riskAmount: Number(riskAmount.toFixed(2)),
      stopDistance: Number(stopDistance.toFixed(2)),
      stopDistancePercent: Number(stopDistancePercent.toFixed(2)),
      units: shares,
      formattedSize: `${shares.toLocaleString('en-US')} Lembar (${lotsIdx} Lot IDX)`,
      unitLabel: 'Lembar / Lot IDX',
    };
  }

  return {
    riskAmount: Number(riskAmount.toFixed(2)),
    stopDistance: Number(stopDistance.toFixed(4)),
    stopDistancePercent: Number(stopDistancePercent.toFixed(2)),
    units: Number(rawUnits.toFixed(4)),
    formattedSize: `${rawUnits.toFixed(4)} Koin`,
    unitLabel: 'Koin / Token',
  };
}

export function calculateMeasuredMove(
  patternHigh: number,
  patternLow: number,
  breakoutLevel: number,
  direction: 'BULLISH' | 'BEARISH'
): { height: number; tp1Conservative: number; tp2FullMove: number } {
  const height = Math.max(0, patternHigh - patternLow);
  if (direction === 'BULLISH') {
    return {
      height: Number(height.toFixed(4)),
      tp1Conservative: Number((breakoutLevel + height * 0.618).toFixed(4)),
      tp2FullMove: Number((breakoutLevel + height).toFixed(4)),
    };
  }
  return {
    height: Number(height.toFixed(4)),
    tp1Conservative: Number((breakoutLevel - height * 0.618).toFixed(4)),
    tp2FullMove: Number((breakoutLevel - height).toFixed(4)),
  };
}

export function getAssetMarketContext(assetClass: AssetClass): {
  title: string;
  rules: string[];
} {
  switch (assetClass) {
    case 'XAUUSD':
      return {
        title: 'Sensitivitas Pasar: XAUUSD (Gold)',
        rules: [
          'Waspadai false breakout (wick panjang / liquidity grab) di sekitar level psikologis bulat (.00 / .50) pada sesi London & New York.',
          'Gunakan toleransi Stop Loss lebih lebar di balik struktur swing terakhir untuk mengantisipasi volatilitas spike.',
        ],
      };
    case 'Forex':
      return {
        title: 'Sensitivitas Pasar: Forex (Major & Cross Pairs)',
        rules: [
          'Prioritaskan kebersihan garis tren (trendline) dan wajib tunggu konfirmasi penutupan candle (candle close) di luar neckline.',
          'Perhatikan transisi likuiditas sesi Asia ke London/New York sebelum eksekusi breakout.',
        ],
      };
    case 'Crypto':
      return {
        title: 'Sensitivitas Pasar: Bitcoin / Crypto',
        rules: [
          'Pola pada timeframe besar (H4 & Daily) seperti Symmetrical Triangle dan Wedge sering mendahului ekspansi volatilitas besar.',
          'Validasi anomali volume (lonjakan volume spot/perp) untuk menghindari fakeout di akhir pekan.',
        ],
      };
    case 'Saham':
      return {
        title: 'Sensitivitas Pasar: Saham (IDX / US Stocks)',
        rules: [
          'Volume adalah syarat mutlak: volume menyusut saat konsolidasi pola dan terjadi volume spike minimal 1.5x rata-rata saat breakout.',
          'Perhatikan potensi Gap pembukaan pasar (opening gap) di sekitar area resistance/support kunci.',
        ],
      };
  }
}

export function validateScanInput(params: {
  mode: 'image' | 'text';
  hasImage: boolean;
  ticker: string;
  priceText: string;
}): { valid: boolean; error?: string } {
  if (params.mode === 'image') {
    if (!params.hasImage) {
      return {
        valid: false,
        error: 'Unggah atau tempel (paste) gambar grafik terlebih dahulu sebelum memindai.',
      };
    }
    return { valid: true };
  }

  const trimmedTicker = params.ticker.trim();
  const trimmedText = params.priceText.trim();

  if (!trimmedTicker) {
    return {
      valid: false,
      error: 'Masukkan simbol aset / ticker (contoh: XAUUSD, BTCUSDT, BBCA, EURUSD).',
    };
  }
  if (trimmedText.length < 15) {
    return {
      valid: false,
      error: 'Masukkan deskripsi struktur harga, level kunci, atau data OHLC minimal 15 karakter.',
    };
  }
  return { valid: true };
}

export function formatPriceByAsset(price: number, assetClass: AssetClass, ticker = ''): string {
  if (!Number.isFinite(price)) return '-';
  if (assetClass === 'Forex') {
    const isJpy = ticker.toUpperCase().includes('JPY') || price > 50;
    return price.toFixed(isJpy ? 3 : 5);
  }
  if (assetClass === 'XAUUSD') {
    return price.toFixed(2);
  }
  if (assetClass === 'Saham') {
    const isIdx = price >= 50 && Number.isInteger(price) && !ticker.includes('.');
    return isIdx ? price.toLocaleString('id-ID') : price.toFixed(2);
  }
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export function inferAssetClassFromTicker(ticker: string): AssetClass {
  const upper = ticker.toUpperCase().trim();
  if (upper.includes('XAU') || upper.includes('GOLD')) return 'XAUUSD';
  if (
    upper.includes('BTC') ||
    upper.includes('ETH') ||
    upper.includes('SOL') ||
    upper.includes('USDT') ||
    upper.includes('BNB')
  ) {
    return 'Crypto';
  }
  if (
    upper.length === 6 &&
    ['EUR', 'GBP', 'USD', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'].some((c) => upper.startsWith(c))
  ) {
    return 'Forex';
  }
  return 'Saham';
}

export function normalizeTimeframe(tf: string): Timeframe {
  const map: Record<string, Timeframe> = {
    M15: 'M15',
    '15M': 'M15',
    H1: 'H1',
    '1H': 'H1',
    H4: 'H4',
    '4H': 'H4',
    D1: 'Daily',
    DAILY: 'Daily',
    '1D': 'Daily',
    W1: 'Weekly',
    WEEKLY: 'Weekly',
    '1W': 'Weekly',
  };
  return map[tf.toUpperCase().trim()] ?? 'H4';
}

export function formatScanReportMarkdown(scan: ChartScanResult): string {
  const signalEmoji =
    scan.primaryPattern.signal === 'BULLISH'
      ? '🟢'
      : scan.primaryPattern.signal === 'BEARISH'
        ? '🔴'
        : '⚪';

  return `## 🔍 HASIL PEMINDAIAN CHART PATTERN
* **Aset / Instrumen:** ${scan.ticker}
* **Timeframe:** ${scan.timeframe}
* **Tren Utama (Market Structure):** ${scan.marketTrend}

### 📊 Pola Terdeteksi
1. **Pola Utama:** ${scan.primaryPattern.name} — **Status:** \`${scan.primaryPattern.status}\`
   * **Arah Sinyal:** ${signalEmoji} **${scan.primaryPattern.signal}**
   * **Tingkat Akurasi Struktur:** ${scan.primaryPattern.accuracyPercent}%
   * **Analisis Detail:** ${scan.primaryPattern.detailAnalysis}
2. **Pola Sekunder / Konfluensi:** ${scan.secondaryConfluence}

### 🎯 Rencana Eksekusi (Trading Plan)
* **Skenario Utama (Konfirmasi):**
  * **Area Entry:** ${scan.tradingPlan.entryArea}
  * **Stop Loss (SL):** ${scan.tradingPlan.stopLossText}
  * **Take Profit 1 (TP1 - Konservatif):** ${scan.tradingPlan.tp1Text}
  * **Take Profit 2 (TP2 - Measured Move):** ${scan.tradingPlan.tp2Text}
  * **Estimasi Risk-to-Reward (R:R):** ${scan.tradingPlan.riskRewardText}
* **Skenario Invalidasi (Batal):** ${scan.tradingPlan.invalidationText}

---
> **⚠️ Disclaimer:** *Analisis ini dihasilkan oleh AI berdasarkan probabilitas pola teknikal historis dan bukan merupakan saran keuangan mutlak (Financial Advice). Selalu terapkan manajemen risiko yang ketat.*`;
}

export function clampPercent(value: number, min = 2, max = 98): number {
  if (!Number.isFinite(value)) return (min + max) / 2;
  return Number(Math.min(max, Math.max(min, value)).toFixed(2));
}

export function deriveImageOverlayFromPlan(scan: ChartScanResult): VisualImageOverlay {
  const existing = scan.visualOverlay;
  const num = scan.tradingPlan.numeric;

  const prices = [
    num.entryPrice,
    num.stopLossPrice,
    num.tp1Price,
    num.tp2Price,
    num.invalidationPrice,
  ].filter((p) => Number.isFinite(p) && p > 0);

  const fallbackLevels = (): ExecutionLevelsPct => {
    if (prices.length < 2) {
      const isBearish = scan.primaryPattern.signal === 'BEARISH';
      return {
        entryYPct: 52,
        stopLossYPct: isBearish ? 30 : 72,
        tp1YPct: isBearish ? 68 : 34,
        tp2YPct: isBearish ? 82 : 20,
        invalidationYPct: isBearish ? 28 : 74,
        zoneStartXPct: 56,
        zoneEndXPct: 92,
      };
    }

    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const span = maxP - minP || 1;
    const mapPriceToY = (price: number, defaultY: number) => {
      if (!Number.isFinite(price) || price <= 0) return defaultY;
      // Higher price sits closer to top (18%), lower price closer to bottom (82%)
      const ratio = (maxP - price) / span;
      return clampPercent(18 + ratio * 64, 8, 92);
    };

    return {
      entryYPct: mapPriceToY(num.entryPrice, 50),
      stopLossYPct: mapPriceToY(num.stopLossPrice, 72),
      tp1YPct: mapPriceToY(num.tp1Price, 34),
      tp2YPct: mapPriceToY(num.tp2Price, 20),
      invalidationYPct: mapPriceToY(num.invalidationPrice || num.stopLossPrice, 74),
      zoneStartXPct: 56,
      zoneEndXPct: 92,
    };
  };

  const baseLevels = fallbackLevels();
  const rawLevels = existing?.executionLevels;

  const hasValidRawLevels =
    rawLevels &&
    rawLevels.entryYPct > 0 &&
    rawLevels.stopLossYPct > 0 &&
    rawLevels.tp1YPct > 0 &&
    rawLevels.tp2YPct > 0;

  const executionLevels: ExecutionLevelsPct = hasValidRawLevels
    ? {
        entryYPct: clampPercent(rawLevels.entryYPct, 5, 95),
        stopLossYPct: clampPercent(rawLevels.stopLossYPct, 5, 95),
        tp1YPct: clampPercent(rawLevels.tp1YPct, 5, 95),
        tp2YPct: clampPercent(rawLevels.tp2YPct, 5, 95),
        invalidationYPct: clampPercent(
          rawLevels.invalidationYPct || rawLevels.stopLossYPct,
          5,
          95
        ),
        zoneStartXPct: clampPercent(rawLevels.zoneStartXPct || 56, 10, 90),
        zoneEndXPct: clampPercent(rawLevels.zoneEndXPct || 92, 15, 96),
      }
    : baseLevels;

  return {
    patternLines: (existing?.patternLines ?? []).map((l) => ({
      ...l,
      x1Pct: clampPercent(l.x1Pct, 2, 96),
      y1Pct: clampPercent(l.y1Pct, 4, 94),
      x2Pct: clampPercent(l.x2Pct, 2, 96),
      y2Pct: clampPercent(l.y2Pct, 4, 94),
    })),
    patternPoints: (existing?.patternPoints ?? []).map((pt) => ({
      ...pt,
      xPct: clampPercent(pt.xPct, 3, 95),
      yPct: clampPercent(pt.yPct, 4, 94),
    })),
    zones: (existing?.zones ?? []).map((z) => ({
      ...z,
      x1Pct: clampPercent(z.x1Pct, 2, 96),
      y1Pct: clampPercent(z.y1Pct, 4, 94),
      x2Pct: clampPercent(z.x2Pct, 2, 96),
      y2Pct: clampPercent(z.y2Pct, 4, 94),
    })),
    executionLevels,
  };
}
