# ESP32 Integration Files

This directory contains the files needed to integrate real ESP32 hardware with the SmartPipeX pipeline monitoring system.

## Files Overview

### 1. `/app/api/ingest/route.ts`

- **Purpose**: API endpoint that accepts real sensor data from ESP32 devices
- **Method**: POST
- **Validation**: Type checking for inputFlow, outputFlow, timestamp, and deviceId
- **Processing**: Leak detection using the same algorithm as mock data
- **Storage**: In-memory array (ready for database integration)

### 2. `esp32_example.ino`

- **Purpose**: Arduino sketch for ESP32 with flow rate sensors
- **Features**:
  - Flow rate sensor integration (YF-S201 compatible)
  - Wi-Fi connectivity
  - HTTP POST to SmartPipeX API
  - Local leak detection and alerts
  - Power management with deep sleep
  - OTA update capability

### 3. `esp32_simulator.py`

- **Purpose**: Python script to simulate ESP32 sensor readings
- **Features**:
  - Realistic sensor data generation
  - Continuous data transmission
  - Error handling and retry logic
  - Testing and debugging capabilities

## Quick Start

### Testing with Simulator

1. **Start SmartPipeX server**:

   ```bash
   npm run dev
   ```

2. **Test single reading** (using curl):

   ```bash
   curl -X POST http://localhost:3000/api/ingest \
     -H "Content-Type: application/json" \
     -d '{
       "inputFlow": 3.2,
       "outputFlow": 2.8,
       "timestamp": "2025-11-25T10:30:00.000Z",
       "deviceId": "ESP32_TEST_001"
     }'
   ```

3. **View stored readings**:
   ```bash
   curl http://localhost:3000/api/ingest
   ```

### Hardware Integration

1. **Hardware Setup**:
   - ESP32 development board
   - 2x Flow rate sensors (YF-S201 or similar)
   - Wi-Fi connectivity
   - Power supply

2. **Software Setup**:
   - Install Arduino IDE
   - Install required libraries:
     - WiFi
     - HTTPClient
     - ArduinoJson
   - Upload `esp32_example.ino` to your ESP32

3. **Configuration**:
   - Update Wi-Fi credentials in the Arduino code
   - Set the correct SmartPipeX API URL
   - Assign unique device ID
   - Calibrate sensors according to your hardware

## API Integration

### Expected JSON Format

```json
{
  "inputFlow": 3.24, // Flow rate in L/min (input pipe)
  "outputFlow": 2.89, // Flow rate in L/min (output pipe)
  "timestamp": "2025-11-25T10:30:00.000Z", // ISO 8601 timestamp
  "deviceId": "ESP32_001" // Unique device identifier
}
```

### Response Processing

The API will:

1. Validate input data types and ranges
2. Calculate leak detection using threshold-based algorithm
3. Assign severity score (mild/medium/critical)
4. Store processed data with metadata
5. Return success/error response

### Leak Detection Logic

- **Threshold**: 0.3 L/min difference (configurable)
- **Severity Calculation**: `(difference * 2) + (consecutiveLeakCount * 1.5)`
- **Categories**:
  - **Mild**: Score < 3.0
  - **Medium**: Score 3.0-5.9
  - **Critical**: Score ≥ 6.0

## Production Considerations

### Security

- Implement device authentication tokens
- Use HTTPS for all API communications
- Validate device certificates
- Rate limiting and DDoS protection

### Database Integration

- Replace in-memory storage with PostgreSQL
- Implement data retention policies
- Add database indexing for performance
- Setup backup and recovery procedures

### Device Management

- Device registration and provisioning
- Remote configuration updates
- Firmware over-the-air (OTA) updates
- Health monitoring and diagnostics

### Scalability

- Support for multiple device types
- Load balancing for high device counts
- Message queuing for reliable data ingestion
- Real-time data streaming to dashboard

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   - Ensure all required libraries are installed
   - Check import paths and dependencies

2. **Connection timeouts**:
   - Verify Wi-Fi connectivity on ESP32
   - Check SmartPipeX server is running
   - Confirm API URL is correct

3. **Invalid payload errors**:
   - Verify JSON format matches expected schema
   - Check data types (numbers vs strings)
   - Ensure timestamp is in ISO 8601 format

4. **Sensor reading issues**:
   - Verify sensor wiring and power supply
   - Check calibration factors
   - Ensure interrupts are properly configured

### Debug Commands

```bash
# Check if server is running
curl http://localhost:3000/api/data/live

# Test ingest endpoint
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"inputFlow":2.5,"outputFlow":2.4,"timestamp":"2025-11-25T10:00:00Z","deviceId":"TEST"}'

# View ingested data
curl "http://localhost:3000/api/ingest?limit=10"

# Check for specific device
curl "http://localhost:3000/api/ingest?deviceId=ESP32_001"
```

## Next Steps

1. **Database Integration**: Replace mock storage with PostgreSQL
2. **WebSocket Support**: Real-time data streaming
3. **Authentication**: Secure device tokens and API keys
4. **Device Fleet Management**: Multi-device monitoring dashboard
5. **Alert Integration**: Connect to existing alert systems
6. **Advanced Analytics**: Machine learning for pattern detection

---

_This integration enables seamless transition from mock data to real ESP32 sensor input without requiring changes to the existing SmartPipeX dashboard and analytics system._
