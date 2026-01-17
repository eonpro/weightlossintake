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
      
      {/* Back button area - aligned with content */}
      {backButton && (
        <div className="px-6 lg:px-8 pt-6">
          <div className="max-w-md lg:max-w-2xl mx-auto w-full">
            {backButton}
          </div>
        </div>
      )}
      
      {/* Content area */}
      <div className="flex-1 px-6 lg:px-8">
        <div className="max-w-md lg:max-w-2xl mx-auto w-full py-4">
          {children}
        </div>
      </div>
      
      {/* Button area - flows with content, not fixed */}
      <div className="px-6 lg:px-8 pt-6 pb-8">
        <div className="max-w-md lg:max-w-2xl mx-auto w-full">
          {button}
          {copyright && (
            <div className="mt-4">
              {copyright}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
