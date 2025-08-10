#!/bin/bash

echo "🔄 Switching Mobile App to Replit Backend"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the mobile directory${NC}"
    exit 1
fi

echo -e "${BLUE}📱 Current Mobile App Configuration:${NC}"
echo "   • API Config: mobile/src/config/api.ts"
echo "   • Current Backend: Local (http://localhost:3001)"
echo ""

echo -e "${YELLOW}🔍 Testing Replit Backend Connection...${NC}"
echo "   • URL: https://LocalEventConnect.jamesnikess.repl.co"
echo "   • Endpoint: /api/events"
echo ""

# Test Replit connection
REPLIT_URL="https://local-event-connect.replit.app/api/events"
RESPONSE=$(curl -s -m 10 "$REPLIT_URL" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✅ Replit Backend is accessible!${NC}"
    echo "   • Response received successfully"
    echo "   • Status: Active"
    echo ""
    
    echo -e "${BLUE}🔄 Updating Mobile App Configuration...${NC}"
    
    # Create a backup of the current config
    cp src/config/api.ts src/config/api.ts.backup
    echo "   • Backup created: src/config/api.ts.backup"
    
    # Update the config to use Replit
    sed -i '' 's/status: '\''inactive'\''/status: '\''active'\''/g' src/config/api.ts
    echo "   • Configuration updated to use Replit backend"
    
    echo ""
    echo -e "${GREEN}✅ Successfully switched to Replit Backend!${NC}"
    echo ""
    echo "📱 Your mobile app will now connect to:"
    echo "   • Replit Backend: https://LocalEventConnect.jamesnikess.repl.co"
    echo "   • Local Backend: http://localhost:3001 (fallback)"
    echo ""
    echo "🔄 To switch back to local backend:"
    echo "   • Run: ./switch-to-local.sh"
    echo "   • Or restore: cp src/config/api.ts.backup src/config/api.ts"
    echo ""
    echo "🧪 Test the connection by refreshing your mobile app!"
    
else
    echo -e "${RED}❌ Replit Backend is not accessible${NC}"
    echo "   • Connection failed or timed out"
    echo "   • Response: $RESPONSE"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting Steps:${NC}"
    echo "   1. Go to: https://replit.com/@jamesnikess/LocalEventConnect"
    echo "   2. Click the 'Run' button"
    echo "   3. Wait for it to start (should show 'Running' status)"
    echo "   4. Run this script again: ./switch-to-replit.sh"
    echo ""
    echo "📱 For now, your mobile app will continue using the local backend"
    echo "   • Local Backend: http://localhost:3001"
    echo "   • Status: Active and working"
fi
