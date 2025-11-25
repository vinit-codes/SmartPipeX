/**
 * Example usage and testing of the mock data module
 * This file demonstrates how to use the leak detection mock data generators
 */

import {
  generateOneSample,
  generateHistoricalData,
  generateContinuousData,
  getLeakStats,
} from './mockData';

// Example 1: Generate a single current reading
console.log('=== Single Sample ===');
const currentReading = generateOneSample();
console.log(currentReading);

// Example 2: Generate historical data
console.log('\n=== Historical Data (Last 10 readings) ===');
const historicalReadings = generateHistoricalData(10);
historicalReadings.forEach((reading, index) => {
  console.log(
    `${index + 1}. ${reading.timestamp}: ${reading.inputFlow}L/min → ${reading.outputFlow}L/min ${reading.leakDetected ? '⚠️' : '✅'}`
  );
});

// Example 3: Generate continuous data for a specific time range
console.log('\n=== Continuous Data (Last 1 Hour, 10-minute intervals) ===');
const endTime = new Date();
const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 1 hour ago
const continuousData = generateContinuousData(startTime, endTime, 10);

continuousData.forEach((reading) => {
  const time = new Date(reading.timestamp).toLocaleTimeString();
  console.log(
    `${time}: ${reading.inputFlow} → ${reading.outputFlow} (Loss: ${reading.waterLoss})`
  );
});

// Example 4: Get statistics from the data
console.log('\n=== Statistics ===');
const stats = getLeakStats(continuousData);
console.log(`Total Readings: ${stats.totalReadings}`);
console.log(`Leak Events: ${stats.leakReadings} (${stats.leakPercentage}%)`);
console.log(`Average Input Flow: ${stats.avgInputFlow} L/min`);
console.log(`Average Output Flow: ${stats.avgOutputFlow} L/min`);
console.log(`Total Water Loss: ${stats.totalWaterLoss} L/min`);
console.log(`Average Water Loss per Reading: ${stats.avgWaterLoss} L/min`);

// Example 5: Simulate real-time monitoring
console.log('\n=== Real-time Simulation ===');
function simulateRealTimeMonitoring() {
  const reading = generateOneSample();
  const status = reading.leakDetected
    ? '🚨 LEAK DETECTED'
    : '✅ Normal Operation';
  console.log(
    `[${new Date().toLocaleTimeString()}] ${status} - Flow: ${reading.inputFlow} → ${reading.outputFlow} L/min`
  );
}

// Simulate 5 readings
for (let i = 0; i < 5; i++) {
  simulateRealTimeMonitoring();
}

export {}; // Make this a module
