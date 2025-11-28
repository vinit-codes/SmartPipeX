import { NextResponse } from 'next/server';
import { generateOneSample } from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';
import { getDatabaseService } from '@/lib/database';

/**
 * GET /api/data/live
 * Returns the latest sensor reading from MongoDB, with fallback to mock data
 */
export async function GET() {
  try {
    let latestReading;
    let source = 'mock';

    try {
      // Try to get latest ESP32 reading first
      const dbService = await getDatabaseService();
      const esp32Reading = await dbService.getLatestReading(
        'ESP32_DEV_PIPELINE_001'
      );

      if (esp32Reading) {
        latestReading = {
          timestamp: esp32Reading.timestamp,
          inputFlow: esp32Reading.inputFlow,
          outputFlow: esp32Reading.outputFlow,
          leakDetected: esp32Reading.leakDetected,
          waterLoss: esp32Reading.waterLoss,
          severity: esp32Reading.severity,
          severityScore: esp32Reading.severityScore,
        };
        source = 'esp32';
        console.log('✅ [LIVE API] Retrieved ESP32 data from MongoDB');
      } else {
        // No ESP32 data, try any device data
        const dbReading = await dbService.getLatestReading();

        if (dbReading) {
          latestReading = {
            timestamp: dbReading.timestamp,
            inputFlow: dbReading.inputFlow,
            outputFlow: dbReading.outputFlow,
            leakDetected: dbReading.leakDetected,
            waterLoss: dbReading.waterLoss,
            severity: dbReading.severity,
            severityScore: dbReading.severityScore,
          };
          source = 'database';
          console.log('✅ [LIVE API] Retrieved fallback data from MongoDB');
        } else {
          // No data in database, use mock
          latestReading = generateOneSample();
          console.log('⚠️ [LIVE API] No database data, using mock');
        }
      }
    } catch (dbError) {
      // Database unavailable, use mock data
      console.error('⚠️ [LIVE API] Database unavailable:', dbError);
      latestReading = generateOneSample();
      source = 'mock-fallback';
    }

    return NextResponse.json(
      ApiResponseHelper.success(
        {
          ...latestReading,
          source,
          databaseStatus: source === 'database' ? 'connected' : 'unavailable',
        },
        `Latest sensor reading retrieved successfully from ${source}`
      )
    );
  } catch (error) {
    console.error('Error retrieving live sensor data:', error);
    return NextResponse.json(
      ApiResponseHelper.error('Failed to retrieve live sensor data'),
      { status: 500 }
    );
  }
}
