#!/bin/bash

# Script to fix text wrapping in all multiple choice option pages
echo "🔄 Fixing text wrapping in multiple choice options..."

# Find and replace text-base lg:text-lg font-medium with proper mobile sizing and leading
find src/app/intake -name "*.tsx" -type f -exec grep -l "text-base lg:text-lg font-medium" {} \; | while read file; do
  echo "📝 Updating: $file"
  
  # Replace text sizing to ensure 16px on mobile and proper line height
  sed -i '' 's/text-base lg:text-lg font-medium/text-[16px] lg:text-lg font-medium leading-tight/g' "$file"
  
  # Remove any whitespace-nowrap that might prevent wrapping
  sed -i '' 's/text-\[16px\] lg:text-lg font-medium leading-tight whitespace-nowrap/text-[16px] lg:text-lg font-medium leading-tight/g' "$file"
  sed -i '' 's/text-base lg:text-lg font-medium whitespace-nowrap/text-[16px] lg:text-lg font-medium leading-tight/g' "$file"
done

echo "✅ Text wrapping fixed in all multiple choice pages"
echo ""
echo "📱 Changes made:"
echo "   • Text size: 16px on mobile (prevents iOS zoom)"
echo "   • Line height: tight (for better multi-line display)"
echo "   • Removed: whitespace-nowrap (allows text wrapping)"
echo "   • Text will now wrap within option boxes"
