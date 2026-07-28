import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import {
  createSensorReading,
  DEFAULT_LEAK_THRESHOLD,
  MAX_FLOW_RATE,
} from '@/lib/domain/leak-detection';
import { fail, ok } from '@/lib/server/api-response';
import { isDatabaseConfigured, saveReading } from '@/lib/server/database';

interface IngestPayload {
  deviceId?: unknown;
  timestamp?: unknown;
  inputFlow?: unknown;
  outputFlow?: unknown;
}

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1_000;
const MAX_READING_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

function isFiniteFlow(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= MAX_FLOW_RATE
  );
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function isAuthorised(request: NextRequest) {
  const expectedKey = process.env.INGEST_API_KEY;
  if (!expectedKey) return process.env.NODE_ENV !== 'production';
  const providedKey = request.headers.get('x-api-key');
  return providedKey ? safeEqual(providedKey, expectedKey) : false;
}

function parseThreshold() {
  const configured = Number(process.env.LEAK_THRESHOLD_LPM);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_LEAK_THRESHOLD;
}

function sanitiseDeviceId(value: unknown) {
  if (typeof value !== 'string') return 'ESP32_UNKNOWN';
  const sanitised = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80);
  return sanitised || 'ESP32_UNKNOWN';
}

export async function POST(request: NextRequest) {
  if (!isAuthorised(request)) {
    return fail('UNAUTHORISED', 'A valid x-api-key header is required.', 401);
  }

  if (!isDatabaseConfigured()) {
    return fail(
      'DATABASE_NOT_CONFIGURED',
      'Sensor ingestion requires MONGODB_URI to be configured.',
      503
    );
  }

  let body: IngestPayload;
  try {
    body = (await request.json()) as IngestPayload;
  } catch {
    return fail('INVALID_JSON', 'The request body must contain valid JSON.');
  }

  if (!isFiniteFlow(body.inputFlow) || !isFiniteFlow(body.outputFlow)) {
    return fail(
      'INVALID_FLOW',
      `inputFlow and outputFlow must be finite numbers between 0 and ${MAX_FLOW_RATE}.`
    );
  }

  const timestamp =
    typeof body.timestamp === 'string' ? new Date(body.timestamp) : new Date();
  if (Number.isNaN(timestamp.getTime())) {
    return fail('INVALID_TIMESTAMP', 'timestamp must be a valid ISO-8601 date.');
  }

  const age = Date.now() - timestamp.getTime();
  if (age < -MAX_CLOCK_SKEW_MS || age > MAX_READING_AGE_MS) {
    return fail(
      'TIMESTAMP_OUT_OF_RANGE',
      'timestamp must be no more than five minutes in the future or seven days old.'
    );
  }

  const reading = createSensorReading({
    deviceId: sanitiseDeviceId(body.deviceId),
    timestamp: timestamp.toISOString(),
    inputFlow: body.inputFlow,
    outputFlow: body.outputFlow,
    threshold: parseThreshold(),
  });

  try {
    await saveReading(reading);
    return ok(reading, { stored: true }, 201);
  } catch (error) {
    console.error('Sensor ingestion failed', error);
    return fail('INGESTION_FAILED', 'The reading could not be stored.', 500);
  }
}

export async function GET() {
  return ok({
    endpoint: '/api/ingest',
    method: 'POST',
    requiredFields: ['inputFlow', 'outputFlow'],
    optionalFields: ['deviceId', 'timestamp'],
    authentication: 'x-api-key when INGEST_API_KEY is configured',
  });
}
