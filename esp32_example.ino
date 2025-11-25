/*
 * SmartPipeX ESP32 Sensor Integration
 * 
 * This Arduino sketch demonstrates how to integrate ESP32 with flow rate sensors
 * and send data to the SmartPipeX ingest API.
 * 
 * Hardware Requirements:
 * - ESP32 development board
 * - 2x Flow rate sensors (YF-S201 or similar)
 * - Wi-Fi connectivity
 * 
 * Libraries Required:
 * - WiFi
 * - HTTPClient
 * - ArduinoJson
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Wi-Fi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// SmartPipeX API configuration
const char* apiUrl = "http://your-server.com/api/ingest";
const char* deviceId = "ESP32_PIPELINE_001";

// Sensor pins
const int inputFlowPin = 2;   // GPIO pin for input flow sensor
const int outputFlowPin = 4;  // GPIO pin for output flow sensor

// Flow rate calculation variables
volatile int inputPulseCount = 0;
volatile int outputPulseCount = 0;
unsigned long lastTime = 0;
const unsigned long sampleInterval = 5000; // 5 seconds

// Calibration factor (pulses per liter - depends on your sensor)
const float calibrationFactor = 7.5; // YF-S201 typical value

void setup() {
  Serial.begin(115200);
  
  // Initialize sensor pins
  pinMode(inputFlowPin, INPUT_PULLUP);
  pinMode(outputFlowPin, INPUT_PULLUP);
  
  // Attach interrupts for pulse counting
  attachInterrupt(digitalPinToInterrupt(inputFlowPin), inputPulseCounter, FALLING);
  attachInterrupt(digitalPinToInterrupt(outputFlowPin), outputPulseCounter, FALLING);
  
  // Initialize Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("✅ WiFi connected");
  Serial.print("📡 IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println("🚀 SmartPipeX ESP32 Sensor Starting...");
  
  lastTime = millis();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if sample interval has passed
  if (currentTime - lastTime >= sampleInterval) {
    // Calculate flow rates
    float inputFlowRate = calculateFlowRate(inputPulseCount);
    float outputFlowRate = calculateFlowRate(outputPulseCount);
    
    // Reset pulse counters
    inputPulseCount = 0;
    outputPulseCount = 0;
    lastTime = currentTime;
    
    // Create sensor data
    SensorData data = {
      inputFlowRate,
      outputFlowRate,
      getCurrentTimestamp(),
      deviceId
    };
    
    // Send data to API
    sendSensorData(data);
    
    // Print to serial for debugging
    Serial.printf("📊 Input: %.2f L/min, Output: %.2f L/min\n", 
                  inputFlowRate, outputFlowRate);
    
    if (inputFlowRate - outputFlowRate > 0.3) {
      Serial.println("⚠️  Potential leak detected!");
    }
  }
  
  delay(100); // Small delay to prevent overwhelming the loop
}

// Interrupt handlers for pulse counting
void IRAM_ATTR inputPulseCounter() {
  inputPulseCount++;
}

void IRAM_ATTR outputPulseCounter() {
  outputPulseCount++;
}

// Calculate flow rate from pulse count
float calculateFlowRate(int pulseCount) {
  // Flow rate (L/min) = (Pulse count * 60) / (calibration factor * sample interval in seconds)
  float flowRate = (pulseCount * 60.0) / (calibrationFactor * (sampleInterval / 1000.0));
  return flowRate;
}

// Get current timestamp in ISO 8601 format
String getCurrentTimestamp() {
  // In a real implementation, you would use NTP to get accurate time
  // For now, we'll use millis() as a simple timestamp
  unsigned long currentMillis = millis();
  
  // Convert to ISO 8601 format (simplified)
  // In production, use a proper time library like TimeLib
  char timestamp[25];
  sprintf(timestamp, "2025-11-25T%02d:%02d:%02d.000Z", 
          (int)((currentMillis / 3600000) % 24),
          (int)((currentMillis / 60000) % 60),
          (int)((currentMillis / 1000) % 60));
  
  return String(timestamp);
}

// Structure for sensor data
struct SensorData {
  float inputFlow;
  float outputFlow;
  String timestamp;
  String deviceId;
};

// Send sensor data to SmartPipeX API
void sendSensorData(SensorData data) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    DynamicJsonDocument doc(1024);
    doc["inputFlow"] = data.inputFlow;
    doc["outputFlow"] = data.outputFlow;
    doc["timestamp"] = data.timestamp;
    doc["deviceId"] = data.deviceId;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode == 201) {
      String response = http.getString();
      Serial.println("✅ Data sent successfully");
      
      // Parse response to check for leak detection
      DynamicJsonDocument responseDoc(2048);
      deserializeJson(responseDoc, response);
      
      if (responseDoc["data"]["processed"]["leakDetected"]) {
        String severity = responseDoc["data"]["processed"]["severity"];
        float severityScore = responseDoc["data"]["processed"]["severityScore"];
        Serial.printf("🚨 LEAK DETECTED - Severity: %s (Score: %.2f)\n", 
                      severity.c_str(), severityScore);
        
        // You could trigger local alarms, LED indicators, or relay controls here
        triggerLocalAlert(severity);
      }
    } else {
      Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
      Serial.println(http.getString());
    }
    
    http.end();
  } else {
    Serial.println("❌ WiFi not connected");
    // Attempt to reconnect
    WiFi.reconnect();
  }
}

// Trigger local alerts based on severity
void triggerLocalAlert(String severity) {
  // Example: Control LEDs, buzzers, or relays based on severity
  if (severity == "critical") {
    // Flash red LED, sound alarm, close valves
    Serial.println("🔴 CRITICAL ALERT - Taking emergency action");
    // digitalWrite(EMERGENCY_VALVE_PIN, LOW); // Close main valve
    // digitalWrite(RED_LED_PIN, HIGH);
  } else if (severity == "medium") {
    // Yellow LED, moderate alarm
    Serial.println("🟡 MEDIUM ALERT - Monitoring closely");
    // digitalWrite(YELLOW_LED_PIN, HIGH);
  } else {
    // Green LED, mild warning
    Serial.println("🟢 MILD ALERT - Minor leak detected");
    // digitalWrite(GREEN_LED_PIN, HIGH);
  }
}

// Additional functions for production use:

// Over-the-Air (OTA) update capability
void setupOTA() {
  // ArduinoOTA.setHostname(deviceId);
  // ArduinoOTA.begin();
  // This allows remote firmware updates
}

// Deep sleep for power management
void enterDeepSleep(int seconds) {
  Serial.printf("💤 Entering deep sleep for %d seconds\n", seconds);
  esp_sleep_enable_timer_wakeup(seconds * 1000000);
  esp_deep_sleep_start();
}

// Sensor calibration routine
void calibrateSensors() {
  Serial.println("🔧 Starting sensor calibration...");
  // Implement calibration logic based on known flow rates
  // Store calibration factors in EEPROM/NVS
}

// Network time synchronization
void syncTime() {
  // Use NTP to get accurate time
  // configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}
