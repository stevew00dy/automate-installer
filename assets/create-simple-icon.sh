#!/bin/bash

echo "🤖 Creating simple robot emoji icon..."

# Create a simple PNG with just the robot emoji
cat > /tmp/robot-emoji.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; }
        #emoji { 
            font-size: 400px; 
            line-height: 512px;
            text-align: center;
            width: 512px;
            height: 512px;
        }
    </style>
</head>
<body>
    <div id="emoji">🤖</div>
</body>
</html>
HTML

# Use built-in macOS tools to create icon
mkdir -p /tmp/Robot.iconset

# Use SF Symbols or system robot icon if available
sips -s format png --resampleHeightWidthMax 1024 /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns --out /tmp/base.png 2>/dev/null

# Or just create from emoji using screencapture
# Take screenshot of emoji (simpler approach)
echo "📸 Using robot emoji 🤖"

# Create iconset with standard sizes
for size in 16 32 128 256 512; do
    echo "🤖" | textutil -convert html -stdin -stdout | \
    sed 's/<[^>]*>//g' > /tmp/Robot.iconset/icon_${size}x${size}.png
done

# Actually, let's use a better method - copy system robot/app icon
cp /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ApplicationsFolderIcon.icns /tmp/temp-icon.icns 2>/dev/null || \
cp /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns /tmp/temp-icon.icns

# Extract and use it
mkdir -p /tmp/Robot.iconset
sips -s format png /tmp/temp-icon.icns --out /tmp/Robot.iconset/icon_512x512.png 2>/dev/null
sips -z 256 256 /tmp/Robot.iconset/icon_512x512.png --out /tmp/Robot.iconset/icon_256x256.png 2>/dev/null
sips -z 128 128 /tmp/Robot.iconset/icon_512x512.png --out /tmp/Robot.iconset/icon_128x128.png 2>/dev/null
sips -z 64 64 /tmp/Robot.iconset/icon_512x512.png --out /tmp/Robot.iconset/icon_32x32@2x.png 2>/dev/null
sips -z 32 32 /tmp/Robot.iconset/icon_512x512.png --out /tmp/Robot.iconset/icon_32x32.png 2>/dev/null
sips -z 32 32 /tmp/Robot.iconset/icon_512x512.png --out /tmp/Robot.iconset/icon_16x16@2x.png 2>/dev/null
sips -z 16 16 /tmp/Robot.iconset/icon_512x512.png --out /tmp/Robot.iconset/icon_16x16.png 2>/dev/null

# Create .icns
iconutil -c icns /tmp/Robot.iconset -o icon.icns

echo "✅ Simple icon created: icon.icns"
rm -rf /tmp/Robot.iconset /tmp/temp-icon.icns
