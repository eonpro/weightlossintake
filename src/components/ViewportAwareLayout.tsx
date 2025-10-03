'use client';

import React, { ReactNode, useEffect, useState } from 'react';

interface ViewportAwareLayoutProps {
  children: ReactNode;
  button: ReactNode;
  copyright?: ReactNode;
  progressBar?: ReactNode;
  backButton?: ReactNode;
  logo?: ReactNode;
  compactMode?: boolean; // For pages with minimal content
}

export default function ViewportAwareLayout({ 
  children, 
  button, 
  copyright,
  progressBar,
  backButton,
  logo,
  compactMode = false
}: ViewportAwareLayoutProps) {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      // Get actual viewport height (accounts for browser chrome on mobile)
      const vh = window.innerHeight;
      setViewportHeight(vh);
      
      // Detect small devices (iPhone SE, older phones)
      // Less than 700px height is considered small
      setIsSmallDevice(vh < 700);
      
      // Set CSS custom property for true viewport height
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };

    // Initial call
    updateViewport();

    // Update on resize and orientation change
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    
    // Also listen for visual viewport changes (keyboard, etc)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
    };
  }, []);

  // Calculate dynamic spacing based on viewport height
  const getSpacingClass = () => {
    if (!viewportHeight) return '';
    
    if (viewportHeight < 600) {
      // Very small devices (iPhone SE landscape, etc)
      return 'spacing-xs';
    } else if (viewportHeight < 700) {
      // Small devices (iPhone SE, iPhone 8, older Androids)
      return 'spacing-sm';
    } else if (viewportHeight < 800) {
      // Medium devices (iPhone 12/13/14, most Androids)
      return 'spacing-md';
    } else {
      // Large devices (iPhone Pro Max, tablets)
      return 'spacing-lg';
    }
  };

  const spacingClass = getSpacingClass();

  // Dynamic styles based on viewport height
  const dynamicStyles = viewportHeight ? {
    contentPadding: isSmallDevice ? 'py-2' : 'py-3',
    titleSpacing: isSmallDevice ? 'mb-3' : 'mb-6',
    elementSpacing: isSmallDevice ? 'space-y-3' : 'space-y-4',
    buttonPadding: isSmallDevice ? 'pt-2 pb-3' : 'pt-3 pb-4',
    scrollPadding: isSmallDevice ? 140 : 160,
    gradientHeight: isSmallDevice ? 'h-8' : 'h-16',
    copyrightMargin: isSmallDevice ? 'mt-2' : 'mt-3',
    logoMargin: isSmallDevice ? 'mt-2' : 'mt-4',
    backButtonPadding: isSmallDevice ? 'pt-3' : 'pt-6'
  } : {
    contentPadding: 'py-3',
    titleSpacing: 'mb-6',
    elementSpacing: 'space-y-4',
    buttonPadding: 'pt-3 pb-4',
    scrollPadding: 160,
    gradientHeight: 'h-16',
    copyrightMargin: 'mt-3',
    logoMargin: 'mt-4',
    backButtonPadding: 'pt-6'
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ minHeight: viewportHeight ? `${viewportHeight}px` : '100vh' }}>
      {/* Progress bar */}
      {progressBar}
      
      {/* Back button area - dynamically sized */}
      {backButton && (
        <div className={`px-6 lg:px-8 ${dynamicStyles.backButtonPadding}`}>
          {backButton}
        </div>
      )}
      
      {/* Logo if provided */}
      {logo && (
        <div className={dynamicStyles.logoMargin}>
          {logo}
        </div>
      )}
      
      {/* Mobile Layout with smart spacing */}
      <div className="lg:hidden flex flex-col flex-1">
        {/* Content area that adapts to available space */}
        <div 
          className="flex-1 overflow-y-auto px-6"
          style={{ paddingBottom: `${dynamicStyles.scrollPadding}px` }}
        >
          <div className={`${dynamicStyles.contentPadding} ${dynamicStyles.elementSpacing}`}>
            {/* Apply title spacing class if in compact mode */}
            {compactMode ? (
              <div className={dynamicStyles.titleSpacing}>
                {children}
              </div>
            ) : (
              children
            )}
          </div>
        </div>
        
        {/* Fixed button area - height adapts to device */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          {/* Gradient overlay */}
          <div className={`absolute bottom-full w-full bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none ${dynamicStyles.gradientHeight}`}></div>
          
          {/* Button container with dynamic padding */}
          <div className={`bg-white px-6 ${dynamicStyles.buttonPadding} safe-area-bottom`}>
            {button}
            {copyright && (
              <div className={dynamicStyles.copyrightMargin}>
                {copyright}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Desktop Layout - unchanged */}
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