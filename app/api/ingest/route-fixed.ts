import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  console.log('🚀 [INGEST] Received POST request');

  try {
    const body = await request.json();
    console.log('📥 [INGEST] Request body:', body);

    if (!body.inputFlow || !body.outputFlow || !body.timestamp) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const { inputFlow, outputFlow, timestamp, deviceId } = body;
    const waterLoss = Number((inputFlow - outputFlow).toFixed(3));
    const leakDetected = waterLoss > 0.3;

    const sensorReading = {
      deviceId: deviceId || 'ESP32_UNKNOWN',
      timestamp: timestamp,
      inputFlow: Number(inputFlow.toFixed(3)),
      outputFlow: Number(outputFlow.toFixed(3)),
      leakDetected,
      waterLoss,
      severity: leakDetected
        ? waterLoss > 1.0
          ? ('critical' as const)
          : ('mild' as const)
        : undefined,
      severityScore: leakDetected ? waterLoss * 2 : 0,
      receivedAt: new Date(),
      processed: true,
    };

    try {
      const dbService = await getDatabaseService();
      await dbService.storeSensorReading(sensorReading);
      console.log('✅ [INGEST] Stored in MongoDB');

      return NextResponse.json(
        {
          success: true,
          message: 'Data stored in MongoDB',
          data: {
            processed: {
              ...sensorReading,
              receivedAt: sensorReading.receivedAt.toISOString(),
            },
            stored: true,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('⚠️ [INGEST] Database error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database unavailable',
          message: 'Could not store data',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('❌ [INGEST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Ingest API is running',
    endpoints: {
      POST: 'Send sensor data: { inputFlow, outputFlow, timestamp, deviceId }',
    },
  });
}
