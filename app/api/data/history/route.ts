import { NextRequest, NextResponse } from 'next/server';
import { generateHistoricalData } from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';
import { getDatabaseService, SensorReadingDocument } from '@/lib/database';

/**
 * GET /api/data/history?count=300
 * Returns historical sensor readings (200-500 samples)
 * Query parameter: count (optional, defaults to 300, min: 200, max: 500)
 * Priority: ESP32 data first, fallback to mock data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const deviceId = searchParams.get('deviceId');
    const limit = searchParams.get('limit');

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

    // If limit parameter is provided (from device query), use database service
    if (limit || deviceId) {
      const limitNum = limit ? parseInt(limit, 10) : count;
      const dbService = await getDatabaseService();
      const readings = await dbService.getHistoricalReadings(
        limitNum,
        deviceId || 'ESP32_DEV_PIPELINE_001'
      );

      if (readings.length > 0) {
        // Add source identifier for ESP32 data
        const espReadings = readings.map((reading: SensorReadingDocument) => ({
          ...reading,
          source: 'esp32',
        }));

        return NextResponse.json(
          ApiResponseHelper.success(
            espReadings,
            `Retrieved ${espReadings.length} ESP32 historical sensor readings`
          )
        );
      }
    }

    // Try to get ESP32 data first
    try {
      const dbService = await getDatabaseService();
      const esp32Readings = await dbService.getHistoricalReadings(
        count,
        'ESP32_DEV_PIPELINE_001'
      );

      if (esp32Readings.length > 0) {
        // Add source identifier for ESP32 data
        const espReadings = esp32Readings.map(
          (reading: SensorReadingDocument) => ({
            ...reading,
            source: 'esp32',
          })
        );

        return NextResponse.json(
          ApiResponseHelper.success(
            espReadings,
            `Retrieved ${espReadings.length} ESP32 historical sensor readings`
          )
        );
      }
    } catch (dbError) {
      console.log('Database query failed, falling back to mock data:', dbError);
    }

    // Fallback to mock data if no ESP32 data available
    const historicalReadings = generateHistoricalData(count).map((reading) => ({
      ...reading,
      source: 'mock',
    }));

    return NextResponse.json(
      ApiResponseHelper.success(
        historicalReadings,
        `Retrieved ${historicalReadings.length} mock historical sensor readings`
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
