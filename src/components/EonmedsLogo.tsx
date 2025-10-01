'use client';

import React from 'react';

interface EonmedsLogoProps {
  compact?: boolean;
}

export default function EonmedsLogo({ compact = false }: EonmedsLogoProps) {
  return (
    <div className={`px-6 lg:px-8 mb-6 max-w-md ${compact ? 'lg:max-w-lg' : 'lg:max-w-2xl'} mx-auto w-full`}>
      <img 
        src="https://static.wixstatic.com/media/c49a9b_60568a55413d471ba85d995d7da0d0f2~mv2.png"
        alt="EONMeds"
        className="h-8 w-auto opacity-30"
        style={{
          filter: 'brightness(0) saturate(100%) invert(75%) sepia(5%) saturate(200%) hue-rotate(0deg) brightness(95%) contrast(86%)'
        }}
      />
    </div>
  );
}
