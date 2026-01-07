#!/bin/bash

# iOS Build Setup Script
# This script sets up the iOS build environment for OnMyWayMobile

set -e  # Exit on error

echo "=== iOS Build Setup ==="
echo ""

# Step 1: Check Homebrew
echo "Step 1: Checking Homebrew..."
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH (for Apple Silicon Macs)
    if [ -f /opt/homebrew/bin/brew ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew is already installed"
    brew --version
fi

echo ""

# Step 2: Install CocoaPods
echo "Step 2: Installing CocoaPods via Homebrew..."
brew install cocoapods

echo ""

# Step 3: Verify CocoaPods
echo "Step 3: Verifying CocoaPods installation..."
pod --version

echo ""

# Step 4: Install iOS Pods
echo "Step 4: Installing iOS dependencies..."
cd ios
pod install
cd ..

echo ""
echo "✅ iOS build setup complete!"
echo ""
echo "To run the app in iOS Simulator, execute:"
echo "  npm run ios"
echo ""
echo "Or to specify a simulator:"
echo "  npx react-native run-ios --simulator=\"iPhone 15 Pro\""



