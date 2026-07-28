import {
  generateHistoricalReadings,
  generateLiveReading,
} from '@/lib/domain/simulation';
import {
  getAlerts,
  getDownsampledReadings,
  getHistoricalReadings,
  getLatestReading,
  isDatabaseConfigured,
} from '@/lib/server/database';
import type {
  DataSource,
  LeakAlert,
  LeakSeverity,
  SensorReading,
} from '@/lib/types';

function canUseSimulationFallback() {
  return (
    !isDatabaseConfigured() ||
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SIMULATION_FALLBACK === 'true'
  );
}

function handleDatabaseFailure(message: string, cause?: unknown) {
  if (!canUseSimulationFallback()) {
    throw new Error(message, cause === undefined ? undefined : { cause });
  }
}

function simulatedAlerts(
  count: number,
  severity: LeakSeverity | 'all'
): LeakAlert[] {
  return generateHistoricalReadings(Math.max(96, count * 8))
    .filter(
      (reading) =>
        reading.leakDetected &&
        (severity === 'all' || reading.severity === severity)
    )
    .reverse()
    .slice(0, count)
    .map((reading, index) => ({
      ...reading,
      id: `${reading.deviceId}-${reading.timestamp}-${index}`,
      acknowledged: false,
      message: `${(reading.severity || 'mild').toUpperCase()} leak detected with ${reading.waterLoss.toFixed(2)} L/min water loss.`,
    }));
}

export async function loadLatestReading(): Promise<{
  reading: SensorReading;
  source: DataSource;
}> {
  if (isDatabaseConfigured()) {
    try {
      const reading = await getLatestReading(process.env.DEFAULT_DEVICE_ID);
      if (reading) return { reading, source: reading.source || 'database' };
      handleDatabaseFailure('No telemetry reading is available.');
    } catch (error) {
      console.error('Latest reading database query failed', error);
      handleDatabaseFailure(
        'The latest telemetry reading could not be loaded.',
        error
      );
    }
  }

  const reading = generateLiveReading();
  return { reading, source: 'simulation' };
}

export async function loadHistoricalReadings(count: number): Promise<{
  readings: SensorReading[];
  source: DataSource;
}> {
  if (isDatabaseConfigured()) {
    try {
      const readings = await getHistoricalReadings(
        count,
        process.env.DEFAULT_DEVICE_ID
      );
      if (readings.length > 0) {
        return { readings, source: readings[0].source || 'database' };
      }
      handleDatabaseFailure('No historical telemetry is available.');
    } catch (error) {
      console.error('Historical reading database query failed', error);
      handleDatabaseFailure('Historical telemetry could not be loaded.', error);
    }
  }

  return { readings: generateHistoricalReadings(count), source: 'simulation' };
}

export async function loadAlerts(
  count: number,
  severity: LeakSeverity | 'all'
): Promise<{ alerts: LeakAlert[]; source: DataSource }> {
  if (isDatabaseConfigured()) {
    try {
      const alerts = await getAlerts(
        count,
        severity,
        process.env.DEFAULT_DEVICE_ID
      );
      return {
        alerts,
        source: alerts[0]?.source || 'database',
      };
    } catch (error) {
      console.error('Alert database query failed', error);
      handleDatabaseFailure('Leak alerts could not be loaded.', error);
    }
  }

  return {
    alerts: simulatedAlerts(count, severity),
    source: 'simulation',
  };
}

export async function loadDownsampledReadings(days: number): Promise<{
  readings: SensorReading[];
  source: DataSource;
}> {
  if (isDatabaseConfigured()) {
    try {
      const readings = await getDownsampledReadings(
        days,
        process.env.DEFAULT_DEVICE_ID
      );
      if (readings.length > 0) {
        return { readings, source: readings[0].source || 'database' };
      }
      handleDatabaseFailure('No consumption telemetry is available.');
    } catch (error) {
      console.error('Downsampled reading database query failed', error);
      handleDatabaseFailure('Consumption telemetry could not be loaded.', error);
    }
  }

  const readingsPerDay = 24 * 12;
  return {
    readings: generateHistoricalReadings(days * readingsPerDay),
    source: 'simulation',
  };
}
