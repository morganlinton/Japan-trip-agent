# Japan Trip Tracker

A daily trip logging app that tracks your Japan travel experiences and automatically updates your Claude.md file with learned preferences.

## Features

- **Daily Log Entry**: Record location, activities, likes/dislikes, onsen visits, and mobility notes
- **Smart Suggestions**: Get personalized recommendations for tomorrow based on your preferences
- **Trip Progress**: Track how many days into your trip you are
- **Claude.md Integration**: Automatically updates your travel preferences file
- **Mobile-Friendly**: Easy to use on your phone during travel

## How to Use

1. **Start the app**:
   ```bash
   npm install
   npm start
   ```

2. **Open in browser**: Visit `http://localhost:3000`

3. **Daily Logging**: Each day, fill out:
   - Current location
   - Activities you did
   - What you liked and didn't like
   - Onsen visits (important for your daily tradition!)
   - Dad's knee/walking notes
   - Overall day rating

4. **Get Suggestions**: After logging, the app generates personalized suggestions for tomorrow based on:
   - Your stated preferences
   - Dad's mobility needs
   - Previous day patterns
   - Location-specific recommendations

5. **Track Progress**: See trip progress and review past entries

## App Benefits

- **Learns Your Preferences**: Each entry teaches the system what you enjoy
- **Considers Dad's Needs**: Factors in knee pain and walking limitations
- **Location-Aware**: Provides different suggestions for Tokyo vs Hokkaido
- **Updates Claude.md**: Your travel file grows more intelligent over time
- **Memory Aid**: Keep track of what you've done and where you've been

## File Structure

- `server.js` - Express server with API endpoints
- `public/index.html` - Main web interface
- `public/styles.css` - Mobile-friendly styling
- `public/app.js` - Frontend JavaScript
- `trip-data.json` - Stores your daily entries (auto-created)
- `claude.md` - Gets updated with learned preferences

## API Endpoints

- `GET /api/entries` - Get all trip entries
- `POST /api/entries` - Add new daily entry
- `GET /api/suggestions` - Get suggestions for tomorrow
- `GET /api/progress` - Get trip progress stats

Perfect for your structured trip style while maintaining the flexibility to adapt plans based on what you learn each day!