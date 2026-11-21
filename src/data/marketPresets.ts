import type { CandlePoint, MarketPreset } from '../types/scanner';

function generateCandlesFromWaypoints(
  waypoints: number[],
  baseVolume: number,
  volatility: number,
  startLabelPrefix: string,
  spikeIndices: number[] = []
): CandlePoint[] {
  const candles: CandlePoint[] = [];
  let prevClose = waypoints[0];

  for (let i = 0; i < waypoints.length; i++) {
    const targetClose = waypoints[i];
    const open = prevClose;
    const close = targetClose;
    const bodyRange = Math.abs(close - open);
    const wickUp = volatility * (0.35 + ((i * 7) % 5) * 0.12);
    const wickDown = volatility * (0.35 + ((i * 11) % 5) * 0.12);
    const high = Math.max(open, close) + wickUp + bodyRange * 0.12;
    const low = Math.min(open, close) - wickDown - bodyRange * 0.12;
    const isSpike = spikeIndices.includes(i);
    const volume = Math.round(
      baseVolume * (isSpike ? 2.15 : 0.75 + ((i * 13) % 7) * 0.08)
    );

    candles.push({
      time: `${startLabelPrefix} ${String(i + 1).padStart(2, '0')}`,
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4)),
      volume,
    });
    prevClose = close;
  }
  return candles;
}

export const MARKET_PRESETS: MarketPreset[] = [
  {
    id: 'xauusd-h4-ihs',
    label: 'XAUUSD · H4',
    assetClass: 'XAUUSD',
    candles: generateCandlesFromWaypoints(
      [
        2676, 2670, 2664, 2658, 2651, 2644, 2636, 2631, // drop into LS
        2637, 2644, 2651, 2648, // rebound to neckline 2652
        2641, 2632, 2621, 2612, 2619, // Head + liquidity sweep 2608-2612
        2629, 2638, 2647, 2652, // rally back to neckline
        2645, 2636, 2629, 2633, // Right Shoulder 2629
        2641, 2649, 2657, 2663, 2655, 2661, // Breakout + Retest
      ],
      18400,
      4.2,
      'H4',
      [15, 27, 30]
    ),
    geometryLines: [
      {
        label: 'Neckline 2652.00',
        x1Index: 9,
        y1: 2652,
        x2Index: 30,
        y2: 2652,
        style: 'solid',
        color: 'accent',
      },
      {
        label: 'LS → Head',
        x1Index: 7,
        y1: 2631,
        x2Index: 15,
        y2: 2612,
        style: 'dashed',
        color: 'bullish',
      },
      {
        label: 'Head → RS',
        x1Index: 15,
        y1: 2612,
        x2Index: 23,
        y2: 2629,
        style: 'dashed',
        color: 'bullish',
      },
    ],
    geometryZones: [
      {
        label: 'Liquidity Sweep + H4 Demand',
        startIndex: 13,
        endIndex: 17,
        topPrice: 2622,
        bottomPrice: 2607,
        tone: 'bullish',
      },
    ],
    scanResult: {
      id: 'preset-xauusd-h4',
      createdAt: '2026-11-18T06:45:00Z',
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
        accuracyPercent: 86,
        detailAnalysis:
          'Struktur pembalikan simetris terbentuk setelah koreksi menuju 2612. Left Shoulder tertahan di 2631, Head menyapu likuiditas di 2608–2612, dan Right Shoulder membentuk Higher Low solid di 2629. Candle H4 menutup tegas di atas Neckline 2652.00 dengan konfirmasi retest.',
      },
      secondaryConfluence:
        'Liquidity Sweep di bawah Equal Lows H4 (2612) + Change of Character (CHoCH) bullish + Bullish Order Block di 2630–2636.',
      marketContextNote:
        'Waspadai fakeout wick panjang di sekitar level psikologis 2650.00 saat pembukaan sesi New York; SL ditempatkan dengan buffer volatilitas di balik Right Shoulder.',
      tradingPlan: {
        entryArea: '2654.00 (Buy on Retest Neckline / Candle Close H4 > 2652.00)',
        stopLossText: '2624.50 (Di bawah struktur Right Shoulder 2629 + buffer wick Gold)',
        tp1Text: '2692.00 (0.618 Measured Move & Supply H4)',
        tp2Text: '2716.00 (Full Measured Move tinggi Head-Neckline)',
        riskRewardText: '1 : 1.29 (Full: 1 : 2.10)',
        invalidationText:
          'Pola dianggap gagal apabila harga menembus dan bertahan di bawah level 2624.50.',
        numeric: {
          entryPrice: 2654,
          stopLossPrice: 2624.5,
          tp1Price: 2692,
          tp2Price: 2716,
          invalidationPrice: 2624.5,
          riskRewardRatio: 2.1,
        },
      },
    },
  },
  {
    id: 'btcusdt-d1-triangle',
    label: 'BTCUSDT · Daily',
    assetClass: 'Crypto',
    candles: generateCandlesFromWaypoints(
      [
        79200, 81400, 84500, 88200, 91600, 93800, 92400, 89800,
        87100, 86200, 87900, 90200, 92100, 91400, 89500, 88100,
        88700, 90100, 91300, 90700, 89400, 89800, 90800, 91600,
        92900, 94100,
      ],
      42500,
      620,
      'D1',
      [4, 5, 24, 25]
    ),
    geometryLines: [
      {
        label: 'Upper Descending Resistance',
        x1Index: 5,
        y1: 94200,
        x2Index: 24,
        y2: 91200,
        style: 'solid',
        color: 'bearish',
      },
      {
        label: 'Lower Ascending Support',
        x1Index: 9,
        y1: 85800,
        x2Index: 24,
        y2: 89600,
        style: 'solid',
        color: 'bullish',
      },
    ],
    geometryZones: [
      {
        label: 'Apex Compression Zone',
        startIndex: 18,
        endIndex: 23,
        topPrice: 91600,
        bottomPrice: 89100,
        tone: 'neutral',
      },
    ],
    scanResult: {
      id: 'preset-btcusdt-d1',
      createdAt: '2026-11-18T05:30:00Z',
      sourceType: 'preset',
      assetClass: 'Crypto',
      ticker: 'BTCUSDT',
      timeframe: 'Daily',
      marketTrend: 'Bullish',
      primaryPattern: {
        name: 'Symmetrical Triangle',
        category: 'Continuation',
        status: 'Valid Breakout',
        signal: 'BULLISH',
        accuracyPercent: 83,
        detailAnalysis:
          'Setelah ekspansi dari 79.200 ke 93.800, Bitcoin berkonsolidasi dalam Symmetrical Triangle yang menyempit menuju 75% jarak apex. Lower Highs (93.800 -> 92.100 -> 91.300) dan Higher Lows (86.200 -> 88.100 -> 89.400) akhirnya ditembus ke atas dengan lonjakan volume spot Daily.',
      },
      secondaryConfluence:
        'Kompresi Bollinger Band Daily + Ekspansi Volume +210% pada candle breakout + Bullish FVG di 90.800–91.600.',
      marketContextNote:
        'Pada aset Crypto timeframe Daily, breakout Symmetrical Triangle pasca kompresi volatilitas panjang sering memicu ekspansi beruntun; perhatikan konfirmasi penutupan candle Daily UTC.',
      tradingPlan: {
        entryArea: '92.400 (Retest Upper Trendline / Area FVG 91.600–92.400)',
        stopLossText: '88.800 (Di bawah Higher Low terakhir di dalam triangle)',
        tp1Text: '96.900 (0.618 Measured Move)',
        tp2Text: '100.200 (Full Measured Move tinggi mulut triangle ~8.000 poin)',
        riskRewardText: '1 : 2.17',
        invalidationText:
          'Pola dianggap gagal apabila harga menembus dan bertahan di bawah level 88.800.',
        numeric: {
          entryPrice: 92400,
          stopLossPrice: 88800,
          tp1Price: 96900,
          tp2Price: 100200,
          invalidationPrice: 88800,
          riskRewardRatio: 2.17,
        },
      },
    },
  },
  {
    id: 'bbca-d1-cup',
    label: 'BBCA · Daily',
    assetClass: 'Saham',
    candles: generateCandlesFromWaypoints(
      [
        10325, 10200, 10050, 9925, 9800, 9725, 9675, 9650,
        9675, 9725, 9800, 9900, 10025, 10150, 10275, 10350,
        10275, 10200, 10150, 10175, 10250, 10375, 10475,
      ],
      85000000,
      45,
      'D1',
      [0, 15, 21, 22]
    ),
    geometryLines: [
      {
        label: 'Rim Resistance (10.350)',
        x1Index: 0,
        y1: 10350,
        x2Index: 22,
        y2: 10350,
        style: 'solid',
        color: 'accent',
      },
      {
        label: 'Handle Channel Support',
        x1Index: 15,
        y1: 10280,
        x2Index: 20,
        y2: 10150,
        style: 'dashed',
        color: 'bullish',
      },
    ],
    geometryZones: [
      {
        label: 'Handle Accumulation Box',
        startIndex: 16,
        endIndex: 20,
        topPrice: 10325,
        bottomPrice: 10125,
        tone: 'bullish',
      },
    ],
    scanResult: {
      id: 'preset-bbca-d1',
      createdAt: '2026-11-18T04:15:00Z',
      sourceType: 'preset',
      assetClass: 'Saham',
      ticker: 'BBCA',
      timeframe: 'Daily',
      marketTrend: 'Bullish',
      primaryPattern: {
        name: 'Cup and Handle',
        category: 'Continuation',
        status: 'Valid Breakout',
        signal: 'BULLISH',
        accuracyPercent: 85,
        detailAnalysis:
          'BBCA membentuk dasar lengkungan Cup yang halus di 9.650 diikuti koreksi Handle dangkal hanya 28% dari tinggi Cup pada kisaran 10.150–10.325. Volume menyusut selama Handle dan mencetak lonjakan volume 2.1x rata-rata saat menembus rim resistance 10.350.',
      },
      secondaryConfluence:
        'Volume Spike >200% MA20 saat breakout + Break of Structure (BOS) Daily + Dukungan EMA 20 & 50 bullish alignment.',
      marketContextNote:
        'Khusus saham IDX, konfirmasi volume spike saat menembus 10.350 memvalidasi akumulasi institusional; perhatikan potensi opening gap saat pembukaan sesi 1 BEI.',
      tradingPlan: {
        entryArea: '10.375 – 10.425 (Buy on Breakout / Retest Rim 10.350)',
        stopLossText: '10.075 (Di bawah dasar Handle 10.125)',
        tp1Text: '10.800 (0.618 Measured Move)',
        tp2Text: '11.050 (Full Measured Move kedalaman Cup 700 poin)',
        riskRewardText: '1 : 2.25',
        invalidationText:
          'Pola dianggap gagal apabila harga menembus dan bertahan di bawah level 10.075.',
        numeric: {
          entryPrice: 10375,
          stopLossPrice: 10075,
          tp1Price: 10800,
          tp2Price: 11050,
          invalidationPrice: 10075,
          riskRewardRatio: 2.25,
        },
      },
    },
  },
  {
    id: 'eurusd-h1-dt',
    label: 'EURUSD · H1',
    assetClass: 'Forex',
    candles: generateCandlesFromWaypoints(
      [
        1.078, 1.0805, 1.083, 1.0855, 1.0875, 1.089, 1.0882, 1.0865,
        1.0842, 1.0825, 1.0812, 1.0824, 1.0846, 1.0868, 1.0886, 1.0892,
        1.0876, 1.0852, 1.083, 1.0815, 1.0804, 1.0792,
      ],
      11200,
      0.0009,
      'H1',
      [5, 15, 20]
    ),
    geometryLines: [
      {
        label: 'Double Top Resistance (1.0890)',
        x1Index: 4,
        y1: 1.089,
        x2Index: 17,
        y2: 1.089,
        style: 'dashed',
        color: 'bearish',
      },
      {
        label: 'Neckline Support (1.0812)',
        x1Index: 8,
        y1: 1.0812,
        x2Index: 21,
        y2: 1.0812,
        style: 'solid',
        color: 'accent',
      },
    ],
    geometryZones: [
      {
        label: 'Bearish OB + Rejection Zone',
        startIndex: 14,
        endIndex: 16,
        topPrice: 1.0898,
        bottomPrice: 1.0878,
        tone: 'bearish',
      },
    ],
    scanResult: {
      id: 'preset-eurusd-h1',
      createdAt: '2026-11-18T03:00:00Z',
      sourceType: 'preset',
      assetClass: 'Forex',
      ticker: 'EURUSD',
      timeframe: 'H1',
      marketTrend: 'Bearish',
      primaryPattern: {
        name: 'Double Top (M Pattern)',
        category: 'Reversal',
        status: 'Valid Breakout',
        signal: 'BEARISH',
        accuracyPercent: 81,
        detailAnalysis:
          'EURUSD gagal menembus supply 1.0890 dua kali (puncak pertama 1.0890, puncak kedua menyapu tipis ke 1.0892 lalu membentuk Bearish Engulfing). Penutupan candle H1 di bawah Neckline 1.0812 mengonfirmasi transisi struktur bearish.',
      },
      secondaryConfluence:
        'Bearish RSI Divergence pada puncak kedua + Change of Character (CHoCH) H1 + Sweep sesi London.',
      marketContextNote:
        'Pada pair Forex utama, kebersihan penutupan candle H1 di bawah Neckline 1.0812 menjadi validasi kunci sebelum melanjutkan penurunan.',
      tradingPlan: {
        entryArea: '1.0808 (Sell on Retest Neckline 1.0812)',
        stopLossText: '1.0852 (Di atas Lower High / Bearish FVG H1)',
        tp1Text: '1.0762 (0.618 Measured Move)',
        tp2Text: '1.0732 (Full Measured Move tinggi M Pattern 78 pips)',
        riskRewardText: '1 : 1.73',
        invalidationText:
          'Pola dianggap gagal apabila harga menembus dan bertahan di atas level 1.0852.',
        numeric: {
          entryPrice: 1.0808,
          stopLossPrice: 1.0852,
          tp1Price: 1.0762,
          tp2Price: 1.0732,
          invalidationPrice: 1.0852,
          riskRewardRatio: 1.73,
        },
      },
    },
  },
];
