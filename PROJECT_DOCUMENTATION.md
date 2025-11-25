# SmartPipeX - Project Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [User Workflows](#user-workflows)
3. [Mock Data Strategy](#mock-data-strategy)
4. [API Specifications](#api-specifications)
5. [Future ESP32 Integration Plan](#future-esp32-integration-plan)
6. [Dashboard Screenshots](#dashboard-screenshots)
7. [Technology Stack](#technology-stack)
8. [Dataflow Diagram](#dataflow-diagram)
9. [Architecture Diagrams](#architecture-diagrams)
10. [Request Flow Diagrams](#request-flow-diagrams)
11. [Next Steps](#next-steps)

---

## System Overview

**SmartPipeX** is an intelligent pipeline leak detection and monitoring system built with Next.js 14. The system provides real-time monitoring, predictive maintenance analysis, and comprehensive leak detection capabilities for industrial pipeline systems.

### Core Capabilities

- **Real-time Monitoring**: Live sensor data streaming with 1-second refresh intervals
- **Intelligent Leak Detection**: Threshold-based detection with severity scoring
- **Predictive Maintenance**: AI-like analysis predicting system failures before they occur
- **Alert Management**: Categorized alerts with severity levels (Mild/Medium/Critical)
- **Historical Analytics**: Comprehensive data visualization with interactive charts
- **Settings Management**: Configurable thresholds and notification preferences
- **Responsive Dashboard**: Professional UI with real-time animations

### Key Features

- 🔄 **Live Data Streaming** with WebSocket-like updates
- 📊 **Interactive Analytics** with Recharts visualizations
- 🤖 **AI Predictive Analysis** without machine learning complexity
- ⚙️ **Configurable Settings** with localStorage persistence
- 🎨 **Modern UI/UX** with Framer Motion animations
- 📱 **Responsive Design** supporting desktop and mobile
- 🔔 **Multi-channel Alerts** (Email, Telegram, Dashboard)

---

## User Workflows

### 1. Dashboard Monitoring Workflow

```
User Access → Dashboard → Live Data View → Alert Notifications → Action Response
```

**Steps:**
1. User navigates to `/dashboard`
2. System loads real-time sensor data
3. Dashboard displays current flow rates, leak status, and system efficiency
4. User can start/stop data streaming
5. Critical alerts trigger visual and audio notifications
6. User responds to alerts via quick action buttons

### 2. Analytics & Reporting Workflow

```
User → Analytics Page → Historical Data → Chart Analysis → Report Generation
```

**Steps:**
1. User navigates to `/dashboard/analytics`
2. System loads configurable historical data (200-500 samples)
3. User views:
   - Line charts for flow rate comparisons
   - Bar charts for water loss analysis
   - Pie charts for event summaries
   - Statistical summaries
4. User can export data or generate reports
5. System provides predictive maintenance recommendations

### 3. Predictive Maintenance Workflow

```
Data Collection → Pattern Analysis → Risk Assessment → Recommendations → Action Planning
```

**Steps:**
1. System analyzes last 50 readings automatically
2. Calculates risk score using: `(leakFrequency * 4) + (avgFlowDiff * 5)`
3. Categorizes risk level (Low/Moderate/High)
4. Generates intelligent recommendations
5. User schedules maintenance based on AI suggestions

### 4. Alert Management Workflow

```
Leak Detection → Severity Assessment → Alert Generation → User Notification → Response Tracking
```

**Steps:**
1. System detects leak when `inputFlow - outputFlow > threshold`
2. Calculates severity score with consecutive leak tracking
3. Categorizes alert (Mild/Medium/Critical)
4. Sends notifications via configured channels
5. Displays alerts in sortable, paginated table
6. User acknowledges and responds to alerts

### 5. Settings Configuration Workflow

```
User → Settings Page → Parameter Adjustment → Validation → Storage → System Update
```

**Steps:**
1. User navigates to `/dashboard/settings`
2. Adjusts leak threshold (0.1-10.0 L/min)
3. Configures system responses (auto-shutoff, alerts)
4. Enables/disables notification channels
5. System validates and stores settings in localStorage
6. Real-time system updates reflect new parameters

---

## Mock Data Strategy

### Current Implementation

The system uses sophisticated mock data generation to simulate realistic pipeline sensor readings:

### Data Generation Logic

```typescript
interface SensorReading {
  timestamp: string;
  inputFlow: number;        // 0-4 L/min with realistic variations
  outputFlow: number;       // Calculated based on input with leak simulation
  leakDetected: boolean;    // Threshold-based detection
  waterLoss: number;        // inputFlow - outputFlow
  severity?: 'mild' | 'medium' | 'critical';
  severityScore?: number;   // Calculated risk score
}
```

### Simulation Parameters

- **Flow Range**: 0-4 L/min (configurable)
- **Leak Probability**: 15% (realistic for industrial systems)
- **Variation**: ±10% normal flow fluctuation
- **Measurement Precision**: 3 decimal places
- **Time Intervals**: 5-minute readings for historical data

### Data Generation Functions

1. **generateOneSample()**: Single real-time reading
2. **generateHistoricalData()**: Batch historical readings
3. **generateContinuousData()**: Time-series data for analysis
4. **performPredictiveAnalysis()**: AI-like pattern analysis

### Realism Features

- **Consecutive Leak Patterns**: Simulates recurring system issues
- **Flow Variations**: Natural pump and pressure fluctuations
- **Seasonal Adjustments**: Configurable for different operating conditions
- **Measurement Noise**: Realistic sensor precision simulation

---

## API Specifications

### Base URL
```
http://localhost:3000/api/data
```

### 1. Live Data Endpoint

```http
GET /api/data/live
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-25T10:30:00.000Z",
    "inputFlow": 3.24,
    "outputFlow": 2.89,
    "leakDetected": true,
    "waterLoss": 0.35,
    "severity": "mild",
    "severityScore": 1.2
  },
  "message": "Latest sensor reading retrieved successfully"
}
```

### 2. Historical Data Endpoint

```http
GET /api/data/history?count=300
```

**Query Parameters:**
- `count` (optional): Number of historical readings (200-500)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-11-25T10:25:00.000Z",
      "inputFlow": 3.18,
      "outputFlow": 3.12,
      "leakDetected": false,
      "waterLoss": 0.06,
      "severity": undefined,
      "severityScore": 0
    }
    // ... more readings
  ],
  "message": "Retrieved 300 historical sensor readings"
}
```

### 3. Alerts Endpoint

```http
GET /api/data/alerts?count=500&severity=all
```

**Query Parameters:**
- `count` (optional): Sample size to analyze (200-1000)
- `severity` (optional): Filter by severity (`mild|medium|critical|all`)

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "timestamp": "2025-11-25T10:30:00.000Z",
        "inputFlow": 3.24,
        "outputFlow": 2.89,
        "leakDetected": true,
        "waterLoss": 0.35,
        "severity": "mild",
        "alertMessage": "Minor leak: 10.8% water loss detected"
      }
    ],
    "summary": {
      "totalSamplesGenerated": 500,
      "totalLeaksFound": 45,
      "leakPercentage": "9.0",
      "alertsReturned": 45,
      "severityFilter": "all",
      "severityBreakdown": {
        "mild": 32,
        "medium": 8,
        "critical": 5
      }
    }
  }
}
```

### 4. Predictive Analysis Endpoint

```http
GET /api/data/predict?samples=50
```

**Query Parameters:**
- `samples` (optional): Analysis sample size (10-100)

**Response:**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "riskScore": 15.8,
      "riskCategory": "Low Risk",
      "leakFrequency": 12.0,
      "avgFlowDifference": 0.32,
      "recommendation": "✅ System operating within normal parameters...",
      "analysisTimestamp": "2025-11-25T10:45:00.000Z",
      "sampleSize": 50
    },
    "metadata": {
      "analysisType": "Predictive Maintenance",
      "algorithm": "Risk-based Pattern Analysis",
      "confidenceLevel": "High",
      "nextAnalysisRecommended": "2025-11-26T10:45:00.000Z"
    }
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Invalid count parameter. Must be a number.",
  "message": "Failed to retrieve sensor data"
}
```

---

## Future ESP32 Integration Plan

### Hardware Integration Architecture

```
ESP32 Sensors → Wi-Fi/Bluetooth → Data Ingestion API → Database → Dashboard
```

### Phase 1: Hardware Setup

**Required Components:**
- ESP32 development board
- Flow rate sensors (2x for input/output measurement)
- Pressure sensors (optional, for enhanced detection)
- Wi-Fi module (built into ESP32)
- Power management system

**Sensor Integration:**
```cpp
// ESP32 sensor reading code structure
struct SensorData {
  float inputFlow;
  float outputFlow;
  float pressure;
  unsigned long timestamp;
  String deviceId;
};
```

### Phase 2: Communication Protocol

**Data Transmission:**
- **Protocol**: HTTP POST to `/api/ingest`
- **Format**: JSON payload
- **Frequency**: 1-second intervals (configurable)
- **Reliability**: Retry logic with exponential backoff

**Payload Structure:**
```json
{
  "deviceId": "ESP32_PIPELINE_001",
  "timestamp": 1732536600000,
  "readings": {
    "inputFlow": 3.24,
    "outputFlow": 2.89,
    "pressure": 85.5,
    "temperature": 22.1
  },
  "calibration": {
    "version": "1.2.0",
    "lastCalibrated": "2025-11-20T08:00:00Z"
  }
}
```

### Phase 3: Data Ingestion API

**New Endpoint:**
```http
POST /api/ingest
Content-Type: application/json
Authorization: Bearer <device-token>
```

**Processing Flow:**
1. Authenticate device token
2. Validate sensor data format
3. Apply calibration corrections
4. Store in database with metadata
5. Trigger real-time updates
6. Return acknowledgment

### Phase 4: Database Integration

**Schema Extensions:**
```sql
-- Device management
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  device_id VARCHAR(50) UNIQUE,
  location VARCHAR(100),
  calibration_data JSONB,
  last_seen TIMESTAMP,
  status ENUM('active', 'inactive', 'maintenance')
);

-- Enhanced sensor readings
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY,
  device_id VARCHAR(50) REFERENCES devices(device_id),
  timestamp TIMESTAMP,
  input_flow DECIMAL(10,3),
  output_flow DECIMAL(10,3),
  pressure DECIMAL(10,2),
  temperature DECIMAL(8,2),
  leak_detected BOOLEAN,
  water_loss DECIMAL(10,3),
  severity VARCHAR(20),
  severity_score DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 5: Enhanced Features

**Real-time Calibration:**
- Remote calibration updates
- Automatic drift detection
- Multi-point calibration curves

**Edge Computing:**
- Local leak detection on ESP32
- Reduced network traffic
- Offline operation capability

**Device Management:**
- Fleet monitoring dashboard
- Firmware update system
- Remote configuration

---

## Dashboard Screenshots

> **Note**: Screenshots will be added once the application is fully deployed and tested.

### Planned Screenshot Sections:

1. **Main Dashboard** (`/dashboard`)
   - Live data streaming interface
   - Real-time flow rate displays
   - System status indicators
   - Alert banners

2. **Analytics Dashboard** (`/dashboard/analytics`)
   - Historical data charts
   - Statistical summaries
   - AI predictive analysis panel
   - Export functionality

3. **Alerts Management** (`/dashboard/alerts`)
   - Alert table with sorting/pagination
   - Severity filtering
   - Alert details modal

4. **Settings Panel** (`/dashboard/settings`)
   - Threshold configuration
   - Notification settings
   - System preferences

5. **Mobile Responsive Views**
   - Dashboard on mobile devices
   - Touch-friendly interface
   - Condensed navigation

---

## Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **React 18**: Latest React with Concurrent Features

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation and transitions
- **Recharts**: Data visualization library
- **Lucide Icons**: Modern icon library

### State Management
- **React Hooks**: useState, useEffect, useContext
- **Context API**: Global state for sensor streaming
- **localStorage**: Settings persistence

### Development Tools
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking
- **Turbopack**: Fast build system (Next.js 14)

### API & Data
- **Next.js API Routes**: Server-side endpoints
- **JSON**: Data exchange format
- **Mock Data Generation**: Sophisticated simulation

### Deployment & Infrastructure
- **Vercel**: Hosting platform (recommended)
- **Node.js**: Runtime environment
- **Git**: Version control

### Future Integrations
- **PostgreSQL/SQLite**: Database for production
- **Redis**: Caching and session management
- **WebSockets**: Real-time communication
- **JWT**: Authentication system
- **Docker**: Containerization

---

## Dataflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SMARTPIPEX DATA FLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────┐    ┌──────────────┐    ┌─────────────────────────┐   │
│  │   ESP32   │    │ Data Ingestion│    │      Database           │   │
│  │  Sensors  │───▶│      API      │───▶│   (Future: PostgreSQL)  │   │
│  └───────────┘    │ /api/ingest   │    │   (Current: Mock Data)  │   │
│                   └──────────────┘    └─────────────────────────┘   │
│                           │                        │               │
│                           ▼                        ▼               │
│                   ┌──────────────┐    ┌─────────────────────────┐   │
│                   │   Validation │    │    Data Processing      │   │
│                   │ & Calibration│    │  - Leak Detection       │   │
│                   └──────────────┘    │  - Severity Scoring     │   │
│                                      │  - Predictive Analysis  │   │
│                                      └─────────────────────────┘   │
│                                                 │                  │
│                                                 ▼                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API LAYER                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │/api/data/   │  │/api/data/   │  │/api/data/   │         │   │
│  │  │   live      │  │  history    │  │  alerts     │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  │                                                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │/api/data/   │  │/api/ingest  │  │/api/health  │         │   │
│  │  │  predict    │  │  (Future)   │  │             │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                   │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  FRONTEND LAYER                             │   │
│  │                                                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │  Dashboard  │  │  Analytics  │  │   Alerts    │         │   │
│  │  │   /dashboard│  │ /analytics  │  │  /alerts    │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  │                                                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │  Settings   │  │ Predictive  │  │ Real-time   │         │   │
│  │  │ /settings   │  │  Analysis   │  │ Streaming   │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                   │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    USER INTERFACE                           │   │
│  │                                                            │   │
│  │  • Real-time monitoring dashboards                        │   │
│  │  • Interactive data visualizations                        │   │
│  │  • Alert management system                                │   │
│  │  • Predictive maintenance recommendations                 │   │
│  │  • Configurable system settings                          │   │
│  │  • Mobile-responsive design                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Diagrams

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SMARTPIPEX SYSTEM ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────┐
                    │      PRESENTATION       │
                    │         LAYER           │
                    ├─────────────────────────┤
                    │  Next.js 14 Frontend    │
                    │  • Dashboard Pages      │
                    │  • Real-time UI         │
                    │  • Settings Management  │
                    │  • Responsive Design    │
                    └─────────────────────────┘
                              │ HTTP/WebSocket
                              ▼
                    ┌─────────────────────────┐
                    │     APPLICATION         │
                    │        LAYER            │
                    ├─────────────────────────┤
                    │  Next.js API Routes     │
                    │  • /api/data/live       │
                    │  • /api/data/history    │
                    │  • /api/data/alerts     │
                    │  • /api/data/predict    │
                    │  • /api/ingest (Future) │
                    └─────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────────┐
                    │       BUSINESS          │
                    │        LOGIC            │
                    ├─────────────────────────┤
                    │  Processing Engine      │
                    │  • Leak Detection       │
                    │  • Severity Scoring     │
                    │  • Predictive Analysis  │
                    │  • Data Validation      │
                    └─────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────────┐
                    │        DATA             │
                    │        LAYER            │
                    ├─────────────────────────┤
                    │  Current: Mock Data     │
                    │  Future: PostgreSQL/    │
                    │          Redis Cache    │
                    │  • Sensor Readings      │
                    │  • Alert History        │
                    │  • Device Management    │
                    └─────────────────────────┘
                              ▲
                    ┌─────────────────────────┐
                    │      HARDWARE           │
                    │       LAYER             │
                    ├─────────────────────────┤
                    │  ESP32 Integration      │
                    │  • Flow Sensors         │
                    │  • Pressure Sensors     │
                    │  • Wi-Fi Communication  │
                    │  • Edge Processing      │
                    └─────────────────────────┘
```

### Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COMPONENT ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Layout    │  │  Dashboard  │  │  Analytics  │  │   Alerts    │ │
│  │ Components  │  │    Page     │  │    Page     │  │    Page     │ │
│  │             │  │             │  │             │  │             │ │
│  │ • Navbar    │  │ • LiveData  │  │ • Charts    │  │ • Table     │ │
│  │ • Sidebar   │  │ • Metrics   │  │ • Stats     │  │ • Filters   │ │
│  │ • Footer    │  │ • Controls  │  │ • Predict   │  │ • Sorting   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Settings  │  │    Shared   │  │   Context   │  │ Animation   │ │
│  │    Page     │  │ Components  │  │ Providers   │  │ Components  │ │
│  │             │  │             │  │             │  │             │ │
│  │ • Toggles   │  │ • Button    │  │ • Sensor    │  │ • Motion    │ │
│  │ • Inputs    │  │ • Loading   │  │   Stream    │  │ • Framer    │ │
│  │ • Forms     │  │ • Modal     │  │ • Settings  │  │ • Smooth    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │     API     │  │   Data      │  │ Prediction  │  │   Utils     │ │
│  │   Routes    │  │ Processing  │  │   Engine    │  │ Libraries   │ │
│  │             │  │             │  │             │  │             │ │
│  │ • live      │  │ • MockData  │  │ • Analysis  │  │ • Settings  │ │
│  │ • history   │  │ • Generate  │  │ • Risk      │  │ • Format    │ │
│  │ • alerts    │  │ • Validate  │  │ • Recommend │  │ • Response  │ │
│  │ • predict   │  │ • Process   │  │ • Pattern   │  │ • Helper    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagrams

### Current Flow: Mock Data → Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CURRENT REQUEST FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │  Dashboard  │    │ API Routes  │    │ Mock Data   │
│             │    │   Frontend  │    │   Backend   │    │  Generator  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. GET /dashboard│                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │                  │                  │
       │ 2. Load Dashboard│                  │                  │
       │◀─────────────────┤                  │                  │
       │                  │                  │                  │
       │                  │ 3. GET /api/data/live               │
       │                  ├─────────────────▶│                  │
       │                  │                  │                  │
       │                  │                  │ 4. generateOneSample()
       │                  │                  ├─────────────────▶│
       │                  │                  │                  │
       │                  │                  │ 5. Enhanced Reading
       │                  │                  │   - inputFlow    │
       │                  │                  │   - outputFlow   │
       │                  │                  │   - leakDetected │
       │                  │                  │   - severity     │
       │                  │                  │   - severityScore│
       │                  │                  │◀─────────────────┤
       │                  │                  │                  │
       │                  │ 6. JSON Response │                  │
       │                  │◀─────────────────┤                  │
       │                  │                  │                  │
       │ 7. Update UI     │                  │                  │
       │  - Live Metrics  │                  │                  │
       │  - Alert Status  │                  │                  │
       │  - Animations    │                  │                  │
       │◀─────────────────┤                  │                  │
       │                  │                  │                  │
       │ 8. Auto Refresh (1s interval)       │                  │
       │                  ├─────────────────▶│                  │
       │                  │◀─────────────────┤                  │
       │◀─────────────────┤                  │                  │
```

### Future Flow: ESP32 → Database → Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FUTURE REQUEST FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  ESP32   │  │ Ingest   │  │Database  │  │Dashboard │  │ Browser  │
│ Sensors  │  │   API    │  │   Layer  │  │  Backend │  │ Frontend │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │             │
     │ 1. Sensor Reading         │             │             │
     │    - Input Flow            │             │             │
     │    - Output Flow           │             │             │
     │    - Pressure              │             │             │
     │    - Temperature           │             │             │
     │             │             │             │             │
     │ 2. POST /api/ingest        │             │             │
     ├────────────▶│             │             │             │
     │             │             │             │             │
     │             │ 3. Validate & Process     │             │
     │             │    - Auth Token           │             │
     │             │    - Data Format          │             │
     │             │    - Calibration          │             │
     │             │             │             │             │
     │             │ 4. Store Reading          │             │
     │             ├────────────▶│             │             │
     │             │             │             │             │
     │             │             │ 5. Trigger Analysis       │
     │             │             │    - Leak Detection       │
     │             │             │    - Severity Scoring     │
     │             │             │    - Predictive Logic     │
     │             │             ├────────────▶│             │
     │             │             │             │             │
     │             │             │ 6. Store Processed Data   │
     │             │             │◀────────────┤             │
     │             │             │             │             │
     │ 7. Acknowledge│             │             │             │
     │◀────────────┤             │             │             │
     │             │             │             │             │
     │             │             │             │ 8. User Request
     │             │             │             │    GET /dashboard
     │             │             │             │◀────────────┤
     │             │             │             │             │
     │             │             │             │ 9. Query Latest Data
     │             │             │             ├────────────▶│
     │             │             │             │             │
     │             │             │             │ 10. Return Data
     │             │             │             │◀────────────┤
     │             │             │             │             │
     │             │             │             │ 11. Render UI
     │             │             │             ├────────────▶│
     │             │             │             │             │
     │             │             │             │ 12. WebSocket Updates
     │             │             │             │    - Real-time Stream
     │             │             │             │    - Alert Notifications
     │             │             │             ├────────────▶│
```

### Analytics Request Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ANALYTICS REQUEST FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Browser  │  │Analytics │  │ History  │  │Predictive│  │  Chart   │
│ Frontend │  │   Page   │  │   API    │  │   API    │  │Libraries │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │             │
     │ 1. Navigate to /analytics  │             │             │
     ├────────────▶│             │             │             │
     │             │             │             │             │
     │             │ 2. Parallel Data Requests │             │
     │             │             │             │             │
     │             │ 3. GET /api/data/history?count=300      │
     │             ├────────────▶│             │             │
     │             │             │             │             │
     │             │ 4. GET /api/data/predict?samples=50     │
     │             ├─────────────────────────▶│             │
     │             │             │             │             │
     │             │             │ 5. Generate Historical    │
     │             │             │    - 300 readings         │
     │             │             │    - Enhanced with        │
     │             │             │      severity scores      │
     │             │             │             │             │
     │             │             │             │ 6. Analyze Patterns
     │             │             │             │    - Risk Score
     │             │             │             │    - Leak Frequency
     │             │             │             │    - Flow Differences
     │             │             │             │    - Recommendations
     │             │             │             │             │
     │             │ 7. Historical Data        │             │
     │             │◀────────────┤             │             │
     │             │             │             │             │
     │             │ 8. Prediction Data        │             │
     │             │◀─────────────────────────┤             │
     │             │             │             │             │
     │             │ 9. Process for Charts     │             │
     │             │    - Line Charts          │             │
     │             │    - Bar Charts           │             │
     │             │    - Pie Charts           │             │
     │             │    - Statistics           │             │
     │             ├─────────────────────────────────────────▶│
     │             │             │             │             │
     │             │ 10. Rendered Charts       │             │
     │             │◀─────────────────────────────────────────┤
     │             │             │             │             │
     │ 11. Complete Analytics Dashboard        │             │
     │◀────────────┤             │             │             │
     │             │             │             │             │
     │             │ 12. Interactive Features │             │
     │             │     - Refresh Button      │             │
     │             │     - Data Range Selection│             │
     │             │     - Export Options      │             │
     │             │     - Predictive Analysis │             │
```

---

## Next Steps

### Immediate Development Priorities

#### 1. Database Integration (Week 1-2)
- **Setup PostgreSQL**: Production database configuration
- **Schema Migration**: Convert mock data structure to tables
- **Connection Layer**: Database connection and query optimization
- **Data Persistence**: Historical data storage and retrieval

#### 2. Real-time WebSocket Implementation (Week 2-3)
- **WebSocket Server**: Real-time data streaming
- **Client Integration**: Dashboard live updates without polling
- **Connection Management**: Reconnection logic and error handling
- **Performance Optimization**: Efficient data broadcasting

#### 3. Authentication & Security (Week 3-4)
- **User Management**: Login/logout functionality
- **JWT Implementation**: Secure token-based authentication
- **Role-based Access**: Admin/operator/viewer permissions
- **API Security**: Rate limiting and input validation

### Hardware Integration Phase

#### 4. ESP32 Development (Week 4-6)
- **Sensor Integration**: Flow rate and pressure sensors
- **Communication Protocol**: Reliable data transmission
- **Edge Processing**: Local leak detection capabilities
- **Power Management**: Battery and sleep optimization

#### 5. Device Management System (Week 6-8)
- **Device Registration**: Automatic device discovery
- **Fleet Management**: Multiple device monitoring
- **Remote Configuration**: OTA updates and settings
- **Calibration System**: Remote sensor calibration

### Advanced Features Phase

#### 6. Enhanced Analytics (Week 8-10)
- **Machine Learning**: Pattern recognition algorithms
- **Advanced Predictions**: Long-term trend analysis
- **Custom Reports**: User-defined reporting system
- **Data Export**: Multiple format support (CSV, PDF, Excel)

#### 7. Alerting & Notifications (Week 10-12)
- **Multi-channel Alerts**: Email, SMS, Slack integration
- **Escalation Rules**: Progressive alert escalation
- **Alert Management**: Acknowledgment and resolution tracking
- **Custom Thresholds**: User-defined alert conditions

### Production Deployment

#### 8. Infrastructure Setup (Week 12-14)
- **Docker Containerization**: Application packaging
- **CI/CD Pipeline**: Automated deployment
- **Monitoring & Logging**: Application performance monitoring
- **Backup Strategy**: Data backup and recovery procedures

#### 9. Performance Optimization (Week 14-16)
- **Caching Strategy**: Redis implementation
- **Database Optimization**: Query performance tuning
- **CDN Integration**: Static asset optimization
- **Load Balancing**: High availability setup

### Long-term Roadmap

#### Quarter 2
- **Mobile Application**: React Native companion app
- **API v2**: GraphQL implementation
- **Advanced ML**: Predictive failure analysis
- **Integration Hub**: Third-party system integrations

#### Quarter 3
- **Multi-tenant Architecture**: Support for multiple organizations
- **Advanced Analytics**: Custom dashboard builder
- **IoT Platform**: Support for multiple sensor types
- **Compliance**: Industry standard certifications

#### Quarter 4
- **AI/ML Platform**: Machine learning model training
- **Edge Computing**: Local processing capabilities
- **Blockchain**: Data integrity and audit trails
- **International**: Multi-language and timezone support

### Technical Debt & Maintenance

#### Ongoing Tasks
- **Code Quality**: Regular refactoring and optimization
- **Security Updates**: Dependency updates and security patches
- **Documentation**: Keep technical documentation current
- **Testing**: Expand test coverage and automation
- **Performance Monitoring**: Continuous performance optimization

---

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode practices
2. Use consistent naming conventions
3. Write comprehensive tests for new features
4. Document API changes and new endpoints
5. Follow the established project structure

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Monitoring and logging setup
- [ ] Backup procedures tested
- [ ] Performance benchmarks met

---

*This documentation is a living document and will be updated as the SmartPipeX system evolves and new features are implemented.*
