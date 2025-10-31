#!/bin/bash

# Create AutoMate Installer DMG
# This creates a professional DMG with bundled repos

set -e

echo "🏗️  Creating AutoMate Installer DMG..."
echo ""

APP_NAME="AutoMate Installer"
DMG_NAME="AutoMate-Installer"
VERSION="1.0.0"

# Step 1: Create a staging directory
echo "📦 Step 1: Creating staging directory..."
rm -rf dist-dmg
mkdir -p dist-dmg
mkdir -p dist-dmg/repos

# Step 2: Copy the app
echo "📱 Step 2: Copying app from Desktop..."
if [ -d ~/Desktop/"$APP_NAME.app" ]; then
  cp -R ~/Desktop/"$APP_NAME.app" dist-dmg/
  echo "   ✅ App copied"
else
  echo "   ⚠️  App not found on Desktop, checking build..."
  if [ -d build/"$APP_NAME.app" ]; then
    cp -R build/"$APP_NAME.app" dist-dmg/
    echo "   ✅ App copied from build"
  else
    echo "   ❌ Error: App not found!"
    exit 1
  fi
fi

# Step 3: Bundle repos (optional but recommended)
echo "📚 Step 3: Bundling GitHub repos..."
echo "   This makes the installer work offline!"
echo ""

# Clone fresh copies of repos
cd dist-dmg/repos

echo "   📥 Cloning AutoChat..."
if [ -d ~/AutoMate/autoChat ]; then
  cp -R ~/AutoMate/autoChat ./autochat
  echo "   ✅ AutoChat bundled (from local)"
else
  # Try to clone (will fail if private)
  git clone https://github.com/stevew00dy/autochat.git 2>/dev/null && echo "   ✅ AutoChat bundled" || echo "   ⚠️  AutoChat private - skipping"
fi

echo "   📥 Cloning AutoHub..."
git clone https://github.com/verygoodplugins/autohub.git 2>/dev/null && echo "   ✅ AutoHub bundled" || echo "   ⚠️  AutoHub failed - skipping"

echo "   📥 Cloning AutoMem..."
git clone https://github.com/verygoodplugins/automem.git 2>/dev/null && echo "   ✅ AutoMem bundled" || echo "   ⚠️  AutoMem failed - skipping"

cd ../..

# Count bundled repos
BUNDLED_COUNT=$(find dist-dmg/repos -maxdepth 1 -type d | wc -l | xargs)
BUNDLED_COUNT=$((BUNDLED_COUNT - 1)) # Subtract the repos dir itself

echo ""
echo "   📊 Bundled $BUNDLED_COUNT of 3 repos"

# Step 4: Embed repos into the app bundle
if [ $BUNDLED_COUNT -gt 0 ]; then
  echo "   📦 Embedding repos into app..."
  mkdir -p "dist-dmg/$APP_NAME.app/Contents/Resources/bundled-repos"
  cp -R dist-dmg/repos/* "dist-dmg/$APP_NAME.app/Contents/Resources/bundled-repos/"
  rm -rf dist-dmg/repos
  echo "   ✅ Repos embedded in app bundle"
fi

echo ""

# Step 5: Create README
echo "📝 Step 4: Creating README..."
cat > dist-dmg/README.txt << 'EOF'
AutoMate Installer v1.0.0

INSTALLATION:
1. Drag "AutoMate Installer.app" to your Applications folder (or Desktop)
2. Double-click to launch
3. Follow the on-screen instructions
4. Enter your Anthropic API key when prompted
5. Wait ~10 minutes for installation
6. Done! AutoChat will open automatically

REQUIREMENTS:
- macOS 10.13 or later
- 8GB RAM minimum
- 5GB free disk space
- Internet connection (for dependencies)

SUPPORT:
- GitHub: https://github.com/stevew00dy/automate-installer
- Issues: https://github.com/stevew00dy/automate-installer/issues

Made with ❤️ for the Mac community
EOF

echo "   ✅ README created"

# Step 6: Copy icon for DMG
echo ""
echo "🎨 Step 5: Adding icon to DMG contents..."
cp assets/icon.icns dist-dmg/.VolumeIcon.icns
echo "   ✅ Icon copied"

# Step 7: Create DMG
echo ""
echo "💿 Step 6: Creating DMG..."

# Create writable DMG first
hdiutil create -volname "$DMG_NAME" \
  -srcfolder dist-dmg \
  -ov \
  -format UDRW \
  "$DMG_NAME-temp.dmg"

# Mount it
hdiutil attach "$DMG_NAME-temp.dmg" -mountpoint /tmp/automate-dmg-build -nobrowse

# Set custom icon attribute
SetFile -a C /tmp/automate-dmg-build

# Unmount
hdiutil detach /tmp/automate-dmg-build

# Convert to compressed read-only
hdiutil convert "$DMG_NAME-temp.dmg" -format UDZO -o "$DMG_NAME.dmg"
rm "$DMG_NAME-temp.dmg"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ DMG created successfully!"
  echo ""
  
  # Get size
  SIZE=$(du -h "$DMG_NAME.dmg" | cut -f1)
  
  echo "📊 DMG Details:"
  echo "   Name: $DMG_NAME.dmg"
  echo "   Size: $SIZE"
  echo "   Bundled repos: $BUNDLED_COUNT"
  echo "   Location: $(pwd)/$DMG_NAME.dmg"
  echo ""
  
  # Move to Desktop for easy access
  mv "$DMG_NAME.dmg" ~/Desktop/
  echo "📍 Moved to: ~/Desktop/$DMG_NAME.dmg"
  echo ""
  
  echo "🎉 Done! You can now:"
  echo "   1. Double-click DMG to test"
  echo "   2. Share the DMG file with others"
  echo "   3. Upload to GitHub releases"
  echo ""
  
  # Open Finder to show it
  open ~/Desktop
else
  echo "❌ Error creating DMG"
  exit 1
fi
EOF
chmod +x scripts/create-dmg.sh && echo "✅ DMG creation script ready"
