import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

/**
 * GET /api/test/connection
 * Simple MongoDB connection test with detailed logging
 */
export async function GET() {
  const connectionString = process.env.MONGODB_URI;
  console.log(
    '🔗 Testing connection to:',
    connectionString?.replace(/\/\/.*@/, '//<credentials>@')
  );

  if (!connectionString) {
    return NextResponse.json({
      success: false,
      error: 'MONGODB_URI not found in environment variables',
      envVars: Object.keys(process.env).filter((key) => key.includes('MONGO')),
    });
  }

  let client: MongoClient | null = null;

  try {
    console.log('📡 Creating MongoDB client...');
    client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
    });

    console.log('🔌 Attempting to connect...');
    await client.connect();

    console.log('🏓 Testing ping...');
    const adminDb = client.db('admin');
    const pingResult = await adminDb.command({ ping: 1 });
    console.log('✅ Ping successful:', pingResult);

    console.log('📋 Listing databases...');
    const databases = await client.db().admin().listDatabases();
    console.log(
      '📂 Available databases:',
      databases.databases.map((db) => db.name)
    );

    console.log('✅ Connection successful!');

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      ping: pingResult,
      databases: databases.databases.map((db) => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk,
      })),
      connectionString: connectionString.replace(/\/\/.*@/, '//<credentials>@'),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Connection failed:', error);

    let errorDetails = 'Unknown error';
    if (error instanceof Error) {
      errorDetails = error.message;
      if (error.message.includes('ENOTFOUND')) {
        errorDetails += ' (DNS resolution failed - check cluster URL)';
      } else if (error.message.includes('Authentication failed')) {
        errorDetails += ' (Check username/password)';
      } else if (error.message.includes('not authorized')) {
        errorDetails += ' (Check database access permissions)';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'MongoDB connection failed',
        details: errorDetails,
        connectionString: connectionString.replace(
          /\/\/.*@/,
          '//<credentials>@'
        ),
        troubleshooting: {
          checkDNS: 'Verify cluster URL in Atlas dashboard',
          checkAuth: 'Verify username/password in Database Access',
          checkNetwork: 'Add your IP to Network Access whitelist',
          checkCluster: 'Ensure cluster is running (not paused)',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      console.log('🔌 Closing connection...');
      await client.close();
    }
  }
}
