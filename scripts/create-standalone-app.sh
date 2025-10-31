#!/bin/bash

echo "🏗️ Creating standalone AutoMate Installer.app..."

APP_NAME="AutoMate Installer"
BUILD_DIR="$PWD/build-standalone"

# Clean and create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$APP_NAME.app/Contents/"{MacOS,Resources}

# Copy all installer files to Resources
echo "📦 Copying installer files..."
mkdir -p "$BUILD_DIR/$APP_NAME.app/Contents/Resources/app"
cp -r src "$BUILD_DIR/$APP_NAME.app/Contents/Resources/app/"
cp package.json "$BUILD_DIR/$APP_NAME.app/Contents/Resources/app/"
cp -r node_modules "$BUILD_DIR/$APP_NAME.app/Contents/Resources/app/" 2>/dev/null || echo "⚠️ Run npm install first"

# Create Info.plist
cat > "$BUILD_DIR/$APP_NAME.app/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>AutoMate Installer</string>
    <key>CFBundleIdentifier</key>
    <string>com.automate.installer</string>
    <key>CFBundleName</key>
    <string>AutoMate Installer</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

# Create launcher script that includes the installer
cat > "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/AutoMate Installer" << 'LAUNCHER'
#!/bin/bash

# Get the Resources directory
RESOURCES="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../Resources" && pwd )"

# Launch Electron from the app bundle
cd "$RESOURCES/app"

# Find electron binary
ELECTRON="$RESOURCES/app/node_modules/.bin/electron"

if [ ! -f "$ELECTRON" ]; then
    # Electron not found, try to use system electron or install
    if ! command -v electron &> /dev/null; then
        osascript -e 'display dialog "Electron is required but not installed.\n\nPlease install Node.js and run:\nnpm install -g electron" buttons {"OK"} default button 1 with title "AutoMate Installer" with icon stop'
        exit 1
    fi
    ELECTRON="electron"
fi

# Run the installer
"$ELECTRON" . &
LAUNCHER

# Make launcher executable
chmod +x "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/AutoMate Installer"

echo "✅ Standalone app created at: $BUILD_DIR/$APP_NAME.app"
echo "📦 Moving to Desktop..."

# Move to Desktop
rm -rf ~/Desktop/"$APP_NAME.app"
cp -r "$BUILD_DIR/$APP_NAME.app" ~/Desktop/

echo "✅ Done! App is on your Desktop"
echo "🖱️  Double-click to launch!"
