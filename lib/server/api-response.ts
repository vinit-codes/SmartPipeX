import { NextResponse } from 'next/server';
import type { ApiFailure, ApiSuccess } from '@/lib/types';

export function ok<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
) {
  const body: ApiSuccess<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(body, { status });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiFailure = {
    success: false,
    error: { code, message, ...(details === undefined ? {} : { details }) },
  };
  return NextResponse.json(body, { status });
}

export function parseBoundedInteger(
  value: string | null,
  fallback: number,
  min: number,
  max: number
) {
  if (value === null) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}
