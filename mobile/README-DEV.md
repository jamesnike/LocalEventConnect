# 🚀 LocalEventConnect Development Setup

This directory contains scripts to easily manage your development environment with Expo and the local backend server.

## 📱 Quick Start

### 1. Start Everything
```bash
./start-dev.sh
```
This will start both the Expo development server and your local backend server.

### 2. Check Status
```bash
./manage-expo.sh status
```
Check if the Expo server is running and get connection details.

### 3. Stop Everything
```bash
./stop-dev.sh
```
Stop both servers and clean up processes.

## 🔧 Individual Server Management

### Expo Server (Mobile App)
```bash
# Start Expo server
./manage-expo.sh start

# Check status
./manage-expo.sh status

# View logs
./manage-expo.sh logs

# Stop server
./manage-expo.sh stop

# Restart server
./manage-expo.sh restart
```

### Backend Server (API)
```bash
# Start backend (from root directory)
npm run dev

# Check if running
curl http://localhost:3001/api/events

# Stop backend
pkill -f "npm run dev"
```

## 📱 Connecting Your Mobile Device

### Option 1: QR Code (Recommended)
1. Open `qr-code.html` in your browser
2. Scan the QR code with Expo Go app
3. Your mobile app will load and connect to the backend

### Option 2: Manual Entry
1. Open Expo Go app
2. Tap "Enter URL manually"
3. Enter: `exp://192.168.1.188:8081`

## 🌐 Current Configuration

- **Expo Server**: `exp://192.168.1.188:8081`
- **Local Backend**: `http://localhost:3001`
- **API Endpoint**: `http://localhost:3001/api/events`
- **Mobile App API Config**: Set to local backend for testing

## 🔄 Testing Replit Backend

To test with your Replit backend instead:

1. Go to https://replit.com/@jamesnikess/LocalEventConnect
2. Click the "Run" button
3. Update `mobile/src/config/api.ts`:
   ```typescript
   BASE_URL: 'https://your-replit-url.repl.co'
   ```

## 📊 Monitoring

### View Expo Logs
```bash
./manage-expo.sh logs
# or
tail -f expo-server.log
```

### View Backend Logs
```bash
tail -f backend-server.log
```

### Check Process Status
```bash
# Check Expo
./manage-expo.sh status

# Check Backend
ps aux | grep "npm run dev"
```

## 🛠️ Troubleshooting

### Expo Server Issues
- **Port conflicts**: Try `./manage-expo.sh restart`
- **QR code not working**: Use manual URL entry
- **Connection failed**: Check if server is running with `./manage-expo.sh status`

### Backend Server Issues
- **Port 3001 in use**: Kill existing processes with `pkill -f "npm run dev"`
- **API not responding**: Check logs with `tail -f backend-server.log`
- **Database errors**: Ensure your local database is set up correctly

### General Issues
- **Scripts not working**: Make sure they're executable: `chmod +x *.sh`
- **Wrong directory**: Always run scripts from the `mobile` directory
- **Permission denied**: Check file permissions and ownership

## 📁 File Structure

```
mobile/
├── manage-expo.sh          # Expo server management
├── start-dev.sh            # Start development environment
├── stop-dev.sh             # Stop development environment
├── qr-code.html            # QR code for mobile connection
├── expo-server.log         # Expo server logs
├── backend-server.log      # Backend server logs
├── expo-server.pid         # Expo server process ID
├── backend-server.pid      # Backend server process ID
└── README-DEV.md           # This file
```

## 🎯 Development Workflow

1. **Start development**: `./start-dev.sh`
2. **Make code changes** in your mobile app
3. **Test on device** by scanning QR code
4. **Check logs** if issues arise
5. **Stop development**: `./stop-dev.sh`

## 🔗 Useful Commands

```bash
# Quick status check
./manage-expo.sh status && curl -s http://localhost:3001/api/events | head -1

# Restart everything
./stop-dev.sh && sleep 2 && ./start-dev.sh

# Monitor both servers
tail -f expo-server.log backend-server.log
```

Happy coding! 🎉
