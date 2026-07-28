import { createSensorReading } from '@/lib/domain/leak-detection';
import type { SensorReading } from '@/lib/types';

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function readingAt(timestamp: Date, index: number): SensorReading {
  const minuteBucket = Math.floor(timestamp.getTime() / 60_000);
  const seed = minuteBucket + index * 17;
  const baseline = 3.05 + Math.sin(seed / 9) * 0.28;
  const inputFlow = Math.max(0.2, baseline + (pseudoRandom(seed) - 0.5) * 0.18);
  const leakWindow = seed % 37 === 0 || seed % 37 === 1 || seed % 91 === 0;
  const normalLoss = 0.04 + pseudoRandom(seed + 4) * 0.08;
  const simulatedLoss = leakWindow
    ? 0.45 + pseudoRandom(seed + 9) * 1.15
    : normalLoss;

  return {
    ...createSensorReading({
      deviceId: 'SIM_PIPELINE_001',
      timestamp: timestamp.toISOString(),
      inputFlow,
      outputFlow: Math.max(0, inputFlow - simulatedLoss),
    }),
    source: 'simulation',
  };
}

export function generateLiveReading(): SensorReading {
  const now = new Date();
  const fiveSecondBucket = Math.floor(now.getTime() / 5_000);
  return readingAt(now, fiveSecondBucket);
}

export function generateHistoricalReadings(
  count = 96,
  intervalMinutes = 5
): SensorReading[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const offset = count - index - 1;
    const timestamp = new Date(
      now.getTime() - offset * intervalMinutes * 60_000
    );
    return readingAt(timestamp, index);
  });
}
