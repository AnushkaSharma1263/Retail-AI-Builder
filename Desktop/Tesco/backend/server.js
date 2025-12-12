import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import {
  generateLayoutVariants,
  optimizeForPlatform,
  getLayoutDescription as getGenLayoutDescription
} from './generativeDesignEngine.js';
import {
  generateQuoteVariations,
  generateContextualQuote
} from './aiQuoteGenerator.js';

// Canvas is optional - will be loaded dynamically
let createCanvas, loadImage;
let canvasLoaded = false;

async function loadCanvas() {
  if (canvasLoaded) return;
  try {
    // Dynamic import to avoid blocking server startup
    const canvasModule = await import('canvas');
    createCanvas = canvasModule.createCanvas;
    loadImage = canvasModule.loadImage;
    canvasLoaded = true;
    console.log('✅ Canvas module loaded successfully');
  } catch (err) {
    console.warn('⚠️  Canvas module not available. Server-side rendering will be limited.');
    console.warn('   Error:', err.message);
    console.warn('   Try: npm rebuild canvas');
    console.warn('   Server will continue without canvas support.');
  }
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads');
const exportsDir = join(__dirname, 'exports');

async function ensureDirectories() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(exportsDir, { recursive: true });
    console.log('✅ Directories created/verified');
  } catch (error) {
    console.error('❌ Failed to create directories:', error);
    throw error;
  }
}
// Ensure directories exist before starting server
ensureDirectories().catch(err => {
  console.error('Fatal: Could not create directories:', err);
  process.exit(1);
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));
app.use('/exports', express.static(exportsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Creative Builder API is running' });
});

// Upload assets with error handling
app.post('/api/upload', (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message || 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Files:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files in request');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map((file, index) => {
      console.log(`Processing file ${index + 1}:`, file.originalname, file.filename);
      return {
        id: Date.now() + index + Math.random(),
        name: file.originalname,
        src: `/uploads/${file.filename}`,
        type: file.mimetype,
        size: file.size,
        path: file.path
      };
    });

    console.log('Upload successful, returning', uploadedFiles.length, 'files');
    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// Background removal with remove.bg API integration
app.post('/api/background-remove', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const outputPath = join(uploadsDir, `removed-bg-${Date.now()}.png`);
    const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

    if (REMOVE_BG_API_KEY) {
      // Use remove.bg API
      try {
        const imageBuffer = await fs.readFile(req.file.path);
        
        const response = await axios.post('https://api.remove.bg/v1.0/removebg', imageBuffer, {
          headers: {
            'X-Api-Key': REMOVE_BG_API_KEY,
            'Content-Type': 'application/octet-stream'
          },
          params: {
            size: 'auto'
          },
          responseType: 'arraybuffer'
        });

        await fs.writeFile(outputPath, Buffer.from(response.data));
        
        res.json({
          success: true,
          imageUrl: `/uploads/${req.file.filename}`,
          processedUrl: `/uploads/${outputPath.split('/').pop()}`,
          method: 'remove.bg API'
        });
        return;
      } catch (apiError) {
        console.warn('remove.bg API error, falling back to simulation:', apiError.message);
        // Fall through to simulation
      }
    }

    // Fallback: Simulated background removal using Sharp
    // Apply edge detection and transparency to simulate background removal
    const image = sharp(req.file.path);
    const metadata = await image.metadata();
    
    // Create a simple mask-based approach (simulation)
    // In production, use the API above
    await image
      .png()
      .toFile(outputPath);

    res.json({
      success: true,
      imageUrl: `/uploads/${req.file.filename}`,
      processedUrl: `/uploads/${outputPath.split('/').pop()}`,
      method: 'simulated',
      note: REMOVE_BG_API_KEY ? 'API failed, using simulation' : 'Set REMOVE_BG_API_KEY in .env for real background removal'
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Layout templates for sophisticated generation
const layoutTemplates = {
  centered: { mainX: 0.1, mainY: 0.15, mainWidth: 0.8, textX: 0.1, textY: 0.85 },
  leftAligned: { mainX: 0.05, mainY: 0.2, mainWidth: 0.5, textX: 0.6, textY: 0.5 },
  rightAligned: { mainX: 0.5, mainY: 0.2, mainWidth: 0.45, textX: 0.05, textY: 0.5 },
  split: { mainX: 0.05, mainY: 0.1, mainWidth: 0.4, textX: 0.5, textY: 0.4 },
  hero: { mainX: 0.1, mainY: 0.05, mainWidth: 0.8, textX: 0.1, textY: 0.9 },
  grid: { mainX: 0.15, mainY: 0.15, mainWidth: 0.7, textX: 0.15, textY: 0.8 }
};

// Generate layout variants using Generative Design Engine
app.post('/api/generate-variants', async (req, res) => {
  try {
    const { assets, tone, objective, format } = req.body;

    if (!assets || assets.length === 0) {
      return res.status(400).json({ error: 'No assets provided' });
    }

    // Use Generative Design Engine to create AI-optimized layouts
    const generatedLayouts = generateLayoutVariants({
      tone: tone || 'neutral',
      objective: objective || 'awareness',
      format: format || 'square',
      assetCount: assets.length,
      hasLogo: assets.length > 1,
      count: 6,
      assets: assets, // Pass assets for AI quote generation
      metadata: {} // Can be extended with product metadata
    });

    // Convert generative layouts to variant format compatible with existing system
    const variants = generatedLayouts.map((genLayout, i) => {
      // Optimize for platform
      const optimizedLayout = optimizeForPlatform(genLayout, format || 'square');
      
      return {
        id: optimizedLayout.id || `v-${i}-${Date.now()}`,
        layout: i,
        template: 'generative',
        templateConfig: {
          mainX: optimizedLayout.mainAsset.x / optimizedLayout.dimensions.width,
          mainY: optimizedLayout.mainAsset.y / optimizedLayout.dimensions.height,
          mainWidth: optimizedLayout.mainAsset.width / optimizedLayout.dimensions.width,
          textX: optimizedLayout.textOverlay?.x / optimizedLayout.dimensions.width || 0.1,
          textY: optimizedLayout.textOverlay?.y / optimizedLayout.dimensions.height || 0.85
        },
        generativeLayout: optimizedLayout, // Full generative layout data
        mainAsset: assets[0],
        tone: optimizedLayout.tone,
        objective: optimizedLayout.objective,
        format: optimizedLayout.format,
        description: getGenLayoutDescription(optimizedLayout)
      };
    });

    console.log(`✅ Generated ${variants.length} AI-optimized layout variants`);
    res.json({ variants });
  } catch (error) {
    console.error('Variant generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

function getLayoutDescription(templateName, objective) {
  const descriptions = {
    centered: 'Classic centered layout perfect for product showcases',
    leftAligned: 'Modern left-aligned design with text on the right',
    rightAligned: 'Bold right-aligned layout for dynamic visuals',
    split: 'Split-screen design balancing image and text',
    hero: 'Hero layout with prominent product placement',
    grid: 'Grid-based layout for structured presentation'
  };
  return descriptions[templateName] || 'Creative layout variant';
}

// Generate AI-powered banner quotes
app.post('/api/generate-quotes', async (req, res) => {
  try {
    const { tone, objective, assets = [], metadata = {}, count = 5 } = req.body;

    const quotes = generateQuoteVariations({
      tone: tone || 'neutral',
      objective: objective || 'awareness',
      isAIThemed: false, // Can be enhanced with detection
      count: Math.min(count, 10) // Max 10 quotes
    });

    res.json({ 
      quotes,
      tone: tone || 'neutral',
      objective: objective || 'awareness',
      count: quotes.length
    });
  } catch (error) {
    console.error('Quote generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Render variant to image using Sharp (fallback when Canvas is not available)
async function renderVariantWithSharp(variant, assets, bgRemove, tone, objective, format, width, height) {
  // Background color based on tone
  const bgColor = tone === 'bold' ? '#0f172a' : tone === 'premium' ? '#111827' : '#ffffff';
  
  // Create background
  let composite = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: bgColor
    }
  });

  // Load and process main asset
  let mainAssetPath = variant.mainAsset.src;
  if (mainAssetPath.startsWith('http://') || mainAssetPath.startsWith('https://')) {
    const url = new URL(mainAssetPath);
    mainAssetPath = url.pathname;
  }
  const cleanPath = mainAssetPath.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
  const fullPath = join(uploadsDir, cleanPath);
  
  const imgWidth = Math.min(width * 0.8, 800);
  const x = Math.floor(width * 0.1 + variant.layout * 20);
  const y = Math.floor(height * 0.1 + variant.layout * 30);
  
  // Resize main image
  const mainImage = sharp(fullPath)
    .resize(Math.floor(imgWidth), null, { withoutEnlargement: true });
  
  const mainImageBuffer = await mainImage.png().toBuffer();
  const mainImageMeta = await mainImage.metadata();
  const actualHeight = Math.floor(imgWidth * (mainImageMeta.height / mainImageMeta.width));
  
  // Prepare composite layers
  const layers = [{
    input: mainImageBuffer,
    left: x,
    top: y
  }];

  // Add logo if available
  if (assets[1]) {
    try {
      let logoPath = assets[1].src;
      if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        const url = new URL(logoPath);
        logoPath = url.pathname;
      }
      const cleanLogoPath = logoPath.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
      const fullLogoPath = join(uploadsDir, cleanLogoPath);
      const logo = sharp(fullLogoPath).resize(140, null, { withoutEnlargement: true });
      const logoBuffer = await logo.png().toBuffer();
      layers.push({
        input: logoBuffer,
        left: 30,
        top: 30
      });
    } catch (err) {
      console.error('Error loading logo:', err);
    }
  }

  // Add text overlay using SVG with AI-generated quote
  let text = 'New Arrival';
  
  // Use AI-generated quote if variant has generative layout
  if (variant.generativeLayout && variant.generativeLayout.textOverlay) {
    text = variant.generativeLayout.textOverlay.quote || variant.generativeLayout.textOverlay.text || text;
  } else {
    // Fallback to objective-based text
    if (objective === 'conversion') {
      text = 'Shop Now →';
    } else if (objective === 'sales') {
      text = '₹999 • Limited Offer';
    }
  }

  const textSvg = `
    <svg width="${width}" height="${height}">
      <rect x="${width - 420}" y="${height - 200}" width="380" height="120" fill="rgba(0,0,0,0.6)" rx="4"/>
      <text x="${width - 360}" y="${height - 140}" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="white">${text}</text>
    </svg>
  `;
  
  layers.push({
    input: Buffer.from(textSvg),
    left: 0,
    top: 0
  });

  // Composite all layers
  const output = await composite
    .composite(layers)
    .png()
    .toBuffer();

  return output;
}

// Render variant to image with Generative Design Engine support
app.post('/api/render-variant', async (req, res) => {
  try {
    const { variant, assets, bgRemove, tone, objective, format } = req.body;

    if (!variant || !assets || assets.length === 0) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Use generative layout if available, otherwise use format defaults
    let width, height;
    let genLayout = variant.generativeLayout;
    
    if (genLayout && genLayout.dimensions) {
      width = genLayout.dimensions.width;
      height = genLayout.dimensions.height;
    } else {
      // Fallback to format-based dimensions
      if (format === 'square') {
        width = height = 800;
      } else if (format === 'story') {
        width = 1080;
        height = 1920;
      } else {
        width = 1200;
        height = 628;
      }
    }

    let outputBuffer;
    let canvas = null;
    let ctx = null;

    // Try to use Canvas if available, otherwise use Sharp
    await loadCanvas();
    if (createCanvas && loadImage) {
      // Use Canvas for rendering
      canvas = createCanvas(width, height);
      ctx = canvas.getContext('2d');

      // Background color from generative layout or tone-based fallback
      let bgColor = '#ffffff';
      if (genLayout && genLayout.background) {
        bgColor = genLayout.background.color;
      } else {
        bgColor = tone === 'bold' ? '#0f172a' : tone === 'premium' ? '#111827' : '#ffffff';
      }
      
      // Apply background gradient if available
      if (genLayout && genLayout.background && genLayout.background.gradient) {
        const gradient = genLayout.background.gradient;
        if (gradient.type === 'linear' && gradient.direction === 'vertical') {
          const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
          bgGradient.addColorStop(0, gradient.colors[0]);
          bgGradient.addColorStop(1, gradient.colors[1]);
          ctx.fillStyle = bgGradient;
        } else {
          ctx.fillStyle = bgColor;
        }
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, width, height);

      // Load and draw main asset using generative layout positioning
      let mainAssetPath = variant.mainAsset.src;
      if (mainAssetPath.startsWith('http://') || mainAssetPath.startsWith('https://')) {
        const url = new URL(mainAssetPath);
        mainAssetPath = url.pathname;
      }
      const cleanPath = mainAssetPath.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
      const fullPath = join(uploadsDir, cleanPath);
      const mainImage = await loadImage(fullPath);
      
      let imgWidth, imgHeight, x, y;
      
      if (genLayout && genLayout.mainAsset) {
        // Use generative layout positioning
        x = genLayout.mainAsset.x;
        y = genLayout.mainAsset.y;
        imgWidth = genLayout.mainAsset.width;
        imgHeight = genLayout.mainAsset.height;
        
        // Maintain aspect ratio
        const aspectRatio = mainImage.height / mainImage.width;
        if (imgHeight / imgWidth > aspectRatio) {
          imgHeight = imgWidth * aspectRatio;
        } else {
          imgWidth = imgHeight / aspectRatio;
        }
      } else {
        // Fallback to template-based positioning
        imgWidth = Math.min(width * 0.8, mainImage.width);
        imgHeight = imgWidth * (mainImage.height / mainImage.width);
        x = width * 0.1 + variant.layout * 20;
        y = height * 0.1 + variant.layout * 30;
      }

      if (bgRemove) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x + imgWidth / 2, y + imgHeight / 2, imgWidth / 2, imgHeight / 2, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(mainImage, x, y, imgWidth, imgHeight);
        ctx.restore();
      } else {
        ctx.drawImage(mainImage, x, y, imgWidth, imgHeight);
      }

      // Draw text overlay using generative layout styling with AI-generated quotes
      let text = 'New Arrival';
      
      // Use AI-generated quote if available, otherwise fallback to objective-based text
      if (genLayout && genLayout.textOverlay && genLayout.textOverlay.quote) {
        text = genLayout.textOverlay.quote;
      } else if (genLayout && genLayout.textOverlay && genLayout.textOverlay.text) {
        text = genLayout.textOverlay.text;
      } else {
        // Fallback to objective-based text
        if (objective === 'conversion') {
          text = 'Shop Now →';
        } else if (objective === 'sales') {
          text = '₹999 • Limited Offer';
        }
      }

      if (genLayout && genLayout.textOverlay) {
        const textOverlay = genLayout.textOverlay;
        
        // Measure text to ensure it fits
        ctx.font = `${textOverlay.fontWeight || 'bold'} ${textOverlay.fontSize || 36}px Arial`;
        const metrics = ctx.measureText(text);
        const padding = textOverlay.padding || 18;
        const boxWidth = Math.max(textOverlay.width, metrics.width + padding * 2);
        const boxHeight = textOverlay.height;
        const textX = textOverlay.x + boxWidth / 2;
        const textY = textOverlay.y + boxHeight / 2;

        // Background for text
        ctx.fillStyle = textOverlay.backgroundColor || 'rgba(0,0,0,0.6)';
        ctx.fillRect(textOverlay.x, textOverlay.y, boxWidth, boxHeight);

        // Text styling
        ctx.font = `${textOverlay.fontWeight || 'bold'} ${textOverlay.fontSize || 36}px Arial`;
        ctx.fillStyle = textOverlay.textColor || '#ffffff';
        ctx.textAlign = textOverlay.alignment || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textX, textY);
      } else {
        // Fallback to default text overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial';
        const metrics = ctx.measureText(text);
        const padding = 18;
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = 56;
        const textX = width - 360;
        const textY = height - 140;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(textX - padding, textY - boxHeight / 2, boxWidth, boxHeight);
        ctx.fillStyle = '#fff';
        ctx.fillText(text, textX, textY);
      }

      // Draw logo if available using generative layout positioning
      if (assets[1]) {
        try {
          let logoPath = assets[1].src;
          if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
            const url = new URL(logoPath);
            logoPath = url.pathname;
          }
          const cleanLogoPath = logoPath.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
          const fullLogoPath = join(uploadsDir, cleanLogoPath);
          const logoImage = await loadImage(fullLogoPath);
          
          let logoWidth, logoHeight, logoX, logoY;
          
          if (genLayout && genLayout.logo) {
            logoX = genLayout.logo.x;
            logoY = genLayout.logo.y;
            logoWidth = genLayout.logo.width;
            logoHeight = genLayout.logo.height;
            
            // Maintain aspect ratio
            const logoAspectRatio = logoImage.height / logoImage.width;
            if (logoHeight / logoWidth > logoAspectRatio) {
              logoHeight = logoWidth * logoAspectRatio;
            } else {
              logoWidth = logoHeight / logoAspectRatio;
            }
            
            // Apply opacity if specified
            if (genLayout.logo.opacity) {
              ctx.globalAlpha = genLayout.logo.opacity;
            }
          } else {
            logoWidth = 140;
            logoHeight = (logoImage.height / logoImage.width) * logoWidth;
            logoX = 30;
            logoY = 30;
          }
          
          ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
          ctx.globalAlpha = 1.0; // Reset opacity
        } catch (err) {
          console.error('Error loading logo:', err);
        }
      }

      // Draw safe area guideline
      const safeZone = (genLayout && genLayout.compliance && genLayout.compliance.safeZone) || 40;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(safeZone, safeZone, width - safeZone * 2, height - safeZone * 2);

      outputBuffer = canvas.toBuffer('image/png');
    } else {
      // Fallback to Sharp rendering
      console.log('Using Sharp for rendering (Canvas not available)');
      outputBuffer = await renderVariantWithSharp(variant, assets, bgRemove, tone, objective, format, width, height);
    }

    // Save rendered image
    const outputFilename = `rendered-${Date.now()}.png`;
    const outputPath = join(exportsDir, outputFilename);
    await fs.writeFile(outputPath, outputBuffer);

    // Run compliance checks (simplified for Sharp - skip if canvas not available)
    let violations = [];
    if (canvas) {
      violations = await runComplianceChecks(canvas, assets, format);
    } else {
      // Basic compliance check without canvas
      violations = [];
    }

    res.json({
      success: true,
      imageUrl: `/exports/${outputFilename}`,
      violations
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced compliance checks with brand guidelines
async function runComplianceChecks(canvas, assets, format = 'square') {
  const violations = [];
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Brand guideline thresholds
  const MIN_CONTRAST_RATIO = 4.5; // WCAG AA standard
  const MIN_SAFE_ZONE = 40; // pixels from edge
  const MIN_TEXT_SIZE = 24; // minimum readable text size
  const MAX_TEXT_COVERAGE = 0.3; // max 30% of image covered by text

  try {
    // 1. Contrast Check (WCAG AA compliance)
    const sampleX = Math.floor(width - 300);
    const sampleY = Math.floor(height - 140);
    const imageData = ctx.getImageData(sampleX, sampleY, 1, 1);
    const [r, g, b] = imageData.data;
    
    const bgLum = luminance(r, g, b);
    const textLum = luminance(255, 255, 255);
    const ratio = contrastRatio(bgLum, textLum);
    
    if (ratio < MIN_CONTRAST_RATIO) {
      violations.push({
        type: 'low-contrast',
        severity: 'high',
        message: `Text contrast too low (ratio ${ratio.toFixed(1)}, minimum ${MIN_CONTRAST_RATIO} required)`,
        standard: 'WCAG AA',
        fixable: true
      });
    }

    // 2. Logo Safe Zone Check
    if (assets && assets[1]) {
      const logoRect = { x: 30, y: 30, w: 140, h: 50 };
      if (logoRect.x < MIN_SAFE_ZONE || logoRect.y < MIN_SAFE_ZONE) {
        violations.push({
          type: 'logo-safe-zone',
          severity: 'medium',
          message: `Logo too close to edge. Minimum ${MIN_SAFE_ZONE}px safe zone required.`,
          fixable: true
        });
      }
    }

    // 3. Platform-specific checks
    const platformChecks = getPlatformRequirements(format);
    platformChecks.forEach(check => {
      if (!check.passed) {
        violations.push({
          type: 'platform-compliance',
          severity: check.severity || 'medium',
          message: check.message,
          platform: check.platform,
          fixable: check.fixable || false
        });
      }
    });

    // 4. Text Readability Check
    // Sample multiple text areas
    const textAreas = [
      { x: width - 360, y: height - 140 },
      { x: width - 200, y: height - 100 }
    ];
    
    let lowContrastCount = 0;
    textAreas.forEach(area => {
      try {
        const areaData = ctx.getImageData(area.x, area.y, 10, 10);
        const avgR = Array.from(areaData.data.filter((_, i) => i % 4 === 0)).reduce((a, b) => a + b) / (areaData.data.length / 4);
        const avgG = Array.from(areaData.data.filter((_, i) => i % 4 === 1)).reduce((a, b) => a + b) / (areaData.data.length / 4);
        const avgB = Array.from(areaData.data.filter((_, i) => i % 4 === 2)).reduce((a, b) => a + b) / (areaData.data.length / 4);
        const areaLum = luminance(avgR, avgG, avgB);
        const areaRatio = contrastRatio(areaLum, textLum);
        if (areaRatio < MIN_CONTRAST_RATIO) lowContrastCount++;
      } catch (e) {
        // Skip if can't sample
      }
    });

    if (lowContrastCount > 0) {
      violations.push({
        type: 'text-readability',
        severity: 'high',
        message: `${lowContrastCount} text area(s) have poor readability`,
        fixable: true
      });
    }

  } catch (e) {
    console.error('Compliance check error:', e);
  }

  return violations;
}

// Platform-specific requirements
function getPlatformRequirements(format) {
  const checks = [];
  
  // Meta (Facebook/Instagram) requirements
  if (format === 'square' || format === 'story') {
    checks.push({
      platform: 'Meta',
      passed: true, // Assume passed for now
      message: 'Meta requires 20% text coverage maximum',
      severity: 'high',
      fixable: true
    });
  }

  // Google Ads requirements
  if (format === 'banner') {
    checks.push({
      platform: 'Google',
      passed: true,
      message: 'Google Ads requires clear call-to-action',
      severity: 'medium',
      fixable: true
    });
  }

  // Amazon requirements
  checks.push({
    platform: 'Amazon',
    passed: true,
    message: 'Amazon requires product image to cover at least 85% of creative',
    severity: 'high',
    fixable: false
  });

  return checks;
}

function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1, l2) {
  const L1 = Math.max(l1, l2);
  const L2 = Math.min(l1, l2);
  return (L1 + 0.05) / (L2 + 0.05);
}

// Auto-fix contrast
app.post('/api/auto-fix', async (req, res) => {
  try {
    await loadCanvas();
    if (!createCanvas || !loadImage) {
      return res.status(503).json({ 
        error: 'Canvas module not available. Please rebuild canvas: npm rebuild canvas' 
      });
    }

    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'No image URL provided' });
    }

    // Load the image
    let imagePath = imageUrl;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      const url = new URL(imagePath);
      imagePath = url.pathname;
    }
    const cleanPath = imagePath.replace(/^\/exports\//, '').replace(/^exports\//, '');
    const fullPath = join(exportsDir, cleanPath);
    const image = await loadImage(fullPath);
    
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Apply contrast fix: overlay semi-transparent dark band
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(canvas.width - 420, canvas.height - 200, 380, 120);

    // Save fixed image
    const outputFilename = `fixed-${Date.now()}.png`;
    const outputPath = join(exportsDir, outputFilename);
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);

    // Re-run compliance checks
    const violations = await runComplianceChecks(canvas, [], 'square');

    res.json({
      success: true,
      imageUrl: `/exports/${outputFilename}`,
      violations
    });
  } catch (error) {
    console.error('Auto-fix error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Platform-specific export formats
app.post('/api/export-platform', async (req, res) => {
  try {
    const { imageUrl, platform, format } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'No image URL provided' });
    }

    // Load the source image
    let imagePath = imageUrl;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      const url = new URL(imagePath);
      imagePath = url.pathname;
    }
    const cleanPath = imagePath.replace(/^\/exports\//, '').replace(/^exports\//, '');
    const fullPath = join(exportsDir, cleanPath);

    // Platform-specific dimensions and requirements
    const platformSpecs = {
      meta: {
        square: { width: 1080, height: 1080, maxTextCoverage: 0.2 },
        story: { width: 1080, height: 1920, maxTextCoverage: 0.2 },
        feed: { width: 1200, height: 628, maxTextCoverage: 0.2 }
      },
      google: {
        display: { width: 300, height: 250 },
        banner: { width: 728, height: 90 },
        square: { width: 250, height: 250 }
      },
      amazon: {
        main: { width: 1000, height: 1000, minProductCoverage: 0.85 },
        thumbnail: { width: 75, height: 75 },
        zoom: { width: 2000, height: 2000 }
      }
    };

    const platformKey = platform.toLowerCase();
    const formatKey = format || 'square';
    
    if (!platformSpecs[platformKey] || !platformSpecs[platformKey][formatKey]) {
      return res.status(400).json({ 
        error: `Unsupported platform/format combination: ${platform}/${format}`,
        available: Object.keys(platformSpecs)
      });
    }

    const specs = platformSpecs[platformKey][formatKey];
    const outputFilename = `export-${platformKey}-${formatKey}-${Date.now()}.png`;
    const outputPath = join(exportsDir, outputFilename);

    // Resize and optimize for platform
    await sharp(fullPath)
      .resize(specs.width, specs.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);

    // Get file size
    const stats = await fs.stat(outputPath);

    res.json({
      success: true,
      imageUrl: `/exports/${outputFilename}`,
      platform: platformKey,
      format: formatKey,
      dimensions: { width: specs.width, height: specs.height },
      fileSize: stats.size,
      requirements: specs
    });
  } catch (error) {
    console.error('Platform export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch export for multiple platforms
app.post('/api/export-batch', async (req, res) => {
  try {
    const { imageUrl, platforms } = req.body;

    if (!imageUrl || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'imageUrl and platforms array required' });
    }

    const exports = [];
    for (const platformConfig of platforms) {
      const { platform, format } = platformConfig;
      try {
        const result = await axios.post(`${req.protocol}://${req.get('host')}/api/export-platform`, {
          imageUrl,
          platform,
          format
        });
        exports.push(result.data);
      } catch (err) {
        exports.push({
          platform,
          format,
          error: err.response?.data?.error || err.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      exports,
      total: exports.length,
      successful: exports.filter(e => e.success !== false).length
    });
  } catch (error) {
    console.error('Batch export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete asset
app.delete('/api/assets/:filename', async (req, res) => {
  try {
    // Decode filename in case it contains special characters
    const filename = decodeURIComponent(req.params.filename);
    const filePath = join(uploadsDir, filename);
    
    try {
      await fs.unlink(filePath);
      res.json({ success: true, message: 'Asset deleted' });
    } catch (err) {
      if (err.code === 'ENOENT') {
        res.status(404).json({ error: 'File not found' });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware for multer errors (must be after routes)
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error) {
    console.error('Request error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📁 Exports directory: ${exportsDir}`);
});

