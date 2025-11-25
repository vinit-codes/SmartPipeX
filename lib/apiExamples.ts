/**
 * API Endpoints Testing and Usage Examples
 * This file demonstrates how to interact with the leak detection API endpoints
 */

// Type definitions for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SensorReading {
  timestamp: string;
  inputFlow: number;
  outputFlow: number;
  leakDetected: boolean;
  waterLoss: number;
}

interface AlertReading extends SensorReading {
  severity: 'low' | 'medium' | 'high';
  alertMessage: string;
}

interface AlertsResponse {
  alerts: AlertReading[];
  summary: {
    totalSamplesGenerated: number;
    totalLeaksFound: number;
    leakPercentage: string;
    alertsReturned: number;
    severityFilter: string;
    severityBreakdown: {
      low: number;
      medium: number;
      high: number;
    };
  };
}

/**
 * Example usage of API endpoints
 * These functions demonstrate how to call the endpoints from a client
 */

// 1. Get latest live sensor reading
async function getLiveSensorData(): Promise<SensorReading | null> {
  try {
    const response = await fetch('/api/data/live');
    const result: ApiResponse<SensorReading> = await response.json();

    if (result.success && result.data) {
      console.log('Live sensor data:', result.data);
      return result.data;
    } else {
      console.error('Failed to get live data:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching live sensor data:', error);
    return null;
  }
}

// 2. Get historical sensor data
async function getHistoricalData(
  count: number = 300
): Promise<SensorReading[] | null> {
  try {
    const response = await fetch(`/api/data/history?count=${count}`);
    const result: ApiResponse<SensorReading[]> = await response.json();

    if (result.success && result.data) {
      console.log(
        `Historical data (${result.data.length} readings):`,
        result.data
      );
      return result.data;
    } else {
      console.error('Failed to get historical data:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching historical sensor data:', error);
    return null;
  }
}

// 3. Get leak alerts
async function getLeakAlerts(
  count: number = 500,
  severity: string = 'all'
): Promise<AlertsResponse | null> {
  try {
    const response = await fetch(
      `/api/data/alerts?count=${count}&severity=${severity}`
    );
    const result: ApiResponse<AlertsResponse> = await response.json();

    if (result.success && result.data) {
      console.log('Leak alerts:', result.data);
      return result.data;
    } else {
      console.error('Failed to get leak alerts:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching leak alerts:', error);
    return null;
  }
}

/**
 * Example usage scenarios
 */

// Scenario 1: Real-time monitoring dashboard
async function realTimeMonitoring() {
  console.log('=== Real-time Monitoring ===');
  const liveData = await getLiveSensorData();

  if (liveData) {
    if (liveData.leakDetected) {
      console.log('🚨 ALERT: Leak detected!');
      console.log(`Water loss: ${liveData.waterLoss} L/min`);
    } else {
      console.log('✅ System operating normally');
    }
  }
}

// Scenario 2: Historical analysis
async function historicalAnalysis() {
  console.log('=== Historical Analysis ===');
  const historicalData = await getHistoricalData(400);

  if (historicalData) {
    const leaks = historicalData.filter((reading) => reading.leakDetected);
    const totalWaterLoss = historicalData.reduce(
      (sum, reading) => sum + reading.waterLoss,
      0
    );

    console.log(`Total readings: ${historicalData.length}`);
    console.log(`Leak events: ${leaks.length}`);
    console.log(
      `Leak rate: ${((leaks.length / historicalData.length) * 100).toFixed(1)}%`
    );
    console.log(`Total water loss: ${totalWaterLoss.toFixed(3)} L/min`);
  }
}

// Scenario 3: Critical alerts monitoring
async function criticalAlertsMonitoring() {
  console.log('=== Critical Alerts Monitoring ===');
  const alerts = await getLeakAlerts(500, 'high');

  if (alerts) {
    console.log(`Found ${alerts.alerts.length} high-severity alerts`);
    console.log('Summary:', alerts.summary);

    // Show most recent critical alerts
    alerts.alerts.slice(0, 3).forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.alertMessage} at ${alert.timestamp}`);
    });
  }
}

// Scenario 4: Comprehensive leak analysis
async function comprehensiveLeakAnalysis() {
  console.log('=== Comprehensive Leak Analysis ===');
  const allAlerts = await getLeakAlerts(800, 'all');

  if (allAlerts) {
    const { summary } = allAlerts;
    console.log(
      `Analysis of ${summary.totalSamplesGenerated} sensor readings:`
    );
    console.log(
      `Total leaks found: ${summary.totalLeaksFound} (${summary.leakPercentage}%)`
    );
    console.log('Severity breakdown:');
    console.log(`  - High severity: ${summary.severityBreakdown.high}`);
    console.log(`  - Medium severity: ${summary.severityBreakdown.medium}`);
    console.log(`  - Low severity: ${summary.severityBreakdown.low}`);

    // Calculate average water loss for each severity
    const highSeverityAlerts = allAlerts.alerts.filter(
      (a) => a.severity === 'high'
    );
    const mediumSeverityAlerts = allAlerts.alerts.filter(
      (a) => a.severity === 'medium'
    );
    const lowSeverityAlerts = allAlerts.alerts.filter(
      (a) => a.severity === 'low'
    );

    if (highSeverityAlerts.length > 0) {
      const avgHighLoss =
        highSeverityAlerts.reduce((sum, a) => sum + a.waterLoss, 0) /
        highSeverityAlerts.length;
      console.log(
        `Average water loss (high severity): ${avgHighLoss.toFixed(3)} L/min`
      );
    }

    if (mediumSeverityAlerts.length > 0) {
      const avgMediumLoss =
        mediumSeverityAlerts.reduce((sum, a) => sum + a.waterLoss, 0) /
        mediumSeverityAlerts.length;
      console.log(
        `Average water loss (medium severity): ${avgMediumLoss.toFixed(3)} L/min`
      );
    }

    if (lowSeverityAlerts.length > 0) {
      const avgLowLoss =
        lowSeverityAlerts.reduce((sum, a) => sum + a.waterLoss, 0) /
        lowSeverityAlerts.length;
      console.log(
        `Average water loss (low severity): ${avgLowLoss.toFixed(3)} L/min`
      );
    }
  }
}

/**
 * cURL examples for testing the endpoints directly
 */
const curlExamples = `
# Test the endpoints using cURL:

# 1. Get live sensor data
curl -X GET "http://localhost:3000/api/data/live"

# 2. Get historical data (300 readings)
curl -X GET "http://localhost:3000/api/data/history?count=300"

# 3. Get historical data (custom count)
curl -X GET "http://localhost:3000/api/data/history?count=450"

# 4. Get all leak alerts
curl -X GET "http://localhost:3000/api/data/alerts?count=500"

# 5. Get only high-severity alerts
curl -X GET "http://localhost:3000/api/data/alerts?count=500&severity=high"

# 6. Get medium-severity alerts from larger dataset
curl -X GET "http://localhost:3000/api/data/alerts?count=800&severity=medium"

# 7. Error cases (invalid parameters)
curl -X GET "http://localhost:3000/api/data/history?count=100"  # Too low
curl -X GET "http://localhost:3000/api/data/history?count=600"  # Too high
curl -X GET "http://localhost:3000/api/data/alerts?severity=invalid"  # Invalid severity
`;

console.log(curlExamples);

// Export functions for use in other modules
export {
  getLiveSensorData,
  getHistoricalData,
  getLeakAlerts,
  realTimeMonitoring,
  historicalAnalysis,
  criticalAlertsMonitoring,
  comprehensiveLeakAnalysis,
};

// Export types for use in other modules
export type { ApiResponse, SensorReading, AlertReading, AlertsResponse };
