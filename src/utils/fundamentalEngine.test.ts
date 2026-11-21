import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRoleplayStats,
  evaluateMacroRelease,
  evaluateRoleplayChoice,
  validateCustomNewsInput,
} from './fundamentalEngine';
import { HISTORICAL_NEWS_ROLEPLAYS, MACRO_INDICATORS } from '../data/fundamentalData';

test('evaluateMacroRelease maps hotter US CPI to hawkish rate expectation and bearish XAUUSD', () => {
  const cpi = MACRO_INDICATORS.find((m) => m.id === 'US_CPI')!;
  const res = evaluateMacroRelease({ indicator: cpi, forecast: 3.1, actual: 3.5 });

  assert.equal(res.surpriseState, 'ABOVE_FORECAST');
  assert.equal(res.dxyBias, 'BULLISH');
  const gold = res.assetImpacts.find((a) => a.asset === 'XAUUSD')!;
  assert.equal(gold.direction, 'BEARISH');
  assert.ok(res.easySummary.includes('XAUUSD'));
});

test('evaluateMacroRelease maps rising DXY to inverse bearish XAUUSD and falling DXY to bullish XAUUSD', () => {
  const dxy = MACRO_INDICATORS.find((m) => m.id === 'DXY')!;
  const up = evaluateMacroRelease({ indicator: dxy, forecast: 104.2, actual: 105.6 });
  const down = evaluateMacroRelease({ indicator: dxy, forecast: 104.2, actual: 102.9 });

  assert.equal(up.assetImpacts.find((a) => a.asset === 'XAUUSD')?.direction, 'BEARISH');
  assert.equal(down.assetImpacts.find((a) => a.asset === 'XAUUSD')?.direction, 'BULLISH');
});

test('evaluateMacroRelease flags in-line release as neutral whipsaw risk', () => {
  const cpi = MACRO_INDICATORS.find((m) => m.id === 'US_CPI')!;
  const inLine = evaluateMacroRelease({ indicator: cpi, forecast: 3.1, actual: 3.12 });

  assert.equal(inLine.surpriseState, 'IN_LINE');
  assert.equal(inLine.dxyBias, 'NETRAL');
  assert.equal(inLine.assetImpacts[0].direction, 'NETRAL');
});

test('evaluateMacroRelease maps Fed rate cut below forecast to bullish XAUUSD and BTCUSDT', () => {
  const fed = MACRO_INDICATORS.find((m) => m.id === 'FED_RATE')!;
  const cut = evaluateMacroRelease({ indicator: fed, forecast: 5.25, actual: 4.75 });

  assert.equal(cut.dxyBias, 'BEARISH');
  assert.equal(cut.assetImpacts.find((a) => a.asset === 'XAUUSD')?.direction, 'BULLISH');
  assert.equal(cut.assetImpacts.find((a) => a.asset === 'BTCUSDT')?.direction, 'BULLISH');
});

test('evaluateRoleplayChoice and computeRoleplayStats track accuracy cleanly', () => {
  const first = HISTORICAL_NEWS_ROLEPLAYS[0];
  const second = HISTORICAL_NEWS_ROLEPLAYS[1];

  const r1 = evaluateRoleplayChoice(first, first.correctAction);
  const r2 = evaluateRoleplayChoice(second, 'BULLISH'); // wrong against BEARISH

  assert.equal(r1.isCorrect, true);
  assert.equal(r2.isCorrect, false);

  const stats = computeRoleplayStats([r1, r2], HISTORICAL_NEWS_ROLEPLAYS.length);
  assert.equal(stats.completedCount, 2);
  assert.equal(stats.correctCount, 1);
  assert.equal(stats.accuracyPercent, 50);
});

test('validateCustomNewsInput enforces minimum length', () => {
  assert.equal(validateCustomNewsInput('short').valid, false);
  assert.equal(
    validateCustomNewsInput('US CPI naik ke 3.5% dari perkiraan 3.1%, DXY menguat tajam').valid,
    true
  );
});
