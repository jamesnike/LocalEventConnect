#!/bin/bash

echo "🔧 Backend Configuration Switcher"
echo "=================================="
echo ""
echo "Choose your backend:"
echo "1. Replit Backend (production)"
echo "2. Local Mock Server (development)"
echo "3. Local Real Backend (if running)"
echo "4. View current configuration"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
  1)
    echo "🔄 Switching to Replit Backend..."
    echo "Please enter your Replit project URL (e.g., https://your-project.your-username.repl.co):"
    read -p "Replit URL: " replit_url
    if [ ! -z "$replit_url" ]; then
      sed -i '' "s|BASE_URL: '.*'|BASE_URL: '$replit_url'|" src/config/api.ts
      echo "✅ Switched to Replit backend: $replit_url"
    else
      echo "❌ No URL provided, keeping current configuration"
    fi
    ;;
  2)
    echo "🔄 Switching to Local Mock Server..."
    sed -i '' "s|BASE_URL: '.*'|BASE_URL: 'http://192.168.1.188:3001'|" src/config/api.ts
    echo "✅ Switched to local mock server"
    ;;
  3)
    echo "🔄 Switching to Local Real Backend..."
    sed -i '' "s|BASE_URL: '.*'|BASE_URL: 'http://192.168.1.188:5000'|" src/config/api.ts
    echo "✅ Switched to local real backend"
    ;;
  4)
    echo "📋 Current configuration:"
    grep "BASE_URL:" src/config/api.ts
    ;;
  *)
    echo "❌ Invalid choice"
    ;;
esac

echo ""
echo "Current configuration:"
grep "BASE_URL:" src/config/api.ts
