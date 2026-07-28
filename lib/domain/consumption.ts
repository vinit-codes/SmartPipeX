import type {
  ConsumptionPoint,
  ConsumptionSummary,
  DataSource,
  SensorReading,
} from '@/lib/types';

const MAX_INTERVAL_MINUTES = 15;

const round = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function withIntervals(readings: SensorReading[]) {
  const sorted = [...readings].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)
  );
  const measuredIntervals = sorted
    .slice(0, -1)
    .map((reading, index) =>
      (Date.parse(sorted[index + 1].timestamp) - Date.parse(reading.timestamp)) /
      60_000
    )
    .filter((minutes) => minutes > 0 && minutes <= MAX_INTERVAL_MINUTES);
  const fallbackInterval = Math.min(
    MAX_INTERVAL_MINUTES,
    Math.max(0, median(measuredIntervals))
  );

  return sorted.map((reading, index) => {
    const nextReading = sorted[index + 1];
    const measured = nextReading
      ? (Date.parse(nextReading.timestamp) - Date.parse(reading.timestamp)) /
        60_000
      : fallbackInterval;
    const intervalMinutes =
      measured > 0 && measured <= MAX_INTERVAL_MINUTES
        ? measured
        : fallbackInterval;

    return { reading, intervalMinutes };
  });
}

function groupByDay(readings: SensorReading[]): ConsumptionPoint[] {
  const groups = new Map<
    string,
    { inputVolume: number; deliveredVolume: number }
  >();

  for (const { reading, intervalMinutes } of withIntervals(readings)) {
    const day = new Date(reading.timestamp).toISOString().slice(0, 10);
    const current = groups.get(day) ?? {
      inputVolume: 0,
      deliveredVolume: 0,
    };
    current.inputVolume += reading.inputFlow * intervalMinutes;
    current.deliveredVolume += reading.outputFlow * intervalMinutes;
    groups.set(day, current);
  }

  return Array.from(groups.entries()).map(
    ([day, { inputVolume, deliveredVolume }]) => {
      const waterLoss = Math.max(0, inputVolume - deliveredVolume);
      return {
        label: new Intl.DateTimeFormat('en', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(`${day}T00:00:00Z`)),
        inputVolume: round(inputVolume),
        deliveredVolume: round(deliveredVolume),
        waterLoss: round(waterLoss),
        efficiency:
          inputVolume === 0
            ? 100
            : round((deliveredVolume / inputVolume) * 100, 1),
      };
    }
  );
}

export function calculateConsumption(
  readings: SensorReading[],
  source: DataSource
): ConsumptionSummary {
  const consumption = groupByDay(readings);
  const totalInput = consumption.reduce(
    (sum, point) => sum + point.inputVolume,
    0
  );
  const totalDelivered = consumption.reduce(
    (sum, point) => sum + point.deliveredVolume,
    0
  );
  const totalWaterLoss = Math.max(0, totalInput - totalDelivered);
  const dailyAverage = consumption.length
    ? totalDelivered / consumption.length
    : 0;
  const previous = consumption.at(-2)?.deliveredVolume || 0;
  const current = consumption.at(-1)?.deliveredVolume || 0;
  const weeklyTrend = previous === 0 ? 0 : ((current - previous) / previous) * 100;

  return {
    consumption,
    summary: {
      totalInput: round(totalInput),
      totalDelivered: round(totalDelivered),
      totalWaterLoss: round(totalWaterLoss),
      dailyAverage: round(dailyAverage),
      monthlyProjection: round(dailyAverage * 30),
      efficiency:
        totalInput === 0
          ? 100
          : round((totalDelivered / totalInput) * 100, 1),
      weeklyTrend: round(weeklyTrend, 1),
    },
    source,
  };
}
