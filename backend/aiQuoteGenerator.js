/**
 * AI Quote Generator
 * Generates creative, engaging banner quotes optimized for:
 * - Brand tone (neutral, bold, playful, premium)
 * - Marketing objectives (awareness, conversion, sales)
 * - Platform context
 */

// Quote templates organized by tone and objective
const QUOTE_TEMPLATES = {
  neutral: {
    awareness: [
      "Discover What's New",
      "Explore Our Collection",
      "Welcome to Innovation",
      "Experience the Difference",
      "Your Journey Starts Here",
      "Quality Meets Design",
      "Elevate Your Style",
      "Where Innovation Lives"
    ],
    conversion: [
      "Shop Now →",
      "Get Started Today",
      "Join Thousands of Happy Customers",
      "Start Your Journey",
      "Make It Yours",
      "Order Now & Save",
      "Try It Risk-Free",
      "Claim Your Offer →"
    ],
    sales: [
      "Limited Time Offer",
      "Special Price Today",
      "Save Up to 50%",
      "Best Deal of the Season",
      "Exclusive Discount Inside",
      "Don't Miss Out",
      "Limited Stock Available",
      "Today Only: Special Pricing"
    ]
  },
  bold: {
    awareness: [
      "BREAK THE MOLD",
      "DARE TO BE DIFFERENT",
      "REVOLUTIONARY DESIGN",
      "POWER UP YOUR LIFE",
      "UNLEASH YOUR POTENTIAL",
      "BOLD. BRAVE. BRILLIANT.",
      "CHANGE THE GAME",
      "FUTURE IS NOW"
    ],
    conversion: [
      "ACT NOW →",
      "JOIN THE REVOLUTION",
      "MAKE YOUR MOVE",
      "SEIZE THE MOMENT",
      "TAKE ACTION TODAY",
      "GET IT NOW →",
      "DON'T WAIT",
      "START YOUR TRANSFORMATION"
    ],
    sales: [
      "FLASH SALE: 50% OFF",
      "LIMITED TIME: ACT FAST",
      "MASSIVE SAVINGS NOW",
      "EXCLUSIVE DEAL INSIDE",
      "DON'T MISS THIS DEAL",
      "HUGE DISCOUNTS TODAY",
      "LAST CHANCE TO SAVE",
      "URGENT: LIMITED STOCK"
    ]
  },
  playful: {
    awareness: [
      "Let's Have Some Fun! 🎉",
      "Your Happy Place Awaits",
      "Life's Too Short, Shop Now!",
      "Spread the Joy ✨",
      "Good Vibes Only",
      "Make Every Day Special",
      "Because You Deserve It 💫",
      "Turn Heads, Make Smiles"
    ],
    conversion: [
      "Let's Do This! →",
      "Join the Fun Party",
      "Your Adventure Starts Here",
      "Hop On Board! 🚀",
      "Make It Happen Today",
      "Say Yes to Awesome",
      "Ready? Set. Shop!",
      "Let's Make Magic Together"
    ],
    sales: [
      "Surprise! Big Savings 🎁",
      "Treat Yourself Today",
      "Deal Alert! 🚨",
      "Save More, Smile More",
      "Your Lucky Day!",
      "Special Price Just for You",
      "Deals That Make You Smile",
      "Happy Shopping! 💰"
    ]
  },
  premium: {
    awareness: [
      "Crafted for Excellence",
      "Where Luxury Meets Innovation",
      "Elevate Your Experience",
      "Timeless Elegance",
      "Sophistication Redefined",
      "Premium Quality, Unmatched",
      "Excellence in Every Detail",
      "The Art of Refinement"
    ],
    conversion: [
      "Experience Excellence →",
      "Join an Exclusive Circle",
      "Indulge in Premium Quality",
      "Elevate Your Lifestyle",
      "Discover Luxury",
      "Unlock Premium Access",
      "Invest in Excellence",
      "Choose Refinement"
    ],
    sales: [
      "Exclusive Premium Offer",
      "Limited Edition Pricing",
      "VIP Discount Available",
      "Premium at Special Price",
      "Luxury Within Reach",
      "Exclusive Savings",
      "Premium Collection Sale",
      "Elegant Savings Await"
    ]
  }
};

// AI-themed quotes for tech/AI products
const AI_THEMED_QUOTES = {
  neutral: {
    awareness: [
      "Powered by AI Intelligence",
      "Where AI Meets Innovation",
      "Smart Solutions, Smarter Future",
      "AI-Driven Excellence",
      "Intelligence Redefined",
      "The Future is Intelligent",
      "AI That Understands You",
      "Next-Gen AI Technology"
    ],
    conversion: [
      "Experience AI Magic →",
      "Unlock AI Potential",
      "Start Your AI Journey",
      "Join the AI Revolution",
      "Discover AI Solutions",
      "Transform with AI →",
      "AI-Powered Results",
      "Smart. Fast. Intelligent."
    ],
    sales: [
      "AI Technology at Best Price",
      "Limited: AI Premium Access",
      "Special AI Bundle Offer",
      "AI Solutions on Sale",
      "Exclusive AI Pricing",
      "AI Tools: Special Deal",
      "Smart Savings on AI",
      "AI Innovation Discount"
    ]
  },
  bold: {
    awareness: [
      "AI REVOLUTION STARTS HERE",
      "POWERED BY ADVANCED AI",
      "INTELLIGENCE UNLEASHED",
      "AI THAT TRANSFORMS",
      "FUTURE-PROOF AI TECHNOLOGY",
      "BREAKTHROUGH AI INNOVATION",
      "AI-POWERED EXCELLENCE",
      "NEXT-LEVEL INTELLIGENCE"
    ],
    conversion: [
      "ACTIVATE AI NOW →",
      "UNLEASH AI POWER",
      "TRANSFORM WITH AI",
      "JOIN THE AI MOVEMENT",
      "REVOLUTIONIZE YOUR WORKFLOW",
      "AI THAT DELIVERS RESULTS",
      "UPGRADE TO AI →",
      "MASTER AI TECHNOLOGY"
    ],
    sales: [
      "AI PREMIUM: LIMITED OFFER",
      "MASSIVE AI SAVINGS NOW",
      "AI TOOLS: FLASH SALE",
      "EXCLUSIVE AI DISCOUNT",
      "AI BUNDLE: SPECIAL PRICE",
      "DON'T MISS AI DEAL",
      "AI ACCESS: TODAY ONLY",
      "URGENT: AI SALE ENDS SOON"
    ]
  },
  playful: {
    awareness: [
      "AI That Gets You! 🤖✨",
      "Smart & Fun AI Solutions",
      "AI Magic at Your Fingertips",
      "Where AI Meets Creativity",
      "Fun Meets Intelligence 🎨",
      "AI That Makes Life Easier",
      "Your AI Companion Awaits",
      "Smart Tech, Happy Life"
    ],
    conversion: [
      "Try AI Magic → 🚀",
      "Join the AI Fun!",
      "Let AI Do the Work",
      "AI That Makes You Smile",
      "Start Your AI Adventure",
      "Discover AI Wonders",
      "AI Made Simple & Fun",
      "Unlock AI Superpowers"
    ],
    sales: [
      "AI Deals That Wow! 🎁",
      "Special AI Savings",
      "AI Tools on Sale!",
      "Your AI Deal Awaits",
      "Smart Savings on AI",
      "AI Bundle: Special Price",
      "Limited AI Offer",
      "AI Magic at Best Price"
    ]
  },
  premium: {
    awareness: [
      "Enterprise-Grade AI Solutions",
      "Premium AI Intelligence",
      "Sophisticated AI Technology",
      "AI Crafted for Excellence",
      "Elite AI Performance",
      "Advanced AI Capabilities",
      "Premium AI Experience",
      "AI Excellence Redefined"
    ],
    conversion: [
      "Access Premium AI →",
      "Experience Elite AI",
      "Unlock Advanced AI",
      "Join Premium AI Circle",
      "Discover Enterprise AI",
      "Elevate with Premium AI",
      "Invest in AI Excellence",
      "Choose Premium AI"
    ],
    sales: [
      "Premium AI: Special Offer",
      "Exclusive AI Pricing",
      "VIP AI Access Discount",
      "Premium AI at Best Price",
      "Limited: Premium AI Deal",
      "Elite AI: Special Savings",
      "Premium AI Bundle Sale",
      "Exclusive AI Premium Deal"
    ]
  }
};

/**
 * Generate a creative banner quote based on tone, objective, and context
 */
export function generateQuote({
  tone = 'neutral',
  objective = 'awareness',
  isAIThemed = false,
  variation = 0
}) {
  const quoteBank = isAIThemed ? AI_THEMED_QUOTES : QUOTE_TEMPLATES;
  const toneQuotes = quoteBank[tone] || quoteBank.neutral;
  const objectiveQuotes = toneQuotes[objective] || toneQuotes.awareness;
  
  // Select quote with variation for diversity
  const index = Math.floor((variation * objectiveQuotes.length) % objectiveQuotes.length);
  return objectiveQuotes[index] || objectiveQuotes[0];
}

/**
 * Generate multiple quote variations
 */
export function generateQuoteVariations({
  tone = 'neutral',
  objective = 'awareness',
  isAIThemed = false,
  count = 3
}) {
  const quotes = [];
  for (let i = 0; i < count; i++) {
    quotes.push(generateQuote({
      tone,
      objective,
      isAIThemed,
      variation: i / count
    }));
  }
  return quotes;
}

/**
 * Detect if content is AI-related based on keywords
 */
export function detectAITheme(assets = [], metadata = {}) {
  // Check for AI-related keywords in asset names or metadata
  const aiKeywords = ['ai', 'artificial', 'intelligence', 'machine learning', 'ml', 'neural', 'algorithm', 'smart', 'automation', 'tech'];
  
  const searchText = [
    ...assets.map(a => a.name || ''),
    metadata.description || '',
    metadata.title || '',
    metadata.tags || ''
  ].join(' ').toLowerCase();
  
  return aiKeywords.some(keyword => searchText.includes(keyword));
}

/**
 * Generate contextual quote with smart detection
 */
export function generateContextualQuote({
  tone = 'neutral',
  objective = 'awareness',
  assets = [],
  metadata = {},
  variation = 0
}) {
  const isAIThemed = detectAITheme(assets, metadata);
  return generateQuote({
    tone,
    objective,
    isAIThemed,
    variation
  });
}

/**
 * Enhance quote with emojis and formatting based on tone
 */
export function enhanceQuote(quote, tone) {
  if (tone === 'playful' && !quote.includes('🎉') && !quote.includes('✨')) {
    // Add playful emojis occasionally
    const emojis = ['✨', '🎉', '🚀', '💫', '🎁'];
    if (Math.random() > 0.5) {
      return quote + ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }
  }
  return quote;
}



