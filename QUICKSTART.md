# Quick Start Guide

## Prerequisites
- Node.js 16+ installed (Node.js 18+ recommended)
- npm (comes with Node.js)

**Note**: If you're using Node.js 16, the project is configured to use Vite 4.4.5 for compatibility. For best performance and latest features, upgrade to Node.js 18+.

## Installation (One Command)

```bash
npm run install:all
```

This installs dependencies for:
- Root project (concurrently for running both servers)
- Frontend (React + Vite + Tailwind)
- Backend (Express + image processing libraries)

## Running the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## First Steps

1. Open http://localhost:3000 in your browser
2. Upload one or more images (product photos, logos)
3. Configure your settings:
   - Select tone (neutral, bold, playful, premium)
   - Choose objective (awareness, conversion, sales)
   - Pick format (Square, Story, Banner)
4. Click "Generate Variants" to create 3 layout options
5. Review violations and use "Auto-fix" if needed
6. Export your creative as PNG

## Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use:
- **Frontend**: Edit `frontend/vite.config.js` and change the `port` value
- **Backend**: Create `backend/.env` and set `PORT=3002` (or another port)

### Canvas/Image Processing Errors
- Ensure you have Node.js 16+ (18+ recommended for native Canvas support)
- On Windows, you may need to install build tools: `npm install --global windows-build-tools`
- If you see `crypto$2.getRandomValues is not a function`, you're likely using Node.js 16 with Vite 5. The project uses Vite 4.4.5 for Node.js 16 compatibility.

### Crypto/GetRandomValues Error
If you encounter `crypto$2.getRandomValues is not a function`:
- **Solution**: The project is already configured with Vite 4.4.5 for Node.js 16 compatibility
- **Better Solution**: Upgrade to Node.js 18+ for full compatibility with latest tools

### File Upload Issues
- Check that `backend/uploads/` directory exists (created automatically)
- Verify file size is under 10MB
- Ensure file is an image format (jpg, png, gif, etc.)

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd ../backend
NODE_ENV=production npm start
```

## Next Steps (Completed ✅)

All features from the Next Steps section have been implemented:

✅ **Background Removal API Integration**
- Integrated with remove.bg API (optional, falls back to simulation)
- Add `REMOVE_BG_API_KEY` to `backend/.env` for real background removal
- See `backend/ENV_SETUP.md` for setup instructions

✅ **Sophisticated Layout Generation**
- 6 professional layout templates (centered, left-aligned, right-aligned, split, hero, grid)
- Each variant includes template configuration and descriptions
- Layouts adapt based on objective (awareness, conversion, sales)

✅ **Enhanced Compliance Checks**
- WCAG AA contrast ratio checking (minimum 4.5:1)
- Logo safe zone validation (40px minimum)
- Platform-specific compliance checks (Meta, Google, Amazon)
- Text readability analysis
- Severity levels and fixable flags for violations

✅ **Platform-Specific Export Formats**
- Meta exports: Square (1080x1080), Story (1080x1920), Feed (1200x628)
- Google Ads exports: Display (300x250), Banner (728x90), Square (250x250)
- Amazon exports: Main (1000x1000), Thumbnail (75x75), Zoom (2000x2000)
- Batch export for multiple platforms at once
- Automatic optimization for each platform's requirements

## Additional Features

- **Enhanced Error Handling**: Better error messages and logging
- **Template-Based Rendering**: Uses layout templates for consistent designs
- **Compliance Scoring**: Detailed violation reporting with severity levels
- **Platform Optimization**: Automatic resizing and optimization for each platform

