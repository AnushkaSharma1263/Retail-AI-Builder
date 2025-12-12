# Generative Design Engine

## Overview

The Generative Design Engine is an AI-powered system that produces dynamic, visually optimized layouts for each platform format. It intelligently adapts to brand tone and marketing objectives to create layouts that maximize visual impact and conversion potential.

## Key Features

### 🎨 AI-Powered Layout Generation
- **Dynamic Layout Creation**: Generates unique layouts using design principles (Golden Ratio, Rule of Thirds, Visual Hierarchy)
- **Intelligent Positioning**: Automatically calculates optimal positioning for assets, text, and logos
- **Visual Optimization**: Applies design best practices to create visually appealing compositions

### 🎯 Brand Tone Adaptation
The engine adapts layouts based on four brand tones:

1. **Neutral**
   - Clean, balanced compositions
   - Subtle color palettes
   - Professional typography
   - Moderate spacing

2. **Bold**
   - High-impact designs
   - Dark backgrounds with vibrant accents
   - Strong typography
   - Dynamic compositions

3. **Playful**
   - Engaging, vibrant layouts
   - Bright color schemes
   - Rounded typography
   - Energetic spacing

4. **Premium**
   - Sophisticated, elegant designs
   - Luxury color palettes (gold accents)
   - Refined typography
   - Balanced compositions

### 📊 Objective-Based Optimization
Layouts are optimized for three marketing objectives:

1. **Awareness**
   - Focus: Visual impact
   - Image size: 75% of canvas
   - Text size: 25% of canvas
   - Composition: Centered, image-focused
   - CTA style: Subtle

2. **Conversion**
   - Focus: Call-to-action
   - Image size: 60% of canvas
   - Text size: 40% of canvas
   - Composition: Balanced
   - CTA style: Prominent

3. **Sales**
   - Focus: Product prominence
   - Image size: 70% of canvas
   - Text size: 30% of canvas
   - Composition: Product-focused
   - CTA style: Urgent

### 📱 Platform-Specific Optimizations
The engine automatically adapts layouts for different platform formats:

#### Square (1080x1080)
- Center-focused compositions
- Symmetrical layouts
- 40px safe zone
- Maximum 20% text coverage

#### Story (1080x1920)
- Vertical flow compositions
- Top-heavy layouts
- 60px safe zone
- Maximum 15% text coverage
- Vertical gradients

#### Banner (1200x628)
- Horizontal flow compositions
- Left-to-right reading patterns
- 30px safe zone
- Maximum 25% text coverage

## How It Works

### Layout Generation Process

1. **Input Analysis**
   - Receives brand tone, objective, format, and asset information
   - Analyzes platform requirements and constraints

2. **Design Principle Application**
   - Applies Golden Ratio for balanced compositions
   - Uses Rule of Thirds for optimal positioning
   - Implements Visual Hierarchy principles

3. **Intelligent Positioning**
   - Calculates optimal main asset position based on objective
   - Determines logo placement for brand visibility
   - Positions text overlays for maximum readability

4. **Visual Styling**
   - Selects color palettes based on tone
   - Applies gradients for depth (especially in Story format)
   - Configures typography (size, weight, style)

5. **Platform Optimization**
   - Ensures compliance with platform requirements
   - Validates safe zones
   - Checks text coverage limits

6. **Variant Generation**
   - Creates multiple diverse layouts
   - Introduces controlled variation for selection
   - Maintains design consistency

## API Usage

### Generate Layout Variants

```javascript
POST /api/generate-variants
{
  "assets": [...],
  "tone": "bold",
  "objective": "conversion",
  "format": "square"
}
```

The engine generates 6 AI-optimized layout variants, each with:
- Unique positioning
- Tone-appropriate styling
- Objective-focused composition
- Platform-compliant dimensions

### Render Variant

```javascript
POST /api/render-variant
{
  "variant": {...}, // Includes generativeLayout data
  "assets": [...],
  "bgRemove": false,
  "tone": "bold",
  "objective": "conversion",
  "format": "square"
}
```

The renderer uses the generative layout data to create the final image with:
- Precise positioning from AI calculations
- Tone-based color schemes
- Objective-optimized text styling
- Platform-specific safe zones

## Design Principles

### Golden Ratio (1.618)
Used for balanced compositions where elements are positioned at golden ratio intervals.

### Rule of Thirds
Positions key elements at intersection points of a 3x3 grid for visual interest.

### Visual Hierarchy
- **Primary**: Main product/image (100% visual weight)
- **Secondary**: Supporting text/CTA (70% visual weight)
- **Tertiary**: Logo/branding (50% visual weight)

## Compliance & Quality

### Automatic Compliance Checks
- WCAG AA contrast ratios (4.5:1 minimum)
- Platform-specific text coverage limits
- Safe zone requirements
- Logo placement validation

### Visual Quality Metrics
- Balance score (0-1)
- Dynamism score (0-1)
- Composition harmony
- Visual flow

## Technical Implementation

### Core Module: `generativeDesignEngine.js`

Key functions:
- `generateLayout()` - Creates a single AI-optimized layout
- `generateLayoutVariants()` - Generates multiple diverse variants
- `optimizeForPlatform()` - Applies platform-specific optimizations
- `getLayoutDescription()` - Provides AI-generated layout descriptions

### Integration Points
- Backend API endpoints (`/api/generate-variants`, `/api/render-variant`)
- Frontend UI components (`AICreativeBuilder.jsx`)
- Rendering pipeline (Canvas/Sharp)

## Benefits

1. **Time Savings**: Automatically generates professional layouts
2. **Consistency**: Maintains brand guidelines across all layouts
3. **Optimization**: Adapts to platform requirements automatically
4. **Diversity**: Creates multiple unique variants for A/B testing
5. **Quality**: Applies design best practices consistently

## Future Enhancements

- Machine learning model integration for layout scoring
- User preference learning
- A/B test result integration
- Advanced color harmony algorithms
- Typography pairing suggestions
- Image analysis for optimal cropping



