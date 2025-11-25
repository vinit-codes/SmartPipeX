/**
 * Mock data generator for pipeline leak detection system
 * Generates realistic sensor readings with flow rates and leak detection
 */

import { SettingsManager } from './settingsManager';

/**
 * Get the current leak threshold from settings (server-safe)
 */
function getCurrentThreshold(): number {
  try {
    // For server-side or when localStorage is not available, use default
    if (typeof window === 'undefined') {
      return 0.3; // Default threshold
    }
    return SettingsManager.getSetting('leakThreshold') || 0.3;
  } catch {
    return 0.3; // Fallback to default
  }
}

export interface SensorReading {
  timestamp: string;
  inputFlow: number;
  outputFlow: number;
  leakDetected: boolean;
  waterLoss: number;
  severity?: 'mild' | 'medium' | 'critical';
  severityScore?: number;
}

export interface PredictiveAnalysis {
  riskScore: number;
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  leakFrequency: number;
  avgFlowDifference: number;
  recommendation: string;
  analysisTimestamp: string;
  sampleSize: number;
}

/**
 * Configuration for mock data generation
 */
const CONFIG = {
  // Flow rate range in L/min
  MIN_FLOW: 0,
  MAX_FLOW: 4,

  // Leak simulation parameters
  LEAK_PROBABILITY: 0.15, // 15% chance of leak in any sample
  LEAK_SEVERITY_MIN: 0.3, // Minimum 30% flow reduction during leak
  LEAK_SEVERITY_MAX: 0.8, // Maximum 80% flow reduction during leak

  // Flow variation parameters
  NORMAL_VARIATION: 0.1, // ±10% normal flow variation
  MEASUREMENT_PRECISION: 3, // Decimal places for flow readings
} as const;

/**
 * Generate a random float within a specified range
 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Round number to specified decimal places
 */
function roundToPrecision(num: number, precision: number): number {
  return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}

/**
 * Generate a realistic input flow rate with some variation
 */
function generateInputFlow(): number {
  const baseFlow = randomFloat(CONFIG.MIN_FLOW, CONFIG.MAX_FLOW);
  const variation = baseFlow * CONFIG.NORMAL_VARIATION * (Math.random() - 0.5);
  const flow = Math.max(CONFIG.MIN_FLOW, baseFlow + variation);
  return roundToPrecision(flow, CONFIG.MEASUREMENT_PRECISION);
}

/**
 * Enhanced leak detection logic with severity scoring
 */
interface LeakEvaluationResult {
  leakDetected: boolean;
  severity: 'mild' | 'medium' | 'critical' | undefined;
  severityScore: number;
}

let consecutiveLeakCount = 0;

/**
 * Evaluate leak detection based on threshold and calculate severity
 */
function evaluateLeakDetection(
  inputFlow: number,
  outputFlow: number,
  threshold: number = 0.3
): LeakEvaluationResult {
  const difference = inputFlow - outputFlow;

  if (difference > threshold) {
    consecutiveLeakCount++;

    // Calculate severity score: (difference * 2) + (consecutiveLeakCount * 1.5)
    const severityScore = difference * 2 + consecutiveLeakCount * 1.5;

    let severity: 'mild' | 'medium' | 'critical';
    if (severityScore >= 6) {
      severity = 'critical';
    } else if (severityScore >= 3) {
      severity = 'medium';
    } else {
      severity = 'mild';
    }

    return {
      leakDetected: true,
      severity,
      severityScore: roundToPrecision(severityScore, 2),
    };
  } else {
    consecutiveLeakCount = 0; // Reset consecutive count if no leak
    return {
      leakDetected: false,
      severity: undefined,
      severityScore: 0,
    };
  }
}

/**
 * Generate output flow based on input flow, with potential leak simulation
 */
function generateOutputFlow(inputFlow: number): {
  outputFlow: number;
  leakDetected: boolean;
} {
  const hasLeak = Math.random() < CONFIG.LEAK_PROBABILITY;

  if (hasLeak) {
    // Simulate leak by reducing output flow
    const leakSeverity = randomFloat(
      CONFIG.LEAK_SEVERITY_MIN,
      CONFIG.LEAK_SEVERITY_MAX
    );
    const outputFlow = inputFlow * (1 - leakSeverity);
    const normalVariation =
      outputFlow * CONFIG.NORMAL_VARIATION * (Math.random() - 0.5);

    return {
      outputFlow: roundToPrecision(
        Math.max(0, outputFlow + normalVariation),
        CONFIG.MEASUREMENT_PRECISION
      ),
      leakDetected: true,
    };
  } else {
    // Normal operation with minor measurement variations
    const variation =
      inputFlow * CONFIG.NORMAL_VARIATION * (Math.random() - 0.5);
    const outputFlow = inputFlow + variation;

    return {
      outputFlow: roundToPrecision(
        Math.max(0, outputFlow),
        CONFIG.MEASUREMENT_PRECISION
      ),
      leakDetected: false,
    };
  }
}

/**
 * Generate a single sensor reading sample with enhanced leak detection
 */
export function generateOneSample(threshold?: number): SensorReading {
  const leakThreshold = threshold ?? getCurrentThreshold();
  const timestamp = new Date().toISOString();
  const inputFlow = generateInputFlow();
  const { outputFlow } = generateOutputFlow(inputFlow);
  const waterLoss = roundToPrecision(
    inputFlow - outputFlow,
    CONFIG.MEASUREMENT_PRECISION
  );

  // Apply enhanced leak detection logic
  const leakEvaluation = evaluateLeakDetection(
    inputFlow,
    outputFlow,
    leakThreshold
  );

  return {
    timestamp,
    inputFlow,
    outputFlow,
    leakDetected: leakEvaluation.leakDetected,
    waterLoss,
    severity: leakEvaluation.severity,
    severityScore: leakEvaluation.severityScore,
  };
}

/**
 * Generate historical sensor data with specified number of readings and enhanced leak detection
 */
export function generateHistoricalData(
  count: number,
  threshold?: number
): SensorReading[] {
  const leakThreshold = threshold ?? getCurrentThreshold();
  if (count <= 0) {
    return [];
  }

  // Reset consecutive leak count for historical generation
  consecutiveLeakCount = 0;

  const readings: SensorReading[] = [];
  const now = new Date();

  // Generate readings with timestamps going back in time
  // Assume readings are taken every 5 minutes
  const READING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(
      now.getTime() - i * READING_INTERVAL_MS
    ).toISOString();
    const inputFlow = generateInputFlow();
    const { outputFlow } = generateOutputFlow(inputFlow);
    const waterLoss = roundToPrecision(
      inputFlow - outputFlow,
      CONFIG.MEASUREMENT_PRECISION
    );

    // Apply enhanced leak detection logic
    const leakEvaluation = evaluateLeakDetection(
      inputFlow,
      outputFlow,
      leakThreshold
    );

    readings.push({
      timestamp,
      inputFlow,
      outputFlow,
      leakDetected: leakEvaluation.leakDetected,
      waterLoss,
      severity: leakEvaluation.severity,
      severityScore: leakEvaluation.severityScore,
    });
  }

  return readings;
}

/**
 * Generate continuous monitoring data (for real-time simulation) with enhanced leak detection
 */
export function generateContinuousData(
  startTime: Date,
  endTime: Date,
  intervalMinutes: number = 5,
  threshold?: number
): SensorReading[] {
  const leakThreshold = threshold ?? getCurrentThreshold();
  // Reset consecutive leak count for continuous generation
  consecutiveLeakCount = 0;

  const readings: SensorReading[] = [];
  const intervalMs = intervalMinutes * 60 * 1000;

  for (
    let time = startTime.getTime();
    time <= endTime.getTime();
    time += intervalMs
  ) {
    const timestamp = new Date(time).toISOString();
    const inputFlow = generateInputFlow();
    const { outputFlow } = generateOutputFlow(inputFlow);
    const waterLoss = roundToPrecision(
      inputFlow - outputFlow,
      CONFIG.MEASUREMENT_PRECISION
    );

    // Apply enhanced leak detection logic
    const leakEvaluation = evaluateLeakDetection(
      inputFlow,
      outputFlow,
      leakThreshold
    );

    readings.push({
      timestamp,
      inputFlow,
      outputFlow,
      leakDetected: leakEvaluation.leakDetected,
      waterLoss,
      severity: leakEvaluation.severity,
      severityScore: leakEvaluation.severityScore,
    });
  }

  return readings;
}

/**
 * Utility function to get leak detection statistics from a dataset
 */
export function getLeakStats(readings: SensorReading[]) {
  const totalReadings = readings.length;
  const leakReadings = readings.filter((r) => r.leakDetected).length;
  const totalWaterLoss = readings.reduce((sum, r) => sum + r.waterLoss, 0);
  const avgInputFlow =
    readings.reduce((sum, r) => sum + r.inputFlow, 0) / totalReadings;
  const avgOutputFlow =
    readings.reduce((sum, r) => sum + r.outputFlow, 0) / totalReadings;

  return {
    totalReadings,
    leakReadings,
    leakPercentage: roundToPrecision((leakReadings / totalReadings) * 100, 1),
    totalWaterLoss: roundToPrecision(
      totalWaterLoss,
      CONFIG.MEASUREMENT_PRECISION
    ),
    avgWaterLoss: roundToPrecision(
      totalWaterLoss / totalReadings,
      CONFIG.MEASUREMENT_PRECISION
    ),
    avgInputFlow: roundToPrecision(avgInputFlow, CONFIG.MEASUREMENT_PRECISION),
    avgOutputFlow: roundToPrecision(
      avgOutputFlow,
      CONFIG.MEASUREMENT_PRECISION
    ),
  };
}

/**
 * AI-like predictive maintenance analysis
 * Analyzes the last 50 readings to predict system risk
 */
export function performPredictiveAnalysis(
  readings?: SensorReading[]
): PredictiveAnalysis {
  // If no readings provided, generate recent historical data for analysis
  const analysisData = readings || generateHistoricalData(50);

  // Take only the last 50 readings for analysis
  const recentReadings = analysisData.slice(-50);
  const sampleSize = recentReadings.length;

  if (sampleSize === 0) {
    return {
      riskScore: 0,
      riskCategory: 'Low Risk',
      leakFrequency: 0,
      avgFlowDifference: 0,
      recommendation: 'No data available for analysis',
      analysisTimestamp: new Date().toISOString(),
      sampleSize: 0,
    };
  }

  // Calculate leak frequency (percentage of readings with leaks)
  const leakCount = recentReadings.filter((r) => r.leakDetected).length;
  const leakFrequency = roundToPrecision((leakCount / sampleSize) * 100, 2);

  // Calculate average flow difference (input - output)
  const totalFlowDifference = recentReadings.reduce(
    (sum, r) => sum + Math.abs(r.inputFlow - r.outputFlow),
    0
  );
  const avgFlowDifference = roundToPrecision(
    totalFlowDifference / sampleSize,
    3
  );

  // Compute risk score: (leakFrequency * 4) + (avgFlowDiff * 5)
  const riskScore = roundToPrecision(
    leakFrequency * 4 + avgFlowDifference * 5,
    2
  );

  // Determine risk category
  let riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  if (riskScore >= 41) {
    riskCategory = 'High Risk';
  } else if (riskScore >= 21) {
    riskCategory = 'Moderate Risk';
  } else {
    riskCategory = 'Low Risk';
  }

  // Generate intelligent recommendations
  const recommendation = generateRecommendation(
    riskScore,
    leakFrequency,
    avgFlowDifference,
    leakCount,
    sampleSize
  );

  return {
    riskScore,
    riskCategory,
    leakFrequency,
    avgFlowDifference,
    recommendation,
    analysisTimestamp: new Date().toISOString(),
    sampleSize,
  };
}

/**
 * Generate intelligent maintenance recommendations based on analysis
 */
function generateRecommendation(
  riskScore: number,
  leakFrequency: number,
  avgFlowDifference: number,
  leakCount: number,
  sampleSize: number
): string {
  const recommendations: string[] = [];

  // Risk-based recommendations
  if (riskScore >= 41) {
    recommendations.push('🚨 URGENT: Immediate system inspection required');
    recommendations.push('Consider emergency maintenance shutdown');
  } else if (riskScore >= 21) {
    recommendations.push('⚠️ Schedule preventive maintenance within 48 hours');
    recommendations.push('Monitor system closely for deterioration');
  } else {
    recommendations.push('✅ System operating within normal parameters');
  }

  // Leak frequency specific recommendations
  if (leakFrequency > 30) {
    recommendations.push('High leak frequency detected - check pipe integrity');
  } else if (leakFrequency > 15) {
    recommendations.push(
      'Moderate leak pattern - inspect joints and connections'
    );
  } else if (leakFrequency === 0) {
    recommendations.push(
      'No recent leaks detected - maintain current monitoring'
    );
  }

  // Flow difference specific recommendations
  if (avgFlowDifference > 1.5) {
    recommendations.push(
      'Significant flow variations - check pump performance'
    );
  } else if (avgFlowDifference > 0.8) {
    recommendations.push(
      'Minor flow inconsistencies - verify sensor calibration'
    );
  }

  // Pattern-based recommendations
  if (leakCount > 0) {
    const consecutivePattern = analyzeLeakPattern(leakCount, sampleSize);
    if (consecutivePattern.hasConsecutiveLeaks) {
      recommendations.push(
        `Consecutive leak pattern detected - ${consecutivePattern.recommendation}`
      );
    }
  }

  // Maintenance schedule recommendations
  if (riskScore < 10 && leakFrequency < 5) {
    recommendations.push('Consider extending maintenance intervals');
  }

  return recommendations.slice(0, 3).join('. ') + '.';
}

/**
 * Analyze leak patterns for consecutive occurrences
 */
function analyzeLeakPattern(
  leakCount: number,
  sampleSize: number
): {
  hasConsecutiveLeaks: boolean;
  recommendation: string;
} {
  const leakRatio = leakCount / sampleSize;

  if (leakRatio > 0.4) {
    return {
      hasConsecutiveLeaks: true,
      recommendation:
        'systematic failure likely, schedule comprehensive inspection',
    };
  } else if (leakRatio > 0.2) {
    return {
      hasConsecutiveLeaks: true,
      recommendation: 'recurring issue detected, check common failure points',
    };
  }

  return {
    hasConsecutiveLeaks: false,
    recommendation: 'isolated incidents, continue monitoring',
  };
}
