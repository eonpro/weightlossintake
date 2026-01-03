'use client';

import React, { ReactNode } from 'react';

interface IntakePageLayoutProps {
  children: ReactNode;
  button: ReactNode;
  copyright?: ReactNode;
  progressBar?: ReactNode;
  backButton?: ReactNode;
}

export default function IntakePageLayout({ 
  children, 
  button, 
  copyright,
  progressBar,
  backButton 
}: IntakePageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#d2c7bb] to-[#e9e1d7] flex flex-col">
      {/* Progress bar */}
      {progressBar}
      
      {/* Back button area - extra top padding for mobile */}
      {backButton && (
        <div className="px-6 lg:px-8 pt-8 lg:pt-6">
          {backButton}
        </div>
      )}
      
      {/* Mobile Layout with fixed button */}
      <div className="lg:hidden flex flex-col flex-1">
        {/* Scrollable content area that takes remaining space */}
        <div className="flex-1 overflow-y-auto px-6 pb-40">
          <div className="py-4">
            {children}
          </div>
        </div>
        
        {/* Fixed button area at bottom with gradient */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {/* Gradient overlay */}
          <div className="h-8 bg-gradient-to-t from-[#e9e1d7] to-transparent"></div>
          {/* Button container */}
          <div className="bg-[#e9e1d7] px-6 pt-2 pb-6">
            <div className="max-w-md mx-auto">
              {button}
              {copyright && (
                <div className="mt-3">
                  {copyright}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:flex-col lg:flex-1">
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl mx-auto">
            {children}
            <div className="mt-8">
              {button}
              {copyright && (
                <div className="mt-4">
                  {copyright}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
