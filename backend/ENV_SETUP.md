# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=3001
NODE_ENV=development

# Optional: remove.bg API Key for real background removal
# Get your free API key at: https://www.remove.bg/api
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

## Getting a remove.bg API Key

1. Visit https://www.remove.bg/api
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

**Note:** The application works without the API key, but will use simulated background removal. With the API key, you get real AI-powered background removal.

## Platform Export Requirements

The application supports platform-specific exports:

### Meta (Facebook/Instagram)
- **Square**: 1080x1080px, max 20% text coverage
- **Story**: 1080x1920px, max 20% text coverage
- **Feed**: 1200x628px, max 20% text coverage

### Google Ads
- **Display**: 300x250px
- **Banner**: 728x90px
- **Square**: 250x250px

### Amazon
- **Main**: 1000x1000px, min 85% product coverage
- **Thumbnail**: 75x75px
- **Zoom**: 2000x2000px






