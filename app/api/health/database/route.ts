import { NextResponse } from 'next/server';
import { checkDatabaseHealth, getDatabaseService } from '@/lib/database';

/**
 * GET /api/health/database
 * Check if MongoDB connection is working
 */
export async function GET() {
  try {
    console.log('🔍 [HEALTH] Checking database connection...');

    // Test basic connection
    const health = await checkDatabaseHealth();
    console.log('📊 [HEALTH] Database health:', health);

    // Test database service
    const dbService = await getDatabaseService();
    const stats = await dbService.getSystemStats();
    console.log('📈 [HEALTH] System stats:', stats);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      health,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [HEALTH] Database connection failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
