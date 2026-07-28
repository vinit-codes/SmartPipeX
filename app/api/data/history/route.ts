import type { NextRequest } from 'next/server';
import { fail, ok, parseBoundedInteger } from '@/lib/server/api-response';
import { loadHistoricalReadings } from '@/lib/server/readings';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const count = parseBoundedInteger(
    request.nextUrl.searchParams.get('count'),
    96,
    12,
    500
  );

  if (count === null) {
    return fail(
      'INVALID_COUNT',
      'The count query parameter must be an integer between 12 and 500.'
    );
  }

  try {
    const { readings, source } = await loadHistoricalReadings(count);
    return ok(readings, { source, count: readings.length });
  } catch (error) {
    console.error('Historical reading request failed', error);
    return fail('HISTORY_FAILED', 'Unable to load historical readings.', 500);
  }
}
