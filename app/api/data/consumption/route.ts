import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseService, SensorReadingDocument } from '@/lib/database';
import { generateHistoricalData } from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';

interface ConsumptionData {
  date: string;
  totalConsumption: number;
  averageFlow: number;
  peakFlow: number;
  activeHours: number;
  efficiency: number; // percentage (output/input * 100)
}

interface ConsumptionSummary {
  period: string;
  totalConsumption: number;
  dailyAverage: number;
  weeklyTrend: number;
  monthlyProjection: number;
  efficiency: number;
  comparedToLastPeriod: number;
}

/**
 * GET /api/data/consumption?period=daily&days=7
 * Returns water consumption analytics
 * Query parameters:
 * - period: 'daily', 'weekly', 'monthly' (default: 'daily')
 * - days: number of days to analyze (default: 7, max: 90)
 * - deviceId: specific device (default: ESP32_DEV_PIPELINE_001)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const daysParam = searchParams.get('days');
    const deviceId = searchParams.get('deviceId') || 'ESP32_DEV_PIPELINE_001';

    // Validate period
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        ApiResponseHelper.error(
          `Invalid period. Must be one of: ${validPeriods.join(', ')}`
        ),
        { status: 400 }
      );
    }

    // Parse and validate days parameter
    let days = 7; // Default
    if (daysParam) {
      const parsedDays = parseInt(daysParam, 10);
      if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 90) {
        return NextResponse.json(
          ApiResponseHelper.error('Days parameter must be between 1 and 90'),
          { status: 400 }
        );
      }
      days = parsedDays;
    }

    let consumptionData: ConsumptionData[] = [];
    let source = 'mock';

    try {
      // Try to get ESP32 data first
      const dbService = await getDatabaseService();
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - days * 24 * 60 * 60 * 1000
      );

      const readings = await dbService.getHistoricalReadings(
        1000, // Get enough readings
        deviceId,
        startDate,
        endDate
      );

      if (readings.length > 0) {
        consumptionData = processConsumptionData(readings, period);
        source = 'esp32';
      }
    } catch (dbError) {
      console.log(
        'Database query failed for consumption, falling back to mock data:',
        dbError
      );
    }

    // Fallback to mock data if no ESP32 data available
    if (consumptionData.length === 0) {
      const mockReadings = generateHistoricalData(days * 24); // Simulate hourly readings
      consumptionData = processConsumptionFromMock(mockReadings, period);
      source = 'mock';
    }

    // Calculate summary statistics
    const summary = calculateConsumptionSummary(consumptionData, period);

    const responseData = {
      consumption: consumptionData,
      summary,
      source,
      period,
      days,
      deviceId,
    };

    return NextResponse.json(
      ApiResponseHelper.success(
        responseData,
        `Retrieved ${consumptionData.length} ${period} consumption records`
      )
    );
  } catch (error) {
    console.error('Error generating consumption data:', error);
    return NextResponse.json(
      ApiResponseHelper.error('Failed to retrieve consumption data'),
      { status: 500 }
    );
  }
}

function processConsumptionData(
  readings: SensorReadingDocument[],
  period: string
): ConsumptionData[] {
  const consumptionMap = new Map<
    string,
    {
      totalInput: number;
      totalOutput: number;
      maxFlow: number;
      readingCount: number;
      activeReadings: number;
    }
  >();

  // Group readings by date
  readings.forEach((reading) => {
    const date = new Date(reading.timestamp);
    const dateKey =
      period === 'daily' ? date.toISOString().split('T')[0] : getWeekKey(date); // For weekly grouping

    if (!consumptionMap.has(dateKey)) {
      consumptionMap.set(dateKey, {
        totalInput: 0,
        totalOutput: 0,
        maxFlow: 0,
        readingCount: 0,
        activeReadings: 0,
      });
    }

    const dayData = consumptionMap.get(dateKey)!;
    dayData.totalInput += reading.inputFlow;
    dayData.totalOutput += reading.outputFlow;
    dayData.maxFlow = Math.max(dayData.maxFlow, reading.inputFlow);
    dayData.readingCount++;

    if (reading.inputFlow > 0.1) {
      // Consider as active if flow > 0.1 L/min
      dayData.activeReadings++;
    }
  });

  // Convert to ConsumptionData array
  const result: ConsumptionData[] = [];
  consumptionMap.forEach((data, dateKey) => {
    const averageFlow =
      data.readingCount > 0 ? data.totalInput / data.readingCount : 0;
    const activeHours = (data.activeReadings * 10) / 60 / 60; // Convert 10-second intervals to hours
    const efficiency =
      data.totalInput > 0 ? (data.totalOutput / data.totalInput) * 100 : 100;

    result.push({
      date: dateKey,
      totalConsumption: data.totalInput,
      averageFlow: Math.round(averageFlow * 100) / 100,
      peakFlow: Math.round(data.maxFlow * 100) / 100,
      activeHours: Math.round(activeHours * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function processConsumptionFromMock(
  mockReadings: { timestamp: string; inputFlow: number; outputFlow: number }[],
  period: string
): ConsumptionData[] {
  // Similar processing but for mock data
  const consumptionMap = new Map<
    string,
    {
      totalInput: number;
      totalOutput: number;
      maxFlow: number;
      readingCount: number;
      activeReadings: number;
    }
  >();

  mockReadings.forEach((reading) => {
    const date = new Date(reading.timestamp);
    const dateKey =
      period === 'daily' ? date.toISOString().split('T')[0] : getWeekKey(date);

    if (!consumptionMap.has(dateKey)) {
      consumptionMap.set(dateKey, {
        totalInput: 0,
        totalOutput: 0,
        maxFlow: 0,
        readingCount: 0,
        activeReadings: 0,
      });
    }

    const dayData = consumptionMap.get(dateKey)!;
    dayData.totalInput += reading.inputFlow;
    dayData.totalOutput += reading.outputFlow;
    dayData.maxFlow = Math.max(dayData.maxFlow, reading.inputFlow);
    dayData.readingCount++;

    if (reading.inputFlow > 0.1) {
      dayData.activeReadings++;
    }
  });

  const result: ConsumptionData[] = [];
  consumptionMap.forEach((data, dateKey) => {
    const averageFlow =
      data.readingCount > 0 ? data.totalInput / data.readingCount : 0;
    const activeHours = Math.random() * 12 + 2; // Mock active hours (2-14 hours)
    const efficiency = 95 + Math.random() * 4; // Mock efficiency (95-99%)

    result.push({
      date: dateKey,
      totalConsumption: Math.round(data.totalInput * 100) / 100,
      averageFlow: Math.round(averageFlow * 100) / 100,
      peakFlow: Math.round(data.maxFlow * 100) / 100,
      activeHours: Math.round(activeHours * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function getWeekKey(date: Date): string {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday as start of week
  return startOfWeek.toISOString().split('T')[0];
}

function calculateConsumptionSummary(
  consumptionData: ConsumptionData[],
  period: string
): ConsumptionSummary {
  if (consumptionData.length === 0) {
    return {
      period,
      totalConsumption: 0,
      dailyAverage: 0,
      weeklyTrend: 0,
      monthlyProjection: 0,
      efficiency: 100,
      comparedToLastPeriod: 0,
    };
  }

  const totalConsumption = consumptionData.reduce(
    (sum, day) => sum + day.totalConsumption,
    0
  );
  const dailyAverage = totalConsumption / consumptionData.length;
  const averageEfficiency =
    consumptionData.reduce((sum, day) => sum + day.efficiency, 0) /
    consumptionData.length;

  // Calculate trend (last half vs first half)
  const midPoint = Math.floor(consumptionData.length / 2);
  const firstHalf = consumptionData.slice(0, midPoint);
  const secondHalf = consumptionData.slice(midPoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, day) => sum + day.totalConsumption, 0) /
    firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, day) => sum + day.totalConsumption, 0) /
    secondHalf.length;
  const weeklyTrend =
    firstHalfAvg > 0
      ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
      : 0;

  return {
    period,
    totalConsumption: Math.round(totalConsumption * 100) / 100,
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    weeklyTrend: Math.round(weeklyTrend * 100) / 100,
    monthlyProjection: Math.round(dailyAverage * 30 * 100) / 100,
    efficiency: Math.round(averageEfficiency * 100) / 100,
    comparedToLastPeriod: Math.round(weeklyTrend * 100) / 100,
  };
}
