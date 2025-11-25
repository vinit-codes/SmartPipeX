import { NextRequest, NextResponse } from 'next/server';
import { generateHistoricalData } from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';

/**
 * GET /api/data/history?count=300
 * Returns historical sensor readings (200-500 samples)
 * Query parameter: count (optional, defaults to 300, min: 200, max: 500)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');

    // Parse and validate count parameter
    let count = 300; // Default value
    if (countParam) {
      const parsedCount = parseInt(countParam, 10);
      if (isNaN(parsedCount)) {
        return NextResponse.json(
          ApiResponseHelper.error('Invalid count parameter. Must be a number.'),
          { status: 400 }
        );
      }
      if (parsedCount < 200 || parsedCount > 500) {
        return NextResponse.json(
          ApiResponseHelper.error(
            'Count parameter must be between 200 and 500.'
          ),
          { status: 400 }
        );
      }
      count = parsedCount;
    }

    const historicalReadings = generateHistoricalData(count);

    return NextResponse.json(
      ApiResponseHelper.success(
        historicalReadings,
        `Retrieved ${historicalReadings.length} historical sensor readings`
      )
    );
  } catch (error) {
    console.error('Error generating historical sensor data:', error);
    return NextResponse.json(
      ApiResponseHelper.error('Failed to retrieve historical sensor data'),
      { status: 500 }
    );
  }
}
