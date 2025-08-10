# 🔗 Connecting to Replit Backend

## Quick Setup

### Option 1: Use the Switch Script (Recommended)
```bash
./switch-backend.sh
```
Choose option 1 and enter your Replit URL when prompted.

### Option 2: Manual Configuration
Edit `src/config/api.ts` and change the `BASE_URL` to your Replit project URL.

## Steps to Get Your Replit Backend Running

1. **Go to your Replit project** in the browser
2. **Click "Run"** to start your backend server
3. **Look for the external URL** - it should look like:
   ```
   https://your-project-name.your-username.repl.co
   ```
4. **Copy that URL** and use it in the mobile app

## Current Configuration

Your mobile app is currently configured to use:
- **Mock Server**: `http://192.168.1.188:3001` (for development)
- **Replit Backend**: `https://your-project.your-username.repl.co` (when you switch)
- **Local Backend**: `http://192.168.1.188:5000` (if you get it running locally)

## Testing the Connection

1. **Switch to Replit backend** using the script
2. **Restart your mobile app** (reload in Expo)
3. **Check the console logs** - you should see API requests going to your Replit URL
4. **Test the app** - events should load from your real database

## Troubleshooting

- **"Network request failed"**: Make sure your Replit project is running
- **"CORS error"**: Your Replit backend needs to allow requests from your mobile app
- **"Authentication failed"**: Check if your Replit auth is properly configured

## Benefits of Using Replit Backend

✅ **Real data** from your PostgreSQL database  
✅ **Live updates** when you modify events  
✅ **User authentication** with Replit Auth  
✅ **Production-ready** backend infrastructure  
✅ **No local setup** required
