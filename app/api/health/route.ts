import { ok } from '@/lib/server/api-response';
import { isDatabaseConfigured, pingDatabase } from '@/lib/server/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isDatabaseConfigured();
  let database: 'connected' | 'unavailable' | 'not-configured' = configured
    ? 'unavailable'
    : 'not-configured';

  if (configured) {
    try {
      await pingDatabase();
      database = 'connected';
    } catch (error) {
      console.error('Database health check failed', error);
    }
  }

  return ok({
    status: database === 'unavailable' ? 'degraded' : 'healthy',
    database,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
