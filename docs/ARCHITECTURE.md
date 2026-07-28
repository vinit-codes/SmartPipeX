# SmartPipeX Architecture

## Overview

SmartPipeX uses a small layered architecture so hardware transport, leak-domain logic, persistence, and presentation can evolve independently.

```text
ESP32 / simulator
      │
      ▼
POST /api/ingest
      │ authentication + validation
      ▼
lib/domain/leak-detection.ts
      │ pure calculation
      ▼
lib/server/database.ts
      │ MongoDB persistence
      ▼
Read APIs ───────────────► Dashboard pages
```

## Layers

### Hardware layer

`firmware/smartpipex_esp32.ino` reads pulses from inlet and outlet flow sensors. Configuration lives in an ignored `config.h`, created from `config.example.h`, so Wi-Fi credentials and the ingestion key are not committed.

### API layer

Next.js Route Handlers expose a deliberately small API:

- Ingestion validates device payloads and persists readings.
- Read routes load MongoDB telemetry when available.
- Read routes use labelled deterministic simulation when MongoDB is not configured.
- Production database failures surface visibly unless demo fallback is explicitly enabled.
- Health checks report whether MongoDB is connected, unavailable, or not configured.

### Domain layer

`lib/domain/leak-detection.ts` contains pure functions with no framework or database dependency:

- `assessLeak`
- `createSensorReading`
- `analyseRisk`

`lib/domain/consumption.ts` integrates flow over real timestamp intervals and prevents telemetry gaps from inflating volume totals.

This makes the most important business logic directly unit-testable.

### Persistence layer

`lib/server/database.ts` owns MongoDB concerns:

- cached development/serverless connection
- connection pooling
- indexes
- reading insertion
- device heartbeat upsert
- deduplicated alert insertion and alert querying
- serialisation of stored timestamps

### Presentation layer

The App Router dashboard consumes typed JSON contracts. Shared visual components are small and live under `components/dashboard` and `components/ui`.

## Leak assessment

The default leak threshold is `0.30 L/min`.

1. `waterLoss = max(0, inputFlow - outputFlow)`
2. A leak exists when `waterLoss > threshold`.
3. The severity score is a bounded multiple of the loss-to-threshold ratio.
4. Scores map to mild, medium, or critical.

Negative differences caused by normal sensor drift are normalised to zero rather than reported as negative water loss.

## Risk analysis

The risk model analyses up to 96 recent readings and combines:

- leak frequency
- average water loss
- proportion of critical readings

The result is capped at 100 and mapped to Low, Moderate, or High. This is a transparent operational heuristic, not a machine-learning model.

## Failure behaviour

| Failure | Behaviour |
| --- | --- |
| MongoDB is not configured | Read routes return labelled simulation data; ingestion returns 503 |
| MongoDB query fails | Production read routes fail visibly; an explicit demo flag can enable labelled simulation |
| Invalid device payload | Ingestion returns a structured 400 error |
| Invalid API key | Ingestion returns 401 |
| Browser loses network | PWA navigation falls back to `/offline` |

## Production considerations

Before industrial use, add device-specific credentials, request replay protection, message signing, rate limiting, distributed alert delivery, redundant sensors, calibration records, observability, and domain certification.
