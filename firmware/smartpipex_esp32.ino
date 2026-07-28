/**
 * SmartPipeX ESP32 firmware
 *
 * Reads two pulse-output flow sensors and sends inlet/outlet flow telemetry to
 * the SmartPipeX ingestion API. Secrets live in config.h, which is ignored by Git.
 */

#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <time.h>
#include "config.h"

volatile uint32_t inputPulseCount = 0;
volatile uint32_t outputPulseCount = 0;
unsigned long lastSampleAt = 0;

void IRAM_ATTR countInputPulse() { inputPulseCount++; }
void IRAM_ATTR countOutputPulse() { outputPulseCount++; }

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");
  const unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < 20000) {
    delay(500);
    Serial.print('.');
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nConnected. IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWi-Fi connection timed out. Retrying from loop().");
  }
}

void syncClock() {
  configTime(0, 0, "pool.ntp.org", "time.google.com");
  struct tm timeInfo;
  if (!getLocalTime(&timeInfo, 10000)) {
    Serial.println("NTP synchronisation failed; timestamps may be unavailable.");
  }
}

String currentIsoTimestamp() {
  struct tm timeInfo;
  if (!getLocalTime(&timeInfo)) return "";

  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeInfo);
  return String(buffer);
}

float flowRateFromPulses(uint32_t pulses, unsigned long durationMs) {
  if (durationMs == 0 || SENSOR_CALIBRATION_FACTOR <= 0) return 0.0F;
  const float durationSeconds = durationMs / 1000.0F;
  return (pulses * 60.0F) / (SENSOR_CALIBRATION_FACTOR * durationSeconds);
}

bool sendReading(float inputFlow, float outputFlow) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.setConnectTimeout(8000);
  http.setTimeout(10000);
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  JsonDocument payload;
  payload["deviceId"] = DEVICE_ID;
  const String timestamp = currentIsoTimestamp();
  if (!timestamp.isEmpty()) payload["timestamp"] = timestamp;
  payload["inputFlow"] = inputFlow;
  payload["outputFlow"] = outputFlow;

  String body;
  serializeJson(payload, body);
  const int status = http.POST(body);
  const String responseBody = http.getString();
  http.end();

  if (status != 201) {
    Serial.printf("Ingestion failed (%d): %s\n", status, responseBody.c_str());
    return false;
  }

  JsonDocument response;
  if (deserializeJson(response, responseBody) != DeserializationError::Ok) {
    Serial.println("Reading stored, but response JSON could not be parsed.");
    return true;
  }

  const bool leakDetected = response["data"]["leakDetected"] | false;
  const float waterLoss = response["data"]["waterLoss"] | 0.0F;
  const char* severity = response["data"]["severity"] | "none";

  Serial.printf(
    "Stored | input %.3f L/min | output %.3f L/min | loss %.3f L/min | leak %s | severity %s\n",
    inputFlow,
    outputFlow,
    waterLoss,
    leakDetected ? "yes" : "no",
    severity
  );
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(INPUT_SENSOR_PIN, INPUT_PULLUP);
  pinMode(OUTPUT_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(INPUT_SENSOR_PIN), countInputPulse, FALLING);
  attachInterrupt(digitalPinToInterrupt(OUTPUT_SENSOR_PIN), countOutputPulse, FALLING);

  connectToWiFi();
  syncClock();
  lastSampleAt = millis();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
    delay(1000);
    return;
  }

  const unsigned long now = millis();
  if (now - lastSampleAt < SAMPLE_INTERVAL_MS) {
    delay(25);
    return;
  }

  noInterrupts();
  const uint32_t inletPulses = inputPulseCount;
  const uint32_t outletPulses = outputPulseCount;
  inputPulseCount = 0;
  outputPulseCount = 0;
  interrupts();

  const unsigned long elapsed = now - lastSampleAt;
  lastSampleAt = now;

  const float inputFlow = flowRateFromPulses(inletPulses, elapsed);
  const float outputFlow = flowRateFromPulses(outletPulses, elapsed);
  sendReading(inputFlow, outputFlow);
}
