#!/bin/bash

# Fix checkbox styling to be consistent across all pages
# Changes:
# 1. Make checkboxes perfect squares (w-5 h-5 flex-shrink-0)
# 2. Change selected state from yellow to light gray background
# 3. Ensure consistent styling

echo "🔧 Fixing checkbox styling across all intake pages..."

# List of files to update (excluding pages that are already fixed)
FILES=(
  "src/app/intake/glp1-type/page.tsx"
  "src/app/intake/semaglutide-success/page.tsx"
  "src/app/intake/tirzepatide-success/page.tsx"
  "src/app/intake/glp1-history/page.tsx"
  "src/app/intake/blood-pressure/page.tsx"
  "src/app/intake/common-side-effects/page.tsx"
  "src/app/intake/dosage-satisfaction/page.tsx"
  "src/app/intake/personalized-treatment/page.tsx"
  "src/app/intake/semaglutide-side-effects/page.tsx"
  "src/app/intake/surgery-details/page.tsx"
  "src/app/intake/health-improvements/page.tsx"
  "src/app/intake/tirzepatide-dosage/page.tsx"
  "src/app/intake/surgery/page.tsx"
  "src/app/intake/alcohol-consumption/page.tsx"
  "src/app/intake/referral-source/page.tsx"
  "src/app/intake/tirzepatide-side-effects/page.tsx"
  "src/app/intake/semaglutide-dosage/page.tsx"
  "src/app/intake/weight-loss-history/page.tsx"
  "src/app/intake/recreational-drugs/page.tsx"
  "src/app/intake/weight-loss-support/page.tsx"
  "src/app/intake/dosage-interest/page.tsx"
  "src/app/intake/digestive-conditions/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating: $file"
    
    # First, fix checkbox dimensions - change w-6 h-6 to w-5 h-5 flex-shrink-0
    sed -i '' 's/w-6 h-6 rounded border-2/w-5 h-5 flex-shrink-0 rounded border-2/g' "$file"
    
    # Also fix if it's written differently
    sed -i '' 's/w-6 h-6 border-2 rounded/w-5 h-5 flex-shrink-0 border-2 rounded/g' "$file"
    
    # Fix selected state background colors - change yellow to gray
    sed -i '' "s/bg-\[#f0feab\] border-\[#f0feab\]/bg-gray-200 border-gray-400/g" "$file"
    
    # Also fix the ternary condition for selected state
    sed -i '' "s/'bg-\[#f0feab\] border-\[#f0feab\]'/'bg-gray-200 border-gray-400'/g" "$file"
    
    # Fix checkmark size if needed
    sed -i '' 's/w-4 h-4 text-black/w-3 h-3 text-black/g' "$file"
  fi
done

# Handle contact-info page separately as it might have different structure
if [ -f "src/app/intake/contact-info/page.tsx" ]; then
  echo "Updating: src/app/intake/contact-info/page.tsx"
  
  # Fix checkbox styling in contact-info page
  sed -i '' "s/bg-\[#f0feab\] border-\[#f0feab\]/bg-gray-200 border-gray-400/g" "src/app/intake/contact-info/page.tsx"
  sed -i '' "s/'bg-\[#f0feab\] border-\[#f0feab\]'/'bg-gray-200 border-gray-400'/g" "src/app/intake/contact-info/page.tsx"
fi

echo "✅ Checkbox styling fixed across all pages!"
echo ""
echo "Changes made:"
echo "1. ✅ Checkboxes are now perfect squares (w-5 h-5)"
echo "2. ✅ Added flex-shrink-0 to maintain square shape"
echo "3. ✅ Selected state now shows light gray background (bg-gray-200)"
echo "4. ✅ Selected border is now gray (border-gray-400)"
echo "5. ✅ Checkmarks are appropriately sized (w-3 h-3)"
