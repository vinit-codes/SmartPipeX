import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseService } from '@/lib/database';
import { generateHistoricalData } from '@/lib/mockData';

/**
 * POST /api/populate-database
 * Populate MongoDB with mock sensor data for testing/demo purposes
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 [POPULATE] Starting database population...');

    const body = await request.json().catch(() => ({}));
    const count = body.count || 500; // Default 500 readings
    const deviceId = body.deviceId || 'ESP32_DEMO_001';

    // Generate mock data
    console.log(`📊 [POPULATE] Generating ${count} mock readings...`);
    const mockReadings = generateHistoricalData(count);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      const dbService = await getDatabaseService();
      console.log('✅ [POPULATE] Connected to database');

      // Process readings in batches to avoid overwhelming the database
      const batchSize = 50;
      const batches = [];

      for (let i = 0; i < mockReadings.length; i += batchSize) {
        batches.push(mockReadings.slice(i, i + batchSize));
      }

      console.log(
        `🔄 [POPULATE] Processing ${batches.length} batches of ${batchSize} readings each...`
      );

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(
          `📦 [POPULATE] Processing batch ${batchIndex + 1}/${batches.length}...`
        );

        for (const reading of batch) {
          try {
            const sensorReading = {
              deviceId: deviceId,
              timestamp: reading.timestamp,
              inputFlow: reading.inputFlow,
              outputFlow: reading.outputFlow,
              leakDetected: reading.leakDetected,
              waterLoss: reading.waterLoss,
              severity: reading.severity,
              severityScore: reading.severityScore,
              receivedAt: new Date(reading.timestamp), // Use reading timestamp as received time for historical data
              processed: true,
            };

            await dbService.storeSensorReading(sensorReading);
            successCount++;

            // Log progress every 100 readings
            if (successCount % 100 === 0) {
              console.log(
                `✅ [POPULATE] Progress: ${successCount}/${mockReadings.length} readings stored`
              );
            }
          } catch (readingError) {
            errorCount++;
            const errorMsg =
              readingError instanceof Error
                ? readingError.message
                : 'Unknown error';
            errors.push(`Reading ${successCount + errorCount}: ${errorMsg}`);

            if (errors.length > 10) {
              console.error('❌ [POPULATE] Too many errors, stopping...');
              break;
            }
          }
        }

        // Small delay between batches to prevent overwhelming the database
        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Get final statistics
      const stats = await dbService.getSystemStats();
      const alerts = await dbService.getAlerts();

      console.log('🎉 [POPULATE] Population complete!');
      console.log(`✅ Successfully stored: ${successCount} readings`);
      console.log(`❌ Errors: ${errorCount}`);
      console.log(`📊 Total readings in DB: ${stats.totalReadings}`);
      console.log(`🚨 Total alerts created: ${alerts.alerts.length}`);

      return NextResponse.json(
        {
          success: true,
          message: 'Database populated successfully',
          data: {
            processed: successCount,
            errors: errorCount,
            errorDetails: errors.slice(0, 5), // Only show first 5 errors
            deviceId,
            batchesProcessed: batches.length,
          },
          statistics: {
            totalReadings: stats.totalReadings,
            totalLeaks: stats.totalLeaks,
            leakPercentage: stats.leakPercentage,
            avgWaterLoss: stats.avgWaterLoss,
            activeDevices: stats.activeDevices,
            totalAlerts: alerts.alerts.length,
            unacknowledgedAlerts: alerts.summary.unacknowledged,
            severityBreakdown: alerts.summary.severityBreakdown,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('❌ [POPULATE] Database connection failed:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          message:
            dbError instanceof Error
              ? dbError.message
              : 'Unknown database error',
          processed: successCount,
          errors: errorCount,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('❌ [POPULATE] Population failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Population failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/populate-database
 * Get information about database population
 */
export async function GET() {
  try {
    const dbService = await getDatabaseService();
    const stats = await dbService.getSystemStats();
    const alerts = await dbService.getAlerts();

    return NextResponse.json({
      success: true,
      message: 'Database population info',
      currentState: {
        totalReadings: stats.totalReadings,
        totalLeaks: stats.totalLeaks,
        leakPercentage: stats.leakPercentage,
        avgWaterLoss: stats.avgWaterLoss,
        activeDevices: stats.activeDevices,
        lastReading: stats.lastReading,
        totalAlerts: alerts.alerts.length,
        unacknowledgedAlerts: alerts.summary.unacknowledged,
      },
      usage: {
        POST: 'Populate database with mock data',
        body: {
          count: 'Number of readings to generate (default: 500)',
          deviceId: 'Device ID for the readings (default: ESP32_DEMO_001)',
        },
        example: {
          count: 1000,
          deviceId: 'ESP32_DEMO_001',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get database info',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
