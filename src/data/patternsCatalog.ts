import type { PatternCatalogItem } from '../types/scanner';

export const PATTERNS_CATALOG: PatternCatalogItem[] = [
  {
    id: 'hs-bearish',
    name: 'Head and Shoulders (H&S)',
    category: 'Reversal',
    bias: 'BEARISH',
    reliability: '82% – 89%',
    description:
      'Pola pembalikan tren naik menjadi turun dengan tiga puncak: Left Shoulder, Head (tertinggi), dan Right Shoulder di sepanjang garis Neckline.',
    validationChecklist: [
      'Didahului tren naik (uptrend) yang jelas sebelum Left Shoulder terbentuk.',
      'Head menembus puncak Left Shoulder dengan volume cenderung melemah pada Right Shoulder.',
      'Konfirmasi valid terjadi saat candle close menembus Neckline disertai peningkatan volume.',
    ],
    volumeSignature: 'Volume menurun dari Left Shoulder ke Head & Right Shoulder, lalu melonjak saat breakdown Neckline.',
    measuredMoveRule: 'Jarak vertikal dari puncak Head ke Neckline diproyeksikan ke bawah dari titik breakdown.',
    smcConfluenceTip: 'Sering bertepatan dengan Liquidity Sweep di atas swing high atau CHoCH bearish di Right Shoulder.',
    svgPath: {
      pricePoints: [
        [10, 78], [26, 42], [38, 66], [52, 16], [66, 67], [78, 43], [90, 86],
      ],
      structureLines: [
        { x1: 22, y1: 66, x2: 86, y2: 67, dashed: false },
        { x1: 52, y1: 16, x2: 52, y2: 66, dashed: true },
      ],
      breakoutTarget: [90, 86],
    },
    sampleInput: {
      ticker: 'EURUSD',
      assetClass: 'Forex',
      timeframe: 'H4',
      priceText:
        'EURUSD H4 membentuk Head and Shoulders setelah reli dari 1.0620. Left Shoulder 1.0890, Head 1.0965, Right Shoulder 1.0880. Neckline horizontal di 1.0810 baru saja ditembus candle close H4 bearish.',
    },
  },
  {
    id: 'ihs-bullish',
    name: 'Inverse Head and Shoulders',
    category: 'Reversal',
    bias: 'BULLISH',
    reliability: '83% – 90%',
    description:
      'Pola pembalikan tren turun menjadi naik dengan tiga lembah: Left Shoulder, Head (terdalam), dan Right Shoulder menuju penembusan Neckline.',
    validationChecklist: [
      'Terbentuk di akhir fase downtrend atau di area Higher-Timeframe Demand.',
      'Right Shoulder membentuk Higher Low yang menunjukkan pelemahan tekanan jual.',
      'Breakout Neckline dengan body candle penuh menandakan pergeseran struktur bullish.',
    ],
    volumeSignature: 'Lonjakan volume beli terlihat saat reli dari Head dan konfirmasi breakout Neckline.',
    measuredMoveRule: 'Tinggi dari dasar Head ke Neckline diproyeksikan ke atas dari titik breakout Neckline.',
    smcConfluenceTip: 'Head sering berupa Liquidity Sweep di bawah Equal Lows sebelum Break of Structure (BOS) ke atas.',
    svgPath: {
      pricePoints: [
        [10, 22], [26, 58], [38, 34], [52, 84], [66, 33], [78, 56], [90, 14],
      ],
      structureLines: [
        { x1: 22, y1: 34, x2: 86, y2: 33, dashed: false },
        { x1: 52, y1: 84, x2: 52, y2: 34, dashed: true },
      ],
      breakoutTarget: [90, 14],
    },
    sampleInput: {
      ticker: 'XAUUSD',
      assetClass: 'XAUUSD',
      timeframe: 'H4',
      priceText:
        'XAUUSD H4 membentuk Inverse H&S: Left Shoulder 2630, Head menyapu likuiditas ke 2608 (wick panjang), Right Shoulder bertahan di 2628. Neckline 2652 baru ditembus close H4.',
    },
  },
  {
    id: 'double-top-bottom',
    name: 'Double Top (M) & Double Bottom (W)',
    category: 'Reversal',
    bias: 'NETRAL',
    reliability: '76% – 84%',
    description:
      'Dua pengujian level puncak atau lembah yang sejajar sebelum harga menembus Neckline sebagai konfirmasi pembalikan.',
    validationChecklist: [
      'Dua puncak (M) atau lembah (W) berada pada zona harga yang relatif setara (toleransi 0.5%–1.5%).',
      'Terdapat reaksi penolakan (rejection wick atau engulfing) pada pengujian kedua.',
      'Belum valid sebelum Neckline di antara dua ekstrem benar-benar tertembus.',
    ],
    volumeSignature: 'Volume puncak/lembah kedua lebih rendah dibanding pertama (divergensi momentum), lalu meningkat saat break Neckline.',
    measuredMoveRule: 'Jarak dari puncak/lembah ke Neckline diproyeksikan searah breakout.',
    smcConfluenceTip: 'Pengujian kedua sering melakukan stop hunt tipis (Equal Highs/Lows sweep) sebelum berbalik arah.',
    svgPath: {
      pricePoints: [
        [10, 78], [30, 22], [50, 56], [70, 24], [90, 82],
      ],
      structureLines: [
        { x1: 20, y1: 23, x2: 78, y2: 23, dashed: true },
        { x1: 22, y1: 56, x2: 88, y2: 56, dashed: false },
      ],
      breakoutTarget: [90, 82],
    },
    sampleInput: {
      ticker: 'GBPUSD',
      assetClass: 'Forex',
      timeframe: 'H1',
      priceText:
        'GBPUSD H1 membentuk Double Top di area resistance 1.2780 (puncak 1: 1.2782, puncak 2: 1.2779 dengan bearish pinbar). Neckline berada di 1.2715.',
    },
  },
  {
    id: 'triple-top-bottom',
    name: 'Triple Top & Triple Bottom',
    category: 'Reversal',
    bias: 'NETRAL',
    reliability: '79% – 86%',
    description:
      'Tiga pengujian berulang pada area support atau resistance horizontal yang kuat sebelum terjadi penembusan struktural.',
    validationChecklist: [
      'Tiga ayunan harga tertahan di area horizontal yang sama tanpa mampu mencetak close di luar zona.',
      'Rentang konsolidasi cukup simetris dengan penolakan berulang.',
      'Validasi akhir membutuhkan penembusan neckline berlawanan dengan momentum kuat.',
    ],
    volumeSignature: 'Volume menyusut di tiap pengujian ulang dan meledak ketika level kunci ditembus.',
    measuredMoveRule: 'Tinggi rentang antara batas horizontal dan neckline diproyeksikan dari level breakout.',
    smcConfluenceTip: 'Sering menunjukkan penyerapan likuiditas institusional (absorption) sebelum ekspansi besar.',
    svgPath: {
      pricePoints: [
        [10, 74], [24, 26], [38, 58], [52, 27], [66, 57], [78, 28], [92, 84],
      ],
      structureLines: [
        { x1: 18, y1: 26, x2: 84, y2: 27, dashed: true },
        { x1: 22, y1: 58, x2: 90, y2: 58, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'BBRI',
      assetClass: 'Saham',
      timeframe: 'Daily',
      priceText:
        'BBRI Daily memantul 3 kali dari area support kuat 4.520 (Triple Bottom) dengan volume mengecil di pengujian ketiga. Resistance neckline berada di 4.840.',
    },
  },
  {
    id: 'wedges',
    name: 'Rising Wedge & Falling Wedge',
    category: 'Reversal',
    bias: 'NETRAL',
    reliability: '78% – 85%',
    description:
      'Saluran harga menyempit dan miring searah (naik untuk Rising Wedge bearish; turun untuk Falling Wedge bullish) menandakan kelelahan momentum.',
    validationChecklist: [
      'Minimal 2 titik sentuh pada garis tren atas dan 2 titik sentuh pada garis tren bawah yang konvergen.',
      'Rentang candle dan volatilitas makin menyempit menuju ujung (apex).',
      'Divergensi RSI/MACD memperkuat probabilitas pembalikan arah.',
    ],
    volumeSignature: 'Volume terus menurun selama harga bergerak di dalam wedge, lalu melonjak saat breakout berlawanan arah.',
    measuredMoveRule: 'Target konservatif di tengah pola; target penuh mengarah ke pangkal awal terbentuknya wedge.',
    smcConfluenceTip: 'Wedge yang miring sering bertindak sebagai pembentuk likuiditas trendline (trendline liquidity) sebelum sweep.',
    svgPath: {
      pricePoints: [
        [10, 22], [28, 56], [42, 34], [58, 66], [70, 48], [88, 18],
      ],
      structureLines: [
        { x1: 12, y1: 22, x2: 78, y2: 50, dashed: false },
        { x1: 24, y1: 56, x2: 78, y2: 68, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'SOLUSDT',
      assetClass: 'Crypto',
      timeframe: 'H4',
      priceText:
        'SOLUSDT H4 membentuk Falling Wedge setelah koreksi dari 210 ke 172. Upper resistance turun di 184, lower support di 174 dengan bullish divergence RSI.',
    },
  },
  {
    id: 'rounding-saucer',
    name: 'Rounding Top & Rounding Bottom (Saucer)',
    category: 'Reversal',
    bias: 'NETRAL',
    reliability: '75% – 82%',
    description:
      'Transisi tren secara bertahap membentuk lengkungan U atau U-terbalik yang mencerminkan akumulasi atau distribusi perlahan.',
    validationChecklist: [
      'Terbentuk dalam durasi waktu panjang (umumnya timeframe Daily/Weekly).',
      'Volatilitas menyempit di dasar lengkungan sebelum secara bertahap membentuk Higher Lows.',
      'Konfirmasi breakout terjadi ketika harga menembus bibir lengkungan (rim resistance).',
    ],
    volumeSignature: 'Pola volume menyerupai huruf U: tinggi di kiri, sangat rendah di dasar, lalu menanjak tajam di sisi kanan.',
    measuredMoveRule: 'Kedalaman dasar lengkungan ke garis rim diproyeksikan keluar dari titik breakout.',
    smcConfluenceTip: 'Sisi dasar saucer sering berisi rangkaian Order Block akumulasi berjangka panjang.',
    svgPath: {
      pricePoints: [
        [10, 26], [24, 52], [40, 72], [56, 76], [72, 54], [86, 28], [94, 14],
      ],
      structureLines: [
        { x1: 10, y1: 27, x2: 92, y2: 27, dashed: true },
      ],
    },
    sampleInput: {
      ticker: 'TLKM',
      assetClass: 'Saham',
      timeframe: 'Daily',
      priceText:
        'TLKM Daily membentuk Rounding Bottom selama 3 bulan di dasar 2.680 – 2.750 dan kini mendekati rim resistance di 3.050 dengan volume akumulasi meningkat.',
    },
  },
  {
    id: 'flag-bull-bear',
    name: 'Bullish Flag & Bearish Flag',
    category: 'Continuation',
    bias: 'NETRAL',
    reliability: '80% – 88%',
    description:
      'Pola penerusan tren berprobabilitas tinggi: dorongan impulsif tajam (Flagpole) diikuti saluran konsolidasi miring berlawanan arah.',
    validationChecklist: [
      'Flagpole harus berupa pergerakan impulsif cepat dengan candle berbadan besar.',
      'Saluran konsolidasi (Flag) tidak boleh mengoreksi lebih dari 38.2%–50% tinggi Flagpole.',
      'Breakout searah tren awal mengonfirmasi kelanjutan momentum.',
    ],
    volumeSignature: 'Volume tinggi pada Flagpole, menyusut signifikan selama saluran Flag, lalu meledak saat breakout.',
    measuredMoveRule: 'Panjang penuh Flagpole diukur dan diproyeksikan dari titik breakout saluran Flag.',
    smcConfluenceTip: 'Area konsolidasi Flag sering mengisi Fair Value Gap (FVG) dari reli Flagpole sebelum melanjutkan tren.',
    svgPath: {
      pricePoints: [
        [12, 84], [32, 24], [44, 42], [54, 30], [64, 48], [72, 36], [90, 12],
      ],
      structureLines: [
        { x1: 32, y1: 24, x2: 76, y2: 38, dashed: false },
        { x1: 42, y1: 42, x2: 76, y2: 52, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'NVDA',
      assetClass: 'Saham',
      timeframe: 'Daily',
      priceText:
        'NVDA Daily reli impulsif dari 118 ke 144 (Flagpole), lalu berkonsolidasi dalam saluran miring turun Bullish Flag antara 137 – 142 dengan volume mengecil.',
    },
  },
  {
    id: 'pennant',
    name: 'Bullish & Bearish Pennant',
    category: 'Continuation',
    bias: 'NETRAL',
    reliability: '77% – 84%',
    description:
      'Tiang impulsif (Flagpole) diikuti konsolidasi segitiga simetris kecil berdurasi singkat sebelum ekspansi lanjutan.',
    validationChecklist: [
      'Durasi konsolidasi relatif singkat (biasanya 5–15 candle) dibanding Flag.',
      'Garis tren atas dan bawah konvergen cepat membentuk segitiga kecil.',
      'Breakout terjadi sebelum harga mencapai 75% panjang menuju apex.',
    ],
    volumeSignature: 'Volume mengerucut drastis di dalam Pennant dan melonjak saat penembusan batas.',
    measuredMoveRule: 'Proyeksi tinggi Flagpole dari titik breakout Pennant.',
    smcConfluenceTip: 'Sering terjadi pasca rilis berita makro atau setelah Break of Structure kuat.',
    svgPath: {
      pricePoints: [
        [14, 84], [34, 22], [46, 42], [56, 28], [66, 38], [72, 33], [90, 14],
      ],
      structureLines: [
        { x1: 34, y1: 22, x2: 76, y2: 34, dashed: false },
        { x1: 44, y1: 44, x2: 76, y2: 34, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'BTCUSDT',
      assetClass: 'Crypto',
      timeframe: 'H4',
      priceText:
        'BTCUSDT H4 melonjak dari 84.200 ke 91.800 lalu membentuk Bullish Pennant ketat di 89.600 – 91.200 selama 10 candle dengan volume menyusut.',
    },
  },
  {
    id: 'asc-desc-triangle',
    name: 'Ascending & Descending Triangle',
    category: 'Continuation',
    bias: 'NETRAL',
    reliability: '79% – 86%',
    description:
      'Ascending Triangle (bullish) memiliki resistance horizontal datar dan higher lows; Descending Triangle (bearish) memiliki support datar dan lower highs.',
    validationChecklist: [
      'Minimal 2 sentuhan pada batas horizontal datar dan 2 ayunan pada garis tren miring.',
      'Kompresi harga menunjukkan akumulasi tekanan beli (Ascending) atau distribusi jual (Descending).',
      'Tunggu penutupan candle penuh di luar garis horizontal.',
    ],
    volumeSignature: 'Volume menyusut di dalam segitiga dan meningkat tajam pada candle breakout.',
    measuredMoveRule: 'Tinggi pangkal terlebar segitiga diproyeksikan dari batas horizontal.',
    smcConfluenceTip: 'Batas horizontal menyimpan kumpulan stop-order (Equal Highs/Lows) yang memicu akselerasi breakout.',
    svgPath: {
      pricePoints: [
        [12, 76], [28, 26], [42, 62], [56, 26], [68, 46], [78, 26], [90, 10],
      ],
      structureLines: [
        { x1: 20, y1: 26, x2: 88, y2: 26, dashed: false },
        { x1: 12, y1: 76, x2: 82, y2: 28, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'XAUUSD',
      assetClass: 'XAUUSD',
      timeframe: 'H1',
      priceText:
        'XAUUSD H1 membentuk Ascending Triangle: resistance horizontal 2665 diuji 3 kali, sementara higher lows naik dari 2638 ke 2649 dan 2656.',
    },
  },
  {
    id: 'symmetrical-triangle',
    name: 'Symmetrical Triangle',
    category: 'Continuation',
    bias: 'NETRAL',
    reliability: '75% – 83%',
    description:
      'Konsolidasi harga dengan puncak yang makin rendah (Lower Highs) dan lembah yang makin tinggi (Higher Lows) menuju titik temu (Apex).',
    validationChecklist: [
      'Minimal 4 titik sentuh (2 di resistance menurun, 2 di support menanjak).',
      'Breakout ideal terjadi antara 50%–75% jarak menuju apex.',
      'Arah breakout mengikuti penutupan candle dan lonjakan volume.',
    ],
    volumeSignature: 'Kompresi volume konsisten di dalam apex; ekspansi volume krusial untuk membedakan breakout asli vs fakeout.',
    measuredMoveRule: 'Tinggi mulut terlebar segitiga diukur dan diproyeksikan dari level breakout.',
    smcConfluenceTip: 'Sering terjadi false break di satu sisi (liquidity sweep) sebelum ekspansi besar ke arah berlawanan.',
    svgPath: {
      pricePoints: [
        [12, 22], [26, 76], [42, 32], [56, 64], [70, 42], [90, 18],
      ],
      structureLines: [
        { x1: 12, y1: 22, x2: 84, y2: 50, dashed: false },
        { x1: 24, y1: 76, x2: 84, y2: 50, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'BTCUSDT',
      assetClass: 'Crypto',
      timeframe: 'Daily',
      priceText:
        'BTCUSDT Daily berada di ujung Symmetrical Triangle (70% menuju apex). Lower high di 92.400, higher low di 88.900, volume menyusut drastis.',
    },
  },
  {
    id: 'cup-handle',
    name: 'Cup and Handle & Inverted Cup',
    category: 'Continuation',
    bias: 'BULLISH',
    reliability: '82% – 89%',
    description:
      'Pola kelanjutan tren dengan dasar melengkung U (Cup) diikuti koreksi dangkal miring turun/datar (Handle) di dekat resistance rim.',
    validationChecklist: [
      'Dasar Cup berbentuk membulat (bukan V tajam), menandakan akumulasi sehat.',
      'Koreksi Handle tidak lebih dalam dari 1/3 tinggi Cup (idealnya di atas area tengah Cup).',
      'Breakout di atas rim resistance dengan volume spike mengonfirmasi sinyal beli institusional.',
    ],
    volumeSignature: 'Volume menurun di dasar Cup dan selama Handle, lalu melonjak >= 1.5x rata-rata saat breakout rim.',
    measuredMoveRule: 'Kedalaman Cup dari rim ke dasar diproyeksikan ke atas dari level rim resistance.',
    smcConfluenceTip: 'Handle kerap membentuk Bullish Flag kecil atau retest Fair Value Gap sebelum breakout.',
    svgPath: {
      pricePoints: [
        [10, 26], [24, 62], [40, 74], [56, 60], [68, 28], [76, 40], [82, 32], [94, 10],
      ],
      structureLines: [
        { x1: 10, y1: 27, x2: 92, y2: 27, dashed: true },
        { x1: 68, y1: 28, x2: 84, y2: 34, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'BBCA',
      assetClass: 'Saham',
      timeframe: 'Daily',
      priceText:
        'BBCA Daily membentuk Cup and Handle: rim resistance 10.350, dasar Cup di 9.650, Handle berkonsolidasi dangkal di 10.125 – 10.300 dengan volume menyusut.',
    },
  },
  {
    id: 'rectangle-box',
    name: 'Rectangle Consolidation Box',
    category: 'Continuation',
    bias: 'NETRAL',
    reliability: '74% – 81%',
    description:
      'Rentang sideways terstruktur antara batas atas (Resistance) dan batas bawah (Support) paralel sebelum kelanjutan atau pembalikan tren.',
    validationChecklist: [
      'Minimal dua kali pengujian bersih di batas atas dan batas bawah.',
      'Harga bergerak horizontal tanpa membentuk struktur tren baru.',
      'Eksekusi hanya setelah penutupan candle di luar batas kotak atau mean-reversion terukur.',
    ],
    volumeSignature: 'Volume datar di dalam kotak; spike volume menandakan breakout valid.',
    measuredMoveRule: 'Tinggi rentang kotak (Resistance - Support) diproyeksikan keluar dari batas breakout.',
    smcConfluenceTip: 'Batas atas dan bawah kotak merupakan kumpulan likuiditas (BSL/SSL) yang rawan sweep.',
    svgPath: {
      pricePoints: [
        [10, 72], [24, 32], [38, 68], [52, 32], [66, 68], [78, 32], [92, 14],
      ],
      structureLines: [
        { x1: 18, y1: 32, x2: 88, y2: 32, dashed: false },
        { x1: 18, y1: 68, x2: 88, y2: 68, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'USDJPY',
      assetClass: 'Forex',
      timeframe: 'H4',
      priceText:
        'USDJPY H4 bergerak sideways di dalam Rectangle Box antara support 152.20 dan resistance 154.60 selama 2 minggu.',
    },
  },
  {
    id: 'harmonic-xabcd',
    name: 'Harmonic Patterns (Gartley, Bat, Butterfly, Crab, Shark, Cypher)',
    category: 'Harmonic & SMC',
    bias: 'NETRAL',
    reliability: '80% – 88%',
    description:
      'Struktur geometri lima titik (X-A-B-C-D) berbasis rasio Fibonacci presisi yang menentukan Potential Reversal Zone (PRZ) pada titik D.',
    validationChecklist: [
      'Gartley: B di 0.618 XA, D di 0.786 XA. Bat: B di 0.382–0.50 XA, D di 0.886 XA.',
      'Butterfly: D ekstensi 1.272–1.618 XA. Crab: D ekstensi 1.618 XA.',
      'Shark & Cypher: Menggunakan proyeksi BC dan ekstensi XC (0.786 XC untuk Cypher) dengan konfirmasi candlestick di PRZ.',
    ],
    volumeSignature: 'Klimaks volume atau absorption wick sering muncul tepat di zona PRZ titik D.',
    measuredMoveRule: 'TP1 di 0.382 AD dan TP2 di 0.618 AD (diukur dari titik A ke D).',
    smcConfluenceTip: 'PRZ Harmonic yang sejajar dengan Higher-Timeframe Order Block memiliki rasio R:R tertinggi.',
    svgPath: {
      pricePoints: [
        [10, 82], [28, 18], [46, 56], [64, 28], [80, 74], [92, 38],
      ],
      structureLines: [
        { x1: 10, y1: 82, x2: 46, y2: 56, dashed: true },
        { x1: 28, y1: 18, x2: 64, y2: 28, dashed: true },
        { x1: 10, y1: 82, x2: 80, y2: 74, dashed: true },
      ],
    },
    sampleInput: {
      ticker: 'EURUSD',
      assetClass: 'Forex',
      timeframe: 'H4',
      priceText:
        'EURUSD H4 membentuk Bullish Gartley XABCD: X=1.0600, A=1.0900, B=1.0715 (0.618 XA), C=1.0840, dan harga kini memasuki PRZ D=1.0664 (0.786 XA).',
    },
  },
  {
    id: 'broadening-megaphone',
    name: 'Broadening Formation (Megaphone)',
    category: 'Harmonic & SMC',
    bias: 'NETRAL',
    reliability: '71% – 79%',
    description:
      'Formasi volatilitas melebar dengan Higher Highs dan Lower Lows yang menyebar keluar menyerupai corong megafon.',
    validationChecklist: [
      'Garis tren atas miring ke atas dan garis tren bawah miring ke bawah (divergen).',
      'Mencerminkan ketidakpastian pasar ekstrem dan perburuan likuiditas di kedua sisi.',
      'Entry dilakukan saat penolakan di batas luar atau breakout terkonfirmasi.',
    ],
    volumeSignature: 'Volatilitas dan volume melonjak acak di tiap ayunan ekstrem.',
    measuredMoveRule: 'Lebar terbesar mulut megafon digunakan sebagai batas risiko/target swing.',
    smcConfluenceTip: 'Setiap puncak/lembah baru dalam megafon merupakan Liquidity Sweep eksternal.',
    svgPath: {
      pricePoints: [
        [14, 44], [28, 58], [42, 34], [58, 70], [74, 22], [90, 78],
      ],
      structureLines: [
        { x1: 14, y1: 44, x2: 86, y2: 18, dashed: false },
        { x1: 14, y1: 52, x2: 86, y2: 80, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'XAUUSD',
      assetClass: 'XAUUSD',
      timeframe: 'H4',
      priceText:
        'XAUUSD H4 membentuk Broadening Megaphone dengan swing melebar: H1 2645, L1 2620, H2 2668, L2 2605, dan kini menguji batas atas di 2688.',
    },
  },
  {
    id: 'smc-ob-fvg',
    name: 'Smart Money Concepts (OB, FVG, BOS, CHoCH, Liquidity Sweep)',
    category: 'Harmonic & SMC',
    bias: 'NETRAL',
    reliability: '81% – 89%',
    description:
      'Kerangka aksi harga institusional yang melacak jejak likuiditas: Change of Character (CHoCH), Break of Structure (BOS), Order Block (OB), dan Fair Value Gap (FVG).',
    validationChecklist: [
      'Liquidity Sweep: Wick menyapu swing high/low sebelumnya lalu kembali ditutup di dalam rentang.',
      'CHoCH / BOS: Pergeseran struktur pasar dengan candle body close yang meyakinkan.',
      'Area Entry presisi saat harga melakukan mitigasi kembali ke Order Block atau FVG.',
    ],
    volumeSignature: 'Displacement impulsif yang menciptakan FVG selalu disertai lonjakan volume institusional.',
    measuredMoveRule: 'Target diarahkan ke External Range Liquidity (swing high/low utama berlawanan).',
    smcConfluenceTip: 'Kombinasikan pola klasik (seperti Double Bottom/IHS) dengan mitigasi OB/FVG untuk R:R di atas 1:3.',
    svgPath: {
      pricePoints: [
        [10, 40], [22, 62], [36, 48], [48, 76], [62, 30], [74, 54], [92, 16],
      ],
      structureLines: [
        { x1: 18, y1: 62, x2: 54, y2: 62, dashed: true },
        { x1: 32, y1: 48, x2: 84, y2: 48, dashed: false },
      ],
    },
    sampleInput: {
      ticker: 'XAUUSD',
      assetClass: 'XAUUSD',
      timeframe: 'M15',
      priceText:
        'XAUUSD M15 menyapu Asian Low di 2632 (Liquidity Sweep), lalu melakukan displacement naik menembus swing high 2641 (CHoCH) dan meninggalkan FVG + Bullish Order Block di 2635 – 2637.',
    },
  },
];
