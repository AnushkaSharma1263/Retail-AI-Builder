/**
 * Generative Design Engine
 * AI-powered dynamic layout generation that adapts intelligently to:
 * - Brand tone (neutral, bold, playful, premium)
 * - Marketing objectives (awareness, conversion, sales)
 * - Platform formats (square, story, banner, etc.)
 */

import {
  generateContextualQuote,
  enhanceQuote
} from './aiQuoteGenerator.js';

// Design principles and rules
const DESIGN_PRINCIPLES = {
  goldenRatio: 1.618,
  ruleOfThirds: {
    horizontal: [0.33, 0.66],
    vertical: [0.33, 0.66]
  },
  visualHierarchy: {
    primary: { size: 1.0, weight: 'bold' },
    secondary: { size: 0.7, weight: 'medium' },
    tertiary: { size: 0.5, weight: 'normal' }
  }
};

// Tone-based design parameters
const TONE_PARAMETERS = {
  neutral: {
    colors: {
      background: ['#ffffff', '#f8f9fa', '#e9ecef'],
      accent: ['#6c757d', '#495057', '#343a40'],
      text: ['#212529', '#495057']
    },
    spacing: { tight: 0.05, normal: 0.1, loose: 0.15 },
    typography: { weight: 'normal', style: 'clean' },
    composition: { balance: 0.5, dynamism: 0.3 }
  },
  bold: {
    colors: {
      background: ['#0f172a', '#1e293b', '#334155'],
      accent: ['#f59e0b', '#ef4444', '#8b5cf6'],
      text: ['#ffffff', '#f1f5f9']
    },
    spacing: { tight: 0.02, normal: 0.08, loose: 0.12 },
    typography: { weight: 'bold', style: 'impact' },
    composition: { balance: 0.4, dynamism: 0.8 }
  },
  playful: {
    colors: {
      background: ['#fef3c7', '#fde68a', '#fcd34d'],
      accent: ['#ec4899', '#8b5cf6', '#06b6d4'],
      text: ['#1f2937', '#374151']
    },
    spacing: { tight: 0.08, normal: 0.12, loose: 0.18 },
    typography: { weight: 'medium', style: 'rounded' },
    composition: { balance: 0.6, dynamism: 0.7 }
  },
  premium: {
    colors: {
      background: ['#111827', '#1f2937', '#374151'],
      accent: ['#d4af37', '#fbbf24', '#f59e0b'],
      text: ['#ffffff', '#f3f4f6']
    },
    spacing: { tight: 0.06, normal: 0.1, loose: 0.14 },
    typography: { weight: 'medium', style: 'elegant' },
    composition: { balance: 0.5, dynamism: 0.4 }
  }
};

// Objective-based layout strategies
const OBJECTIVE_STRATEGIES = {
  awareness: {
    focus: 'visual-impact',
    imageSize: 0.75,
    textSize: 0.25,
    ctaStyle: 'subtle',
    composition: 'centered',
    visualWeight: { image: 0.8, text: 0.2 }
  },
  conversion: {
    focus: 'call-to-action',
    imageSize: 0.6,
    textSize: 0.4,
    ctaStyle: 'prominent',
    composition: 'balanced',
    visualWeight: { image: 0.6, text: 0.4 }
  },
  sales: {
    focus: 'product-prominence',
    imageSize: 0.7,
    textSize: 0.3,
    ctaStyle: 'urgent',
    composition: 'product-focused',
    visualWeight: { image: 0.75, text: 0.25 }
  }
};

// Platform-specific optimizations
const PLATFORM_OPTIMIZATIONS = {
  square: {
    dimensions: { width: 1080, height: 1080 },
    safeZone: 40,
    textMaxCoverage: 0.2,
    compositionRules: ['center-focused', 'symmetrical'],
    optimalImageRatio: 1.0
  },
  story: {
    dimensions: { width: 1080, height: 1920 },
    safeZone: 60,
    textMaxCoverage: 0.15,
    compositionRules: ['vertical-flow', 'top-heavy'],
    optimalImageRatio: 0.5625
  },
  banner: {
    dimensions: { width: 1200, height: 628 },
    safeZone: 30,
    textMaxCoverage: 0.25,
    compositionRules: ['horizontal-flow', 'left-to-right'],
    optimalImageRatio: 1.91
  }
};

/**
 * Generate a dynamic, AI-optimized layout configuration
 */
export function generateLayout({
  tone = 'neutral',
  objective = 'awareness',
  format = 'square',
  assetCount = 1,
  hasLogo = false,
  assets = [],
  metadata = {},
  variation = 0
}) {
  const toneParams = TONE_PARAMETERS[tone] || TONE_PARAMETERS.neutral;
  const objectiveStrategy = OBJECTIVE_STRATEGIES[objective] || OBJECTIVE_STRATEGIES.awareness;
  const platformOpts = PLATFORM_OPTIMIZATIONS[format] || PLATFORM_OPTIMIZATIONS.square;
  
  const { width, height } = platformOpts.dimensions;
  const dynamism = toneParams.composition.dynamism;
  const balance = toneParams.composition.balance;
  
  // Generate intelligent positioning using design principles
  const layout = {
    id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    format,
    tone,
    objective,
    dimensions: { width, height },
    
    // Main asset positioning (AI-optimized)
    mainAsset: generateMainAssetPosition({
      width,
      height,
      objectiveStrategy,
      platformOpts,
      dynamism,
      balance
    }),
    
    // Logo positioning
    logo: hasLogo ? generateLogoPosition({
      width,
      height,
      toneParams,
      platformOpts
    }) : null,
    
    // Text overlay positioning with AI-generated quote
    textOverlay: generateTextOverlay({
      width,
      height,
      objectiveStrategy,
      toneParams,
      platformOpts,
      tone,
      objective,
      assets,
      metadata,
      variation
    }),
    
    // Background configuration
    background: generateBackgroundConfig({
      toneParams,
      objectiveStrategy,
      format
    }),
    
    // Visual effects
    effects: generateVisualEffects({
      tone,
      objective,
      format
    }),
    
    // Compliance metadata
    compliance: {
      safeZone: platformOpts.safeZone,
      textCoverage: calculateTextCoverage(objectiveStrategy),
      contrastLevel: 'high'
    }
  };
  
  return layout;
}

/**
 * Generate intelligent main asset positioning
 */
function generateMainAssetPosition({ width, height, objectiveStrategy, platformOpts, dynamism, balance }) {
  const imageSize = objectiveStrategy.imageSize;
  const composition = objectiveStrategy.composition;
  
  let x, y, assetWidth, assetHeight;
  
  // Apply composition strategy
  switch (composition) {
    case 'centered':
      assetWidth = width * imageSize;
      assetHeight = height * imageSize;
      x = (width - assetWidth) / 2;
      y = (height - assetHeight) / 2;
      break;
      
    case 'balanced':
      // Use golden ratio for balanced composition
      const goldenX = width / DESIGN_PRINCIPLES.goldenRatio;
      assetWidth = width * imageSize;
      assetHeight = height * imageSize;
      x = goldenX - assetWidth / 2;
      y = height * 0.2;
      break;
      
    case 'product-focused':
      // Rule of thirds positioning
      const thirdX = width * DESIGN_PRINCIPLES.ruleOfThirds.horizontal[0];
      const thirdY = height * DESIGN_PRINCIPLES.ruleOfThirds.vertical[0];
      assetWidth = width * imageSize;
      assetHeight = height * imageSize;
      x = thirdX;
      y = thirdY;
      break;
      
    default:
      // Dynamic positioning based on dynamism factor
      const offsetX = (Math.random() - 0.5) * dynamism * width * 0.3;
      const offsetY = (Math.random() - 0.5) * dynamism * height * 0.3;
      assetWidth = width * imageSize;
      assetHeight = height * imageSize;
      x = (width - assetWidth) / 2 + offsetX;
      y = (height - assetHeight) / 2 + offsetY;
  }
  
  // Ensure within safe zone
  x = Math.max(platformOpts.safeZone, Math.min(x, width - assetWidth - platformOpts.safeZone));
  y = Math.max(platformOpts.safeZone, Math.min(y, height - assetHeight - platformOpts.safeZone));
  
  return {
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.floor(assetWidth),
    height: Math.floor(assetHeight),
    anchor: 'center',
    scale: 1.0
  };
}

/**
 * Generate logo positioning optimized for brand visibility
 */
function generateLogoPosition({ width, height, toneParams, platformOpts }) {
  const safeZone = platformOpts.safeZone;
  const spacing = toneParams.spacing.normal;
  
  // Logo typically goes top-left or top-right
  const positions = [
    { x: safeZone, y: safeZone, anchor: 'top-left' },
    { x: width - 140 - safeZone, y: safeZone, anchor: 'top-right' }
  ];
  
  // Select position based on composition balance
  const position = positions[Math.floor(Math.random() * positions.length)];
  
  return {
    x: position.x,
    y: position.y,
    width: 140,
    height: 50,
    anchor: position.anchor,
    opacity: 0.95
  };
}

/**
 * Generate text overlay with intelligent positioning and AI-generated quotes
 */
function generateTextOverlay({ width, height, objectiveStrategy, toneParams, platformOpts, tone, objective, assets, metadata, variation }) {
  const textSize = objectiveStrategy.textSize;
  const ctaStyle = objectiveStrategy.ctaStyle;
  
  // Generate AI-powered creative quote
  let quote = generateContextualQuote({
    tone,
    objective,
    assets: assets || [],
    metadata: metadata || {},
    variation
  });
  
  // Enhance quote with emojis/formatting based on tone
  quote = enhanceQuote(quote, tone);
  
  // Determine text position based on objective
  let textX, textY, textWidth, textHeight;
  
  if (objectiveStrategy.composition === 'centered') {
    textX = width * 0.1;
    textY = height * 0.85;
    textWidth = width * 0.8;
    textHeight = height * 0.1;
  } else if (objectiveStrategy.composition === 'balanced') {
    textX = width * 0.55;
    textY = height * 0.5;
    textWidth = width * 0.4;
    textHeight = height * 0.2;
  } else {
    // Dynamic positioning
    textX = width * 0.1;
    textY = height * (0.7 + Math.random() * 0.2);
    textWidth = width * 0.8;
    textHeight = height * 0.15;
  }
  
  // Style based on CTA style
  const styles = {
    subtle: {
      fontSize: 28,
      fontWeight: 'medium',
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: 16
    },
    prominent: {
      fontSize: 36,
      fontWeight: 'bold',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 20
    },
    urgent: {
      fontSize: 32,
      fontWeight: 'bold',
      backgroundColor: 'rgba(239,68,68,0.9)',
      padding: 18
    }
  };
  
  const style = styles[ctaStyle] || styles.prominent;
  
  return {
    x: Math.floor(textX),
    y: Math.floor(textY),
    width: Math.floor(textWidth),
    height: Math.floor(textHeight),
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    backgroundColor: style.backgroundColor,
    padding: style.padding,
    textColor: toneParams.colors.text[0],
    alignment: 'center',
    quote: quote, // Include the generated quote
    text: quote // For backward compatibility
  };
}

/**
 * Generate background configuration
 */
function generateBackgroundConfig({ toneParams, objectiveStrategy, format }) {
  const colors = toneParams.colors.background;
  
  // Select background color based on objective
  let bgColor;
  if (objectiveStrategy.focus === 'visual-impact') {
    bgColor = colors[0]; // Lightest for awareness
  } else if (objectiveStrategy.focus === 'call-to-action') {
    bgColor = colors[1]; // Medium for conversion
  } else {
    bgColor = colors[2]; // Darker for sales
  }
  
  return {
    color: bgColor,
    gradient: generateGradient(toneParams, format),
    pattern: null
  };
}

/**
 * Generate gradient based on tone
 */
function generateGradient(toneParams, format) {
  if (format === 'story') {
    // Vertical gradient for stories
    return {
      type: 'linear',
      direction: 'vertical',
      colors: [toneParams.colors.background[0], toneParams.colors.background[1]],
      opacity: 0.3
    };
  }
  return null;
}

/**
 * Generate visual effects based on tone and objective
 */
function generateVisualEffects({ tone, objective, format }) {
  const effects = {
    shadows: tone === 'premium' || tone === 'bold',
    borders: tone === 'playful',
    overlays: objective === 'conversion',
    blur: false
  };
  
  return effects;
}

/**
 * Calculate text coverage percentage
 */
function calculateTextCoverage(objectiveStrategy) {
  return objectiveStrategy.textSize;
}

/**
 * Generate multiple layout variants with diversity
 */
export function generateLayoutVariants({
  tone = 'neutral',
  objective = 'awareness',
  format = 'square',
  assetCount = 1,
  hasLogo = false,
  count = 6,
  assets = [],
  metadata = {}
}) {
  const variants = [];
  
  for (let i = 0; i < count; i++) {
    // Introduce variation in parameters
    const variation = {
      tone,
      objective,
      format,
      assetCount,
      hasLogo,
      assets,
      metadata,
      variation: i / count // Pass variation for quote diversity
    };
    
    const layout = generateLayout(variation);
    
    // Add diversity to layouts
    if (i > 0) {
      layout.mainAsset.x += (Math.random() - 0.5) * 50;
      layout.mainAsset.y += (Math.random() - 0.5) * 50;
    }
    
    variants.push(layout);
  }
  
  return variants;
}

/**
 * Optimize layout for specific platform requirements
 */
export function optimizeForPlatform(layout, platform) {
  const platformRules = PLATFORM_OPTIMIZATIONS[platform] || PLATFORM_OPTIMIZATIONS.square;
  
  // Adjust layout to meet platform requirements
  if (layout.textOverlay) {
    const textCoverage = (layout.textOverlay.width * layout.textOverlay.height) / 
                        (layout.dimensions.width * layout.dimensions.height);
    
    if (textCoverage > platformRules.textMaxCoverage) {
      // Reduce text size to meet requirements
      const scale = platformRules.textMaxCoverage / textCoverage;
      layout.textOverlay.width *= scale;
      layout.textOverlay.height *= scale;
    }
  }
  
  // Ensure safe zones
  if (layout.mainAsset) {
    layout.mainAsset.x = Math.max(platformRules.safeZone, layout.mainAsset.x);
    layout.mainAsset.y = Math.max(platformRules.safeZone, layout.mainAsset.y);
  }
  
  return layout;
}

/**
 * Get layout description with AI-generated insights
 */
export function getLayoutDescription(layout) {
  const { tone, objective, format } = layout;
  
  const descriptions = {
    awareness: {
      neutral: 'Clean, balanced composition optimized for brand awareness and recognition',
      bold: 'High-impact design with strong visual presence for maximum awareness',
      playful: 'Engaging, vibrant layout designed to capture attention and build brand recall',
      premium: 'Sophisticated, elegant design that elevates brand perception'
    },
    conversion: {
      neutral: 'Conversion-focused layout with clear call-to-action and balanced visual hierarchy',
      bold: 'Dynamic design with prominent CTA optimized for click-through rates',
      playful: 'Engaging layout that guides users toward conversion with friendly, approachable design',
      premium: 'Refined design that builds trust and encourages premium conversions'
    },
    sales: {
      neutral: 'Product-focused layout highlighting key features and value proposition',
      bold: 'Urgent, action-oriented design optimized for immediate sales conversion',
      playful: 'Exciting, energetic layout that creates urgency and drives sales',
      premium: 'Luxury-focused design that emphasizes quality and exclusivity'
    }
  };
  
  return descriptions[objective]?.[tone] || 
         `AI-optimized ${tone} layout for ${objective} on ${format} format`;
}

