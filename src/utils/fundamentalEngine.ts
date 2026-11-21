import type {
  HistoricalNewsRoleplay,
  MacroAssetImpact,
  MacroIndicatorMeta,
  MacroSimulationResult,
  RoleplayAnswerRecord,
} from '../types/fundamental';
import type { SignalDirection } from '../types/scanner';

export function evaluateMacroRelease(params: {
  indicator: MacroIndicatorMeta;
  forecast: number;
  actual: number;
}): MacroSimulationResult {
  const { indicator, forecast, actual } = params;
  const rawDelta = actual - forecast;
  const surpriseDelta = Number(rawDelta.toFixed(4));
  const surprisePercent =
    forecast !== 0 ? Number(((rawDelta / Math.abs(forecast)) * 100).toFixed(2)) : 0;

  let surpriseState: MacroSimulationResult['surpriseState'] = 'IN_LINE';
  if (Math.abs(rawDelta) > indicator.inLineTolerance) {
    surpriseState = rawDelta > 0 ? 'ABOVE_FORECAST' : 'BELOW_FORECAST';
  }

  if (surpriseState === 'IN_LINE') {
    return {
      indicator,
      forecast,
      actual,
      surpriseDelta,
      surprisePercent,
      surpriseState,
      dxyBias: 'NETRAL',
      rateExpectation: 'Sesuai ekspektasi pasar; kebijakan bank sentral tidak berubah signifikan.',
      mechanismChain: [
        `Data ${indicator.shortLabel} Aktual (${actual}${indicator.unit}) sesuai perkiraan (${forecast}${indicator.unit}).`,
        'Tidak ada kejutan baru terhadap ekspektasi suku bunga maupun DXY.',
        'Harga aset berisiko mengalami whipsaw (kocokan dua arah) sebelum kembali mengikuti tren teknikal utama.',
      ],
      easySummary:
        'Karena angka rilis sesuai dengan perkiraan pasar, berita ini sudah diantisipasi sebelumnya (priced-in). Fokuskan eksekusi pada struktur pola grafik teknikal dan hindari mengejar candle pertama.',
      assetImpacts: [
        {
          asset: 'XAUUSD',
          assetClass: 'XAUUSD',
          direction: 'NETRAL',
          horizon: 'Intraday',
          reason: 'Minim kejutan fundamental; ikuti level Support/Resistance teknikal.',
        },
        {
          asset: 'EURUSD / Forex',
          assetClass: 'Forex',
          direction: 'NETRAL',
          horizon: 'Intraday',
          reason: 'Rentan false breakout di awal rilis sebelum kembali ke struktur sesi.',
        },
        {
          asset: 'BTCUSDT',
          assetClass: 'Crypto',
          direction: 'NETRAL',
          horizon: 'Intraday',
          reason: 'Pergerakan cenderung mengikuti sentimen teknikal yang sudah berjalan.',
        },
        {
          asset: 'Saham IDX / US',
          assetClass: 'Saham',
          direction: 'NETRAL',
          horizon: 'Harian',
          reason: 'Tidak mengubah proyeksi biaya modal atau valuasi emiten secara mendadak.',
        },
      ],
    };
  }

  const isHigher = surpriseState === 'ABOVE_FORECAST';

  if (indicator.id === 'US_CPI') {
    if (isHigher) {
      return {
        indicator,
        forecast,
        actual,
        surpriseDelta,
        surprisePercent,
        surpriseState,
        dxyBias: 'BULLISH',
        rateExpectation: 'Ekspektasi Suku Bunga Naik / Ditahan Tinggi Lebih Lama (Hawkish)',
        mechanismChain: [
          `CPI Aktual (${actual}%) lebih tinggi dari perkiraan (${forecast}%), menandakan inflasi masih membandel.`,
          'Memicu dugaan bank sentral (The Fed) akan menaikkan atau menahan suku bunga tinggi lebih lama untuk meredam inflasi.',
          'Yield obligasi & DXY menguat → Emas (aset tanpa bunga) dan aset berisiko cenderung turun dalam jangka pendek.',
        ],
        easySummary:
          'CPI lebih tinggi dari perkiraan = Ekspektasi Suku Bunga Naik = DXY menguat, sehingga Emas (XAUUSD), Crypto, dan Saham Growth cenderung turun dalam jangka pendek.',
        assetImpacts: [
          {
            asset: 'XAUUSD',
            assetClass: 'XAUUSD',
            direction: 'BEARISH',
            horizon: 'Jangka Pendek',
            reason: 'Suku bunga tinggi meningkatkan biaya peluang memegang emas dan menguatkan DXY.',
          },
          {
            asset: 'EURUSD / GBPUSD',
            assetClass: 'Forex',
            direction: 'BEARISH',
            horizon: 'Intraday - H4',
            reason: 'Dolar AS menguat seiring lonjakan ekspektasi suku bunga AS.',
          },
          {
            asset: 'BTCUSDT',
            assetClass: 'Crypto',
            direction: 'BEARISH',
            horizon: 'Jangka Pendek',
            reason: 'Likuiditas mengetat saat pasar menunda harapan pemangkasan bunga.',
          },
          {
            asset: 'Saham Tech / IDX',
            assetClass: 'Saham',
            direction: 'BEARISH',
            horizon: 'Jangka Pendek',
            reason: 'Tekanan biaya bunga tinggi menekan valuasi saham pertumbuhan dan arus dana asing.',
          },
        ],
      };
    }

    return {
      indicator,
      forecast,
      actual,
      surpriseDelta,
      surprisePercent,
      surpriseState,
      dxyBias: 'BEARISH',
      rateExpectation: 'Ekspektasi Pemangkasan Suku Bunga Menguat (Dovish)',
      mechanismChain: [
        `CPI Aktual (${actual}%) lebih rendah dari perkiraan (${forecast}%), menandakan inflasi mendingin.`,
        'Memberi ruang bagi The Fed untuk menghentikan pengetatan atau memangkas suku bunga lebih cepat.',
        'DXY & Yield AS melemah → Emas, pair non-USD, Crypto, dan Saham terdorong naik.',
      ],
      easySummary:
        'CPI lebih rendah dari perkiraan = Tekanan suku bunga mereda = DXY turun, sehingga XAUUSD, EURUSD, Bitcoin, dan Saham cenderung naik.',
      assetImpacts: [
        {
          asset: 'XAUUSD',
          assetClass: 'XAUUSD',
          direction: 'BULLISH',
          horizon: 'Jangka Pendek - Menengah',
          reason: 'Pelemahan DXY dan turunnya yield riil mendorong minat beli emas.',
        },
        {
          asset: 'EURUSD / GBPUSD',
          assetClass: 'Forex',
          direction: 'BULLISH',
          horizon: 'Intraday - H4',
          reason: 'Tekanan jual pada DXY mengangkat mata uang utama lawan USD.',
        },
        {
          asset: 'BTCUSDT',
          assetClass: 'Crypto',
          direction: 'BULLISH',
          horizon: 'H4 - Daily',
          reason: 'Harapan pelonggaran likuiditas meningkatkan selera risiko (risk-on).',
        },
        {
          asset: 'Saham US & IDX',
          assetClass: 'Saham',
          direction: 'BULLISH',
          horizon: 'Daily',
          reason: 'Prospek bunga lebih rendah menurunkan beban utang emiten.',
        },
      ],
    };
  }

  if (indicator.id === 'DXY') {
    const impacts: MacroAssetImpact[] = isHigher
      ? [
          {
            asset: 'XAUUSD',
            assetClass: 'XAUUSD',
            direction: 'BEARISH',
            horizon: 'Intraday - Menengah',
            reason: 'Korelasi invers: DXY naik membuat harga emas lebih mahal secara global.',
          },
          {
            asset: 'EURUSD / GBPUSD',
            assetClass: 'Forex',
            direction: 'BEARISH',
            horizon: 'Intraday - H4',
            reason: 'Dolar AS mendominasi keranjang mata uang utama sehingga pair XXX/USD turun.',
          },
          {
            asset: 'BTCUSDT',
            assetClass: 'Crypto',
            direction: 'BEARISH',
            horizon: 'Jangka Pendek',
            reason: 'Penguatan Dolar sering memicu sikap defensif (risk-off) di aset kripto.',
          },
          {
            asset: 'Saham IDX / Emerging',
            assetClass: 'Saham',
            direction: 'BEARISH',
            horizon: 'Jangka Pendek',
            reason: 'DXY kuat menekan Rupiah dan berpotensi memicu arus keluar dana asing.',
          },
        ]
      : [
          {
            asset: 'XAUUSD',
            assetClass: 'XAUUSD',
            direction: 'BULLISH',
            horizon: 'Intraday - Menengah',
            reason: 'Korelasi invers: pelemahan DXY memberi ruang reli kuat pada XAUUSD.',
          },
          {
            asset: 'EURUSD / GBPUSD',
            assetClass: 'Forex',
            direction: 'BULLISH',
            horizon: 'Intraday - H4',
            reason: 'Pelemahan USD mengangkat pasangan mata uang utama berlawanan USD.',
          },
          {
            asset: 'BTCUSDT',
            assetClass: 'Crypto',
            direction: 'BULLISH',
            horizon: 'H4 - Daily',
            reason: 'USD melemah meningkatkan likuiditas aset berisiko dan kripto.',
          },
          {
            asset: 'Saham IDX / US',
            assetClass: 'Saham',
            direction: 'BULLISH',
            horizon: 'Daily',
            reason: 'Mengurangi tekanan nilai tukar sehingga arus modal masuk lebih lancar.',
          },
        ];

    return {
      indicator,
      forecast,
      actual,
      surpriseDelta,
      surprisePercent,
      surpriseState,
      dxyBias: isHigher ? 'BULLISH' : 'BEARISH',
      rateExpectation: isHigher
        ? 'Permintaan Dolar AS Menguat (Risk-Off / Yield Tinggi)'
        : 'Permintaan Dolar AS Melemah (Risk-On / Rotasi Aset)',
      mechanismChain: isHigher
        ? [
            `Indeks DXY naik ke ${actual} di atas acuan ${forecast}.`,
            'Dolar AS menjadi lebih kuat relatif terhadap mata uang utama dan komoditas.',
            'Aset berdenominasi USD seperti XAUUSD dan EURUSD cenderung tertekan turun.',
          ]
        : [
            `Indeks DXY turun ke ${actual} di bawah acuan ${forecast}.`,
            'Tekanan beli terhadap Dolar AS mereda dan modal mengalir ke aset non-USD.',
            'XAUUSD, pair mayor XXX/USD, serta aset risk-on cenderung menguat.',
          ],
      easySummary: isHigher
        ? 'Rumus klasik: DXY Naik ⇒ XAUUSD Turun. Selama indeks Dolar menguat, prioritaskan kewaspadaan pada posisi Buy Emas dan pair XXX/USD.'
        : 'Rumus klasik: DXY Turun ⇒ XAUUSD Naik. Pelemahan Dolar AS bertindak sebagai angin pendorong bagi kenaikan Emas, EURUSD, dan Bitcoin.',
      assetImpacts: impacts,
    };
  }

  if (indicator.id === 'US_NFP' || indicator.id === 'FED_RATE') {
    const bullishUsd = isHigher;
    return {
      indicator,
      forecast,
      actual,
      surpriseDelta,
      surprisePercent,
      surpriseState,
      dxyBias: bullishUsd ? 'BULLISH' : 'BEARISH',
      rateExpectation: bullishUsd
        ? 'Kebijakan Moneter Ketat / Suku Bunga Tinggi (Hawkish USD)'
        : 'Pelonggaran Moneter / Suku Bunga Melandai (Dovish USD)',
      mechanismChain: bullishUsd
        ? [
            `${indicator.shortLabel} Aktual (${actual}${indicator.unit}) di atas Forecast (${forecast}${indicator.unit}).`,
            'Menunjukkan tekanan kebijakan ketat / suku bunga tetap tinggi di AS.',
            'DXY menguat → XAUUSD, EURUSD, dan aset berisiko cenderung melemah.',
          ]
        : [
            `${indicator.shortLabel} Aktual (${actual}${indicator.unit}) di bawah Forecast (${forecast}${indicator.unit}).`,
            'Memperkuat peluang pelonggaran suku bunga oleh The Fed.',
            'DXY melemah → XAUUSD, Bitcoin, dan Saham cenderung menguat.',
          ],
      easySummary: bullishUsd
        ? `Rilis ${indicator.shortLabel} lebih tinggi dari perkiraan memperkuat DXY dan menekan XAUUSD serta pair lawan USD dalam jangka pendek.`
        : `Rilis ${indicator.shortLabel} lebih rendah dari perkiraan melemahkan DXY dan mendorong penguatan XAUUSD, Bitcoin, serta pasar saham.`,
      assetImpacts: [
        {
          asset: 'XAUUSD',
          assetClass: 'XAUUSD',
          direction: bullishUsd ? 'BEARISH' : 'BULLISH',
          horizon: 'Intraday - H4',
          reason: bullishUsd
            ? 'Penguatan USD dan yield menekan harga emas jangka pendek.'
            : 'Pelemahan USD dan turunnya yield mengangkat emas.',
        },
        {
          asset: 'EURUSD / GBPUSD',
          assetClass: 'Forex',
          direction: bullishUsd ? 'BEARISH' : 'BULLISH',
          horizon: 'Intraday',
          reason: bullishUsd ? 'USD menguat terhadap mata uang mayor.' : 'USD melemah terhadap mata uang mayor.',
        },
        {
          asset: 'BTCUSDT',
          assetClass: 'Crypto',
          direction: bullishUsd ? 'BEARISH' : 'BULLISH',
          horizon: 'H4 - Daily',
          reason: bullishUsd
            ? 'Sikap hawkish mengurangi arus likuiditas jangka pendek.'
            : 'Likuiditas yang lebih longgar mendorong reli aset kripto.',
        },
        {
          asset: 'Saham US & IDX',
          assetClass: 'Saham',
          direction: bullishUsd ? 'BEARISH' : 'BULLISH',
          horizon: 'Daily',
          reason: bullishUsd
            ? 'Suku bunga tinggi meningkatkan diskonto valuasi saham.'
            : 'Penurunan bunga menopang ekspansi laba dan valuasi pasar saham.',
        },
      ],
    };
  }

  // BI_RATE
  const biHike = isHigher;
  return {
    indicator,
    forecast,
    actual,
    surpriseDelta,
    surprisePercent,
    surpriseState,
    dxyBias: 'NETRAL',
    rateExpectation: biHike
      ? 'BI Mengetatkan Suku Bunga untuk Stabilitas Rupiah (Hawkish Domestik)'
      : 'BI Melonggarkan Suku Bunga untuk Mendorong Kredit & Pertumbuhan (Dovish)',
    mechanismChain: biHike
      ? [
          `BI Rate naik ke ${actual}% (di atas perkiraan ${forecast}%).`,
          'Imbal hasil aset Rupiah meningkat sehingga USDIDR cenderung tertahan/menguatkan Rupiah.',
          'Biaya dana emiten naik → Saham properti & sektor berutang tinggi tertekan jangka pendek.',
        ]
      : [
          `BI Rate turun ke ${actual}% (di bawah perkiraan ${forecast}%).`,
          'Biaya kredit konsumsi dan korporasi menjadi lebih murah.',
          'Mendorong optimisme pertumbuhan laba → Saham perbankan, properti, dan konsumer IDX cenderung naik.',
        ],
    easySummary: biHike
      ? 'Kenaikan BI Rate membantu menstabilkan Rupiah, namun biasanya menjadi tekanan jangka pendek bagi saham properti dan sektor sensitif bunga di IDX.'
      : 'Penurunan BI Rate memberi katalis positif (bullish) bagi IHSG, khususnya saham perbankan dan properti karena beban bunga kredit menurun.',
    assetImpacts: [
      {
        asset: 'Saham Properti & Konsumer IDX',
        assetClass: 'Saham',
        direction: biHike ? 'BEARISH' : 'BULLISH',
        horizon: 'Jangka Pendek - Menengah',
        reason: biHike
          ? 'Bunga KPR dan beban utang meningkat.'
          : 'Bunga KPR turun mendorong permintaan kredit dan penjualan.',
      },
      {
        asset: 'USDIDR (Kurs Rupiah)',
        assetClass: 'Forex',
        direction: biHike ? 'BEARISH' : 'BULLISH',
        horizon: 'Jangka Pendek',
        reason: biHike
          ? 'Suku bunga Rupiah lebih tinggi menarik arus modal menjaga IDR (USDIDR turun).'
          : 'Selisih bunga menyempit berisiko melemahkan IDR sementara.',
      },
      {
        asset: 'XAUUSD',
        assetClass: 'XAUUSD',
        direction: 'NETRAL',
        horizon: 'Global',
        reason: 'Harga emas global lebih ditentukan oleh DXY & kebijakan The Fed AS.',
      },
      {
        asset: 'BTCUSDT',
        assetClass: 'Crypto',
        direction: 'NETRAL',
        horizon: 'Global',
        reason: 'Pasar kripto global mengikuti likuiditas USD/global.',
      },
    ],
  };
}

export function evaluateRoleplayChoice(
  scenario: HistoricalNewsRoleplay,
  chosenAction: SignalDirection
): RoleplayAnswerRecord {
  return {
    scenarioId: scenario.id,
    chosenAction,
    isCorrect: chosenAction === scenario.correctAction,
    answeredAt: new Date().toISOString(),
  };
}

export function computeRoleplayStats(
  records: RoleplayAnswerRecord[],
  totalScenarios: number
): { completedCount: number; correctCount: number; accuracyPercent: number } {
  const uniqueByScenario = new Map<string, RoleplayAnswerRecord>();
  for (const r of records) {
    uniqueByScenario.set(r.scenarioId, r);
  }
  const completedCount = uniqueByScenario.size;
  const correctCount = Array.from(uniqueByScenario.values()).filter((r) => r.isCorrect).length;
  const accuracyPercent =
    completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;

  return {
    completedCount: Math.min(completedCount, totalScenarios),
    correctCount,
    accuracyPercent,
  };
}

export function validateCustomNewsInput(newsText: string): { valid: boolean; error?: string } {
  const trimmed = newsText.trim();
  if (trimmed.length < 15) {
    return {
      valid: false,
      error: 'Masukkan teks berita atau angka data ekonomi minimal 15 karakter agar dapat dianalisis.',
    };
  }
  return { valid: true };
}
