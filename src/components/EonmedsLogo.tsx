'use client';

import React from 'react';

interface EonmedsLogoProps {
  compact?: boolean;
  showLottie?: boolean;
}

export default function EonmedsLogo({ compact = false, showLottie = true }: EonmedsLogoProps) {
  // Use same max-width constraint as content to ensure alignment
  const maxWidthClass = compact ? 'max-w-md lg:max-w-lg' : 'max-w-md lg:max-w-2xl';

  return (
    <div className={`px-6 lg:px-8 mb-4 ${maxWidthClass} mx-auto w-full`}>
      <div className="flex items-center justify-between">
        <img
          src="https://static.wixstatic.com/shapes/c49a9b_a0bd04a723284392ac265f9e53628dd6.svg"
          alt="EONMeds"
          className="h-7 w-auto"
        />
        {showLottie && (
          <div className="w-[70px] h-[70px] overflow-hidden">
            <iframe
              src="https://lottie.host/embed/9c7564a3-b6ee-4e8b-8b5e-14a59b28c515/3Htnjbp08p.lottie"
              style={{
                width: '70px',
                height: '70px',
                border: 'none',
                background: 'transparent',
              }}
              title="EONMeds animation"
            />
          </div>
        )}
      </div>
    </div>
  );
}
