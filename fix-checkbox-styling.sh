#!/bin/bash

# Script to fix checkbox styling in all multiple choice pages
echo "🔄 Fixing checkbox styling in multiple choice options..."

# Find all files with multiple choice checkboxes
find src/app/intake -name "*.tsx" -type f | while read file; do
  # Check if file contains the checkbox pattern
  if grep -q "w-5 h-5.*rounded border-2.*flex items-center justify-center" "$file"; then
    echo "📝 Updating: $file"
    
    # Replace checkbox styling to use gray background when selected
    # First pattern: for selected state with bg-[#f0feab] border-[#f0feab]
    sed -i '' 's/? '\''bg-\[#f0feab\] border-\[#f0feab\]'\''/? '\''bg-gray-200 border-gray-400'\''/g' "$file"
    
    # Alternative pattern that might exist
    sed -i '' 's/'\''bg-\[#f0feab\] border-\[#f0feab\]'\'' :/'\''bg-gray-200 border-gray-400'\'' :/g' "$file"
    
    # Fix the checkbox size to be consistent (use flex-shrink-0)
    sed -i '' 's/\(w-5 h-5.*rounded border-2.*flex items-center justify-center\)/\1 flex-shrink-0/g' "$file"
    
    # Remove duplicate flex-shrink-0 if it exists
    sed -i '' 's/flex-shrink-0 flex-shrink-0/flex-shrink-0/g' "$file"
  fi
done

echo "✅ Checkbox styling fixed!"
echo ""
echo "📱 Changes made:"
echo "   • Checkbox background: Gray when selected (not yellow)"
echo "   • Better contrast with yellow container"
echo "   • Fixed size with flex-shrink-0"
echo "   • Consistent square shape"
