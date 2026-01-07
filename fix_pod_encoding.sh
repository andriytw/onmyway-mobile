#!/bin/bash

# Fix encoding issues for pod install
# This script fixes the hermes-engine.podspec encoding issue

set -e

cd "$(dirname "$0")"

echo "Fixing hermes-engine.podspec encoding..."

# Read file as binary and write as UTF-8
ruby -e "
content = File.binread('node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec')
# Force UTF-8 encoding
content = content.force_encoding('UTF-8')
# Remove BOM if present
content = content.sub(/^\xEF\xBB\xBF/, '')
# Ensure it's valid UTF-8
content = content.encode('UTF-8', invalid: :replace, undef: :replace)
File.binwrite('node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec', content)
"

echo "✅ Fixed encoding"

echo ""
echo "Now run: cd ios && pod install"



