/**
 * MongoDB Database Connection and Models
 * Replaces mock data with real database storage
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { SensorReading } from './mockData';

// Database configuration
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://kunduvineeth0_db_user:tfT2o2TJrjixsh2B@cluster0.mongodb.net/smartpipex?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || 'smartpipex';

// Global connection instance
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB with connection pooling
 */
export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    // Create new connection
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10, // Maximum 10 connections in pool
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    await client.connect();
    console.log('✅ Connected to MongoDB successfully');

    const db = client.db(DB_NAME);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    // Create indexes for better performance
    await createIndexes(db);

    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error(`Failed to connect to MongoDB: ${error}`);
  }
}

/**
 * Create database indexes for optimal performance
 */
async function createIndexes(db: Db) {
  try {
    // Index on sensor_readings for fast queries
    await db.collection('sensor_readings').createIndex({ timestamp: -1 }); // Latest first
    await db.collection('sensor_readings').createIndex({ deviceId: 1 }); // Filter by device
    await db.collection('sensor_readings').createIndex({ leakDetected: 1 }); // Filter leaks
    await db.collection('sensor_readings').createIndex({
      timestamp: -1,
      leakDetected: 1,
    }); // Compound index

    // Index on devices collection
    await db
      .collection('devices')
      .createIndex({ deviceId: 1 }, { unique: true });
    await db.collection('devices').createIndex({ status: 1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('⚠️ Warning: Could not create indexes:', error);
  }
}

// TypeScript interfaces for database documents
export interface DeviceDocument {
  _id?: ObjectId;
  deviceId: string;
  name: string;
  location: string;
  installationDate: Date;
  status: 'active' | 'inactive' | 'maintenance';
  lastSeen: Date;
  calibration: {
    inputFlowFactor: number;
    outputFlowFactor: number;
    lastCalibrated: Date;
    version: string;
  };
  metadata: {
    firmwareVersion: string;
    hardwareVersion: string;
    batteryLevel?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorReadingDocument extends SensorReading {
  _id?: ObjectId;
  deviceId: string;
  receivedAt: Date;
  processed: boolean;
  metadata?: {
    signalStrength?: number;
    batteryLevel?: number;
    errorCode?: string;
  };
}

export interface AlertDocument {
  _id?: ObjectId;
  deviceId: string;
  timestamp: Date;
  type: 'leak' | 'sensor_failure' | 'communication_loss';
  severity: 'mild' | 'medium' | 'critical';
  severityScore: number;
  message: string;
  waterLoss: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata: {
    inputFlow: number;
    outputFlow: number;
    threshold: number;
  };
  createdAt: Date;
}

/**
 * Database service class with all CRUD operations
 */
export class DatabaseService {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  // ============ DEVICE OPERATIONS ============

  /**
   * Register a new ESP32 device
   */
  async registerDevice(
    deviceData: Omit<DeviceDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const now = new Date();
    const device: DeviceDocument = {
      ...deviceData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.db
      .collection<DeviceDocument>('devices')
      .insertOne(device);
    console.log(`✅ Device registered: ${deviceData.deviceId}`);
    return result.insertedId.toString();
  }

  /**
   * Update device last seen timestamp
   */
  async updateDeviceLastSeen(deviceId: string): Promise<void> {
    await this.db.collection<DeviceDocument>('devices').updateOne(
      { deviceId },
      {
        $set: {
          lastSeen: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Get all registered devices
   */
  async getDevices(): Promise<DeviceDocument[]> {
    return await this.db
      .collection<DeviceDocument>('devices')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  }

  // ============ SENSOR READING OPERATIONS ============

  /**
   * Store sensor reading from ESP32
   */
  async storeSensorReading(reading: SensorReadingDocument): Promise<string> {
    const readingWithMetadata = {
      ...reading,
      receivedAt: new Date(),
      processed: true,
    };

    const result = await this.db
      .collection<SensorReadingDocument>('sensor_readings')
      .insertOne(readingWithMetadata);

    // Update device last seen
    await this.updateDeviceLastSeen(reading.deviceId);

    // Create alert if leak detected
    if (reading.leakDetected && reading.severity) {
      await this.createAlert({
        deviceId: reading.deviceId,
        timestamp: new Date(reading.timestamp),
        type: 'leak',
        severity: reading.severity,
        severityScore: reading.severityScore || 0,
        message: `${reading.severity.toUpperCase()} leak detected: ${reading.waterLoss.toFixed(2)}L/min water loss`,
        waterLoss: reading.waterLoss,
        acknowledged: false,
        resolved: false,
        metadata: {
          inputFlow: reading.inputFlow,
          outputFlow: reading.outputFlow,
          threshold: 0.3, // Should come from settings
        },
        createdAt: new Date(),
      });
    }

    return result.insertedId.toString();
  }

  /**
   * Get latest sensor reading
   */
  async getLatestReading(
    deviceId?: string
  ): Promise<SensorReadingDocument | null> {
    const query = deviceId ? { deviceId } : {};
    return await this.db
      .collection<SensorReadingDocument>('sensor_readings')
      .findOne(query, { sort: { timestamp: -1 } });
  }

  /**
   * Get historical sensor readings
   */
  async getHistoricalReadings(
    count: number = 300,
    deviceId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SensorReadingDocument[]> {
    const query: any = {};

    if (deviceId) query.deviceId = deviceId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    return await this.db
      .collection<SensorReadingDocument>('sensor_readings')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(count)
      .toArray();
  }

  // ============ ALERT OPERATIONS ============

  /**
   * Create a new alert
   */
  async createAlert(alert: Omit<AlertDocument, '_id'>): Promise<string> {
    const result = await this.db
      .collection<AlertDocument>('alerts')
      .insertOne(alert);
    console.log(`🚨 Alert created: ${alert.severity} - ${alert.message}`);
    return result.insertedId.toString();
  }

  /**
   * Get alerts with filtering and pagination
   */
  async getAlerts(
    severity?: string,
    deviceId?: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<{
    alerts: AlertDocument[];
    total: number;
    summary: {
      totalAlerts: number;
      unacknowledged: number;
      resolved: number;
      severityBreakdown: Record<string, number>;
    };
  }> {
    const query: any = {};

    if (severity && severity !== 'all') query.severity = severity;
    if (deviceId) query.deviceId = deviceId;

    const [alerts, total] = await Promise.all([
      this.db
        .collection<AlertDocument>('alerts')
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.db.collection<AlertDocument>('alerts').countDocuments(query),
    ]);

    // Calculate summary statistics
    const allAlerts = await this.db
      .collection<AlertDocument>('alerts')
      .find({})
      .toArray();
    const summary = {
      totalAlerts: allAlerts.length,
      unacknowledged: allAlerts.filter((a) => !a.acknowledged).length,
      resolved: allAlerts.filter((a) => a.resolved).length,
      severityBreakdown: {
        mild: allAlerts.filter((a) => a.severity === 'mild').length,
        medium: allAlerts.filter((a) => a.severity === 'medium').length,
        critical: allAlerts.filter((a) => a.severity === 'critical').length,
      },
    };

    return { alerts, total, summary };
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<void> {
    await this.db.collection<AlertDocument>('alerts').updateOne(
      { _id: new ObjectId(alertId) },
      {
        $set: {
          acknowledged: true,
          acknowledgedBy,
          acknowledgedAt: new Date(),
        },
      }
    );
  }

  // ============ ANALYTICS OPERATIONS ============

  /**
   * Get system statistics for dashboard
   */
  async getSystemStats(deviceId?: string): Promise<{
    totalReadings: number;
    totalLeaks: number;
    leakPercentage: number;
    avgWaterLoss: number;
    activeDevices: number;
    lastReading: Date | null;
  }> {
    const query = deviceId ? { deviceId } : {};

    const [
      totalReadings,
      totalLeaks,
      activeDevices,
      latestReading,
      avgWaterLossResult,
    ] = await Promise.all([
      this.db
        .collection<SensorReadingDocument>('sensor_readings')
        .countDocuments(query),
      this.db
        .collection<SensorReadingDocument>('sensor_readings')
        .countDocuments({ ...query, leakDetected: true }),
      this.db
        .collection<DeviceDocument>('devices')
        .countDocuments({ status: 'active' }),
      this.db
        .collection<SensorReadingDocument>('sensor_readings')
        .findOne({}, { sort: { timestamp: -1 } }),
      this.db
        .collection<SensorReadingDocument>('sensor_readings')
        .aggregate([
          { $match: query },
          { $group: { _id: null, avgWaterLoss: { $avg: '$waterLoss' } } },
        ])
        .toArray(),
    ]);

    const leakPercentage =
      totalReadings > 0 ? (totalLeaks / totalReadings) * 100 : 0;
    const avgWaterLoss =
      avgWaterLossResult.length > 0 ? avgWaterLossResult[0].avgWaterLoss : 0;

    return {
      totalReadings,
      totalLeaks,
      leakPercentage: Math.round(leakPercentage * 100) / 100,
      avgWaterLoss: Math.round(avgWaterLoss * 1000) / 1000,
      activeDevices,
      lastReading: latestReading ? new Date(latestReading.timestamp) : null,
    };
  }
}

// ============ UTILITY FUNCTIONS ============

/**
 * Initialize database connection and return service instance
 */
export async function getDatabaseService(): Promise<DatabaseService> {
  const { db } = await connectToDatabase();
  return new DatabaseService(db);
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  status: string;
  timestamp: Date;
}> {
  try {
    const { db } = await connectToDatabase();
    await db.admin().ping();
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', timestamp: new Date() };
  }
}

/**
 * Close database connection (for cleanup)
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('✅ Database connection closed');
  }
}
