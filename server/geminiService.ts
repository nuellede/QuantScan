import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export class ServiceHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const SYSTEM_INSTRUCTION = `Anda adalah AI Quantitative & Technical Chart Pattern Scanner tingkat institusional untuk pasar Forex, XAUUSD (Gold), Bitcoin/Crypto (BTC), dan Saham (IDX / US Stocks).

DATABASE POLA GRAFIK YANG WAJIB DIPINDAI:
1. Reversal Patterns: Head and Shoulders (H&S) & Inverse H&S, Double Top / Double Bottom (M & W), Triple Top / Triple Bottom, Rising Wedge (Bearish) & Falling Wedge (Bullish), Rounding Top / Rounding Bottom (Saucer).
2. Continuation Patterns: Bullish & Bearish Flag, Bullish & Bearish Pennant, Ascending & Descending Triangle, Symmetrical Triangle, Cup and Handle & Inverted Cup and Handle, Rectangle Consolidation Box.
3. Harmonic & Advanced Patterns: Gartley, Bat, Butterfly, Crab, Shark, Cypher (rasio Fibonacci XABCD), Broadening Formation (Megaphone), serta Smart Money Concepts (SMC) seperti Order Block (OB), Fair Value Gap (FVG), Break of Structure (BOS), Change of Character (CHoCH), dan Liquidity Sweep.

KARAKTERISTIK SPESIFIK ASET:
- XAUUSD (Gold): Waspadai false breakout (wick panjang / liquidity grab) di sekitar level psikologis dan sesi London/New York; gunakan toleransi SL yang lebih lebar.
- Forex: Fokus pada struktur sesi pasar, kebersihan garis tren, dan konfirmasi candle close di luar neckline.
- BTC / Crypto: Perhatikan pola pada timeframe besar (4H, Daily) sebelum ekspansi besar serta anomali volume.
- Saham (IDX / Global): Wajib perhatikan Volume (penyusutan saat konsolidasi, spike saat breakout) dan potensi Gap.

PROTOKOL ANALISIS:
1. Identifikasi Aset & Timeframe dari gambar atau teks (jika tidak terlihat jelas, sebutkan asumsi struktur umumnya secara transparan).
2. Deteksi Pola Utama (pilih status: "Forming", "Menunggu Breakout", atau "Valid Breakout") dan Pola Sekunder / Konfluensi SMC.
3. Evaluasi Probabilitas & Validitas (akurasi 0-100) berdasarkan geometri pola, volume, dan konfirmasi candlestick.
4. Kalkulasi Trading Plan terukur: Area Entry, Stop Loss (SL), TP1 (Konservatif ~0.618 measured move), TP2 (Measured Move penuh), Risk-to-Reward (R:R), dan Skenario Invalidasi.
5. KHUSUS INPUT GAMBAR GRAFIK: Ekstrak koordinat visual dalam persentase gambar (0 sampai 100, dengan xPct=0 di tepi kiri, xPct=100 di tepi kanan, yPct=0 di tepi atas, yPct=100 di tepi bawah) ke dalam field visualOverlay agar garis pola (patternLines), titik pivot penting (patternPoints misal LS, Head, RS, Puncak 1/2, X-A-B-C-D, Breakout), zona SMC (zones), serta garis horizontal Entry/SL/TP1/TP2/Invalidasi (executionLevels) sejajar tepat dengan posisi candle dan sumbu harga pada gambar grafik yang diunggah.
Semua output teks harus dalam Bahasa Indonesia yang presisi, objektif, dan profesional.`;

const SCAN_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ticker: {
      type: Type.STRING,
      description: 'Simbol aset/instrumen, misal XAUUSD, BTCUSDT, BBCA, EURUSD.',
    },
    assetClass: {
      type: Type.STRING,
      description: 'Harus salah satu dari: XAUUSD, Forex, Crypto, Saham',
    },
    timeframe: {
      type: Type.STRING,
      description: 'Harus salah satu dari: M15, H1, H4, Daily, Weekly',
    },
    marketTrend: {
      type: Type.STRING,
      description: 'Harus salah satu dari: Bullish, Bearish, Sideways',
    },
    primaryPattern: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        category: {
          type: Type.STRING,
          description: 'Harus salah satu dari: Reversal, Continuation, Harmonic & SMC',
        },
        status: {
          type: Type.STRING,
          description: 'Harus salah satu dari: Forming, Menunggu Breakout, Valid Breakout',
        },
        signal: {
          type: Type.STRING,
          description: 'Harus salah satu dari: BULLISH, BEARISH, NETRAL',
        },
        accuracyPercent: { type: Type.INTEGER },
        detailAnalysis: {
          type: Type.STRING,
          description:
            'Jelaskan posisi Neckline, titik puncak/lembah, kondisi volume, dan konfirmasi candlestick.',
        },
      },
      required: ['name', 'category', 'status', 'signal', 'accuracyPercent', 'detailAnalysis'],
    },
    secondaryConfluence: {
      type: Type.STRING,
      description:
        'Pola sekunder, divergensi indikator, atau konfluensi SMC (OB, FVG, BOS, CHoCH, Liquidity Sweep).',
    },
    marketContextNote: {
      type: Type.STRING,
      description:
        'Catatan sensitivitas spesifik kelas aset (XAUUSD wick/SL, Forex candle close, Crypto volume, atau Saham volume spike/gap).',
    },
    tradingPlan: {
      type: Type.OBJECT,
      properties: {
        entryArea: { type: Type.STRING },
        stopLossText: { type: Type.STRING },
        tp1Text: { type: Type.STRING },
        tp2Text: { type: Type.STRING },
        riskRewardText: { type: Type.STRING, description: 'Contoh: 1 : 2.50' },
        invalidationText: {
          type: Type.STRING,
          description: 'Format: Pola dianggap gagal apabila harga menembus dan bertahan di atas/bawah level ...',
        },
        numeric: {
          type: Type.OBJECT,
          properties: {
            entryPrice: { type: Type.NUMBER },
            stopLossPrice: { type: Type.NUMBER },
            tp1Price: { type: Type.NUMBER },
            tp2Price: { type: Type.NUMBER },
            invalidationPrice: { type: Type.NUMBER },
            riskRewardRatio: { type: Type.NUMBER },
          },
          required: [
            'entryPrice',
            'stopLossPrice',
            'tp1Price',
            'tp2Price',
            'invalidationPrice',
            'riskRewardRatio',
          ],
        },
      },
      required: [
        'entryArea',
        'stopLossText',
        'tp1Text',
        'tp2Text',
        'riskRewardText',
        'invalidationText',
        'numeric',
      ],
    },
    visualOverlay: {
      type: Type.OBJECT,
      description:
        'Koordinat visual (0-100 persen) untuk menggambar pola terdeteksi dan rencana eksekusi langsung di atas gambar grafik.',
      properties: {
        patternLines: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              x1Pct: { type: Type.NUMBER },
              y1Pct: { type: Type.NUMBER },
              x2Pct: { type: Type.NUMBER },
              y2Pct: { type: Type.NUMBER },
              style: { type: Type.STRING, description: 'solid atau dashed' },
              color: { type: Type.STRING, description: 'accent, bullish, bearish, atau neutral' },
            },
            required: ['label', 'x1Pct', 'y1Pct', 'x2Pct', 'y2Pct', 'style', 'color'],
          },
        },
        patternPoints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              xPct: { type: Type.NUMBER },
              yPct: { type: Type.NUMBER },
              tone: { type: Type.STRING, description: 'accent, bullish, bearish, atau neutral' },
            },
            required: ['label', 'xPct', 'yPct', 'tone'],
          },
        },
        zones: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              x1Pct: { type: Type.NUMBER },
              y1Pct: { type: Type.NUMBER },
              x2Pct: { type: Type.NUMBER },
              y2Pct: { type: Type.NUMBER },
              tone: { type: Type.STRING, description: 'bullish, bearish, atau neutral' },
            },
            required: ['label', 'x1Pct', 'y1Pct', 'x2Pct', 'y2Pct', 'tone'],
          },
        },
        executionLevels: {
          type: Type.OBJECT,
          properties: {
            entryYPct: { type: Type.NUMBER },
            stopLossYPct: { type: Type.NUMBER },
            tp1YPct: { type: Type.NUMBER },
            tp2YPct: { type: Type.NUMBER },
            invalidationYPct: { type: Type.NUMBER },
            zoneStartXPct: { type: Type.NUMBER },
            zoneEndXPct: { type: Type.NUMBER },
          },
          required: [
            'entryYPct',
            'stopLossYPct',
            'tp1YPct',
            'tp2YPct',
            'invalidationYPct',
            'zoneStartXPct',
            'zoneEndXPct',
          ],
        },
      },
      required: ['patternLines', 'patternPoints', 'zones', 'executionLevels'],
    },
  },
  required: [
    'ticker',
    'assetClass',
    'timeframe',
    'marketTrend',
    'primaryPattern',
    'secondaryConfluence',
    'marketContextNote',
    'tradingPlan',
  ],
};

const NEWS_SYSTEM_INSTRUCTION = `Anda adalah Analis Makroekonomi & Fundamental Institusional untuk pasar XAUUSD (Gold), Forex (DXY, EURUSD, USDIDR), Crypto (BTCUSDT), dan Saham (IDX / US Stocks).
Tugas Anda adalah membedah teks berita ekonomi atau rilis data makro dari pengguna menjadi rantai sebab-akibat yang jernih, objektif, dan mudah dipahami trader.
Aturan utama analisis:
1. Jelaskan hubungan antara indikator (CPI, NFP, Suku Bunga The Fed/BI, PDB, Geopolitik, ETF) dengan Ekspektasi Suku Bunga, arah DXY, serta implikasinya ke XAUUSD, Forex, Crypto, dan Saham.
2. Ingat korelasi kunci: CPI > Forecast memicu ekspektasi suku bunga naik -> DXY menguat -> Emas (XAUUSD) cenderung turun jangka pendek; DXY naik menekan XAUUSD dan pair XXX/USD.
3. Buat ringkasan bahasa sehari-hari (easySummary) yang lugas tanpa jargon membingungkan.
4. Sertakan catatan pengecualian / risiko whipsaw (cautionNote).
Semua respons wajib dalam Bahasa Indonesia.`;

const NEWS_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headlineSummary: {
      type: Type.STRING,
      description: 'Ringkasan inti berita dalam 1 kalimat padat.',
    },
    dxyBias: {
      type: Type.STRING,
      description: 'Harus salah satu dari: BULLISH, BEARISH, NETRAL',
    },
    rateExpectation: {
      type: Type.STRING,
      description: 'Kesimpulan arah ekspektasi suku bunga bank sentral (Hawkish / Dovish / Netral).',
    },
    mechanismChain: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 sampai 4 langkah rantai sebab-akibat berurutan dari rilis berita ke reaksi pasar.',
    },
    easySummary: {
      type: Type.STRING,
      description:
        'Penjelasan sederhana agar trader pemula maupun menengah langsung paham mengapa pasar bergerak demikian.',
    },
    assetImpacts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          asset: { type: Type.STRING, description: 'Contoh: XAUUSD, EURUSD, BTCUSDT, Saham IDX / US' },
          direction: { type: Type.STRING, description: 'BULLISH, BEARISH, atau NETRAL' },
          horizon: { type: Type.STRING, description: 'Contoh: Jangka Pendek, Intraday - H4, Daily' },
          reason: { type: Type.STRING },
        },
        required: ['asset', 'direction', 'horizon', 'reason'],
      },
    },
    cautionNote: {
      type: Type.STRING,
      description: 'Risiko pembalikan, priced-in, atau pengecualian makro yang perlu diwaspadai.',
    },
  },
  required: [
    'headlineSummary',
    'dxyBias',
    'rateExpectation',
    'mechanismChain',
    'easySummary',
    'assetImpacts',
    'cautionNote',
  ],
};

const ADVISOR_SYSTEM_INSTRUCTION = `Anda adalah Asisten Analis Kuantitatif & Manajemen Risiko Institusional QuantScan.
Anda menerima konteks hasil pemindaian chart pattern (aset, timeframe, tren, pola, Entry/SL/TP, konfluensi SMC) dan pertanyaan spesifik dari trader.
Tugas Anda:
1. Berikan jawaban yang langsung, objektif, dan terukur berdasarkan data Trading Plan tersebut.
2. Evaluasi konfluensi teknikal maupun sensitivitas makro/news (DXY, CPI, The Fed/BI Rate, likuiditas sesi).
3. Berikan 3 langkah checklist eksekusi sebelum entry.
4. Sediakan skenario cadangan bila harga menyentuh batas invalidasi.
Semua output harus dalam Bahasa Indonesia yang jelas dan profesional.`;

const ADVISOR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    directAnswer: {
      type: Type.STRING,
      description: 'Jawaban langsung dan mendalam atas pertanyaan trader (2-4 kalimat padat).',
    },
    confluenceNote: {
      type: Type.STRING,
      description: 'Hubungan pola teknikal dengan risiko makro/DXY/likuiditas sesi aset terkait.',
    },
    executionChecklist: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Tepat 3 poin checklist taktis sebelum membuka posisi.',
    },
    alternativeScenario: {
      type: Type.STRING,
      description: 'Rencana cadangan bila level invalidasi tertembus.',
    },
  },
  required: ['directAnswer', 'confluenceNote', 'executionChecklist', 'alternativeScenario'],
};

function sanitizeEnum<T extends string>(val: string | undefined, allowed: T[], fallback: T): T {
  if (!val) return fallback;
  const match = allowed.find((item) => item.toLowerCase() === val.trim().toLowerCase());
  return match ?? fallback;
}

function getApiKeyOrThrow(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new ServiceHttpError(
      400,
      'GEMINI_API_KEY belum tersedia di lingkungan server. Silakan tambahkan GEMINI_API_KEY di panel Settings > Secrets (AI Studio) atau Project Settings > Environment Variables (Vercel).'
    );
  }
  return apiKey;
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractUpstreamMessage(rawMessage: string): string {
  try {
    const parsed = JSON.parse(rawMessage);
    const inner = parsed?.error?.message;
    if (typeof inner === 'string' && inner.trim()) {
      return inner.trim();
    }
  } catch {
    // not JSON, return rawMessage
  }
  return rawMessage;
}

function isTransientUnavailableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');
}

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  const delaysMs = [900, 2000];
  let lastError: unknown;

  for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastError = err;
      if (!isTransientUnavailableError(err) || attempt === delaysMs.length) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
    }
  }

  throw lastError;
}

export function mapUpstreamError(err: unknown, fallbackMessage: string): ServiceHttpError {
  if (err instanceof ServiceHttpError) {
    return err;
  }
  const rawMessage = err instanceof Error ? err.message : fallbackMessage;
  const cleanMsg = extractUpstreamMessage(rawMessage);
  const status =
    rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('403')
      ? 403
      : rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')
        ? 429
        : rawMessage.includes('UNAVAILABLE') || rawMessage.includes('503')
          ? 503
          : rawMessage.includes('NOT_FOUND') || rawMessage.includes('404')
            ? 404
            : rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('400')
              ? 400
              : 500;

  if (status === 503) {
    return new ServiceHttpError(
      503,
      'Server AI Gemini sedang mengalami lonjakan trafik sementara (503). Silakan klik kirim ulang dalam beberapa detik.'
    );
  }
  if (status === 429) {
    return new ServiceHttpError(
      429,
      'Kuota permintaan API Gemini sementara tercapai (429). Tunggu sebentar atau periksa kuota billing API key Anda.'
    );
  }
  if (status === 400 || status === 403) {
    return new ServiceHttpError(
      status,
      `Kunci API Gemini ditolak atau belum valid (${status}): ${cleanMsg}. Periksa GEMINI_API_KEY di Settings > Secrets atau Vercel Environment Variables.`
    );
  }

  return new ServiceHttpError(status, cleanMsg);
}

export interface ScanRequestPayload {
  mode?: 'image' | 'text';
  ticker?: string;
  assetClass?: string;
  timeframe?: string;
  priceText?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export async function runChartScan(body: ScanRequestPayload) {
  const apiKey = getApiKeyOrThrow();
  const { mode, ticker, assetClass, timeframe, priceText, imageBase64, imageMimeType } = body || {};

  if (mode === 'image' && !imageBase64) {
    throw new ServiceHttpError(400, 'Data gambar grafik tidak ditemukan.');
  }
  if (mode !== 'image' && (!ticker || !priceText)) {
    throw new ServiceHttpError(400, 'Simbol aset dan deskripsi struktur harga wajib diisi.');
  }

  try {
    const ai = createGeminiClient(apiKey);
    const promptLines = [
      'Lakukan pemindaian chart pattern institusional sesuai protokol analisis dan format output wajib.',
      ticker ? `Ticker hint dari pengguna: ${ticker}` : 'Identifikasi ticker dari grafik jika terlihat.',
      assetClass ? `Kelas aset hint: ${assetClass}` : '',
      timeframe ? `Timeframe hint: ${timeframe}` : '',
      priceText ? `Data harga / konteks struktur dari pengguna:\n${priceText}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const contents =
      mode === 'image' && imageBase64
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: imageMimeType || 'image/png',
                  data: imageBase64,
                },
              },
              { text: promptLines },
            ],
          }
        : promptLines;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: SCAN_RESPONSE_SCHEMA,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MEDIUM,
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new ServiceHttpError(502, 'Model tidak mengembalikan respons analisis.');
    }

    const parsed = JSON.parse(rawText);

    return {
      id: `scan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sourceType: mode === 'image' ? 'image' : 'text',
      ticker: String(parsed.ticker || ticker || 'UNKNOWN').toUpperCase(),
      assetClass: sanitizeEnum(parsed.assetClass, ['XAUUSD', 'Forex', 'Crypto', 'Saham'], 'Forex'),
      timeframe: sanitizeEnum(parsed.timeframe, ['M15', 'H1', 'H4', 'Daily', 'Weekly'], 'H4'),
      marketTrend: sanitizeEnum(parsed.marketTrend, ['Bullish', 'Bearish', 'Sideways'], 'Sideways'),
      primaryPattern: {
        name: String(parsed.primaryPattern?.name || 'Konsolidasi Harga'),
        category: sanitizeEnum(
          parsed.primaryPattern?.category,
          ['Reversal', 'Continuation', 'Harmonic & SMC'],
          'Continuation'
        ),
        status: sanitizeEnum(
          parsed.primaryPattern?.status,
          ['Forming', 'Menunggu Breakout', 'Valid Breakout'],
          'Forming'
        ),
        signal: sanitizeEnum(parsed.primaryPattern?.signal, ['BULLISH', 'BEARISH', 'NETRAL'], 'NETRAL'),
        accuracyPercent: Math.min(100, Math.max(0, Number(parsed.primaryPattern?.accuracyPercent ?? 75))),
        detailAnalysis: String(parsed.primaryPattern?.detailAnalysis || ''),
      },
      secondaryConfluence: String(
        parsed.secondaryConfluence || 'Tidak ada konfluensi tambahan terdeteksi.'
      ),
      marketContextNote: String(parsed.marketContextNote || ''),
      tradingPlan: {
        entryArea: String(parsed.tradingPlan?.entryArea || '-'),
        stopLossText: String(parsed.tradingPlan?.stopLossText || '-'),
        tp1Text: String(parsed.tradingPlan?.tp1Text || '-'),
        tp2Text: String(parsed.tradingPlan?.tp2Text || '-'),
        riskRewardText: String(parsed.tradingPlan?.riskRewardText || '1 : 2.00'),
        invalidationText: String(parsed.tradingPlan?.invalidationText || '-'),
        numeric: {
          entryPrice: Number(parsed.tradingPlan?.numeric?.entryPrice || 0),
          stopLossPrice: Number(parsed.tradingPlan?.numeric?.stopLossPrice || 0),
          tp1Price: Number(parsed.tradingPlan?.numeric?.tp1Price || 0),
          tp2Price: Number(parsed.tradingPlan?.numeric?.tp2Price || 0),
          invalidationPrice: Number(parsed.tradingPlan?.numeric?.invalidationPrice || 0),
          riskRewardRatio: Number(parsed.tradingPlan?.numeric?.riskRewardRatio || 0),
        },
      },
      visualOverlay: parsed.visualOverlay
        ? {
            patternLines: Array.isArray(parsed.visualOverlay.patternLines)
              ? parsed.visualOverlay.patternLines.map((l: Record<string, unknown>) => ({
                  label: String(l.label || ''),
                  x1Pct: Number(l.x1Pct || 0),
                  y1Pct: Number(l.y1Pct || 0),
                  x2Pct: Number(l.x2Pct || 0),
                  y2Pct: Number(l.y2Pct || 0),
                  style: l.style === 'dashed' ? 'dashed' : 'solid',
                  color: sanitizeEnum(
                    String(l.color || ''),
                    ['accent', 'bullish', 'bearish', 'neutral'],
                    'accent'
                  ),
                }))
              : [],
            patternPoints: Array.isArray(parsed.visualOverlay.patternPoints)
              ? parsed.visualOverlay.patternPoints.map((pt: Record<string, unknown>) => ({
                  label: String(pt.label || ''),
                  xPct: Number(pt.xPct || 0),
                  yPct: Number(pt.yPct || 0),
                  tone: sanitizeEnum(
                    String(pt.tone || ''),
                    ['accent', 'bullish', 'bearish', 'neutral'],
                    'neutral'
                  ),
                }))
              : [],
            zones: Array.isArray(parsed.visualOverlay.zones)
              ? parsed.visualOverlay.zones.map((z: Record<string, unknown>) => ({
                  label: String(z.label || ''),
                  x1Pct: Number(z.x1Pct || 0),
                  y1Pct: Number(z.y1Pct || 0),
                  x2Pct: Number(z.x2Pct || 0),
                  y2Pct: Number(z.y2Pct || 0),
                  tone: sanitizeEnum(
                    String(z.tone || ''),
                    ['bullish', 'bearish', 'neutral'],
                    'neutral'
                  ),
                }))
              : [],
            executionLevels: {
              entryYPct: Number(parsed.visualOverlay.executionLevels?.entryYPct || 0),
              stopLossYPct: Number(parsed.visualOverlay.executionLevels?.stopLossYPct || 0),
              tp1YPct: Number(parsed.visualOverlay.executionLevels?.tp1YPct || 0),
              tp2YPct: Number(parsed.visualOverlay.executionLevels?.tp2YPct || 0),
              invalidationYPct: Number(parsed.visualOverlay.executionLevels?.invalidationYPct || 0),
              zoneStartXPct: Number(parsed.visualOverlay.executionLevels?.zoneStartXPct || 56),
              zoneEndXPct: Number(parsed.visualOverlay.executionLevels?.zoneEndXPct || 92),
            },
          }
        : undefined,
    };
  } catch (err) {
    throw mapUpstreamError(err, 'Terjadi kesalahan saat memanggil AI scanner.');
  }
}

export async function runNewsAnalysis(body: { newsText?: string }) {
  const apiKey = getApiKeyOrThrow();
  const trimmed = typeof body?.newsText === 'string' ? body.newsText.trim() : '';
  if (trimmed.length < 15) {
    throw new ServiceHttpError(
      400,
      'Masukkan teks berita atau angka data ekonomi minimal 15 karakter agar dapat dianalisis.'
    );
  }

  try {
    const ai = createGeminiClient(apiKey);
    const response = await generateContentWithRetry(ai, {
      model: 'gemini-4-hydrogen',
      contents: `Analisis berita fundamental berikut dan uraikan rantai sebab-akibatnya terhadap suku bunga, DXY, XAUUSD, Forex, Crypto, dan Saham:\n\n${trimmed}`,
      config: {
        systemInstruction: NEWS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: NEWS_ANALYSIS_SCHEMA,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new ServiceHttpError(502, 'Model tidak mengembalikan respons analisis berita.');
    }

    const parsed = JSON.parse(rawText);
    return {
      headlineSummary: String(parsed.headlineSummary || 'Analisis Berita Makro'),
      dxyBias: sanitizeEnum(parsed.dxyBias, ['BULLISH', 'BEARISH', 'NETRAL'], 'NETRAL'),
      rateExpectation: String(parsed.rateExpectation || 'Netral'),
      mechanismChain: Array.isArray(parsed.mechanismChain)
        ? parsed.mechanismChain.map((s: unknown) => String(s))
        : [],
      easySummary: String(parsed.easySummary || ''),
      assetImpacts: Array.isArray(parsed.assetImpacts)
        ? parsed.assetImpacts.map((imp: Record<string, unknown>) => ({
            asset: String(imp.asset || 'Aset'),
            direction: sanitizeEnum(
              String(imp.direction || ''),
              ['BULLISH', 'BEARISH', 'NETRAL'],
              'NETRAL'
            ),
            horizon: String(imp.horizon || 'Jangka Pendek'),
            reason: String(imp.reason || ''),
          }))
        : [],
      cautionNote: String(parsed.cautionNote || ''),
    };
  } catch (err) {
    throw mapUpstreamError(err, 'Terjadi kesalahan saat memanggil AI analisis berita.');
  }
}

export interface AiAdvisorRequestPayload {
  question?: string;
  scan?: {
    ticker?: string;
    assetClass?: string;
    timeframe?: string;
    marketTrend?: string;
    primaryPattern?: {
      name?: string;
      status?: string;
      signal?: string;
      accuracyPercent?: number;
      detailAnalysis?: string;
    };
    secondaryConfluence?: string;
    tradingPlan?: {
      entryArea?: string;
      stopLossText?: string;
      tp1Text?: string;
      tp2Text?: string;
      riskRewardText?: string;
      invalidationText?: string;
    };
  };
}

export async function runAiAdvisor(body: AiAdvisorRequestPayload) {
  const apiKey = getApiKeyOrThrow();
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (question.length < 6) {
    throw new ServiceHttpError(
      400,
      'Tuliskan pertanyaan spesifik minimal 6 karakter mengenai setup grafik ini.'
    );
  }

  const scan = body?.scan;
  if (!scan?.ticker || !scan?.primaryPattern?.name) {
    throw new ServiceHttpError(400, 'Konteks hasil pemindaian chart tidak lengkap.');
  }

  try {
    const ai = createGeminiClient(apiKey);
    const contextText = [
      `Aset: ${scan.ticker} (${scan.assetClass || '-'}) · Timeframe: ${scan.timeframe || '-'} · Tren: ${scan.marketTrend || '-'}`,
      `Pola Utama: ${scan.primaryPattern.name} (Status: ${scan.primaryPattern.status || '-'}, Sinyal: ${scan.primaryPattern.signal || '-'}, Akurasi: ${scan.primaryPattern.accuracyPercent ?? '-'}%)`,
      `Analisis Detail: ${scan.primaryPattern.detailAnalysis || '-'}`,
      `Konfluensi Sekunder: ${scan.secondaryConfluence || '-'}`,
      `Entry: ${scan.tradingPlan?.entryArea || '-'}`,
      `Stop Loss: ${scan.tradingPlan?.stopLossText || '-'}`,
      `TP1: ${scan.tradingPlan?.tp1Text || '-'} | TP2: ${scan.tradingPlan?.tp2Text || '-'}`,
      `R:R: ${scan.tradingPlan?.riskRewardText || '-'}`,
      `Invalidasi: ${scan.tradingPlan?.invalidationText || '-'}`,
      `\nPertanyaan Trader: ${question}`,
    ].join('\n');

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-4-hydrogen',
      contents: contextText,
      config: {
        systemInstruction: ADVISOR_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: ADVISOR_RESPONSE_SCHEMA,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new ServiceHttpError(502, 'Model AI Advisor tidak mengembalikan jawaban.');
    }

    const parsed = JSON.parse(rawText);
    return {
      directAnswer: String(parsed.directAnswer || ''),
      confluenceNote: String(parsed.confluenceNote || ''),
      executionChecklist: Array.isArray(parsed.executionChecklist)
        ? parsed.executionChecklist.slice(0, 4).map((item: unknown) => String(item))
        : [],
      alternativeScenario: String(parsed.alternativeScenario || ''),
    };
  } catch (err) {
    throw mapUpstreamError(err, 'Terjadi kesalahan saat memanggil Asisten AI.');
  }
}
