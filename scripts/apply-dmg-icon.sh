#!/bin/bash

# Apply custom icon to DMG file

DMG_FILE="$HOME/Desktop/AutoMate-Installer.dmg"
ICON_FILE="$(pwd)/assets/icon.icns"

if [ ! -f "$DMG_FILE" ]; then
    echo "❌ DMG not found: $DMG_FILE"
    exit 1
fi

if [ ! -f "$ICON_FILE" ]; then
    echo "❌ Icon not found: $ICON_FILE"
    exit 1
fi

echo "🎨 Applying robot icon to DMG..."

# Mount the DMG
hdiutil attach "$DMG_FILE" -mountpoint /tmp/automate-dmg -nobrowse

# Copy icon to mounted volume
cp "$ICON_FILE" /tmp/automate-dmg/.VolumeIcon.icns

# Set custom icon attribute
SetFile -a C /tmp/automate-dmg

# Unmount
hdiutil detach /tmp/automate-dmg

echo "✅ Robot icon applied to DMG!"
echo "🔄 Refresh Finder to see it..."

# Refresh Finder
killall Finder

sleep 2
echo "✅ Done! The DMG should now show the robot icon! 🤖"
