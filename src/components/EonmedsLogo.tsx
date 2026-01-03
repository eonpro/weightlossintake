'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface EonmedsLogoProps {
  compact?: boolean;
  showLottie?: boolean;
}

export default function EonmedsLogo({ compact = false, showLottie = true }: EonmedsLogoProps) {
  return (
    <div className={`px-6 lg:px-8 mb-4 max-w-md ${compact ? 'lg:max-w-lg' : 'lg:max-w-2xl'} mx-auto w-full`}>
      <div className="flex items-center justify-between">
        <img 
          src="https://static.wixstatic.com/shapes/c49a9b_a0bd04a723284392ac265f9e53628dd6.svg"
          alt="EONMeds"
          className="h-7 w-auto"
        />
        {showLottie && (
          <div className="w-10 h-10">
            <DotLottieReact
              src="https://lottie.host/9c7564a3-b6ee-4e8b-8b5e-14a59b28c515/3Htnjbp08p.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
