# Mobile App Setup Guide

## Overview
Your EventConnect web app is now configured with Capacitor to build native mobile apps for iOS and Android.

## Quick Start

### 1. Build the Web App
```bash
npm run build
```

### 2. Add Mobile Platforms
```bash
# Add Android platform
npx cap add android

# Add iOS platform (Mac only)
npx cap add ios
```

### 3. Build and Sync
```bash
# Sync web build with mobile platforms
npx cap sync
```

### 4. Run on Device/Emulator
```bash
# Run on Android
npx cap run android

# Run on iOS (Mac only)
npx cap run ios
```

### 5. Open in IDE
```bash
# Open in Android Studio
npx cap open android

# Open in Xcode (Mac only)
npx cap open ios
```

## Mobile Features Added

### Core Plugins
- **App**: App state management and URL handling
- **Haptics**: Touch feedback for better user experience
- **Keyboard**: Keyboard behavior optimization
- **Status Bar**: Native status bar styling
- **Splash Screen**: App launch screen

### Event App Features
- **Geolocation**: For location-based event discovery
- **Camera**: For event photo uploads
- **Share**: Share events with others
- **Push Notifications**: Event reminders and updates
- **Filesystem**: Save event data offline

## Configuration
- **App ID**: com.eventconnect.app
- **App Name**: EventConnect
- **Build Directory**: dist/

## Development Workflow

### For Android
1. Install Android Studio
2. Set up Android SDK
3. Run `npx cap add android`
4. Use `npx cap run android` to test

### For iOS
1. Install Xcode (Mac only)
2. Run `npx cap add ios`
3. Use `npx cap run ios` to test

## Publishing

### Google Play Store
1. Build signed APK in Android Studio
2. Upload to Google Play Console
3. Follow Google's publishing guidelines

### Apple App Store
1. Build app in Xcode
2. Upload to App Store Connect
3. Submit for review

## Tips
- Test on real devices for best experience
- Use `npx cap sync` after each web build
- Check platform-specific requirements
- Consider app store guidelines during development