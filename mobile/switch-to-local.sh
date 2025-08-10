#!/bin/bash

echo "🔄 Switching Mobile App to Local Backend"
echo "========================================"
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
echo "   • Current Backend: Replit (https://LocalEventConnect.jamesnikess.repl.co)"
echo ""

echo -e "${YELLOW}🔍 Testing Local Backend Connection...${NC}"
echo "   • URL: http://localhost:3001"
echo "   • Endpoint: /api/events"
echo ""

# Test local connection
LOCAL_URL="http://localhost:3001/api/events"
RESPONSE=$(curl -s -m 5 "$LOCAL_URL" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✅ Local Backend is accessible!${NC}"
    echo "   • Response received successfully"
    echo "   • Status: Active"
    echo ""
    
    echo -e "${BLUE}🔄 Updating Mobile App Configuration...${NC}"
    
    # Create a backup of the current config
    cp src/config/api.ts src/config/api.ts.backup.replit
    echo "   • Backup created: src/config/api.ts.backup.replit"
    
    # Update the config to use Local
    sed -i '' 's/status: '\''active'\''/status: '\''inactive'\''/g' src/config/api.ts
    echo "   • Configuration updated to use local backend"
    
    echo ""
    echo -e "${GREEN}✅ Successfully switched to Local Backend!${NC}"
    echo ""
    echo "📱 Your mobile app will now connect to:"
    echo "   • Local Backend: http://localhost:3001"
    echo "   • Replit Backend: https://LocalEventConnect.jamesnikess.repl.co (inactive)"
    echo ""
    echo "🔄 To switch back to Replit backend:"
    echo "   • Run: ./switch-to-replit.sh"
    echo "   • Or restore: cp src/config/api.ts.backup.replit src/config/api.ts"
    echo ""
    echo "🧪 Test the connection by refreshing your mobile app!"
    
else
    echo -e "${RED}❌ Local Backend is not accessible${NC}"
    echo "   • Connection failed or timed out"
    echo "   • Response: $RESPONSE"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting Steps:${NC}"
    echo "   1. Make sure your local backend is running:"
    echo "      • From root directory: npm run dev"
    echo "      • Or use: ./start-dev.sh"
    echo "   2. Check if port 3001 is available"
    echo "   3. Run this script again: ./switch-to-local.sh"
    echo ""
    echo "📱 For now, your mobile app will continue using the Replit backend"
fi
