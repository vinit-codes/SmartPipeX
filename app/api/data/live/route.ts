import { loadLatestReading } from '@/lib/server/readings';
import { fail, ok } from '@/lib/server/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { reading, source } = await loadLatestReading();
    return ok(reading, {
      source,
      generatedAt: new Date().toISOString(),
      fallback: source === 'simulation',
    });
  } catch (error) {
    console.error('Live reading request failed', error);
    return fail('LIVE_READING_FAILED', 'Unable to load the latest reading.', 500);
  }
}
