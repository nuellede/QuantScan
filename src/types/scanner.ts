export type AssetClass = 'XAUUSD' | 'Forex' | 'Crypto' | 'Saham';

export type Timeframe = 'M15' | 'H1' | 'H4' | 'Daily' | 'Weekly';

export type MarketTrend = 'Bullish' | 'Bearish' | 'Sideways';

export type PatternStatus = 'Forming' | 'Menunggu Breakout' | 'Valid Breakout';

export type SignalDirection = 'BULLISH' | 'BEARISH' | 'NETRAL';

export type PatternCategory = 'Reversal' | 'Continuation' | 'Harmonic & SMC';

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartGeometryLine {
  label: string;
  x1Index: number;
  y1: number;
  x2Index: number;
  y2: number;
  style: 'solid' | 'dashed';
  color: 'accent' | 'bullish' | 'bearish' | 'neutral';
}

export interface ChartGeometryZone {
  label: string;
  startIndex: number;
  endIndex: number;
  topPrice: number;
  bottomPrice: number;
  tone: 'bullish' | 'bearish' | 'neutral';
}

export interface TradingPlanNumeric {
  entryPrice: number;
  stopLossPrice: number;
  tp1Price: number;
  tp2Price: number;
  invalidationPrice: number;
  riskRewardRatio: number;
}

export interface OverlayLinePct {
  label: string;
  x1Pct: number;
  y1Pct: number;
  x2Pct: number;
  y2Pct: number;
  style: 'solid' | 'dashed';
  color: 'accent' | 'bullish' | 'bearish' | 'neutral';
}

export interface OverlayPointPct {
  label: string;
  xPct: number;
  yPct: number;
  tone: 'accent' | 'bullish' | 'bearish' | 'neutral';
}

export interface OverlayZonePct {
  label: string;
  x1Pct: number;
  y1Pct: number;
  x2Pct: number;
  y2Pct: number;
  tone: 'bullish' | 'bearish' | 'neutral';
}

export interface ExecutionLevelsPct {
  entryYPct: number;
  stopLossYPct: number;
  tp1YPct: number;
  tp2YPct: number;
  invalidationYPct: number;
  zoneStartXPct: number;
  zoneEndXPct: number;
}

export interface VisualImageOverlay {
  patternLines: OverlayLinePct[];
  patternPoints: OverlayPointPct[];
  zones: OverlayZonePct[];
  executionLevels: ExecutionLevelsPct;
}

export interface ChartScanResult {
  id: string;
  createdAt: string;
  sourceType: 'image' | 'text' | 'preset';
  assetClass: AssetClass;
  ticker: string;
  timeframe: Timeframe;
  marketTrend: MarketTrend;
  primaryPattern: {
    name: string;
    category: PatternCategory;
    status: PatternStatus;
    signal: SignalDirection;
    accuracyPercent: number;
    detailAnalysis: string;
  };
  secondaryConfluence: string;
  marketContextNote: string;
  tradingPlan: {
    entryArea: string;
    stopLossText: string;
    tp1Text: string;
    tp2Text: string;
    riskRewardText: string;
    invalidationText: string;
    numeric: TradingPlanNumeric;
  };
  imagePreviewDataUrl?: string;
  visualOverlay?: VisualImageOverlay;
}

export interface PatternCatalogItem {
  id: string;
  name: string;
  category: PatternCategory;
  bias: SignalDirection;
  reliability: string;
  description: string;
  validationChecklist: string[];
  volumeSignature: string;
  measuredMoveRule: string;
  smcConfluenceTip: string;
  svgPath: {
    pricePoints: Array<[number, number]>;
    structureLines: Array<{ x1: number; y1: number; x2: number; y2: number; dashed?: boolean }>;
    breakoutTarget?: [number, number];
  };
  sampleInput: {
    ticker: string;
    assetClass: AssetClass;
    timeframe: Timeframe;
    priceText: string;
  };
}

export interface MarketPreset {
  id: string;
  label: string;
  assetClass: AssetClass;
  candles: CandlePoint[];
  geometryLines: ChartGeometryLine[];
  geometryZones: ChartGeometryZone[];
  scanResult: ChartScanResult;
}

export interface AiAdvisorResponse {
  directAnswer: string;
  confluenceNote: string;
  executionChecklist: string[];
  alternativeScenario: string;
}

