import type { NextRequest } from 'next/server';
import { calculateConsumption } from '@/lib/domain/consumption';
import { fail, ok, parseBoundedInteger } from '@/lib/server/api-response';
import { loadDownsampledReadings } from '@/lib/server/readings';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const days = parseBoundedInteger(
    request.nextUrl.searchParams.get('days'),
    7,
    1,
    30
  );
  if (days === null) {
    return fail('INVALID_DAYS', 'Days must be an integer between 1 and 30.');
  }

  try {
    const { readings, source } = await loadDownsampledReadings(days);
    return ok(calculateConsumption(readings, source), { source });
  } catch (error) {
    console.error('Consumption request failed', error);
    return fail('CONSUMPTION_FAILED', 'Unable to calculate consumption.', 500);
  }
}
