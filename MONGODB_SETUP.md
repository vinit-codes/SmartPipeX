# MongoDB Integration Setup for SmartPipeX

## Prerequisites

1. **MongoDB Atlas Account** (Free tier available)
   - Go to https://mongodb.com/atlas
   - Create free account
   - Create a new cluster
   - Get connection string

2. **Environment Variables**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartpipex?retryWrites=true&w=majority
   DB_NAME=smartpipex
   ```

## Installation

```bash
npm install mongodb mongoose
npm install @types/mongodb @types/mongoose --save-dev
```

## Database Schema Design

### Collections Structure:

1. **devices** - Store ESP32 device information
2. **sensor_readings** - Store all sensor data
3. **alerts** - Store detected leaks and alerts
4. **settings** - Store system configuration

## Quick Start Guide

1. **Setup MongoDB Atlas**
2. **Add connection string to `.env.local`**
3. **Run database initialization**
4. **Update API endpoints to use MongoDB**
5. **Deploy with database integration**

## Production Considerations

- **Indexing**: Optimize queries with proper indexes
- **Data Retention**: Archive old data to prevent storage bloat
- **Backup Strategy**: Automated daily backups
- **Monitoring**: Set up alerts for database performance
- **Security**: Use strong passwords and IP whitelisting
