<?php
/**
 * Product SVG Asset Generator
 * Generates beautiful, high-fidelity vector product illustrations
 * for all 36 products (16 existing + 20 new Amazon & Flipkart flagship items)
 */

$targets = [
    __DIR__ . '/../../frontend/public/uploads/products',
    __DIR__ . '/../../backend/uploads/products'
];

foreach ($targets as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
}

$svgs = [];

// Helper function to build standard studio container with Amazon/Flipkart clean presentation
function buildSvg($svgContent, $title, $subtitle, $accentColor = '#6366f1', $badgeText = 'OFFICIAL BRAND') {
    return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="65%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </radialGradient>
    <radialGradient id="spotlight" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="{$accentColor}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="{$accentColor}" stop-opacity="0" />
    </radialGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Clean Studio Stage Background -->
  <rect width="600" height="600" fill="url(#bgGlow)" rx="24" />
  <circle cx="300" cy="270" r="220" fill="url(#spotlight)" />

  <!-- Soft Grounding Shadow -->
  <ellipse cx="300" cy="430" rx="170" ry="18" fill="#0f172a" opacity="0.1" filter="url(#dropShadow)" />

  <!-- Top Badge -->
  <g transform="translate(300, 48)">
    <rect x="-95" y="-14" width="190" height="28" rx="14" fill="#ffffff" stroke="{$accentColor}" stroke-width="1.5" />
    <circle cx="-74" cy="0" r="4" fill="{$accentColor}" />
    <text x="-60" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#0f172a" letter-spacing="1.5">{$badgeText}</text>
  </g>

  <!-- Main Product Illustration Artwork -->
  <g id="productArtwork" filter="url(#dropShadow)">
{$svgContent}
  </g>

  <!-- Bottom Details Typography -->
  <g transform="translate(300, 520)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="0.3">{$title}</text>
    <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#64748b" text-anchor="middle" letter-spacing="0.5">{$subtitle}</text>
  </g>
</svg>
SVG;
}

// --------------------------------------------------------------------------
// 1. SAMSUNG GALAXY S24 ULTRA 5G
// --------------------------------------------------------------------------
$svgs['galaxy-s24-ultra.svg'] = buildSvg('
  <!-- S24 Ultra Phone Body -->
  <g transform="translate(200, 110)">
    <!-- Titanium Frame -->
    <rect x="0" y="0" width="170" height="310" rx="10" fill="#475569" stroke="#94a3b8" stroke-width="2.5" />
    <!-- Inner Screen Bezel -->
    <rect x="5" y="5" width="160" height="300" rx="6" fill="#020617" />
    <!-- Dynamic AMOLED Screen with Galaxy AI Wallpaper Glow -->
    <defs>
      <linearGradient id="s24Wall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="45%" stop-color="#818cf8" />
        <stop offset="70%" stop-color="#c084fc" />
        <stop offset="100%" stop-color="#f43f5e" />
      </linearGradient>
    </defs>
    <rect x="7" y="7" width="156" height="296" rx="4" fill="url(#s24Wall)" opacity="0.85" />
    <!-- Top Infinity-O Camera Cutout -->
    <circle cx="85" cy="18" r="3.5" fill="#000000" />
    <!-- Screen UI Elements -->
    <text x="85" y="80" font-family="sans-serif" font-size="28" font-weight="300" fill="#ffffff" text-anchor="middle">10:08</text>
    <text x="85" y="98" font-family="sans-serif" font-size="10" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.9">Tue, 24 Oct • 28°C</text>
    <!-- Galaxy AI Star Emblem in Center -->
    <g transform="translate(85, 175) scale(0.9)">
      <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill="#ffffff" opacity="0.95" />
      <polygon points="14,-14 16,-8 22,-6 16,-4 14,2 12,-4 6,-6 12,-8" fill="#fde047" />
    </g>
    <text x="85" y="215" font-family="sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">Galaxy AI</text>
  </g>
  <!-- S-Pen Stylus Alongside -->
  <g transform="translate(390, 160)">
    <rect x="0" y="0" width="12" height="230" rx="6" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5" />
    <!-- S Pen Clicker Top -->
    <rect x="1" y="0" width="10" height="20" rx="3" fill="#cbd5e1" />
    <!-- S Pen Button -->
    <rect x="2" y="80" width="8" height="22" rx="3" fill="#64748b" />
    <!-- Fine Tip -->
    <polygon points="0,225 12,225 6,245" fill="#0f172a" />
  </g>
', 'Samsung Galaxy S24 Ultra 5G', 'Snapdragon 8 Gen 3 • 200MP Quad Camera • S Pen', '#38bdf8', 'GALAXY AI FLAGSHIP');

// --------------------------------------------------------------------------
// 2. APPLE iPHONE 15 PRO
// --------------------------------------------------------------------------
$svgs['iphone-15-pro.svg'] = buildSvg('
  <g transform="translate(215, 115)">
    <!-- Natural Titanium Body -->
    <rect x="0" y="0" width="170" height="310" rx="36" fill="#64748b" stroke="#cbd5e1" stroke-width="2.5" />
    <!-- OLED Bezel -->
    <rect x="5" y="5" width="160" height="300" rx="32" fill="#090d16" />
    <!-- iOS 17 Gradient Wallpaper -->
    <defs>
      <linearGradient id="iosWall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b" />
        <stop offset="30%" stop-color="#312e81" />
        <stop offset="70%" stop-color="#4f46e5" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
    </defs>
    <rect x="7" y="7" width="156" height="296" rx="30" fill="url(#iosWall)" />
    <!-- Dynamic Island Pill -->
    <rect x="55" y="16" width="50" height="15" rx="7.5" fill="#000000" />
    <circle cx="95" cy="23.5" r="3" fill="#0f172a" stroke="#1e293b" stroke-width="0.8" />
    <!-- Clock & Lock Screen Widgets -->
    <text x="80" y="85" font-family="-apple-system, sans-serif" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle">9:41</text>
    <text x="80" y="105" font-family="-apple-system, sans-serif" font-size="11" font-weight="500" fill="#e2e8f0" text-anchor="middle">Tuesday, September 12</text>
    <!-- Lock screen circular widgets -->
    <g transform="translate(48, 122)">
      <circle cx="16" cy="16" r="14" fill="#ffffff" fill-opacity="0.15" />
      <text x="16" y="20" font-family="sans-serif" font-size="10" fill="#ffffff" text-anchor="middle">85%</text>
      <circle cx="48" cy="16" r="14" fill="#ffffff" fill-opacity="0.15" />
      <path d="M48,10 A6,6 0 0,1 48,22" stroke="#38bdf8" stroke-width="2" fill="none" />
    </g>
    <!-- Flashlight & Camera shortcut circles -->
    <circle cx="30" cy="275" r="14" fill="#ffffff" fill-opacity="0.2" />
    <circle cx="130" cy="275" r="14" fill="#ffffff" fill-opacity="0.2" />
    <rect x="60" y="293" width="40" height="3" rx="1.5" fill="#ffffff" opacity="0.8" />
  </g>
', 'Apple iPhone 15 Pro', 'A17 Pro 3nm • Pro Camera 48MP • Natural Titanium', '#a855f7', 'APPLE ORIGINAL');

// --------------------------------------------------------------------------
// 3. ONEPLUS 12 5G
// --------------------------------------------------------------------------
$svgs['oneplus-12.svg'] = buildSvg('
  <g transform="translate(215, 115)">
    <!-- Emerald Green Glass Back -->
    <defs>
      <linearGradient id="opGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b" />
        <stop offset="50%" stop-color="#047857" />
        <stop offset="100%" stop-color="#022c22" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="170" height="310" rx="28" fill="url(#opGreen)" stroke="#34d399" stroke-width="2" />
    <!-- Hasselblad Giant Circular Camera Island -->
    <g transform="translate(85, 90)">
      <circle cx="0" cy="0" r="54" fill="#0f172a" stroke="#cbd5e1" stroke-width="2.5" />
      <circle cx="0" cy="0" r="50" fill="#1e293b" />
      <!-- Lenses -->
      <circle cx="-20" cy="-18" r="14" fill="#020617" stroke="#64748b" stroke-width="2" />
      <circle cx="-20" cy="-18" r="7" fill="#1e293b" />
      <circle cx="20" cy="-18" r="14" fill="#020617" stroke="#64748b" stroke-width="2" />
      <circle cx="20" cy="-18" r="7" fill="#1e293b" />
      <rect x="-18" y="8" width="36" height="24" rx="4" fill="#020617" stroke="#64748b" stroke-width="1.5" />
      <!-- Hasselblad H Logo in center -->
      <text x="0" y="2" font-family="serif" font-size="14" font-weight="900" fill="#f87171" text-anchor="middle">H</text>
    </g>
    <!-- OnePlus 1+ Logo at bottom -->
    <rect x="73" y="240" width="24" height="24" rx="4" fill="#ef4444" />
    <text x="85" y="257" font-family="sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">1+</text>
  </g>
', 'OnePlus 12 5G (Flowy Emerald)', 'Snapdragon 8 Gen 3 • 4th Gen Hasselblad • 100W SuperVOOC', '#10b981', 'FLAGSHIP PERFORMANCE');

// --------------------------------------------------------------------------
// 4. APPLE MACBOOK AIR 15" M3
// --------------------------------------------------------------------------
$svgs['macbook-air-m3.svg'] = buildSvg('
  <!-- Open Laptop Clamshell Profile -->
  <g transform="translate(130, 150)">
    <!-- Display Lid -->
    <rect x="40" y="0" width="260" height="175" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="2" />
    <!-- Bezel -->
    <rect x="46" y="6" width="248" height="163" rx="4" fill="#020617" />
    <!-- Retina Screen with macOS Wallpaper -->
    <defs>
      <linearGradient id="macWall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="35%" stop-color="#8b5cf6" />
        <stop offset="70%" stop-color="#ec4899" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>
    </defs>
    <rect x="49" y="9" width="242" height="157" fill="url(#macWall)" />
    <!-- Camera Notch -->
    <rect x="160" y="9" width="20" height="6" rx="2" fill="#020617" />
    <!-- Base Lower Chassis (Perspective) -->
    <polygon points="0,205 340,205 320,175 20,175" fill="#334155" stroke="#94a3b8" stroke-width="1.5" />
    <!-- Keyboard Well -->
    <polygon points="50,195 290,195 280,180 60,180" fill="#0f172a" />
    <!-- Trackpad -->
    <rect x="135" y="196" width="70" height="8" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="0.8" />
  </g>
', 'Apple MacBook Air 15" M3', 'Apple M3 Chip • 15.3" Liquid Retina • 18h Battery', '#8b5cf6', 'APPLE SILICON M3');

// --------------------------------------------------------------------------
// 5. SONY BRAVIA 55" 4K GOOGLE TV
// --------------------------------------------------------------------------
$svgs['sony-bravia-tv.svg'] = buildSvg('
  <g transform="translate(120, 130)">
    <!-- Thin Bezel Frame -->
    <rect x="0" y="0" width="360" height="225" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="3" />
    <!-- 4K HDR Screen with Aurora Mountain Scenic Art -->
    <defs>
      <linearGradient id="auroraSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="40%" stop-color="#065f46" />
        <stop offset="70%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#1e1b4b" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="348" height="213" fill="url(#auroraSky)" />
    <!-- Mountains silhouette -->
    <polygon points="30,190 110,120 180,190" fill="#0f172a" />
    <polygon points="140,190 220,100 310,190" fill="#020617" />
    <!-- Sony Logo & 4K HDR badge -->
    <text x="180" y="212" font-family="sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">SONY</text>
    <rect x="290" y="18" width="48" height="18" rx="3" fill="#000000" fill-opacity="0.75" />
    <text x="314" y="31" font-family="sans-serif" font-size="9" font-weight="800" fill="#fbbf24" text-anchor="middle">4K HDR</text>
    <!-- Dual Stand Metal Feet -->
    <polygon points="55,225 65,225 50,250 40,250" fill="#94a3b8" />
    <polygon points="305,225 295,225 310,250 320,250" fill="#94a3b8" />
  </g>
', 'Sony Bravia 55" 4K Google TV', 'Dolby Vision & Atmos • 4K Processor X1 • Google TV', '#eab308', 'CINEMATIC 4K HDR');

// --------------------------------------------------------------------------
// 6. SONY WH-1000XM5 WIRELESS HEADPHONES
// --------------------------------------------------------------------------
$svgs['sony-wh1000xm5.svg'] = buildSvg('
  <g transform="translate(180, 120)">
    <!-- Headband Arc -->
    <path d="M 40,160 C 40,30 200,30 200,160" fill="none" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round" />
    <path d="M 60,110 C 60,60 180,60 180,110" fill="none" stroke="#cbd5e1" stroke-width="6" />
    <!-- Left Earcup Assembly -->
    <g transform="translate(10, 140)">
      <rect x="18" y="0" width="8" height="30" rx="4" fill="#94a3b8" />
      <ellipse cx="22" cy="55" rx="32" ry="46" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
      <ellipse cx="22" cy="55" rx="20" ry="32" fill="#e2e8f0" />
      <circle cx="22" cy="55" r="4" fill="#64748b" />
    </g>
    <!-- Right Earcup Assembly -->
    <g transform="translate(190, 140)">
      <rect x="14" y="0" width="8" height="30" rx="4" fill="#94a3b8" />
      <ellipse cx="18" cy="55" rx="32" ry="46" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
      <ellipse cx="18" cy="55" rx="20" ry="32" fill="#e2e8f0" />
      <circle cx="18" cy="55" r="4" fill="#64748b" />
    </g>
  </g>
', 'Sony WH-1000XM5 ANC Headphones', 'Industry-Leading Active Noise Cancelling • LDAC • 30h Battery', '#38bdf8', 'HI-RES AUDIO CERTIFIED');

// --------------------------------------------------------------------------
// 7. boAt AIRDOPES 141 ANC
// --------------------------------------------------------------------------
$svgs['boat-airdopes.svg'] = buildSvg('
  <!-- Open Pebble Charging Case -->
  <g transform="translate(200, 140)">
    <!-- Case Lower Body -->
    <rect x="20" y="80" width="160" height="120" rx="45" fill="#18181b" stroke="#3f3f46" stroke-width="2.5" />
    <!-- boAt Emblem in center -->
    <path d="M 90,140 L 100,122 L 110,140 Z" fill="#ef4444" />
    <!-- 4 Battery LED Indicator Dots -->
    <g transform="translate(75, 170)">
      <circle cx="0" cy="0" r="3" fill="#22c55e" />
      <circle cx="16" cy="0" r="3" fill="#22c55e" />
      <circle cx="32" cy="0" r="3" fill="#22c55e" />
      <circle cx="48" cy="0" r="3" fill="#22c55e" />
    </g>
    <!-- Twin Earbuds protruding out -->
    <!-- Left Bud -->
    <g transform="translate(45, 10)">
      <ellipse cx="16" cy="20" rx="16" ry="18" fill="#27272a" stroke="#71717a" stroke-width="1.5" />
      <rect x="12" y="34" width="8" height="42" rx="4" fill="#27272a" stroke="#52525b" stroke-width="1" />
      <circle cx="16" cy="20" r="4" fill="#ef4444" />
    </g>
    <!-- Right Bud -->
    <g transform="translate(125, 10)">
      <ellipse cx="16" cy="20" rx="16" ry="18" fill="#27272a" stroke="#71717a" stroke-width="1.5" />
      <rect x="12" y="34" width="8" height="42" rx="4" fill="#27272a" stroke="#52525b" stroke-width="1" />
      <circle cx="16" cy="20" r="4" fill="#ef4444" />
    </g>
  </g>
', 'boAt Airdopes 141 ANC', 'Active Noise Cancellation 32dB • 42H Total Playtime • BEAST Mode', '#ef4444', 'BESTSELLING EARBUDS');

// --------------------------------------------------------------------------
// 8. APPLE iPAD AIR 11" M2
// --------------------------------------------------------------------------
$svgs['ipad-air-m2.svg'] = buildSvg('
  <g transform="translate(190, 115)">
    <!-- Aluminum Body -->
    <rect x="0" y="0" width="220" height="295" rx="20" fill="#475569" stroke="#94a3b8" stroke-width="2" />
    <!-- Bezel -->
    <rect x="7" y="7" width="206" height="281" rx="14" fill="#020617" />
    <!-- Liquid Retina Wallpaper Screen -->
    <defs>
      <linearGradient id="ipadWall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="50%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#14b8a6" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="200" height="275" rx="12" fill="url(#ipadWall)" />
    <!-- Digital Art Wave -->
    <path d="M 10,180 Q 70,80 140,160 T 210,120 L 210,285 L 10,285 Z" fill="#0891b2" opacity="0.6" />
    <!-- Apple Pencil magnetically snapped on right edge -->
    <rect x="223" y="40" width="7" height="190" rx="3.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <polygon points="223,230 230,230 226.5,244" fill="#94a3b8" />
  </g>
', 'Apple iPad Air 11" M2', 'Apple M2 Chip • 11" Liquid Retina • Apple Pencil Pro Ready', '#06b6d4', 'CREATIVE POWERHOUSE');

// --------------------------------------------------------------------------
// 9. LEVI'S 511 SLIM FIT JEANS
// --------------------------------------------------------------------------
$svgs['levis-jeans.svg'] = buildSvg('
  <g transform="translate(200, 120)">
    <!-- Denim Pants Shape -->
    <defs>
      <linearGradient id="denimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="40%" stop-color="#1d4ed8" />
        <stop offset="100%" stop-color="#172554" />
      </linearGradient>
    </defs>
    <path d="M 20,20 L 180,20 L 190,80 L 175,270 L 115,270 L 100,120 L 85,270 L 25,270 L 10,80 Z" fill="url(#denimGrad)" stroke="#60a5fa" stroke-width="2" />
    <!-- Waistband & Belt Loops -->
    <rect x="18" y="20" width="164" height="22" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,2" />
    <!-- Levi\'s Leather Patch on Waistband -->
    <rect x="140" y="23" width="34" height="16" rx="2" fill="#b45309" />
    <text x="157" y="34" font-family="sans-serif" font-size="6" font-weight="900" fill="#fef3c7" text-anchor="middle">LEVI STRAUSS</text>
    <!-- Front Pockets & Contrast Stitching -->
    <path d="M 20,42 Q 60,45 65,85" fill="none" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
    <path d="M 180,42 Q 140,45 135,85" fill="none" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
    <!-- Fly seam -->
    <line x1="100" y1="42" x2="100" y2="105" stroke="#d97706" stroke-width="2" stroke-dasharray="3,2" />
    <circle cx="100" cy="32" r="5" fill="#cbd5e1" stroke="#64748b" stroke-width="1" />
  </g>
', 'Levi\'s 511 Slim Fit Stretch Jeans', 'Original Performance Denim • Flex Stretch • Iconic Dark Wash', '#3b82f6', 'AUTHENTIC DENIM');

// --------------------------------------------------------------------------
// 10. U.S. POLO ASSN. POLO T-SHIRT
// --------------------------------------------------------------------------
$svgs['polo-tshirt.svg'] = buildSvg('
  <g transform="translate(160, 130)">
    <defs>
      <linearGradient id="poloBlue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <!-- Polo Shirt Silhouette -->
    <path d="M 90,30 L 190,30 L 260,75 L 235,130 L 200,115 L 200,260 L 80,260 L 80,115 L 45,130 L 20,75 Z" fill="url(#poloBlue)" stroke="#3b82f6" stroke-width="2" />
    <!-- Ribbed Collar -->
    <polygon points="90,30 140,65 110,95 80,50" fill="#172554" stroke="#60a5fa" stroke-width="1.5" />
    <polygon points="190,30 140,65 170,95 200,50" fill="#172554" stroke="#60a5fa" stroke-width="1.5" />
    <!-- 2-Button Placket -->
    <rect x="130" y="65" width="20" height="50" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1" />
    <circle cx="140" cy="80" r="3" fill="#ffffff" />
    <circle cx="140" cy="100" r="3" fill="#ffffff" />
    <!-- USPA Embroidered Double Horseman Logo -->
    <circle cx="175" cy="115" r="7" fill="#dc2626" />
    <text x="175" y="118" font-family="sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">P</text>
  </g>
', 'U.S. Polo Assn. Cotton Pique Polo', '100% Combed Cotton • Breathable Pique Knit • Regular Fit', '#ef4444', 'PREMIUM CASUAL');

// --------------------------------------------------------------------------
// 11. ZARA FLORAL SUMMER MAXI DRESS
// --------------------------------------------------------------------------
$svgs['zara-dress.svg'] = buildSvg('
  <g transform="translate(200, 120)">
    <!-- Elegant Wooden Hanger -->
    <path d="M 50,20 Q 100,0 150,20 L 100,5 Z" fill="#b45309" stroke="#78350f" stroke-width="1" />
    <path d="M 100,0 C 100,-15 115,-15 115,-5" fill="none" stroke="#94a3b8" stroke-width="2" />
    <!-- Flowing Dress Body -->
    <defs>
      <linearGradient id="dressFabric" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff1f2" />
        <stop offset="50%" stop-color="#fecdd3" />
        <stop offset="100%" stop-color="#fda4af" />
      </linearGradient>
    </defs>
    <path d="M 75,30 L 125,30 L 140,80 L 125,120 L 185,270 L 15,270 L 75,120 L 60,80 Z" fill="url(#dressFabric)" stroke="#fb7185" stroke-width="2" />
    <!-- Floral Pattern Motifs -->
    <g fill="#e11d48" opacity="0.65">
      <circle cx="80" cy="150" r="7" /><circle cx="120" cy="180" r="9" /><circle cx="60" cy="220" r="8" /><circle cx="140" cy="235" r="11" />
      <circle cx="95" cy="110" r="6" /><circle cx="100" cy="250" r="10" />
    </g>
    <!-- Sweetheart Waistline Belt -->
    <path d="M 75,120 Q 100,130 125,120" fill="none" stroke="#be123c" stroke-width="2.5" />
  </g>
', 'Zara Floral Linen Summer Maxi Dress', 'Artisanal Botanical Print • 75% Pure Linen • Flowing Silhouette', '#f43f5e', 'TRENDING FASHION');

// --------------------------------------------------------------------------
// 12. PUMA MEN\'S TRACKSUIT JACKET
// --------------------------------------------------------------------------
$svgs['puma-tracksuit.svg'] = buildSvg('
  <g transform="translate(170, 130)">
    <!-- Black Athletic Jacket with Contrast Red/White Stripes -->
    <path d="M 90,30 L 170,30 L 240,75 L 215,130 L 180,115 L 180,260 L 80,260 L 80,115 L 45,130 L 20,75 Z" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
    <!-- White T7 Contrast Sleeve Stripes -->
    <polygon points="20,75 45,85 70,115 55,125" fill="#f8fafc" />
    <polygon points="240,75 215,85 190,115 205,125" fill="#f8fafc" />
    <!-- Full Center Zipper -->
    <line x1="130" y1="30" x2="130" y2="260" stroke="#a1a1aa" stroke-width="2.5" stroke-dasharray="4,2" />
    <!-- Puma Leaping Cat Logo -->
    <g transform="translate(155, 75) scale(0.6)">
      <path d="M 0,15 Q 12,0 25,5 Q 35,15 30,25 Q 15,20 0,15 Z" fill="#ffffff" />
    </g>
  </g>
', 'Puma Iconic T7 Training Jacket', 'dryCELL Moisture Control • Recycled Performance Tricot', '#ffffff', 'ATHLETIC SPORTSWEAR');

// --------------------------------------------------------------------------
// 13. NIKE AIR JORDAN 1 RETRO HIGH OG
// --------------------------------------------------------------------------
$svgs['nike-air-jordan.svg'] = buildSvg('
  <g transform="translate(150, 160)">
    <!-- Sole Unit -->
    <path d="M 20,170 Q 150,170 280,165 Q 290,195 270,195 L 30,195 Q 15,195 20,170 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
    <rect x="25" y="190" width="250" height="8" rx="3" fill="#dc2626" />
    <!-- Chicago Red Overlays -->
    <path d="M 30,170 L 60,110 L 100,105 L 110,170 Z" fill="#dc2626" />
    <path d="M 200,80 L 260,110 L 280,165 L 210,165 L 170,110 Z" fill="#dc2626" />
    <!-- High Ankle Collar -->
    <polygon points="140,20 210,40 200,90 130,80" fill="#18181b" stroke="#dc2626" stroke-width="2" />
    <!-- Summit White Quarter Panel -->
    <polygon points="90,110 170,110 160,165 95,165" fill="#f8fafc" />
    <!-- Black Swoosh -->
    <path d="M 90,135 Q 140,150 200,105 Q 240,75 220,120 Q 160,170 90,135 Z" fill="#18181b" />
    <!-- Laces & Tongue -->
    <polygon points="90,90 140,30 155,40 110,105" fill="#18181b" />
    <line x1="95" y1="95" x2="135" y2="55" stroke="#f8fafc" stroke-width="2.5" />
    <line x1="102" y1="105" x2="142" y2="65" stroke="#f8fafc" stroke-width="2.5" />
    <!-- Wings Logo on Collar -->
    <circle cx="175" cy="55" r="9" fill="#000000" stroke="#facc15" stroke-width="1" />
  </g>
', 'Nike Air Jordan 1 Retro High OG', 'Chicago Colorway • Encapsulated Air Sole • Full-Grain Leather', '#dc2626', 'STREETWEAR ICON');

// --------------------------------------------------------------------------
// 14. PUMA SMASHIC RETRO SNEAKERS
// --------------------------------------------------------------------------
$svgs['puma-sneakers.svg'] = buildSvg('
  <g transform="translate(150, 180)">
    <!-- Vulcanized Rubber Sole -->
    <rect x="20" y="140" width="270" height="25" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" />
    <!-- Clean White Leather Upper -->
    <path d="M 20,140 Q 60,65 140,65 Q 230,70 280,120 L 290,140 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
    <!-- Suede Green Formstrip -->
    <path d="M 70,120 Q 150,135 240,85 Q 260,95 220,135 Q 140,140 70,120 Z" fill="#15803d" />
    <!-- Gold PUMA Wordmark -->
    <text x="120" y="95" font-family="sans-serif" font-size="10" font-weight="900" fill="#ca8a04">PUMA</text>
    <!-- Lacing Eyelets -->
    <line x1="110" y1="75" x2="170" y2="75" stroke="#e2e8f0" stroke-width="3" />
  </g>
', 'Puma Smashic Casual Retro Sneakers', 'SoftFoam+ Optimal Insole • Classic Suede Formstrip • White / Green', '#16a34a', 'TIMELESS CLASSIC');

// --------------------------------------------------------------------------
// 15. WOODLAND LEATHER TREKKING BOOTS
// --------------------------------------------------------------------------
$svgs['woodland-boots.svg'] = buildSvg('
  <g transform="translate(150, 160)">
    <!-- Deep Lugged Commando Tread Sole -->
    <path d="M 20,165 L 290,165 L 285,195 L 20,195 Z" fill="#18181b" />
    <!-- Tread teeth -->
    <g fill="#27272a">
      <rect x="35" y="195" width="20" height="8" /><rect x="75" y="195" width="20" height="8" />
      <rect x="115" y="195" width="20" height="8" /><rect x="155" y="195" width="20" height="8" />
      <rect x="195" y="195" width="20" height="8" /><rect x="235" y="195" width="20" height="8" />
    </g>
    <!-- Oiled Camel Nubuck Upper -->
    <path d="M 20,165 Q 50,110 110,105 L 140,30 L 210,35 L 220,110 Q 260,125 290,165 Z" fill="#d97706" stroke="#92400e" stroke-width="2.5" />
    <!-- Padded Collar at Ankle -->
    <rect x="140" y="25" width="70" height="18" rx="6" fill="#451a03" />
    <!-- Hex Metal Eyelets and Cord Laces -->
    <g fill="#ca8a04">
      <circle cx="145" cy="65" r="4" /><circle cx="148" cy="85" r="4" /><circle cx="150" cy="105" r="4" />
      <circle cx="180" cy="65" r="4" /><circle cx="182" cy="85" r="4" /><circle cx="185" cy="105" r="4" />
    </g>
    <!-- Tree Logo Emboss -->
    <circle cx="80" cy="135" r="14" fill="#92400e" opacity="0.6" />
  </g>
', 'Woodland Camel Nubuck Trekking Boots', 'Heavy-Duty Nubuck Leather • Deep Commando Lug Sole • All-Terrain', '#d97706', 'OUTDOOR RUGGED');

// --------------------------------------------------------------------------
// 16. PHILIPS DIGITAL AIR FRYER HD9252
// --------------------------------------------------------------------------
$svgs['philips-airfryer.svg'] = buildSvg('
  <g transform="translate(190, 120)">
    <!-- Gloss Black Main Appliance Body -->
    <rect x="10" y="20" width="200" height="260" rx="35" fill="#18181b" stroke="#3f3f46" stroke-width="2.5" />
    <!-- Top Slanted Digital Touch Panel -->
    <rect x="25" y="35" width="170" height="80" rx="16" fill="#09090b" stroke="#52525b" stroke-width="1.5" />
    <!-- LED Display Glowing Temp & Time -->
    <text x="110" y="70" font-family="monospace" font-size="24" font-weight="900" fill="#22c55e" text-anchor="middle">180°C</text>
    <text x="110" y="95" font-family="sans-serif" font-size="12" font-weight="700" fill="#a1a1aa" text-anchor="middle">20 MIN • RAPID AIR</text>
    <!-- Preset Touch Icons -->
    <circle cx="50" cy="65" r="5" fill="#f59e0b" /><circle cx="170" cy="65" r="5" fill="#3b82f6" />
    <!-- Basket Seam Divider -->
    <line x1="10" y1="135" x2="210" y2="135" stroke="#27272a" stroke-width="3" />
    <!-- Chrome Pull Handle -->
    <rect x="90" y="160" width="40" height="85" rx="12" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
    <rect x="98" y="172" width="24" height="60" rx="8" fill="#18181b" />
  </g>
', 'Philips Digital Air Fryer HD9252', 'Rapid Air Technology 4.1L • 7 Touch Presets • 90% Less Oil', '#22c55e', 'HEALTHY COOKING');

// --------------------------------------------------------------------------
// 17. DYSON V12 DETECT SLIM VACUUM
// --------------------------------------------------------------------------
$svgs['dyson-vacuum.svg'] = buildSvg('
  <g transform="translate(180, 110)">
    <!-- Cyclone Motor Head (Copper / Nickel finish) -->
    <rect x="40" y="20" width="80" height="90" rx="14" fill="#d97706" stroke="#f59e0b" stroke-width="2" />
    <!-- Clear Bin with Radial Cyclones inside -->
    <rect x="45" y="30" width="70" height="60" rx="8" fill="#18181b" stroke="#cbd5e1" stroke-width="1" />
    <circle cx="80" cy="60" r="18" fill="#f59e0b" opacity="0.8" />
    <!-- Ergonomic Trigger Handle -->
    <path d="M 40,60 L 0,80 L 10,120 L 40,100 Z" fill="#3f3f46" stroke="#71717a" stroke-width="1.5" />
    <circle cx="20" cy="90" r="5" fill="#ef4444" />
    <!-- Slim Wand Extension (Purple/Gold) -->
    <rect x="74" y="110" width="12" height="150" rx="4" fill="#a855f7" stroke="#c084fc" stroke-width="1.5" />
    <!-- Laser Fluffy Cleaner Head -->
    <rect x="40" y="260" width="80" height="24" rx="6" fill="#10b981" stroke="#34d399" stroke-width="2" />
    <!-- Green Laser Beam Glow projection -->
    <polygon points="120,265 200,285 200,295 120,275" fill="#22c55e" opacity="0.4" />
  </g>
', 'Dyson V12 Detect Slim Cordless', 'Laser Dust Detection • 150 AW Suction • Piezo Particle Sensor', '#a855f7', 'PRECISION ENGINEERING');

// --------------------------------------------------------------------------
// 18. ATOMIC HABITS BY JAMES CLEAR
// --------------------------------------------------------------------------
$svgs['atomic-habits.svg'] = buildSvg('
  <g transform="translate(185, 110)">
    <!-- 3D Hardcover Book Perspective Spine -->
    <polygon points="20,20 35,5 35,275 20,290" fill="#ca8a04" stroke="#a16207" stroke-width="1.5" />
    <!-- Front Cover -->
    <rect x="35" y="5" width="190" height="270" rx="4" fill="#fafafa" stroke="#e2e8f0" stroke-width="2" />
    <!-- Title Constellation Motif -->
    <circle cx="130" cy="100" r="38" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="6,4" />
    <circle cx="130" cy="100" r="22" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,2" />
    <circle cx="130" cy="100" r="8" fill="#ca8a04" />
    <!-- Bestseller Banner -->
    <rect x="50" y="24" width="160" height="16" rx="8" fill="#fef08a" />
    <text x="130" y="35" font-family="sans-serif" font-size="8" font-weight="800" fill="#854d0e" text-anchor="middle">OVER 15 MILLION COPIES SOLD</text>
    <!-- Book Title & Author -->
    <text x="130" y="165" font-family="serif" font-size="20" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">ATOMIC</text>
    <text x="130" y="190" font-family="serif" font-size="22" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">HABITS</text>
    <line x1="85" y1="202" x2="175" y2="202" stroke="#eab308" stroke-width="2" />
    <text x="130" y="222" font-family="sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">JAMES CLEAR</text>
    <text x="130" y="245" font-family="sans-serif" font-size="7" font-weight="600" fill="#94a3b8" text-anchor="middle">Tiny Changes, Remarkable Results</text>
  </g>
', 'Atomic Habits by James Clear', 'Tiny Changes, Remarkable Results • International #1 Bestseller', '#eab308', 'GLOBAL BESTSELLER');

// --------------------------------------------------------------------------
// 19. THE PSYCHOLOGY OF MONEY
// --------------------------------------------------------------------------
$svgs['psychology-of-money.svg'] = buildSvg('
  <g transform="translate(185, 110)">
    <!-- Book Spine -->
    <polygon points="20,20 35,5 35,275 20,290" fill="#15803d" stroke="#166534" stroke-width="1.5" />
    <!-- Front Cover -->
    <rect x="35" y="5" width="190" height="270" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" />
    <!-- Classical Greek Coin / Currency Seal -->
    <circle cx="130" cy="95" r="32" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
    <text x="130" y="103" font-family="serif" font-size="24" font-weight="900" fill="#15803d" text-anchor="middle">₹</text>
    <!-- Titles -->
    <text x="130" y="155" font-family="serif" font-size="16" font-weight="700" fill="#0f172a" text-anchor="middle">THE PSYCHOLOGY</text>
    <text x="130" y="175" font-family="serif" font-size="13" font-weight="500" fill="#475569" text-anchor="middle">OF</text>
    <text x="130" y="202" font-family="serif" font-size="26" font-weight="900" fill="#15803d" text-anchor="middle">MONEY</text>
    <line x1="80" y1="216" x2="180" y2="216" stroke="#22c55e" stroke-width="1.5" />
    <text x="130" y="235" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">MORGAN HOUSEL</text>
    <text x="130" y="255" font-family="sans-serif" font-size="8" font-weight="500" fill="#64748b" text-anchor="middle">Timeless Lessons on Wealth, Greed &amp; Happiness</text>
  </g>
', 'The Psychology of Money', 'Timeless Lessons on Wealth &amp; Happiness • Morgan Housel', '#16a34a', 'FINANCIAL MASTERCLASS');

// --------------------------------------------------------------------------
// 20. RAY-BAN CLASSIC WAYFARER
// --------------------------------------------------------------------------
$svgs['rayban-wayfarer.svg'] = buildSvg('
  <g transform="translate(130, 190)">
    <!-- Left Lens Frame -->
    <path d="M 30,20 Q 90,15 150,25 Q 140,90 90,95 Q 35,90 30,20 Z" fill="#0f172a" stroke="#cbd5e1" stroke-width="3" />
    <!-- Left Polarized G-15 Green Tint Lens with Glare Reflection -->
    <path d="M 38,28 Q 90,23 142,32 Q 134,84 90,88 Q 42,84 38,28 Z" fill="#064e3b" opacity="0.9" />
    <polygon points="50,35 110,35 90,75 40,75" fill="#34d399" opacity="0.25" />
    <text x="50" y="44" font-family="serif" font-size="7" font-weight="900" fill="#ffffff" opacity="0.8">Ray-Ban</text>
    <circle cx="36" cy="24" r="2.5" fill="#cbd5e1" />

    <!-- Center Bridge -->
    <path d="M 150,25 Q 170,18 190,25" fill="none" stroke="#0f172a" stroke-width="8" />

    <!-- Right Lens Frame -->
    <path d="M 190,25 Q 250,15 310,20 Q 305,90 250,95 Q 200,90 190,25 Z" fill="#0f172a" stroke="#cbd5e1" stroke-width="3" />
    <!-- Right Polarized Lens -->
    <path d="M 198,32 Q 250,23 302,28 Q 298,84 250,88 Q 206,84 198,32 Z" fill="#064e3b" opacity="0.9" />
    <polygon points="210,35 270,35 250,75 200,75" fill="#34d399" opacity="0.25" />
    <circle cx="304" cy="24" r="2.5" fill="#cbd5e1" />

    <!-- Temples reaching back -->
    <path d="M 28,24 L 2,6" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
    <path d="M 312,24 L 338,6" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
  </g>
', 'Ray-Ban Classic Wayfarer RB2140', 'Iconic Black Acetate • G-15 Polarized Crystal Lenses • 100% UV400', '#10b981', 'ICONIC SUNWEAR');

// --------------------------------------------------------------------------
// UPGRADE EXISTING 16 PRODUCTS SO ALL ARE HIGH-DEFINITION
// --------------------------------------------------------------------------

// Headphones
$svgs['headphones.svg'] = buildSvg('
  <g transform="translate(175, 120)">
    <path d="M 50,150 C 50,30 200,30 200,150" fill="none" stroke="#6366f1" stroke-width="16" stroke-linecap="round" />
    <ellipse cx="45" cy="180" rx="35" ry="48" fill="#1e1b4b" stroke="#818cf8" stroke-width="3" />
    <ellipse cx="205" cy="180" rx="35" ry="48" fill="#1e1b4b" stroke="#818cf8" stroke-width="3" />
    <circle cx="45" cy="180" r="14" fill="#6366f1" opacity="0.5" />
    <circle cx="205" cy="180" r="14" fill="#6366f1" opacity="0.5" />
  </g>
', 'Pro Wireless ANC Headphones', '40mm Neodymium • 40h Battery • Bluetooth 5.3', '#818cf8', 'PREMIUM AUDIO');

// Laptop
$svgs['laptop.svg'] = buildSvg('
  <g transform="translate(140, 145)">
    <rect x="30" y="0" width="260" height="170" rx="8" fill="#0f172a" stroke="#818cf8" stroke-width="2.5" />
    <rect x="36" y="6" width="248" height="158" rx="4" fill="#1e1b4b" />
    <circle cx="160" cy="85" r="42" fill="#6366f1" opacity="0.3" />
    <text x="160" y="90" font-family="sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">4K OLED HDR</text>
    <polygon points="0,200 320,200 290,170 30,170" fill="#334155" stroke="#94a3b8" stroke-width="1.5" />
    <rect x="125" y="190" width="70" height="6" rx="2" fill="#0f172a" />
  </g>
', 'UltraBook Pro 15.6" Laptop', 'Intel Core i7-13700H • 16GB RAM • 1TB SSD • 4K OLED', '#818cf8', 'PRO COMPUTING');

// Smartwatch
$svgs['smartwatch.svg'] = buildSvg('
  <g transform="translate(210, 110)">
    <!-- Silicone Strap Top & Bottom -->
    <rect x="50" y="0" width="80" height="80" rx="12" fill="#334155" />
    <rect x="50" y="240" width="80" height="80" rx="12" fill="#334155" />
    <!-- Watch Case -->
    <rect x="25" y="55" width="130" height="180" rx="36" fill="#0f172a" stroke="#cbd5e1" stroke-width="3" />
    <!-- Display -->
    <rect x="32" y="62" width="116" height="166" rx="30" fill="#020617" />
    <!-- Activity Rings -->
    <circle cx="90" cy="135" r="40" fill="none" stroke="#ef4444" stroke-width="6" stroke-dasharray="210,50" />
    <circle cx="90" cy="135" r="28" fill="none" stroke="#22c55e" stroke-width="6" stroke-dasharray="140,40" />
    <circle cx="90" cy="135" r="16" fill="none" stroke="#06b6d4" stroke-width="6" stroke-dasharray="80,30" />
    <text x="90" y="205" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">72 BPM • 5 ATM</text>
  </g>
', 'Smart Fitness Watch Series 9', 'AMOLED Display • SpO2 • ECG • Dual-Band GPS', '#ef4444', 'HEALTH & FITNESS');

// Keyboard
$svgs['keyboard.svg'] = buildSvg('
  <g transform="translate(130, 160)">
    <rect x="0" y="0" width="340" height="150" rx="12" fill="#0f172a" stroke="#a855f7" stroke-width="2.5" />
    <g fill="#1e1b4b" stroke="#8b5cf6" stroke-width="1">
      <rect x="20" y="20" width="25" height="25" rx="4" />
      <rect x="55" y="20" width="25" height="25" rx="4" />
      <rect x="90" y="20" width="25" height="25" rx="4" />
      <rect x="125" y="20" width="25" height="25" rx="4" />
      <rect x="160" y="20" width="25" height="25" rx="4" />
      <rect x="195" y="20" width="25" height="25" rx="4" />
      <rect x="230" y="20" width="25" height="25" rx="4" />
      <rect x="265" y="20" width="25" height="25" rx="4" />
      <!-- Spacebar -->
      <rect x="90" y="105" width="160" height="25" rx="4" fill="#a855f7" opacity="0.6" />
    </g>
  </g>
', 'Mechanical Gaming Keyboard RGB', 'Hot-Swappable Red Linear • PBT Double-Shot • 1000Hz', '#a855f7', 'ESPORTS GRADE');

// Shirt
$svgs['shirt.svg'] = buildSvg('
  <g transform="translate(180, 130)">
    <path d="M 80,30 L 160,30 L 220,70 L 195,120 L 170,110 L 170,250 L 70,250 L 70,110 L 45,120 L 20,70 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
    <polygon points="80,30 120,60 100,85 70,50" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
    <polygon points="160,30 120,60 140,85 170,50" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
    <line x1="120" y1="60" x2="120" y2="250" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2" />
    <circle cx="120" cy="90" r="3" fill="#64748b" /><circle cx="120" cy="130" r="3" fill="#64748b" /><circle cx="120" cy="170" r="3" fill="#64748b" />
  </g>
', 'Classic Premium Oxford Shirt', '100% Organic Pima Cotton • Button-Down Collar • Slim Fit', '#38bdf8', 'PURE COTTON');

// Jacket
$svgs['jacket.svg'] = buildSvg('
  <g transform="translate(170, 130)">
    <path d="M 90,30 L 170,30 L 240,75 L 215,130 L 180,115 L 180,260 L 80,260 L 80,115 L 45,130 L 20,75 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5" />
    <line x1="130" y1="30" x2="130" y2="260" stroke="#0f172a" stroke-width="3" />
    <rect x="95" y="110" width="20" height="35" rx="3" fill="#0369a1" />
    <rect x="145" y="110" width="20" height="35" rx="3" fill="#0369a1" />
  </g>
', 'All-Weather Waterproof Shell Jacket', 'Triple-Layer GORE Membrane • 20,000mm Waterproof • Sealed Seams', '#0284c7', 'ALL-WEATHER GEAR');

// Jeans
$svgs['jeans.svg'] = buildSvg('
  <g transform="translate(200, 120)">
    <path d="M 20,20 L 180,20 L 190,80 L 175,270 L 115,270 L 100,120 L 85,270 L 25,270 L 10,80 Z" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2" />
    <rect x="18" y="20" width="164" height="20" fill="#172554" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,2" />
    <line x1="100" y1="40" x2="100" y2="105" stroke="#d97706" stroke-width="2" stroke-dasharray="3,2" />
  </g>
', 'Organic Cotton Slim Denim Jeans', '98% Cotton 2% Elastane • Selvedge Stretch • Vintage Indigo', '#2563eb', 'DENIM ESSENTIAL');

// Shoes
$svgs['shoes.svg'] = buildSvg('
  <g transform="translate(150, 170)">
    <path d="M 20,135 Q 80,45 160,45 Q 230,55 280,110 L 290,135 Z" fill="#f97316" stroke="#fb923c" stroke-width="2" />
    <rect x="15" y="135" width="280" height="25" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
    <path d="M 60,110 Q 140,125 240,75" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
  </g>
', 'Air Velocity Running Shoes', 'NitroFoam Carbon Midsole • Continental Rubber • 8mm Drop', '#f97316', 'PRO MARATHON');

// Dress Shoes
$svgs['dress-shoes.svg'] = buildSvg('
  <g transform="translate(150, 175)">
    <rect x="20" y="130" width="270" height="22" rx="6" fill="#451a03" stroke="#78350f" stroke-width="1.5" />
    <path d="M 20,130 Q 55,75 120,70 Q 200,75 285,115 L 290,130 Z" fill="#78350f" stroke="#b45309" stroke-width="2" />
    <polygon points="120,70 170,70 155,100 135,100" fill="#451a03" />
  </g>
', 'Italian Full-Grain Leather Derby', 'Handcrafted Calfskin • Goodyear Welted Leather Sole • Dark Cognac', '#b45309', 'FORMAL LUXURY');

// Espresso Machine
$svgs['espresso.svg'] = buildSvg('
  <g transform="translate(190, 120)">
    <rect x="20" y="20" width="180" height="240" rx="18" fill="#334155" stroke="#cbd5e1" stroke-width="2" />
    <rect x="40" y="40" width="140" height="40" rx="8" fill="#0f172a" />
    <circle cx="70" cy="60" r="8" fill="#22c55e" /><circle cx="110" cy="60" r="8" fill="#f59e0b" /><circle cx="150" cy="60" r="8" fill="#ef4444" />
    <rect x="80" y="100" width="60" height="30" rx="6" fill="#1e293b" />
    <!-- Steam Wand -->
    <path d="M 160,100 L 175,180" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
    <!-- Drip Tray -->
    <rect x="30" y="220" width="160" height="30" rx="6" fill="#0f172a" />
  </g>
', 'Barista Touch Espresso Machine', '15-Bar Italian Pump • Integrated Burr Grinder • PID Temperature', '#f59e0b', 'CAFE QUALITY');

// Dutch Oven
$svgs['dutch-oven.svg'] = buildSvg('
  <g transform="translate(170, 160)">
    <ellipse cx="130" cy="50" rx="120" ry="25" fill="#dc2626" stroke="#f87171" stroke-width="2" />
    <circle cx="130" cy="30" r="14" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
    <path d="M 10,50 Q 130,220 250,50 Z" fill="#b91c1c" stroke="#dc2626" stroke-width="2.5" />
    <!-- Handles -->
    <rect x="0" y="45" width="20" height="15" rx="6" fill="#7f1d1d" />
    <rect x="240" y="45" width="20" height="15" rx="6" fill="#7f1d1d" />
  </g>
', 'Cast Iron Dutch Oven 6-Quart', 'Heavy-Duty Enameled Cast Iron • Oven Safe 500°F • Gloss Red', '#ef4444', 'GOURMET COOKWARE');

// Clean Code Book
$svgs['book.svg'] = buildSvg('
  <g transform="translate(185, 110)">
    <polygon points="20,20 35,5 35,275 20,290" fill="#1d4ed8" stroke="#1e40af" stroke-width="1.5" />
    <rect x="35" y="5" width="190" height="270" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
    <text x="130" y="80" font-family="sans-serif" font-size="18" font-weight="900" fill="#38bdf8" text-anchor="middle">CLEAN CODE</text>
    <text x="130" y="110" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">ARCHITECTURE</text>
    <rect x="65" y="140" width="130" height="60" rx="6" fill="#0f172a" />
    <text x="130" y="175" font-family="monospace" font-size="11" fill="#22c55e" text-anchor="middle">&lt;clean_code /&gt;</text>
  </g>
', 'Clean Code Architecture & Design', 'Software Engineering Principles • Refactoring & TDD', '#3b82f6', 'TECH BESTSELLER');

// Web Book
$svgs['web-book.svg'] = buildSvg('
  <g transform="translate(185, 110)">
    <polygon points="20,20 35,5 35,275 20,290" fill="#7c3aed" stroke="#6d28d9" stroke-width="1.5" />
    <rect x="35" y="5" width="190" height="270" rx="4" fill="#0f172a" stroke="#8b5cf6" stroke-width="2" />
    <text x="130" y="80" font-family="sans-serif" font-size="16" font-weight="900" fill="#c084fc" text-anchor="middle">FULL-STACK</text>
    <text x="130" y="105" font-family="sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">WEB ENGINEERING</text>
    <circle cx="130" cy="165" r="30" fill="none" stroke="#a855f7" stroke-width="3" stroke-dasharray="10,6" />
    <text x="130" y="170" font-family="monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">JS / PHP</text>
  </g>
', 'Full-Stack Modern Web Engineering', 'Cloud Deployments • Database Architecture • React & APIs', '#8b5cf6', 'ENGINEERING GUIDE');

// Luxury Watch
$svgs['luxury-watch.svg'] = buildSvg('
  <g transform="translate(200, 115)">
    <!-- Leather Strap -->
    <rect x="60" y="0" width="80" height="80" rx="8" fill="#78350f" />
    <rect x="60" y="240" width="80" height="80" rx="8" fill="#78350f" />
    <!-- Steel Bezel -->
    <circle cx="100" cy="160" r="75" fill="#0f172a" stroke="#cbd5e1" stroke-width="5" />
    <circle cx="100" cy="160" r="68" fill="#020617" />
    <!-- Dial markers & hands -->
    <line x1="100" y1="160" x2="100" y2="115" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" />
    <line x1="100" y1="160" x2="135" y2="160" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" />
    <line x1="100" y1="160" x2="75" y2="185" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="100" cy="160" r="4" fill="#38bdf8" />
  </g>
', 'Automatic Minimalist Sapphire Watch', '24-Jewel Japanese Automatic • Sapphire Crystal • 316L Steel', '#38bdf8', 'LUXURY TIMEPIECE');

// Backpack
$svgs['backpack.svg'] = buildSvg('
  <g transform="translate(190, 120)">
    <path d="M 40,60 Q 110,15 180,60 L 195,250 L 25,250 Z" fill="#78350f" stroke="#b45309" stroke-width="2.5" />
    <rect x="50" y="110" width="120" height="110" rx="14" fill="#451a03" stroke="#b45309" stroke-width="1.5" />
    <rect x="85" y="130" width="50" height="10" rx="3" fill="#ca8a04" />
    <path d="M 80,15 C 80,-5 140,-5 140,15" fill="none" stroke="#451a03" stroke-width="8" />
  </g>
', 'Full-Grain Leather Commuter Backpack', 'Fits 16" Laptop • Antiqued Brass • Saddle Tan Cowhide', '#b45309', 'HANDCRAFTED LEATHER');

// Sunglasses
$svgs['sunglasses.svg'] = buildSvg('
  <g transform="translate(140, 190)">
    <!-- Aviator Teardrop Shape -->
    <path d="M 30,25 Q 85,20 140,25 Q 150,95 85,100 Q 25,95 30,25 Z" fill="#0f172a" stroke="#ca8a04" stroke-width="3" />
    <path d="M 180,25 Q 235,20 290,25 Q 295,95 235,100 Q 170,95 180,25 Z" fill="#0f172a" stroke="#ca8a04" stroke-width="3" />
    <line x1="140" y1="25" x2="180" y2="25" stroke="#ca8a04" stroke-width="3" />
    <line x1="135" y1="18" x2="185" y2="18" stroke="#ca8a04" stroke-width="2" />
  </g>
', 'Polarized Aviator Sunglasses UV400', 'Grade 5 Titanium • Tri-Acetate Polarized • Glare Eliminator', '#ca8a04', 'CLASSIC AVIATOR');

// Save all SVGs to both target folders
$savedCount = 0;
foreach ($svgs as $filename => $svgData) {
    foreach ($targets as $dir) {
        file_put_contents($dir . '/' . $filename, $svgData);
    }
    $savedCount++;
}

echo "Successfully generated and saved {$savedCount} high-definition product vector SVGs into both frontend and backend directories.\n";
