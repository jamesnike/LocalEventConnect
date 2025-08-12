#!/bin/bash

# Expo Server Management Script
# This script helps manage the Expo development server in the background

EXPO_LOG="expo-server.log"
EXPO_PID_FILE="expo-server.pid"
EXPO_PORT="${EXPO_PORT}"

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

# Find a free TCP port starting at 8081
find_free_port() {
    local start=8081
    local end=8090
    for ((p=start; p<=end; p++)); do
        if command -v fuser >/dev/null 2>&1; then
            if ! fuser -n tcp "$p" >/dev/null 2>&1; then
                echo "$p"
                return 0
            fi
        else
            # Fallback: optimistically return first candidate
            echo "$p"
            return 0
        fi
    done
    # Fallback default if none found in range
    echo 8085
}

# Function to check if Expo server is running
check_status() {
    if [ -f "$EXPO_PID_FILE" ]; then
        PID=$(cat "$EXPO_PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Expo server is running (PID: $PID)${NC}"
            echo "🌐 Local: http://localhost:${EXPO_PORT:-unknown}"
            echo "🔗 Tunnel: check 'Public URL' in logs below or run './manage-expo.sh logs'"
            echo "📱 QR Code: For public access, open qr-code.html after updating it to the tunnel URL"
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

    if [ -z "$EXPO_PORT" ]; then
        EXPO_PORT=$(find_free_port)
    fi
    
    print_status "Starting Expo server with public tunnel in background on port ${EXPO_PORT}..."
    
    # Start Expo server in background with tunnel for a public URL
    CI=1 npx expo start --clear --tunnel --port ${EXPO_PORT} > "$EXPO_LOG" 2>&1 &
    EXPO_PID=$!
    
    # Save PID to file
    echo $EXPO_PID > "$EXPO_PID_FILE"
    
    print_status "Expo server started with PID: $EXPO_PID"
    print_status "Logs are being written to: $EXPO_LOG"
    
    # Wait a moment for server to start
    sleep 6
    
    if check_status > /dev/null 2>&1; then
        print_status "Server is starting up. Tunnel URL will appear in logs once ready. 🚀"
        echo ""
        echo "📱 To connect your mobile device (public):"
        echo "   1. Run './manage-expo.sh logs'"
        echo "   2. Look for a line like 'Tunnel ready' or 'Public URL' (exp+https://...)"
        echo "   3. Open that URL in Expo Go or scan the QR shown in your terminal"
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
        print_status "Showing last 50 lines of Expo server logs (look for 'Tunnel' or 'Public URL'):"
        echo "----------------------------------------"
        tail -50 "$EXPO_LOG"
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
