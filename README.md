# AI Creative Builder - Full Stack Application

A complete full-stack application for AI-powered creative design generation with real-time compliance checking and multi-format export capabilities.

## Features

- **Asset Upload**: Upload multiple images (product photos, logos) with preview
- **Smart Editing**: Background removal (simulated, ready for API integration)
- **Generative Layouts**: Server-side generation of layout variants
- **Real-Time Compliance**: Automatic contrast checking and safe zone validation
- **Multi-format Export**: Download creatives as PNG in Square, Story, or Banner formats
- **Style Controls**: Adjust tone (neutral, bold, playful, premium) and objective (awareness, conversion, sales)

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios for API calls

### Backend
- Node.js with Express
- Multer for file uploads
- Sharp for image processing
- Canvas for server-side rendering
- CORS enabled for cross-origin requests

## Project Structure

```
Tesco/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/
│   │   │   └── AICreativeBuilder.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/            # Express API server
│   ├── server.js       # Main server file
│   ├── uploads/        # Uploaded assets (created automatically)
│   ├── exports/        # Rendered images (created automatically)
│   ├── package.json
│   └── .env.example
├── package.json        # Root package.json for convenience scripts
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)
  - **Note**: Node.js 16 is supported but requires Vite 4.4.x (already configured)
  - For best experience, upgrade to Node.js 18+

### Setup Steps

1. **Install all dependencies** (root, frontend, and backend):
   ```bash
   npm run install:all
   ```

   Or install manually:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Configure backend environment** (optional):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env if needed (defaults work for development)
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This starts both:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

## Usage

1. **Upload Assets**: Click "Upload Assets" and select one or more images (product photos, logos)
2. **Configure Settings**: 
   - Toggle background removal
   - Select tone and objective
   - Choose format (Square, Story, Banner)
3. **Generate Variants**: Click "Generate Variants" to create 3 layout options
4. **Review & Export**: 
   - View violations in the left panel
   - Use "Auto-fix contrast" if needed
   - Click "Export PNG" to download

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Upload image files (multipart/form-data)
- `POST /api/background-remove` - Remove background from image (simulated)
- `POST /api/generate-variants` - Generate layout variants
- `POST /api/render-variant` - Render variant to image
- `POST /api/auto-fix` - Auto-fix contrast issues
- `DELETE /api/assets/:filename` - Delete an asset

## Production Deployment

### Frontend Build
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend
- Set `NODE_ENV=production`
- Configure proper file storage (consider cloud storage like S3)
- Add API keys for production services (e.g., remove.bg API)
- Use a process manager like PM2

### Environment Variables

**Backend (.env)**:
```
PORT=3001
NODE_ENV=production
REMOVE_BG_API_KEY=your_key_here  # Optional: for real background removal
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:3001  # Change to your production API URL
```

## Integration with Real Services

### Background Removal ✅
**Already Integrated!** The application uses remove.bg API when `REMOVE_BG_API_KEY` is set in `.env`.

1. Get a free API key from https://www.remove.bg/api
2. Add to `backend/.env`: `REMOVE_BG_API_KEY=your_key_here`
3. Background removal will automatically use the API

See `backend/ENV_SETUP.md` for detailed setup instructions.

### Layout Generation ✅
**Enhanced!** The system now generates 6 sophisticated layout templates:
- Centered, Left Aligned, Right Aligned, Split, Hero, Grid
- Each with template configurations and descriptions
- Adapts based on objective (awareness, conversion, sales)

### Compliance Checks ✅
**Fully Enhanced!** Includes:
- ✅ WCAG AA contrast ratio validation (4.5:1 minimum)
- ✅ Logo safe zone checking (40px minimum)
- ✅ Text readability analysis
- ✅ Platform-specific requirements (Meta, Google, Amazon)
- ✅ Severity levels and fixable flags

### Platform-Specific Exports ✅
**Implemented!** Export optimized creatives for:
- ✅ Meta (Facebook/Instagram): Square, Story, Feed formats
- ✅ Google Ads: Display, Banner, Square formats
- ✅ Amazon: Main, Thumbnail, Zoom formats
- ✅ Batch export to multiple platforms at once

See `FEATURES.md` for complete feature documentation.

## Development Notes

- Uploaded files are stored in `backend/uploads/`
- Rendered images are saved in `backend/exports/`
- Both directories are created automatically
- Canvas rendering happens server-side for better performance
- Frontend uses proxy configuration to avoid CORS issues in development

## License

MIT

