# SmartPipeX API

All responses use a consistent envelope.

## Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## Failure

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FLOW",
    "message": "inputFlow and outputFlow must be finite numbers between 0 and 100."
  }
}
```

## `POST /api/ingest`

Stores one ESP32 reading.

### Headers

```text
Content-Type: application/json
x-api-key: <INGEST_API_KEY>
```

The API key is optional in local development when `INGEST_API_KEY` is not configured. It is required in production.

### Request

```json
{
  "deviceId": "ESP32_DEV_PIPELINE_001",
  "timestamp": "2026-07-28T10:00:00.000Z",
  "inputFlow": 3.42,
  "outputFlow": 2.61
}
```

`inputFlow` and `outputFlow` must be finite numbers between `0` and `100`. Device IDs are normalised to letters, numbers, underscores, and hyphens. Timestamps may be at most five minutes in the future or seven days old.

### Status codes

| Status | Meaning |
| --- | --- |
| 201 | Reading validated and stored |
| 400 | Invalid JSON, flow value, device timestamp, or timestamp range |
| 401 | Missing or invalid API key |
| 503 | MongoDB is not configured |
| 500 | Persistence failed |

## `GET /api/data/live`

Returns the newest stored reading. When none is available, returns deterministic simulation data with `meta.source = "simulation"`.

## `GET /api/data/history?count=96`

Returns ordered historical readings.

- Minimum count: `12`
- Maximum count: `500`
- Default count: `96`

## `GET /api/data/alerts?severity=all&count=100`

Returns persisted alert records newest-first, plus a severity summary. When MongoDB is not configured, the endpoint derives clearly labelled demo alerts from deterministic simulation data.

- Minimum count: `1`
- Maximum count: `500`
- Default count: `100`
- Valid severity values: `all`, `mild`, `medium`, `critical`.

## `GET /api/data/consumption?days=7`

Downsamples stored telemetry into five-minute buckets, then estimates daily input volume, delivered volume, water loss, and efficiency from the actual interval between samples.

Valid days range: `1` to `30`.

## `GET /api/data/predict`

Returns the transparent operational risk analysis.

## `GET /api/health`

Reports application and database health without exposing connection details or environment variables.
