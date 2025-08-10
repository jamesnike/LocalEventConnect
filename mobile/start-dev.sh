#!/bin/bash

echo "🚀 Starting LocalEventConnect Development Environment"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the mobile directory"
    exit 1
fi

# Start Expo server in background
echo "📱 Starting Expo development server..."
./manage-expo.sh start

echo ""
echo "🌐 Starting local backend server..."
cd .. && npm run dev > ../mobile/backend-server.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../mobile/backend-server.pid

echo ""
echo "✅ Development environment started!"
echo ""
echo "📱 Mobile App:"
echo "   • Expo Server: exp://192.168.1.188:8081"
echo "   • QR Code: Open qr-code.html in your browser"
echo "   • Status: ./manage-expo.sh status"
echo ""
echo "🔧 Backend API:"
echo "   • Local Server: http://localhost:3001"
echo "   • API Endpoint: http://localhost:3001/api/events"
echo "   • Logs: tail -f backend-server.log"
echo ""
echo "🛑 To stop everything:"
echo "   • Stop Expo: ./manage-expo.sh stop"
echo "   • Stop Backend: kill \$(cat backend-server.pid)"
echo ""
echo "🔍 To check status:"
echo "   • Expo: ./manage-expo.sh status"
echo "   • Backend: ps aux | grep 'npm run dev'"
