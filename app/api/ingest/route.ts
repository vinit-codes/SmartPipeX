import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for ingested sensor readings
// In production, this would be stored in a database
let ingestedReadings: Array<{
  timestamp: string;
  inputFlow: number;
  outputFlow: number;
  leakDetected: boolean;
  waterLoss: number;
  severity?: 'mild' | 'medium' | 'critical';
  severityScore?: number;
  deviceId?: string;
  receivedAt: string;
}> = [];

// Type definition for ESP32 payload
interface ESP32Payload {
  inputFlow: number;
  outputFlow: number;
  timestamp: string;
  deviceId?: string; // Optional for future device management
}

// Leak detection result interface
interface LeakEvaluationResult {
  leakDetected: boolean;
  severity: 'mild' | 'medium' | 'critical' | undefined;
  severityScore: number;
}

// Track consecutive leaks for severity calculation
let consecutiveLeakCount = 0;

// Helper function to round to specified precision
function roundToPrecision(num: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

// Leak detection logic (adapted from mockData.ts)
function evaluateLeakDetection(
  inputFlow: number,
  outputFlow: number,
  threshold: number = 0.3
): LeakEvaluationResult {
  const difference = inputFlow - outputFlow;

  if (difference > threshold) {
    consecutiveLeakCount++;

    // Calculate severity score: (difference * 2) + (consecutiveLeakCount * 1.5)
    const severityScore = difference * 2 + consecutiveLeakCount * 1.5;

    let severity: 'mild' | 'medium' | 'critical';
    if (severityScore >= 6) {
      severity = 'critical';
    } else if (severityScore >= 3) {
      severity = 'medium';
    } else {
      severity = 'mild';
    }

    return {
      leakDetected: true,
      severity,
      severityScore: roundToPrecision(severityScore, 2),
    };
  } else {
    consecutiveLeakCount = 0; // Reset consecutive count if no leak
    return {
      leakDetected: false,
      severity: undefined,
      severityScore: 0,
    };
  }
}

// Validation function
function validateESP32Payload(data: unknown): data is ESP32Payload {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const payload = data as Record<string, unknown>;

  return (
    typeof payload.inputFlow === 'number' &&
    typeof payload.outputFlow === 'number' &&
    typeof payload.timestamp === 'string' &&
    !isNaN(payload.inputFlow) &&
    !isNaN(payload.outputFlow) &&
    payload.inputFlow >= 0 &&
    payload.outputFlow >= 0 &&
    payload.inputFlow <= 10 && // Reasonable maximum flow rate
    payload.outputFlow <= 10 && // Reasonable maximum flow rate
    new Date(payload.timestamp).toString() !== 'Invalid Date'
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON payload
    const body = await request.json();

    // Validate payload structure and types
    if (!validateESP32Payload(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payload format',
          message:
            'Expected { inputFlow: number, outputFlow: number, timestamp: string }',
          received:
            typeof body === 'object' ? Object.keys(body || {}) : typeof body,
        },
        { status: 400 }
      );
    }

    const { inputFlow, outputFlow, timestamp, deviceId } = body;

    // Calculate water loss
    const waterLoss = Number((inputFlow - outputFlow).toFixed(3));

    // Use leak detection logic with default threshold
    const leakEvaluation = evaluateLeakDetection(inputFlow, outputFlow);

    // Create processed reading
    const processedReading = {
      timestamp,
      inputFlow: Number(inputFlow.toFixed(3)),
      outputFlow: Number(outputFlow.toFixed(3)),
      leakDetected: leakEvaluation.leakDetected,
      waterLoss,
      severity: leakEvaluation.severity,
      severityScore: leakEvaluation.severityScore,
      deviceId: deviceId || 'ESP32_UNKNOWN',
      receivedAt: new Date().toISOString(),
    };

    // Store in mock array (in production, this would go to database)
    ingestedReadings.push(processedReading);

    // Keep only last 1000 readings to prevent memory issues
    if (ingestedReadings.length > 1000) {
      ingestedReadings = ingestedReadings.slice(-1000);
    }

    // Log the ingestion for monitoring
    console.log(
      `[INGEST] Received data from ${deviceId || 'unknown device'}:`,
      {
        inputFlow,
        outputFlow,
        waterLoss,
        leakDetected: leakEvaluation.leakDetected,
        severity: leakEvaluation.severity,
      }
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data ingested successfully',
        data: {
          processed: processedReading,
          stored: true,
          totalReadings: ingestedReadings.length,
        },
        metadata: {
          receivedAt: processedReading.receivedAt,
          deviceId: processedReading.deviceId,
          processingTime: Date.now() - new Date(timestamp).getTime(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle JSON parsing errors and other exceptions
    console.error('[INGEST] Error processing request:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof SyntaxError
            ? 'Invalid JSON format in request body'
            : 'Failed to process sensor data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve ingested readings (for debugging/monitoring)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      500
    );
    const deviceId = url.searchParams.get('deviceId');

    let readings = ingestedReadings;

    // Filter by device ID if specified
    if (deviceId) {
      readings = readings.filter((reading) => reading.deviceId === deviceId);
    }

    // Return most recent readings
    const recentReadings = readings.slice(-limit).reverse();

    return NextResponse.json({
      success: true,
      data: {
        readings: recentReadings,
        totalCount: readings.length,
        devices: [...new Set(ingestedReadings.map((r) => r.deviceId))],
        lastUpdate:
          readings.length > 0 ? readings[readings.length - 1].receivedAt : null,
      },
      message: `Retrieved ${recentReadings.length} ingested sensor readings`,
      query: {
        limit,
        deviceId: deviceId || 'all',
      },
    });
  } catch (error) {
    console.error('[INGEST] Error retrieving readings:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve ingested readings',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Export the stored readings for potential use by other API endpoints
export function getIngestedReadings() {
  return ingestedReadings;
}

// Clear stored readings (useful for testing)
export function clearIngestedReadings() {
  ingestedReadings = [];
  console.log('[INGEST] Cleared all stored readings');
}
