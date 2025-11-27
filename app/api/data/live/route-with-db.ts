/**
 * Updated Live Data API with MongoDB Integration
 * Replaces mock data with real database queries
 */

import { NextResponse } from 'next/server';
import { getDatabaseService } from '@/lib/database';
import { generateOneSample } from '@/lib/mockData'; // Fallback for development

export async function GET() {
  try {
    // Try to get real data from MongoDB
    try {
      const dbService = await getDatabaseService();
      const latestReading = await dbService.getLatestReading();

      if (latestReading) {
        return NextResponse.json({
          success: true,
          data: {
            timestamp: latestReading.timestamp,
            inputFlow: latestReading.inputFlow,
            outputFlow: latestReading.outputFlow,
            leakDetected: latestReading.leakDetected,
            waterLoss: latestReading.waterLoss,
            severity: latestReading.severity,
            severityScore: latestReading.severityScore || 0,
          },
          message: 'Latest sensor reading from database',
          source: 'database',
        });
      }
    } catch (dbError) {
      console.warn(
        '⚠️ Database unavailable, falling back to mock data:',
        dbError
      );
    }

    // Fallback to mock data if database is unavailable
    const mockReading = generateOneSample();
    return NextResponse.json({
      success: true,
      data: mockReading,
      message: 'Latest sensor reading (mock data)',
      source: 'mock',
    });
  } catch (error) {
    console.error('❌ Live data API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve sensor data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
