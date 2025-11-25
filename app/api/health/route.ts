import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper } from '@/lib';

// Sample data
const healthData = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  uptime: process.uptime(),
};

export async function GET() {
  try {
    return NextResponse.json(
      ApiResponseHelper.success(healthData, 'API is healthy')
    );
  } catch {
    return NextResponse.json(ApiResponseHelper.error('Internal server error'), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Example validation
    if (!body.data) {
      return NextResponse.json(
        ApiResponseHelper.error('Missing required field: data'),
        { status: 400 }
      );
    }

    return NextResponse.json(
      ApiResponseHelper.success(
        { received: body.data },
        'Data received successfully'
      )
    );
  } catch {
    return NextResponse.json(ApiResponseHelper.error('Invalid JSON payload'), {
      status: 400,
    });
  }
}
