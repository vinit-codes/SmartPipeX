import type { NextRequest } from 'next/server';
import { fail, ok, parseBoundedInteger } from '@/lib/server/api-response';
import { loadAlerts } from '@/lib/server/readings';
import type { LeakSeverity } from '@/lib/types';

const severities = new Set<LeakSeverity | 'all'>([
  'mild',
  'medium',
  'critical',
  'all',
]);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const count = parseBoundedInteger(
    request.nextUrl.searchParams.get('count'),
    100,
    1,
    500
  );
  const severity = request.nextUrl.searchParams.get('severity') || 'all';

  if (count === null) {
    return fail(
      'INVALID_COUNT',
      'The count query parameter must be an integer between 1 and 500.'
    );
  }
  if (!severities.has(severity as LeakSeverity | 'all')) {
    return fail(
      'INVALID_SEVERITY',
      'Severity must be mild, medium, critical, or all.'
    );
  }

  try {
    const { alerts, source } = await loadAlerts(
      count,
      severity as LeakSeverity | 'all'
    );
    const summary = {
      total: alerts.length,
      critical: alerts.filter((alert) => alert.severity === 'critical').length,
      medium: alerts.filter((alert) => alert.severity === 'medium').length,
      mild: alerts.filter((alert) => alert.severity === 'mild').length,
    };

    return ok({ alerts, summary }, { source });
  } catch (error) {
    console.error('Alerts request failed', error);
    return fail('ALERTS_FAILED', 'Unable to load leak alerts.', 500);
  }
}
