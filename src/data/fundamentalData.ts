import type {
  FundamentalFormulaRule,
  HistoricalNewsRoleplay,
  MacroIndicatorMeta,
} from '../types/fundamental';

export const MACRO_INDICATORS: MacroIndicatorMeta[] = [
  {
    id: 'US_CPI',
    name: 'US CPI (Inflasi Konsumen YoY)',
    shortLabel: 'US CPI',
    unit: '%',
    defaultForecast: 3.1,
    defaultActual: 3.5,
    inLineTolerance: 0.05,
    quickScenarios: [
      { label: 'CPI Lebih Panas (+0.4%)', forecast: 3.1, actual: 3.5 },
      { label: 'CPI Sesuai Perkiraan', forecast: 3.1, actual: 3.1 },
      { label: 'CPI Melandai (-0.3%)', forecast: 3.1, actual: 2.8 },
    ],
  },
  {
    id: 'DXY',
    name: 'DXY (Indeks Dolar AS)',
    shortLabel: 'DXY',
    unit: 'pts',
    defaultForecast: 104.2,
    defaultActual: 105.6,
    inLineTolerance: 0.15,
    quickScenarios: [
      { label: 'DXY Breakout Naik', forecast: 104.2, actual: 105.6 },
      { label: 'DXY Datar / Konsolidasi', forecast: 104.2, actual: 104.25 },
      { label: 'DXY Melemah Turun', forecast: 104.2, actual: 102.9 },
    ],
  },
  {
    id: 'US_NFP',
    name: 'US Non-Farm Payrolls (NFP)',
    shortLabel: 'US NFP',
    unit: 'K',
    defaultForecast: 185,
    defaultActual: 275,
    inLineTolerance: 15,
    quickScenarios: [
      { label: 'NFP Panas (+90K)', forecast: 185, actual: 275 },
      { label: 'NFP Sesuai Forecast', forecast: 185, actual: 190 },
      { label: 'NFP Lemah (-75K)', forecast: 185, actual: 110 },
    ],
  },
  {
    id: 'FED_RATE',
    name: 'The Fed Interest Rate (FOMC)',
    shortLabel: 'Fed Rate',
    unit: '%',
    defaultForecast: 5.25,
    defaultActual: 4.75,
    inLineTolerance: 0.05,
    quickScenarios: [
      { label: 'Kejutan Naik (+25 bps)', forecast: 5.25, actual: 5.5 },
      { label: 'Suku Bunga Tetap', forecast: 5.25, actual: 5.25 },
      { label: 'Pemangkasan Dovish (-50 bps)', forecast: 5.25, actual: 4.75 },
    ],
  },
  {
    id: 'BI_RATE',
    name: 'BI-Rate (Bank Indonesia)',
    shortLabel: 'BI Rate',
    unit: '%',
    defaultForecast: 6.0,
    defaultActual: 6.25,
    inLineTolerance: 0.05,
    quickScenarios: [
      { label: 'BI Rate Naik (+25 bps)', forecast: 6.0, actual: 6.25 },
      { label: 'BI Rate Tetap', forecast: 6.0, actual: 6.0 },
      { label: 'BI Rate Turun (-25 bps)', forecast: 6.0, actual: 5.75 },
    ],
  },
];

export const FUNDAMENTAL_FORMULAS: FundamentalFormulaRule[] = [
  {
    id: 'rule-dxy-xauusd',
    title: 'Korelasi Invers DXY vs XAUUSD (Gold)',
    triggerCondition: 'DXY Naik Kuat / Breakout Resistance',
    formulaEquation: 'DXY ↑  ⇒  USD Mahal  ⇒  XAUUSD ↓  &  EURUSD ↓',
    primaryMechanism:
      'Emas diperdagangkan dalam Dolar AS. Ketika Indeks DXY menguat, harga emas menjadi relatif lebih mahal bagi pemegang mata uang non-USD sehingga permintaan jangka pendek tertekan.',
    assetImpacts: [
      { asset: 'XAUUSD', assetClass: 'XAUUSD', direction: 'BEARISH', horizon: 'Jangka Pendek - Menengah' },
      { asset: 'EURUSD / GBPUSD', assetClass: 'Forex', direction: 'BEARISH', horizon: 'Intraday - H4' },
      { asset: 'USDJPY', assetClass: 'Forex', direction: 'BULLISH', horizon: 'Intraday - H4' },
    ],
    easySummary:
      'Aturan paling dasar: DXY dan XAUUSD bergerak berlawanan arah seperti jungkat-jungkit. Jika DXY melonjak menembus resistance, hindari memaksakan Buy di Emas sebelum tekanan DXY mereda.',
    cautionNote:
      'Pengecualian krisis geopolitik ekstrem (perang/krisis bank): DXY dan XAUUSD terkadang bisa naik bersamaan karena keduanya diburu sebagai safe-haven.',
  },
  {
    id: 'rule-cpi-gold',
    title: 'Inflasi US CPI Lebih Tinggi dari Perkiraan',
    triggerCondition: 'US CPI Actual > Forecast (Inflasi Memanas)',
    formulaEquation: 'CPI ↑ (> Forecast)  ⇒  Ekspektasi Suku Bunga ↑  ⇒  DXY ↑  ⇒  Emas ↓ (Jangka Pendek)',
    primaryMechanism:
      'CPI yang lebih tinggi dari perkiraan memicu dugaan bank sentral (seperti The Fed) akan menaikkan atau mempertahankan suku bunga tinggi lebih lama (higher for longer) untuk meredam inflasi.',
    assetImpacts: [
      { asset: 'XAUUSD', assetClass: 'XAUUSD', direction: 'BEARISH', horizon: 'Jangka Pendek (Rilis - H4)' },
      { asset: 'BTCUSDT & Nasdaq', assetClass: 'Crypto', direction: 'BEARISH', horizon: 'Jangka Pendek' },
      { asset: 'DXY / Yield US10Y', assetClass: 'Forex', direction: 'BULLISH', horizon: 'Jangka Pendek - Menengah' },
    ],
    easySummary:
      'Emas tidak memberikan bunga (non-yielding asset). Jadi saat inflasi tinggi membuat The Fed menahan suku bunga tinggi, investor lebih memilih obligasi/USD yang berbunga, sehingga Emas cenderung turun dalam jangka pendek.',
    cautionNote:
      'Dalam jangka panjang, jika inflasi tak terkendali dan memicu resesi (stagflasi), Emas justru bisa kembali diburu sebagai pelindung nilai.',
  },
  {
    id: 'rule-cpi-cool',
    title: 'Inflasi US CPI Lebih Rendah dari Perkiraan',
    triggerCondition: 'US CPI Actual < Forecast (Inflasi Melandai)',
    formulaEquation: 'CPI ↓ (< Forecast)  ⇒  Peluang Cut Rate ↑  ⇒  DXY ↓  ⇒  XAUUSD ↑ & BTC ↑',
    primaryMechanism:
      'Inflasi yang melandai memberi ruang bagi The Fed untuk melonggarkan kebijakan moneter dan memangkas suku bunga, menurunkan imbal hasil obligasi AS serta melemahkan USD.',
    assetImpacts: [
      { asset: 'XAUUSD', assetClass: 'XAUUSD', direction: 'BULLISH', horizon: 'Intraday - Swing' },
      { asset: 'BTCUSDT', assetClass: 'Crypto', direction: 'BULLISH', horizon: 'H4 - Daily' },
      { asset: 'EURUSD / Saham Growth', assetClass: 'Forex', direction: 'BULLISH', horizon: 'Intraday - Daily' },
    ],
    easySummary:
      'Inflasi turun berarti beban suku bunga segera berkurang. Likuiditas kembali mengalir ke aset berisiko (Crypto & Saham) serta mendorong XAUUSD naik.',
    cautionNote:
      'Perhatikan Core CPI (tanpa energi & pangan) karena The Fed sering menilai Core CPI lebih akurat daripada angka headline.',
  },
  {
    id: 'rule-nfp-forex',
    title: 'Tenaga Kerja US NFP Jauh di Atas Forecast',
    triggerCondition: 'NFP Actual >> Forecast & Pengangguran Stabil/Turun',
    formulaEquation: 'NFP ↑↑  ⇒  Ekonomi AS Panas  ⇒  The Fed Hawkish  ⇒  USD ↑  ⇒  EURUSD ↓ & XAUUSD ↓',
    primaryMechanism:
      'Pasar tenaga kerja yang sangat kuat memberi kepercayaan diri bagi bank sentral AS untuk menunda pemotongan suku bunga karena daya beli masih tinggi.',
    assetImpacts: [
      { asset: 'EURUSD / GBPUSD', assetClass: 'Forex', direction: 'BEARISH', horizon: 'Intraday (Sesi NY)' },
      { asset: 'XAUUSD', assetClass: 'XAUUSD', direction: 'BEARISH', horizon: 'Intraday' },
      { asset: 'USDJPY', assetClass: 'Forex', direction: 'BULLISH', horizon: 'Intraday' },
    ],
    easySummary:
      'Berita bagus untuk tenaga kerja AS biasanya berarti Dolar AS menguat. Pair yang berakhiran USD (EURUSD, GBPUSD, XAUUSD) cenderung turun cepat saat NFP mencetak angka jauh di atas ekspektasi.',
    cautionNote:
      'NFP sangat rawan whipsaw (ekor candle panjang ke dua arah) pada 5–15 menit pertama. Tunggu penutupan candle M15/H1.',
  },
  {
    id: 'rule-fed-pivot',
    title: 'Pemangkasan Suku Bunga The Fed (Dovish Pivot)',
    triggerCondition: 'Fed Funds Rate Dipangkas atau Dot Plot Lebih Dovish',
    formulaEquation: 'Suku Bunga ↓  ⇒  Biaya Pinjaman Murah & Yield ↓  ⇒  DXY ↓  ⇒  XAUUSD ↑, BTC ↑, Saham ↑',
    primaryMechanism:
      'Penurunan suku bunga menurunkan biaya peluang memegang Emas dan menyuntikkan likuiditas baru ke pasar saham serta kripto.',
    assetImpacts: [
      { asset: 'XAUUSD', assetClass: 'XAUUSD', direction: 'BULLISH', horizon: 'Menengah - Panjang' },
      { asset: 'BTCUSDT', assetClass: 'Crypto', direction: 'BULLISH', horizon: 'Daily - Weekly' },
      { asset: 'Saham US & IDX', assetClass: 'Saham', direction: 'BULLISH', horizon: 'Daily - Weekly' },
    ],
    easySummary:
      'Saat bank sentral menurunkan bunga, uang murah beredar lebih banyak. Aset lindung nilai (Emas) dan aset pertumbuhan (Crypto & Saham) sama-sama mendapat bahan bakar naik.',
    cautionNote:
      'Waspadai pola "Buy the Rumor, Sell the News" apabila pasar sudah terlalu dini mem-price-in pemangkasan sebelum pengumuman resmi.',
  },
  {
    id: 'rule-birate-idx',
    title: 'Kejutan Kenaikan Suku Bunga BI Rate (Makro IDX)',
    triggerCondition: 'BI Rate Naik di Luar Perkiraan Pasar',
    formulaEquation: 'BI Rate ↑  ⇒  Beban Kredit ↑ & Rupiah Dijaga  ⇒  Saham Rate-Sensitive ↓ (Jangka Pendek)',
    primaryMechanism:
      'Kenaikan BI Rate bertujuan menjaga stabilitas Rupiah dan meredam arus modal keluar, namun meningkatkan biaya dana (cost of fund) bagi emiten perbankan, properti, dan konsumer.',
    assetImpacts: [
      { asset: 'Saham Properti & Bank Kecil', assetClass: 'Saham', direction: 'BEARISH', horizon: 'Jangka Pendek' },
      { asset: 'USDIDR (Rupiah Menguat)', assetClass: 'Forex', direction: 'BEARISH', horizon: 'Jangka Pendek' },
      { asset: 'Big Banks (BBCA/BBRI)', assetClass: 'Saham', direction: 'NETRAL', horizon: 'Menunggu Stabilisasi NIM' },
    ],
    easySummary:
      'Saat BI Rate naik mendadak, saham yang sensitif terhadap cicilan bunga (seperti properti dan otomotif) cenderung tertekan jangka pendek, sementara Rupiah mendapat dukungan penguatan.',
    cautionNote:
      'Bank besar berdana murah (CASA tinggi seperti BBCA) biasanya jauh lebih tahan dibanding bank kecil atau sektor properti.',
  },
];

export const HISTORICAL_NEWS_ROLEPLAYS: HistoricalNewsRoleplay[] = [
  {
    id: 'hist-cpi-june-2022',
    title: 'Ledakan Inflasi US CPI 9.1% (Puncak 40 Tahun)',
    periodLabel: '13 Juli 2022 · Rilis US CPI Juni',
    assetClass: 'XAUUSD',
    targetInstrument: 'XAUUSD (Gold)',
    indicatorTag: 'US CPI YoY',
    previousValue: '8.6%',
    forecastValue: '8.8%',
    actualValue: '9.1%',
    preReleaseBrief:
      'Pasar sebelumnya sudah khawatir inflasi tinggi, namun konsensus memperkirakan CPI hanya naik tipis ke 8.8%. Tepat pukul 19:30 WIB, angka aktual keluar mengejutkan di 9.1% — tertinggi sejak 1981.',
    questionPrompt:
      'Melihat CPI Aktual (9.1%) jauh lebih panas dari Forecast (8.8%), bagaimana keputusan paling rasional untuk arah XAUUSD dalam jangka pendek setelah rilis?',
    correctAction: 'BEARISH',
    historicalOutcome: {
      priceMoveSummary: 'XAUUSD turun tajam sekitar -250 pips (dari area $1.732 ke ~$1.707) sebelum fase konsolidasi.',
      whatHappened:
        'Begitu CPI 9.1% dirilis, imbal hasil obligasi AS melonjak dan pasar langsung memprediksi The Fed akan menaikkan suku bunga secara super agresif (75–100 bps). Indeks DXY melesat naik.',
      whyMarketReacted:
        'Meskipun Emas sering disebut pelindung inflasi dalam jangka panjang, dalam jangka pendek CPI panas memicu ekspektasi suku bunga naik lebih lama. Dolar AS menjadi jauh lebih menarik karena memberikan imbal hasil bunga tinggi, sehingga Emas dijual.',
      practicalLesson:
        'Rumus wajib: CPI > Forecast ⇒ Ekspektasi Suku Bunga Naik ⇒ DXY Naik ⇒ XAUUSD cenderung turun jangka pendek. Jangan langsung melawan arus dengan Buy hanya karena mendengar kata "inflasi tinggi".',
    },
  },
  {
    id: 'hist-dxy-114-sep-2022',
    title: 'Reli DXY Menembus 114.00 & Tekanan Global',
    periodLabel: 'September 2022 · Siklus Hawkish The Fed',
    assetClass: 'Forex',
    targetInstrument: 'EURUSD & XAUUSD',
    indicatorTag: 'DXY Breakout',
    previousValue: '109.50',
    forecastValue: '111.00',
    actualValue: '114.70',
    preReleaseBrief:
      'The Fed baru saja menaikkan suku bunga sebesar 75 bps ketiga kalinya secara beruntun dengan nada sangat hawkish. Indeks DXY menembus level psikologis 112 dan terus merangkak menuju 114.70.',
    questionPrompt:
      'Ketika Indeks DXY menguat tajam dan mencetak level tertinggi baru di atas 114.00, posisi apa yang selaras dengan korelasi fundamental pada EURUSD dan XAUUSD?',
    correctAction: 'BEARISH',
    historicalOutcome: {
      priceMoveSummary: 'EURUSD jatuh menembus paritas hingga ~0.9535, sementara XAUUSD tertekan ke dasar $1.615.',
      whatHappened:
        'Arus modal global mengalir deras masuk ke Dolar AS demi mengejar selisih suku bunga tertinggi di antara negara maju, mendorong DXY mencetak rekor tertinggi 20 tahun.',
      whyMarketReacted:
        'Karena DXY mengukur kekuatan USD terhadap keranjang mata uang utama (di mana Euro berbobot ~57.6%), lonjakan DXY otomatis menekan EURUSD ke bawah paritas 1.0000 dan membuat harga emas dalam USD terdiskon berat.',
      practicalLesson:
        'Selalu cek grafik DXY sebelum masuk posisi di EURUSD atau XAUUSD. Selama DXY membentuk struktur Higher High & Higher Low yang bersih, peluang terbaik di XAUUSD/EURUSD adalah mencari setup Sell pada retest resistance.',
    },
  },
  {
    id: 'hist-nfp-jan-2023',
    title: 'Kejutan NFP +517 Ribu Pekerjaan Baru',
    periodLabel: '3 Februari 2023 · Rilis US NFP',
    assetClass: 'Forex',
    targetInstrument: 'EURUSD',
    indicatorTag: 'US NFP',
    previousValue: '+260K',
    forecastValue: '+185K',
    actualValue: '+517K',
    preReleaseBrief:
      'Para ekonom memperkirakan perekrutan tenaga kerja AS mulai melambat ke +185K setelah kenaikan suku bunga sepanjang 2022. Namun rilis resmi mencatatkan +517K dengan tingkat pengangguran turun ke 3.4%.',
    questionPrompt:
      'Dengan NFP Aktual +517K (hampir 3x lipat dari Forecast +185K), ke arah mana probabilitas terkuat bagi EURUSD di sesi New York?',
    correctAction: 'BEARISH',
    historicalOutcome: {
      priceMoveSummary: 'EURUSD ambles lebih dari -140 pips dalam beberapa jam dari ~1.0940 ke ~1.0790.',
      whatHappened:
        'Angka ketenagakerjaan yang luar biasa kuat memupus harapan pasar bahwa The Fed akan segera menghentikan kenaikan suku bunga pada kuartal berikutnya.',
      whyMarketReacted:
        'Ekonomi AS terbukti tetap panas dan tangguh, artinya inflasi upah masih berisiko bertahan. Trader institusional langsung membeli USD dan melepas Euro.',
      practicalLesson:
        'Jika selisih NFP Aktual vs Forecast sangat lebar (> +100K), jangan ragu mengikuti arah penguatan USD setelah candle konfirmasi M15/H1 terbentuk.',
    },
  },
  {
    id: 'hist-fed-cut-sep-2024',
    title: 'Pemangkasan Suku Bunga The Fed Pertama 50 bps',
    periodLabel: '18 September 2024 · FOMC Rate Cut',
    assetClass: 'XAUUSD',
    targetInstrument: 'XAUUSD & BTCUSDT',
    indicatorTag: 'Fed Funds Rate',
    previousValue: '5.50%',
    forecastValue: '5.25% (-25 bps)',
    actualValue: '5.00% (-50 bps)',
    preReleaseBrief:
      'Setelah menahan suku bunga di puncak 5.50% lebih dari setahun, sebagian besar ekonom memprediksi pemangkasan awal bertahap 25 bps. Namun The Fed memutuskan memangkas langsung 50 bps menjadi 5.00%.',
    questionPrompt:
      'Pemangkasan suku bunga The Fed yang lebih besar dari ekspektasi (50 bps) menjadi sinyal dimulainya siklus pelonggaran. Apa bias utama XAUUSD dan BTC pasca rilis?',
    correctAction: 'BULLISH',
    historicalOutcome: {
      priceMoveSummary: 'XAUUSD menembus rekor baru di atas $2.600 dan BTCUSDT reli dari ~$60.000 menuju >$65.000 dalam hari-hari berikutnya.',
      whatHappened:
        'Sempat terjadi kocokan cepat (whipsaw) saat konferensi pers Jerome Powell, lalu tren bullish berlanjut solid sepanjang pekan.',
      whyMarketReacted:
        'Penurunan suku bunga menurunkan imbal hasil riil obligasi AS dan melemahkan daya tarik DXY secara struktural. Aset non-bunga seperti Emas serta aset berbasis likuiditas seperti Bitcoin langsung diuntungkan.',
      practicalLesson:
        'Saat bank sentral berbalik dari siklus pengetatan ke pemangkasan (Dovish Pivot), koreksi jangka pendek pada Emas dan Crypto biasanya menjadi area akumulasi (Buy on Dip), bukan pembalikan bearish.',
    },
  },
  {
    id: 'hist-btc-etf-jan-2024',
    title: 'Persetujuan ETF Bitcoin Spot oleh SEC AS',
    periodLabel: '10 Januari 2024 · Regulasi & Arus Modal',
    assetClass: 'Crypto',
    targetInstrument: 'BTCUSDT',
    indicatorTag: 'Arus Modal ETF',
    previousValue: 'Tertunda',
    forecastValue: 'Disetujui (Sudah Priced-In Sebagian)',
    actualValue: '11 ETF Spot Disetujui Resmi',
    preReleaseBrief:
      'Harga BTC sudah reli lebih dari +70% sejak Oktober 2023 menjelang tenggat keputusan SEC. Pada 10 Januari 2024, SEC resmi menyetujui 11 ETF Bitcoin Spot secara serentak, namun di hari-hari awal terjadi arus keluar besar dari dana lama (GBTC).',
    questionPrompt:
      'Pada momen berita besar yang sudah diantisipasi pasar jauh hari sebelumnya (reli +70% sebelum rilis), sikap taktis apa yang paling aman tepat di minggu pertama pasca pengumuman?',
    correctAction: 'NETRAL',
    historicalOutcome: {
      priceMoveSummary: 'BTC sempat menyentuh ~$49.000 sesaat, lalu terkoreksi -20% ke ~$38.500 (Sell the News) sebelum akhirnya reli ke rekor baru >$73.000.',
      whatHappened:
        'Trader jangka pendek merealisasikan keuntungan tepat saat pengumuman resmi keluar, sementara arus keluar Grayscale (GBTC) menciptakan tekanan jual sementara selama 2 minggu sebelum arus masuk BlackRock/Fidelity mendominasi.',
      whyMarketReacted:
        'Pasar bergerak berdasarkan ekspektasi masa depan. Ketika rumor sudah menaikkan harga jauh sebelum berita resmi terbit, rilis aktual sering memicu aksi ambil untung jangka pendek (Buy the Rumor, Sell the News).',
      practicalLesson:
        'Jangan FOMO mengejar breakout tepat saat berita yang sudah ditunggu semua orang resmi diumumkan. Tunggu konsolidasi/koreksi struktur (Wait & See) atau tunggu arus dana nyata masuk terlebih dahulu.',
    },
  },
  {
    id: 'hist-birate-apr-2024',
    title: 'Kejutan Kenaikan BI Rate ke 6.25% Jaga Rupiah',
    periodLabel: '24 April 2024 · RDG Bank Indonesia',
    assetClass: 'Saham',
    targetInstrument: 'Saham IDX (Perbankan & Properti)',
    indicatorTag: 'BI Rate',
    previousValue: '6.00%',
    forecastValue: '6.00% (Tahan)',
    actualValue: '6.25% (+25 bps)',
    preReleaseBrief:
      'Kurs Rupiah sempat melemah menembus Rp16.200/USD akibat ketegangan geopolitik dan penundaan cut rate The Fed. Mayoritas konsensus memperkirakan BI akan menahan bunga di 6.00%, tetapi BI justru menaikkan suku bunga ke 6.25%.',
    questionPrompt:
      'Kenaikan BI Rate yang tidak terduga (6.25% vs Forecast 6.00%) secara langsung meningkatkan biaya pinjaman domestik. Bagaimana dampak jangka pendeknya terhadap sektor saham sensitif suku bunga (properti & perbankan menengah)?',
    correctAction: 'BEARISH',
    historicalOutcome: {
      priceMoveSummary: 'IHSG dan saham perbankan/properti mengalami tekanan jual jangka pendek (-2% hingga -5% pada beberapa saham rate-sensitive) sementara Rupiah berangsur stabil.',
      whatHappened:
        'Investor asing dan institusi melakukan penyesuaian valuasi karena kenaikan suku bunga acuan memperketat likuiditas kredit dan menekan margin bunga bersih (NIM) bank yang bergantung pada dana mahal.',
      whyMarketReacted:
        'Suku bunga tinggi membuat deposito dan obligasi pemerintah (SBN) lebih menarik dibanding saham berisiko dalam jangka pendek, sekaligus memperlambat ekspansi kredit properti dan konsumsi.',
      practicalLesson:
        'Di pasar Saham IDX, selalu periksa arah BI Rate dan kurs USDIDR. Kenaikan suku bunga kejutan menuntut trader mengurangi eksposur di saham berutang tinggi/properti hingga struktur teknikal membentuk dasar baru.',
    },
  },
];
