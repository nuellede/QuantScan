import type { AssetClass, SignalDirection } from './scanner';

export type MacroIndicatorId = 'US_CPI' | 'DXY' | 'US_NFP' | 'FED_RATE' | 'BI_RATE';

export interface MacroIndicatorMeta {
  id: MacroIndicatorId;
  name: string;
  shortLabel: string;
  unit: string;
  defaultForecast: number;
  defaultActual: number;
  inLineTolerance: number;
  quickScenarios: Array<{
    label: string;
    forecast: number;
    actual: number;
  }>;
}

export interface FundamentalFormulaRule {
  id: string;
  title: string;
  triggerCondition: string;
  formulaEquation: string;
  primaryMechanism: string;
  assetImpacts: Array<{
    asset: string;
    assetClass: AssetClass;
    direction: SignalDirection;
    horizon: string;
  }>;
  easySummary: string;
  cautionNote: string;
}

export interface MacroAssetImpact {
  asset: string;
  assetClass: AssetClass;
  direction: SignalDirection;
  horizon: string;
  reason: string;
}

export interface MacroSimulationResult {
  indicator: MacroIndicatorMeta;
  forecast: number;
  actual: number;
  surpriseDelta: number;
  surprisePercent: number;
  surpriseState: 'ABOVE_FORECAST' | 'BELOW_FORECAST' | 'IN_LINE';
  dxyBias: SignalDirection;
  rateExpectation: string;
  mechanismChain: string[];
  easySummary: string;
  assetImpacts: MacroAssetImpact[];
}

export interface HistoricalNewsRoleplay {
  id: string;
  title: string;
  periodLabel: string;
  assetClass: AssetClass;
  targetInstrument: string;
  indicatorTag: string;
  previousValue: string;
  forecastValue: string;
  actualValue: string;
  preReleaseBrief: string;
  questionPrompt: string;
  correctAction: SignalDirection;
  historicalOutcome: {
    priceMoveSummary: string;
    whatHappened: string;
    whyMarketReacted: string;
    practicalLesson: string;
  };
}

export interface RoleplayAnswerRecord {
  scenarioId: string;
  chosenAction: SignalDirection;
  isCorrect: boolean;
  answeredAt: string;
}

export interface CustomNewsAnalysisResult {
  headlineSummary: string;
  dxyBias: SignalDirection;
  rateExpectation: string;
  mechanismChain: string[];
  easySummary: string;
  assetImpacts: Array<{
    asset: string;
    direction: SignalDirection;
    horizon: string;
    reason: string;
  }>;
  cautionNote: string;
}
