import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTargetDimensions } from './imageOptimize.ts';

test('computeTargetDimensions preserves dimensions within maxDim limit', () => {
  const res = computeTargetDimensions(1280, 720, 1600);
  assert.deepEqual(res, { width: 1280, height: 720 });
});

test('computeTargetDimensions proportionally scales oversized 4K chart screenshots', () => {
  const res = computeTargetDimensions(3840, 2160, 1600);
  assert.deepEqual(res, { width: 1600, height: 900 });
});
