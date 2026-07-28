import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyseRisk,
  assessLeak,
  createSensorReading,
} from '../lib/domain/leak-detection.ts';
import type { SensorReading } from '../lib/types.ts';

test('does not flag normal sensor variation as a leak', () => {
  const result = assessLeak(3.1, 2.92, 0.3);
  assert.equal(result.leakDetected, false);
  assert.equal(result.severityScore, 0);
  assert.equal(result.waterLoss, 0.18);
});

test('classifies high water loss as critical', () => {
  const result = assessLeak(4, 1.9, 0.3);
  assert.equal(result.leakDetected, true);
  assert.equal(result.severity, 'critical');
  assert.ok(result.severityScore >= 7);
});

test('normalises negative water loss caused by sensor drift', () => {
  const result = assessLeak(2.5, 2.6, 0.3);
  assert.equal(result.waterLoss, 0);
  assert.equal(result.lossPercentage, 0);
});

test('creates a complete typed sensor reading', () => {
  const reading = createSensorReading({
    deviceId: 'ESP32_TEST_001',
    timestamp: '2026-07-28T10:00:00.000Z',
    inputFlow: 3.2,
    outputFlow: 2.4,
  });

  assert.equal(reading.deviceId, 'ESP32_TEST_001');
  assert.equal(reading.leakDetected, true);
  assert.equal(reading.waterLoss, 0.8);
});

test('risk analysis distinguishes stable and high-risk datasets', () => {
  const stable: SensorReading[] = Array.from({ length: 24 }, (_, index) =>
    createSensorReading({
      deviceId: 'TEST',
      timestamp: new Date(index * 60_000).toISOString(),
      inputFlow: 3,
      outputFlow: 2.94,
    })
  );
  const risky: SensorReading[] = Array.from({ length: 24 }, (_, index) =>
    createSensorReading({
      deviceId: 'TEST',
      timestamp: new Date(index * 60_000).toISOString(),
      inputFlow: 4,
      outputFlow: index % 3 === 0 ? 1.4 : 2.7,
    })
  );

  assert.equal(analyseRisk(stable).riskCategory, 'Low');
  assert.equal(analyseRisk(risky).riskCategory, 'High');
});
