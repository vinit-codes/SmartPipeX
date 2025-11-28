import { NextRequest, NextResponse } from 'next/server';
import { generateHistoricalData, SensorReading } from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';
import { getDatabaseService, SensorReadingDocument } from '@/lib/database';

interface AlertReading extends SensorReading {
  alertMessage: string;
}

/**
 * GET /api/data/alerts?count=500&severity=all
 * Returns filtered sensor readings where leakDetected = true
 * Query parameters:
 * - count: number of samples to generate and filter from (default: 500, min: 200, max: 1000)
 * - severity: filter by leak severity - 'mild', 'medium', 'critical', or 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const severityParam = searchParams.get('severity');

    // Parse and validate count parameter
    let count = 500; // Default value
    if (countParam) {
      const parsedCount = parseInt(countParam, 10);
      if (isNaN(parsedCount)) {
        return NextResponse.json(
          ApiResponseHelper.error('Invalid count parameter. Must be a number.'),
          { status: 400 }
        );
      }
      if (parsedCount < 200 || parsedCount > 1000) {
        return NextResponse.json(
          ApiResponseHelper.error(
            'Count parameter must be between 200 and 1000.'
          ),
          { status: 400 }
        );
      }
      count = parsedCount;
    }

    // Validate severity parameter
    const validSeverities = ['mild', 'medium', 'critical', 'all'];
    const severity = severityParam || 'all';
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        ApiResponseHelper.error(
          `Invalid severity parameter. Must be one of: ${validSeverities.join(', ')}`
        ),
        { status: 400 }
      );
    }

    let allReadings: SensorReading[] = [];
    let source = 'mock';

    // Try to get ESP32 data first
    try {
      const dbService = await getDatabaseService();
      const esp32Readings = await dbService.getHistoricalReadings(
        count,
        'ESP32_DEV_PIPELINE_001'
      );

      if (esp32Readings.length > 0) {
        // Convert database readings to SensorReading format
        allReadings = esp32Readings.map((reading: SensorReadingDocument) => ({
          timestamp: reading.timestamp,
          inputFlow: reading.inputFlow,
          outputFlow: reading.outputFlow,
          leakDetected: reading.leakDetected,
          waterLoss: reading.waterLoss,
          severity: reading.severity || undefined,
          severityScore: reading.severityScore || 0,
        }));
        source = 'esp32';
      }
    } catch (dbError) {
      console.log(
        'Database query failed for alerts, falling back to mock data:',
        dbError
      );
    }

    // Fallback to mock data if no ESP32 data available
    if (allReadings.length === 0) {
      allReadings = generateHistoricalData(count);
      source = 'mock';
    }

    // Filter for leaks
    const leakReadings = allReadings.filter((reading) => reading.leakDetected);

    // Enhance readings with alert messages (severity already calculated in mockData)
    const alertReadings: AlertReading[] = leakReadings.map((reading) => {
      const waterLossPercentage =
        reading.inputFlow > 0
          ? (reading.waterLoss / reading.inputFlow) * 100
          : 0;
      const severityLevel = reading.severity || 'mild';
      const severityScore = reading.severityScore || 0;

      let alertMessage: string;
      if (severityLevel === 'critical') {
        alertMessage = `CRITICAL LEAK: ${waterLossPercentage.toFixed(1)}% water loss detected (Score: ${severityScore.toFixed(1)})`;
      } else if (severityLevel === 'medium') {
        alertMessage = `MODERATE LEAK: ${waterLossPercentage.toFixed(1)}% water loss detected (Score: ${severityScore.toFixed(1)})`;
      } else {
        alertMessage = `Minor leak: ${waterLossPercentage.toFixed(1)}% water loss detected (Score: ${severityScore.toFixed(1)})`;
      }

      return {
        ...reading,
        alertMessage,
      };
    });

    // Filter by severity if specified
    const filteredAlerts =
      severity === 'all'
        ? alertReadings
        : alertReadings.filter((alert) => alert.severity === severity);

    // Sort by timestamp (most recent first)
    filteredAlerts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const responseData = {
      alerts: filteredAlerts,
      source: source,
      summary: {
        totalSamplesGenerated: count,
        totalSamplesReturned: allReadings.length,
        totalLeaksFound: leakReadings.length,
        leakPercentage:
          allReadings.length > 0
            ? ((leakReadings.length / allReadings.length) * 100).toFixed(1)
            : '0.0',
        alertsReturned: filteredAlerts.length,
        severityFilter: severity,
        severityBreakdown: {
          mild: alertReadings.filter((a) => a.severity === 'mild').length,
          medium: alertReadings.filter((a) => a.severity === 'medium').length,
          critical: alertReadings.filter((a) => a.severity === 'critical')
            .length,
        },
      },
    };

    return NextResponse.json(
      ApiResponseHelper.success(
        responseData,
        `Retrieved ${filteredAlerts.length} leak alerts from ${count} sensor readings`
      )
    );
  } catch (error) {
    console.error('Error generating leak alerts:', error);
    return NextResponse.json(
      ApiResponseHelper.error('Failed to retrieve leak alerts'),
      { status: 500 }
    );
  }
}
