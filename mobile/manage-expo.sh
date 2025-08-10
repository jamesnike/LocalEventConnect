#!/bin/bash

# Expo Server Management Script
# This script helps manage the Expo development server in the background

EXPO_LOG="expo-server.log"
EXPO_PID_FILE="expo-server.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Expo Server Management Tool${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if Expo server is running
check_status() {
    if [ -f "$EXPO_PID_FILE" ]; then
        PID=$(cat "$EXPO_PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Expo server is running (PID: $PID)${NC}"
            echo "📍 Server URL: exp://192.168.1.188:8081"
            echo "🌐 Local URL: http://localhost:8081"
            echo "📱 QR Code: Open qr-code.html in your browser"
            return 0
        else
            echo -e "${RED}❌ Expo server is not running (stale PID file)${NC}"
            rm -f "$EXPO_PID_FILE"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Expo server is not running${NC}"
        return 1
    fi
}

# Function to start Expo server
start_server() {
    if check_status > /dev/null 2>&1; then
        print_warning "Expo server is already running!"
        return 1
    fi
    
    print_status "Starting Expo server in background..."
    
    # Start Expo server in background
    npx expo start --clear > "$EXPO_LOG" 2>&1 &
    EXPO_PID=$!
    
    # Save PID to file
    echo $EXPO_PID > "$EXPO_PID_FILE"
    
    print_status "Expo server started with PID: $EXPO_PID"
    print_status "Logs are being written to: $EXPO_LOG"
    
    # Wait a moment for server to start
    sleep 3
    
    if check_status > /dev/null 2>&1; then
        print_status "Server is ready! 🚀"
        echo ""
        echo "📱 To connect your mobile device:"
        echo "   1. Open qr-code.html in your browser"
        echo "   2. Scan the QR code with Expo Go app"
        echo "   3. Or manually enter: exp://192.168.1.188:8081"
        echo ""
        echo "📊 To monitor logs: ./manage-expo.sh logs"
        echo "🛑 To stop server: ./manage-expo.sh stop"
    else
        print_error "Failed to start server. Check logs: $EXPO_LOG"
        return 1
    fi
}

# Function to stop Expo server
stop_server() {
    if [ -f "$EXPO_PID_FILE" ]; then
        PID=$(cat "$EXPO_PID_FILE")
        print_status "Stopping Expo server (PID: $PID)..."
        
        # Kill the process
        kill $PID 2>/dev/null
        
        # Wait for it to stop
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            print_warning "Force killing server..."
            kill -9 $PID 2>/dev/null
        fi
        
        # Remove PID file
        rm -f "$EXPO_PID_FILE"
        
        print_status "Expo server stopped"
    else
        print_warning "No PID file found. Server may not be running."
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$EXPO_LOG" ]; then
        print_status "Showing last 20 lines of Expo server logs:"
        echo "----------------------------------------"
        tail -20 "$EXPO_LOG"
        echo "----------------------------------------"
        echo ""
        echo "📝 Full logs: tail -f $EXPO_LOG"
    else
        print_error "Log file not found: $EXPO_LOG"
    fi
}

# Function to restart server
restart_server() {
    print_status "Restarting Expo server..."
    stop_server
    sleep 2
    start_server
}

# Function to show help
show_help() {
    print_header
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start Expo server in background"
    echo "  stop      Stop Expo server"
    echo "  restart   Restart Expo server"
    echo "  status    Check server status"
    echo "  logs      Show recent logs"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start the server"
    echo "  $0 status   # Check if running"
    echo "  $0 logs     # View logs"
    echo "  $0 stop     # Stop the server"
    echo ""
}

# Main script logic
case "${1:-help}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
