# Troubleshooting Guide

## Upload Errors

### Error: "Failed to upload files: Request failed with status code 500"

**Possible Causes:**
1. **Uploads directory doesn't exist or isn't writable**
   - Solution: The server automatically creates `backend/uploads/` directory on startup
   - Check that the directory exists and has write permissions

2. **File size too large**
   - Maximum file size: 10MB per file
   - Maximum files: 10 files per upload

3. **Invalid file type**
   - Only image files are allowed (jpg, png, gif, etc.)

4. **Multer configuration error**
   - Check server logs for detailed error messages
   - Ensure multer is properly configured

**How to Debug:**
1. Check the backend server console for error messages
2. Look for detailed error logs that show the exact issue
3. Verify the uploads directory exists: `backend/uploads/`
4. Try uploading a small image file first to test

**Server Logs:**
The server now logs:
- When upload request is received
- Number of files in the request
- Each file being processed
- Any errors with full stack traces

## Network Errors

### Error: "Failed to upload files: Network Error"

**Causes:**
1. Backend server is not running
2. Backend server is running on a different port
3. CORS issues (should be handled automatically)

**Solutions:**
1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `🚀 Backend server running on http://localhost:3001`

2. **Verify backend is running:**
   ```bash
   # In PowerShell
   Test-NetConnection -ComputerName localhost -Port 3001
   ```

3. **Check frontend API URL:**
   - The frontend uses relative URLs in development (via Vite proxy)
   - Ensure `frontend/vite.config.js` has the correct proxy configuration

## Canvas Module Errors

### Error: "Canvas module not available"

**Cause:** The `canvas` package requires native bindings that may not be built correctly.

**Solutions:**
1. **Rebuild canvas:**
   ```bash
   cd backend
   npm rebuild canvas
   ```

2. **Install build tools (Windows):**
   ```bash
   npm install --global windows-build-tools
   npm rebuild canvas
   ```

3. **Note:** The server will continue to run without canvas, but server-side rendering features will be disabled.

## General Issues

### Server won't start

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be Node.js 16+ (18+ recommended)

2. **Check dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Check for port conflicts:**
   - Default backend port: 3001
   - Default frontend port: 3000
   - Change ports in `.env` or config files if needed

### Frontend won't start

1. **Vite/Crypto errors:**
   - Already fixed by downgrading to Vite 4.4.5
   - If issues persist, upgrade to Node.js 18+

2. **Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

## Getting Help

1. Check server console logs for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify both servers are running:
   - Backend: http://localhost:3001/api/health
   - Frontend: http://localhost:3000

## Quick Fixes

**Restart everything:**
```bash
# Stop all Node processes
# Then restart:
npm run dev
```

**Clear and reinstall:**
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend  
cd ../frontend
rm -rf node_modules
npm install
```




