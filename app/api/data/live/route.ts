import { NextResponse } from 'next/server';
import { generateOneSample } from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';

/**
 * GET /api/data/live
 * Returns the latest sensor reading
 */
export async function GET() {
  try {
    const latestReading = generateOneSample();

    return NextResponse.json(
      ApiResponseHelper.success(
        latestReading,
        'Latest sensor reading retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Error generating live sensor data:', error);
    return NextResponse.json(
      ApiResponseHelper.error('Failed to retrieve live sensor data'),
      { status: 500 }
    );
  }
}
