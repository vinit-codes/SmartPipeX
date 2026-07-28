import { analyseRisk } from '@/lib/domain/leak-detection';
import { fail, ok } from '@/lib/server/api-response';
import { loadHistoricalReadings } from '@/lib/server/readings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { readings, source } = await loadHistoricalReadings(96);
    return ok(analyseRisk(readings), {
      source,
      model: 'transparent heuristic risk score',
    });
  } catch (error) {
    console.error('Risk analysis request failed', error);
    return fail('RISK_ANALYSIS_FAILED', 'Unable to calculate pipeline risk.', 500);
  }
}
