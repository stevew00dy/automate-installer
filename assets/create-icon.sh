#!/bin/bash

# Create a robot icon for AutoMate Installer
# This creates an .icns file from an emoji/image

echo "🤖 Creating robot icon..."

# Create a simple SVG robot icon
cat > /tmp/robot-icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Robot body (blue gradient) - NO BACKGROUND -->
  <defs>
    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#a78bfa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- NO BACKGROUND CIRCLE - transparent background -->
  
  <!-- Antenna -->
  <line x1="256" y1="120" x2="256" y2="80" stroke="url(#bodyGradient)" stroke-width="8" stroke-linecap="round"/>
  <circle cx="256" cy="70" r="12" fill="#fbbf24"/>
  
  <!-- Robot head -->
  <rect x="180" y="120" width="152" height="120" rx="20" fill="url(#headGradient)"/>
  
  <!-- Eyes -->
  <circle cx="220" cy="170" r="20" fill="#ffffff"/>
  <circle cx="292" cy="170" r="20" fill="#ffffff"/>
  <circle cx="225" cy="165" r="8" fill="#60a5fa"/>
  <circle cx="297" cy="165" r="8" fill="#60a5fa"/>
  
  <!-- Smile -->
  <path d="M 210 200 Q 256 220 302 200" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/>
  
  <!-- Robot body -->
  <rect x="160" y="250" width="192" height="180" rx="25" fill="url(#bodyGradient)"/>
  
  <!-- Chest panel -->
  <rect x="210" y="290" width="92" height="80" rx="10" fill="#ffffff" opacity="0.2"/>
  <circle cx="256" cy="320" r="15" fill="#10b981"/>
  <circle cx="256" cy="350" r="8" fill="#fbbf24"/>
  
  <!-- Arms -->
  <rect x="120" y="270" width="30" height="120" rx="15" fill="url(#bodyGradient)"/>
  <rect x="362" y="270" width="30" height="120" rx="15" fill="url(#bodyGradient)"/>
  
  <!-- Hands -->
  <circle cx="135" cy="400" r="18" fill="#a78bfa"/>
  <circle cx="377" cy="400" r="18" fill="#a78bfa"/>
  
  <!-- Legs -->
  <rect x="190" y="430" width="50" height="60" rx="10" fill="url(#bodyGradient)"/>
  <rect x="272" y="430" width="50" height="60" rx="10" fill="url(#bodyGradient)"/>
  
  <!-- Feet -->
  <ellipse cx="215" cy="485" rx="35" ry="15" fill="#8b5cf6"/>
  <ellipse cx="297" cy="485" rx="35" ry="15" fill="#8b5cf6"/>
</svg>
SVG

echo "✅ SVG created"

# Check if we have ImageMagick or use sips (built into macOS)
if command -v convert &> /dev/null; then
    echo "📐 Using ImageMagick to create icon..."
    
    # Create iconset directory
    mkdir -p /tmp/AutoMate.iconset
    
    # Generate all required sizes
    for size in 16 32 64 128 256 512; do
        convert -background none /tmp/robot-icon.svg -resize ${size}x${size} "/tmp/AutoMate.iconset/icon_${size}x${size}.png"
        if [ $size -le 256 ]; then
            size2=$((size * 2))
            convert -background none /tmp/robot-icon.svg -resize ${size2}x${size2} "/tmp/AutoMate.iconset/icon_${size}x${size}@2x.png"
        fi
    done
    
    # Create .icns file
    iconutil -c icns /tmp/AutoMate.iconset -o "$(pwd)/assets/icon.icns"
    
    echo "✅ Icon created: assets/icon.icns"
    
elif command -v sips &> /dev/null; then
    echo "📐 Using sips (macOS) to create icon..."
    echo "⚠️  Note: For best quality, install ImageMagick: brew install imagemagick"
    
    # Convert SVG to PNG first (sips needs rasterized input)
    # Use qlmanage to convert SVG to PNG
    qlmanage -t -s 1024 -o /tmp /tmp/robot-icon.svg 2>/dev/null
    
    if [ -f /tmp/robot-icon.svg.png ]; then
        # Create iconset
        mkdir -p /tmp/AutoMate.iconset
        
        # Generate all sizes
        sips -z 16 16 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_16x16.png >/dev/null 2>&1
        sips -z 32 32 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_16x16@2x.png >/dev/null 2>&1
        sips -z 32 32 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_32x32.png >/dev/null 2>&1
        sips -z 64 64 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_32x32@2x.png >/dev/null 2>&1
        sips -z 128 128 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_128x128.png >/dev/null 2>&1
        sips -z 256 256 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_128x128@2x.png >/dev/null 2>&1
        sips -z 256 256 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_256x256.png >/dev/null 2>&1
        sips -z 512 512 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_256x256@2x.png >/dev/null 2>&1
        sips -z 512 512 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_512x512.png >/dev/null 2>&1
        sips -z 1024 1024 /tmp/robot-icon.svg.png --out /tmp/AutoMate.iconset/icon_512x512@2x.png >/dev/null 2>&1
        
        # Create .icns
        iconutil -c icns /tmp/AutoMate.iconset -o "$(pwd)/assets/icon.icns"
        echo "✅ Icon created: assets/icon.icns"
    else
        echo "❌ Could not convert SVG. Install ImageMagick: brew install imagemagick"
        exit 1
    fi
else
    echo "❌ Neither ImageMagick nor sips found. Install ImageMagick: brew install imagemagick"
    exit 1
fi

# Cleanup
rm -rf /tmp/AutoMate.iconset /tmp/robot-icon.svg* 2>/dev/null

echo ""
echo "🎨 Icon created successfully!"
echo "📍 Location: $(pwd)/assets/icon.icns"
echo ""
echo "To apply to your app:"
echo "  cp assets/icon.icns ~/Desktop/AutoMate\ Installer.app/Contents/Resources/"
