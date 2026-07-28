import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateConsumption } from '../lib/domain/consumption.ts';
import type { SensorReading } from '../lib/types.ts';

function reading(timestamp: string, inputFlow: number, outputFlow: number): SensorReading {
  return {
    deviceId: 'ESP32_TEST',
    timestamp,
    inputFlow,
    outputFlow,
    waterLoss: Math.max(0, inputFlow - outputFlow),
    lossPercentage: inputFlow === 0 ? 0 : ((inputFlow - outputFlow) / inputFlow) * 100,
    leakDetected: inputFlow - outputFlow >= 0.3,
    severityScore: 0,
  };
}

test('integrates flow using the actual five-second sample interval', () => {
  const result = calculateConsumption(
    [
      reading('2026-07-28T00:00:00.000Z', 6, 5),
      reading('2026-07-28T00:00:05.000Z', 6, 5),
      reading('2026-07-28T00:00:10.000Z', 6, 5),
    ],
    'esp32'
  );

  assert.equal(result.summary.totalInput, 1.5);
  assert.equal(result.summary.totalDelivered, 1.25);
  assert.equal(result.summary.totalWaterLoss, 0.25);
});

test('does not invent consumption from a single timestamp', () => {
  const result = calculateConsumption(
    [reading('2026-07-28T00:00:00.000Z', 6, 5)],
    'database'
  );

  assert.equal(result.summary.totalInput, 0);
  assert.equal(result.summary.totalDelivered, 0);
});

test('ignores an unbounded telemetry gap instead of inflating usage', () => {
  const result = calculateConsumption(
    [
      reading('2026-07-28T00:00:00.000Z', 6, 5),
      reading('2026-07-28T01:00:00.000Z', 6, 5),
    ],
    'database'
  );

  assert.equal(result.summary.totalInput, 0);
  assert.equal(result.summary.totalDelivered, 0);
});
