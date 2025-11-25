import { NextRequest, NextResponse } from 'next/server';
import {
  generateOneSample,
  generateHistoricalData,
  getLeakStats,
  SensorReading,
} from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';

type StatsResponse = {
  readings: number;
  totalReadings: number;
  leakReadings: number;
  leakPercentage: number;
  totalWaterLoss: number;
  avgWaterLoss: number;
  avgInputFlow: number;
  avgOutputFlow: number;
  period: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count');
    const type = searchParams.get('type') || 'current';

    let data: SensorReading | SensorReading[] | StatsResponse;

    switch (type) {
      case 'current':
        data = generateOneSample();
        break;

      case 'historical':
        const readingCount = count ? parseInt(count, 10) : 24;
        if (isNaN(readingCount) || readingCount <= 0 || readingCount > 1000) {
          return NextResponse.json(
            ApiResponseHelper.error(
              'Invalid count parameter. Must be between 1 and 1000.'
            ),
            { status: 400 }
          );
        }
        data = generateHistoricalData(readingCount);
        break;

      case 'stats':
        const statsCount = count ? parseInt(count, 10) : 100;
        if (isNaN(statsCount) || statsCount <= 0 || statsCount > 1000) {
          return NextResponse.json(
            ApiResponseHelper.error(
              'Invalid count parameter. Must be between 1 and 1000.'
            ),
            { status: 400 }
          );
        }
        const readings = generateHistoricalData(statsCount);
        data = {
          readings: readings.length,
          ...getLeakStats(readings),
          period: `${statsCount} readings`,
        };
        break;

      default:
        return NextResponse.json(
          ApiResponseHelper.error(
            'Invalid type parameter. Use: current, historical, or stats'
          ),
          { status: 400 }
        );
    }

    return NextResponse.json(
      ApiResponseHelper.success(
        data,
        `Successfully generated ${type} sensor data`
      )
    );
  } catch (error) {
    console.error('Error generating sensor data:', error);
    return NextResponse.json(ApiResponseHelper.error('Internal server error'), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startTime, endTime, intervalMinutes } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        ApiResponseHelper.error(
          'Missing required fields: startTime and endTime'
        ),
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const interval = intervalMinutes || 5;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        ApiResponseHelper.error('Invalid date format. Use ISO string format.'),
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        ApiResponseHelper.error('startTime must be before endTime'),
        { status: 400 }
      );
    }

    // Limit the time range to prevent excessive data generation
    const maxHours = 24 * 7; // 1 week
    const hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > maxHours) {
      return NextResponse.json(
        ApiResponseHelper.error(
          `Time range too large. Maximum ${maxHours} hours allowed.`
        ),
        { status: 400 }
      );
    }

    // Import the continuous data generator here to avoid issues with module imports
    const { generateContinuousData } = await import('@/lib/mockData');
    const data = generateContinuousData(start, end, interval);

    return NextResponse.json(
      ApiResponseHelper.success(
        data,
        `Generated ${data.length} sensor readings`
      )
    );
  } catch (error) {
    console.error('Error generating continuous sensor data:', error);
    return NextResponse.json(
      ApiResponseHelper.error('Invalid JSON payload or internal error'),
      { status: 400 }
    );
  }
}
