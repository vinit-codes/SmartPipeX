import type { LeakSeverity, RiskAnalysis, SensorReading } from '@/lib/types';

export const DEFAULT_LEAK_THRESHOLD = 0.3;
export const MAX_FLOW_RATE = 100;

export interface LeakAssessment {
  waterLoss: number;
  lossPercentage: number;
  leakDetected: boolean;
  severity?: LeakSeverity;
  severityScore: number;
}

const round = (value: number, precision = 3) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

export function assessLeak(
  inputFlow: number,
  outputFlow: number,
  threshold = DEFAULT_LEAK_THRESHOLD
): LeakAssessment {
  const safeInput = Math.max(0, inputFlow);
  const safeOutput = Math.max(0, outputFlow);
  const waterLoss = round(Math.max(0, safeInput - safeOutput));
  const lossPercentage =
    safeInput === 0 ? 0 : round((waterLoss / safeInput) * 100, 1);
  const leakDetected = waterLoss > threshold;

  if (!leakDetected) {
    return {
      waterLoss,
      lossPercentage,
      leakDetected: false,
      severityScore: 0,
    };
  }

  const thresholdRatio = waterLoss / Math.max(threshold, 0.01);
  const severityScore = round(Math.min(10, thresholdRatio * 1.8), 1);

  let severity: LeakSeverity = 'mild';
  if (severityScore >= 7) severity = 'critical';
  else if (severityScore >= 4) severity = 'medium';

  return {
    waterLoss,
    lossPercentage,
    leakDetected: true,
    severity,
    severityScore,
  };
}

export function createSensorReading(input: {
  deviceId?: string;
  timestamp?: string;
  inputFlow: number;
  outputFlow: number;
  threshold?: number;
}): SensorReading {
  const assessment = assessLeak(
    input.inputFlow,
    input.outputFlow,
    input.threshold
  );

  return {
    deviceId: input.deviceId?.trim() || 'ESP32_UNKNOWN',
    timestamp: input.timestamp || new Date().toISOString(),
    inputFlow: round(input.inputFlow),
    outputFlow: round(input.outputFlow),
    ...assessment,
  };
}

export function analyseRisk(readings: SensorReading[]): RiskAnalysis {
  const sample = readings.slice(-96);
  if (sample.length === 0) {
    return {
      riskScore: 0,
      riskCategory: 'Low',
      leakFrequency: 0,
      averageWaterLoss: 0,
      efficiency: 100,
      recommendation: 'No readings are available yet.',
      sampleSize: 0,
      analysedAt: new Date().toISOString(),
    };
  }

  const leakReadings = sample.filter((reading) => reading.leakDetected);
  const leakFrequency = round((leakReadings.length / sample.length) * 100, 1);
  const averageWaterLoss = round(
    sample.reduce((sum, reading) => sum + reading.waterLoss, 0) / sample.length
  );
  const totalInput = sample.reduce((sum, reading) => sum + reading.inputFlow, 0);
  const totalOutput = sample.reduce(
    (sum, reading) => sum + reading.outputFlow,
    0
  );
  const efficiency =
    totalInput === 0 ? 100 : round((totalOutput / totalInput) * 100, 1);
  const criticalRatio =
    leakReadings.filter((reading) => reading.severity === 'critical').length /
    sample.length;

  const riskScore = round(
    Math.min(
      100,
      leakFrequency * 1.1 + averageWaterLoss * 18 + criticalRatio * 100 * 1.4
    ),
    1
  );

  let riskCategory: RiskAnalysis['riskCategory'] = 'Low';
  let recommendation =
    'System behaviour is stable. Continue routine monitoring and calibration.';

  if (riskScore >= 65) {
    riskCategory = 'High';
    recommendation =
      'Inspect the pipeline immediately and isolate the affected section before continued operation.';
  } else if (riskScore >= 30) {
    riskCategory = 'Moderate';
    recommendation =
      'Schedule a targeted inspection and verify sensor calibration within the next maintenance window.';
  }

  return {
    riskScore,
    riskCategory,
    leakFrequency,
    averageWaterLoss,
    efficiency,
    recommendation,
    sampleSize: sample.length,
    analysedAt: new Date().toISOString(),
  };
}
