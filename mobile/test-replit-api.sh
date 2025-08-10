#!/bin/bash

echo "🧪 Testing Replit API Connection"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REPLIT_URL="https://local-event-connect.replit.app"
API_ENDPOINT="/api/events"
FULL_URL="${REPLIT_URL}${API_ENDPOINT}"

echo -e "${BLUE}🔗 Testing Connection to:${NC}"
echo "   • Base URL: $REPLIT_URL"
echo "   • API Endpoint: $API_ENDPOINT"
echo "   • Full URL: $FULL_URL"
echo ""

echo -e "${YELLOW}📡 Making API Request...${NC}"
echo "   • Method: GET"
echo "   • Timeout: 10 seconds"
echo ""

# Make the API request
RESPONSE=$(curl -s -m 10 -w "HTTP_STATUS:%{http_code}" "$FULL_URL" 2>/dev/null)

# Extract HTTP status and response body
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//')

echo -e "${BLUE}📊 Response Details:${NC}"
echo "   • HTTP Status: $HTTP_STATUS"

if [ -n "$HTTP_STATUS" ]; then
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo -e "   • Status: ${GREEN}✅ Success${NC}"
        echo "   • Response: Data received successfully"
        
        # Show first few lines of response
        if [ -n "$RESPONSE_BODY" ]; then
            echo ""
            echo -e "${BLUE}📄 Response Preview:${NC}"
            echo "$RESPONSE_BODY" | head -5
            if [ $(echo "$RESPONSE_BODY" | wc -l) -gt 5 ]; then
                echo "... (truncated)"
            fi
        fi
        
        echo ""
        echo -e "${GREEN}🎉 Replit Backend is working!${NC}"
        echo "   • Your mobile app can now connect to it"
        echo "   • Run: ./switch-to-replit.sh to switch your app"
        
    else
        echo -e "   • Status: ${RED}❌ Error (HTTP $HTTP_STATUS)${NC}"
        echo "   • Response: $RESPONSE_BODY"
        echo ""
        echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
        echo "   • Check if Replit project is running"
        echo "   • Verify the API endpoint exists"
        echo "   • Check Replit logs for errors"
        
    fi
else
    echo -e "   • Status: ${RED}❌ Connection Failed${NC}"
    echo "   • No response received"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo "   • Go to: https://replit.com/@jamesnikess/LocalEventConnect"
    echo "   • Click 'Run' button to start the project"
    echo "   • Wait for it to show 'Running' status"
    echo "   • Run this test again: ./test-replit-api.sh"
fi

echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo "   • If successful: ./switch-to-replit.sh"
echo "   • If failed: Start your Replit project first"
echo "   • Always test: ./test-replit-api.sh"
