#!/bin/bash

# Build mobile app with Capacitor

echo "Building web app for mobile..."
npm run build

echo "Syncing with Capacitor..."
npx cap sync

echo "Mobile build complete!"
echo ""
echo "To add platforms:"
echo "  Android: npx cap add android"
echo "  iOS: npx cap add ios"
echo ""
echo "To run on device:"
echo "  Android: npx cap run android"
echo "  iOS: npx cap run ios"
echo ""
echo "To open in IDE:"
echo "  Android Studio: npx cap open android"
echo "  Xcode: npx cap open ios"