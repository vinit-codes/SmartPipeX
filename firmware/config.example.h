#pragma once

// Copy this file to config.h and replace every placeholder.
// config.h is ignored by Git.

constexpr char WIFI_SSID[] = "YOUR_WIFI_SSID";
constexpr char WIFI_PASSWORD[] = "YOUR_WIFI_PASSWORD";
constexpr char API_URL[] = "https://your-deployment.example/api/ingest";
constexpr char API_KEY[] = "replace-with-the-INGEST_API_KEY";
constexpr char DEVICE_ID[] = "ESP32_DEV_PIPELINE_001";

constexpr int INPUT_SENSOR_PIN = 18;
constexpr int OUTPUT_SENSOR_PIN = 19;

// Replace with the calibration factor for the selected flow-sensor model.
constexpr float SENSOR_CALIBRATION_FACTOR = 7.5F;
constexpr unsigned long SAMPLE_INTERVAL_MS = 5000;
