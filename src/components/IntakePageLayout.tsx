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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      {progressBar}
      
      {/* Back button area */}
      {backButton && (
        <div className="px-6 lg:px-8 pt-6">
          {backButton}
        </div>
      )}
      
      {/* Mobile Layout with fixed button */}
      <div className="lg:hidden flex flex-col flex-1">
        {/* Scrollable content area that takes remaining space */}
        <div className="flex-1 overflow-y-auto px-6 pb-32">
          <div className="py-6">
            {children}
          </div>
        </div>
        
        {/* Fixed button area at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {button}
          {copyright && (
            <div className="mt-3">
              {copyright}
            </div>
          )}
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
