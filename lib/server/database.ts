import {
  MongoClient,
  type Collection,
  type Db,
  type Document,
  type WithId,
} from 'mongodb';
import type { LeakAlert, LeakSeverity, SensorReading } from '@/lib/types';

interface StoredSensorReading {
  deviceId: string;
  timestamp: Date;
  inputFlow: number;
  outputFlow: number;
  waterLoss: number;
  lossPercentage: number;
  leakDetected: boolean;
  severity?: LeakSeverity;
  severityScore: number;
  receivedAt: Date;
}

interface StoredAlert {
  deviceId: string;
  timestamp: Date;
  inputFlow: number;
  outputFlow: number;
  waterLoss: number;
  lossPercentage: number;
  severity: LeakSeverity;
  severityScore: number;
  message: string;
  acknowledged: boolean;
  createdAt: Date;
}

interface MongoCache {
  client: MongoClient | null;
  database: Db | null;
  connection: Promise<Db> | null;
  indexesReady: boolean;
}

const globalForMongo = globalThis as typeof globalThis & {
  smartPipeXMongo?: MongoCache;
};

const cache: MongoCache = globalForMongo.smartPipeXMongo ?? {
  client: null,
  database: null,
  connection: null,
  indexesReady: false,
};

globalForMongo.smartPipeXMongo = cache;

export const isDatabaseConfigured = () => Boolean(process.env.MONGODB_URI);

async function ensureIndexes(db: Db) {
  if (cache.indexesReady) return;

  await Promise.all([
    db.collection('sensor_readings').createIndex({ timestamp: -1 }),
    db.collection('sensor_readings').createIndex({ deviceId: 1, timestamp: -1 }),
    db.collection('alerts').createIndex({ timestamp: -1 }),
    db.collection('alerts').createIndex({ deviceId: 1, timestamp: -1 }),
    db.collection('alerts').createIndex({ deviceId: 1, createdAt: -1 }),
    db.collection('devices').createIndex({ deviceId: 1 }, { unique: true }),
  ]);
  cache.indexesReady = true;
}

export async function getDatabase(): Promise<Db> {
  if (cache.database) return cache.database;
  if (cache.connection) return cache.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');

  cache.connection = (async () => {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5_000,
    });
    await client.connect();

    const database = client.db(process.env.MONGODB_DB || 'smartpipex');
    await ensureIndexes(database);

    cache.client = client;
    cache.database = database;
    return database;
  })();

  try {
    return await cache.connection;
  } catch (error) {
    cache.connection = null;
    throw error;
  }
}

function readingsCollection(db: Db): Collection<StoredSensorReading> {
  return db.collection<StoredSensorReading>('sensor_readings');
}

function alertsCollection(db: Db): Collection<StoredAlert> {
  return db.collection<StoredAlert>('alerts');
}

function toPublicReading(document: StoredSensorReading): SensorReading {
  return {
    deviceId: document.deviceId,
    timestamp: document.timestamp.toISOString(),
    inputFlow: document.inputFlow,
    outputFlow: document.outputFlow,
    waterLoss: document.waterLoss,
    lossPercentage: document.lossPercentage,
    leakDetected: document.leakDetected,
    severity: document.severity,
    severityScore: document.severityScore,
    source: document.deviceId.startsWith('ESP32') ? 'esp32' : 'database',
  };
}

function toPublicAlert(document: WithId<StoredAlert>): LeakAlert {
  return {
    id: document._id.toString(),
    deviceId: document.deviceId,
    timestamp: document.timestamp.toISOString(),
    inputFlow: document.inputFlow,
    outputFlow: document.outputFlow,
    waterLoss: document.waterLoss,
    lossPercentage: document.lossPercentage,
    leakDetected: true,
    severity: document.severity,
    severityScore: document.severityScore,
    message: document.message,
    acknowledged: document.acknowledged,
    source: document.deviceId.startsWith('ESP32') ? 'esp32' : 'database',
  };
}

export async function saveReading(reading: SensorReading) {
  const db = await getDatabase();
  const timestamp = new Date(reading.timestamp);
  const now = new Date();

  const document: StoredSensorReading = {
    deviceId: reading.deviceId,
    timestamp,
    inputFlow: reading.inputFlow,
    outputFlow: reading.outputFlow,
    waterLoss: reading.waterLoss,
    lossPercentage: reading.lossPercentage,
    leakDetected: reading.leakDetected,
    severity: reading.severity,
    severityScore: reading.severityScore,
    receivedAt: now,
  };

  await readingsCollection(db).insertOne(document);
  await db.collection('devices').updateOne(
    { deviceId: reading.deviceId },
    {
      $set: {
        status: 'active',
        lastSeen: now,
        updatedAt: now,
      },
      $setOnInsert: {
        name: reading.deviceId,
        location: 'Unassigned',
        createdAt: now,
      },
    },
    { upsert: true }
  );

  if (reading.leakDetected && reading.severity) {
    const recentDuplicate = await alertsCollection(db).findOne({
      deviceId: reading.deviceId,
      severity: reading.severity,
      createdAt: { $gte: new Date(now.getTime() - 60_000) },
    });

    if (!recentDuplicate) {
      const alert: StoredAlert = {
        deviceId: reading.deviceId,
        timestamp,
        inputFlow: reading.inputFlow,
        outputFlow: reading.outputFlow,
        waterLoss: reading.waterLoss,
        lossPercentage: reading.lossPercentage,
        severity: reading.severity,
        severityScore: reading.severityScore,
        message: `${reading.severity.toUpperCase()} leak: ${reading.waterLoss.toFixed(2)} L/min loss`,
        acknowledged: false,
        createdAt: now,
      };
      await alertsCollection(db).insertOne(alert);
    }
  }
}

export async function getLatestReading(deviceId?: string) {
  const db = await getDatabase();
  const query = deviceId ? { deviceId } : {};
  const reading = await readingsCollection(db).findOne(query, {
    sort: { timestamp: -1 },
  });

  return reading ? toPublicReading(reading) : null;
}

export async function getHistoricalReadings(count: number, deviceId?: string) {
  const db = await getDatabase();
  const query = deviceId ? { deviceId } : {};
  const readings = await readingsCollection(db)
    .find(query)
    .sort({ timestamp: -1 })
    .limit(count)
    .toArray();

  return readings.reverse().map(toPublicReading);
}

export async function getAlerts(
  count: number,
  severity: LeakSeverity | 'all',
  deviceId?: string
) {
  const db = await getDatabase();
  const query: Document = {};
  if (deviceId) query.deviceId = deviceId;
  if (severity !== 'all') query.severity = severity;

  const alerts = await alertsCollection(db)
    .find(query)
    .sort({ timestamp: -1 })
    .limit(count)
    .toArray();

  return alerts.map(toPublicAlert);
}

export async function getDownsampledReadings(
  days: number,
  deviceId?: string,
  intervalMinutes = 5
) {
  const db = await getDatabase();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1_000);
  const match: Document = { timestamp: { $gte: start } };
  if (deviceId) match.deviceId = deviceId;

  const readings = await readingsCollection(db)
    .aggregate<StoredSensorReading>([
      { $match: match },
      {
        $group: {
          _id: {
            deviceId: '$deviceId',
            timestamp: {
              $dateTrunc: {
                date: '$timestamp',
                unit: 'minute',
                binSize: intervalMinutes,
              },
            },
          },
          inputFlow: { $avg: '$inputFlow' },
          outputFlow: { $avg: '$outputFlow' },
          waterLoss: { $avg: '$waterLoss' },
          lossPercentage: { $avg: '$lossPercentage' },
          leakDetected: { $max: '$leakDetected' },
          severityScore: { $max: '$severityScore' },
          receivedAt: { $max: '$receivedAt' },
        },
      },
      {
        $project: {
          _id: 0,
          deviceId: '$_id.deviceId',
          timestamp: '$_id.timestamp',
          inputFlow: 1,
          outputFlow: 1,
          waterLoss: 1,
          lossPercentage: 1,
          leakDetected: 1,
          severityScore: 1,
          receivedAt: 1,
        },
      },
      { $sort: { timestamp: 1 } },
    ])
    .toArray();

  return readings.map((reading) => {
    const score = reading.severityScore;
    const severity = !reading.leakDetected
      ? undefined
      : score >= 7
        ? 'critical'
        : score >= 4
          ? 'medium'
          : 'mild';

    return toPublicReading({ ...reading, severity });
  });
}

export async function pingDatabase() {
  const db = await getDatabase();
  await db.command({ ping: 1 } as Document);
  return true;
}
