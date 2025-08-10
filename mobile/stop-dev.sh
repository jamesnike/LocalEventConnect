#!/bin/bash

echo "🛑 Stopping LocalEventConnect Development Environment"
echo "==================================================="
echo ""

# Stop Expo server
if [ -f "manage-expo.sh" ]; then
    echo "📱 Stopping Expo server..."
    ./manage-expo.sh stop
else
    echo "⚠️  Expo management script not found"
fi

# Stop backend server
if [ -f "backend-server.pid" ]; then
    BACKEND_PID=$(cat backend-server.pid)
    echo "🔧 Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    
    # Wait and force kill if needed
    sleep 2
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "⚠️  Force killing backend server..."
        kill -9 $BACKEND_PID 2>/dev/null
    fi
    
    rm -f backend-server.pid
    echo "✅ Backend server stopped"
else
    echo "⚠️  Backend PID file not found"
fi

# Clean up any remaining processes
echo "🧹 Cleaning up remaining processes..."
pkill -f "expo start" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

echo ""
echo "✅ Development environment stopped!"
echo ""
echo "🔍 To verify everything is stopped:"
echo "   • Check Expo: ./manage-expo.sh status"
echo "   • Check Backend: ps aux | grep 'npm run dev'"
