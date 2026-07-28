export type LeakSeverity = 'mild' | 'medium' | 'critical';
export type DataSource = 'esp32' | 'database' | 'simulation';

export interface SensorReading {
  deviceId: string;
  timestamp: string;
  inputFlow: number;
  outputFlow: number;
  waterLoss: number;
  lossPercentage: number;
  leakDetected: boolean;
  severity?: LeakSeverity;
  severityScore: number;
  source?: DataSource;
}

export interface LeakAlert extends SensorReading {
  id: string;
  message: string;
  acknowledged: boolean;
}

export interface RiskAnalysis {
  riskScore: number;
  riskCategory: 'Low' | 'Moderate' | 'High';
  leakFrequency: number;
  averageWaterLoss: number;
  efficiency: number;
  recommendation: string;
  sampleSize: number;
  analysedAt: string;
}

export interface ConsumptionPoint {
  label: string;
  inputVolume: number;
  deliveredVolume: number;
  waterLoss: number;
  efficiency: number;
}

export interface ConsumptionSummary {
  consumption: ConsumptionPoint[];
  summary: {
    totalInput: number;
    totalDelivered: number;
    totalWaterLoss: number;
    dailyAverage: number;
    monthlyProjection: number;
    efficiency: number;
    weeklyTrend: number;
  };
  source: DataSource;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
