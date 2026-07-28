# ESP32 Hardware Integration

## Reference components

- ESP32 development board
- Two pulse-output water flow sensors
- Stable 5 V sensor supply where required by the selected sensor
- Appropriate voltage protection or level shifting for the ESP32 input pins
- Wi-Fi connection

Confirm the voltage and pulse characteristics of your exact flow-sensor model before connecting it to the ESP32.

## Firmware setup

1. Open `firmware/smartpipex_esp32.ino` in Arduino IDE or PlatformIO.
2. Copy the safe template:

   ```bash
   cp firmware/config.example.h firmware/config.h
   ```

3. Add Wi-Fi credentials, API URL, API key, device ID, pin numbers, and sensor calibration factor to `firmware/config.h`.
4. Install these Arduino libraries:
   - ArduinoJson
   - ESP32 board support package
5. Compile and flash the board.
6. Open Serial Monitor at `115200` baud.

If NTP synchronisation is temporarily unavailable, the firmware omits the timestamp and the ingestion API records server receive time instead.

`firmware/config.h` is ignored by Git and must never be committed.

## Example wiring

The firmware defaults in the template use GPIO 18 and GPIO 19 for pulse input. Change them for your board and circuit.

```text
Inlet sensor signal  ──► configured INPUT_SENSOR_PIN
Outlet sensor signal ──► configured OUTPUT_SENSOR_PIN
Sensor ground        ──► shared ground
ESP32 Wi-Fi          ──► SmartPipeX HTTPS endpoint
```

Use interrupt-capable GPIO pins and appropriate pull-up or pull-down configuration for the chosen sensor.

## Calibration

Pulse-based flow sensors expose a model-specific calibration factor. The firmware converts pulse count to litres per minute using:

```text
flow rate = pulses × 60 / (calibration factor × sample duration in seconds)
```

Calibrate with a known measured volume rather than relying only on a datasheet value.

## Production hardening

For a real deployment, add:

- per-device keys instead of one shared key
- request signatures and replay protection
- TLS certificate validation strategy
- local buffering during network outages
- watchdog recovery
- over-the-air update controls
- tamper-resistant enclosures
- redundant sensing and fail-safe valves
