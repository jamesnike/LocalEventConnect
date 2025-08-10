#!/bin/bash

echo "🔗 Testing Replit Backend Connection"
echo "===================================="
echo ""

# Test the main Replit URL format
echo "Testing main URL format..."
curl -s -m 10 "https://LocalEventConnect.jamesnikess.repl.co/api/events" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: Main URL is working!"
    echo "🌐 Your mobile app should work with: https://LocalEventConnect.jamesnikess.repl.co"
else
    echo "❌ Main URL not working yet"
fi

echo ""

# Test alternative URL formats
echo "Testing alternative URL formats..."
for url in "https://jamesnikess-LocalEventConnect.repl.co" "https://LocalEventConnect--jamesnikess.repl.co" "https://LocalEventConnect.jamesnikess.replit.dev"; do
    echo "Testing: $url"
    curl -s -m 5 "$url/api/events" > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ SUCCESS: $url is working!"
        echo "🌐 Update your mobile app to use: $url"
        break
    else
        echo "❌ Failed"
    fi
done

echo ""
echo "📱 If none work, make sure your Replit project is running first!"
echo "🔗 Go to: https://replit.com/@jamesnikess/LocalEventConnect"
echo "▶️  Click the 'Run' button and wait for it to start"
