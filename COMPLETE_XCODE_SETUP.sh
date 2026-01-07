#!/bin/bash

# Complete Xcode Setup Script
# Run this AFTER Xcode installation is complete

set -e

echo "=== Xcode Setup ==="
echo ""

# Step 1: Switch to Xcode
echo "Step 1: Switching to Xcode..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

echo ""

# Step 2: Accept license
echo "Step 2: Accepting Xcode license..."
sudo xcodebuild -license accept

echo ""

# Step 3: Install iOS dependencies
echo "Step 3: Installing iOS dependencies..."
cd "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile/ios"
eval "$(/opt/homebrew/bin/brew shellenv)"
pod install
cd ..

echo ""
echo "✅ Xcode setup complete!"
echo ""
echo "To run the app, execute:"
echo "  cd OnMyWayMobile"
echo "  npm run ios"



