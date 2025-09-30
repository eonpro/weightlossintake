'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';

// Dynamic import to avoid SSR issues
const IntroLottie = dynamic(() => import('@/components/IntroLottie'), {
  ssr: false
});

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true); // Always start with intro showing
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Handle navigation to goals page
  const handleContinue = () => {
    router.push('/intake/goals');
  };
  
  // Enable Enter key navigation when not showing intro
  useEnterNavigation(handleContinue, showIntro);

  useEffect(() => {
    setMounted(true);
    
    // Always show intro for 3 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShowIntro(false);
      }, 500);
    }, 3000); // 3 seconds duration
    
    return () => clearTimeout(timer);
  }, []);

  // Show intro animation if needed (either not mounted yet or showIntro is true)
  if (!mounted || showIntro) {
    return (
      <div className={`min-h-screen bg-white flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-center">
          <IntroLottie />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Yellow progress bar at top */}
      <div className="w-full h-1 bg-[#f0feab]"></div>
      
      {/* Main content - single container with consistent width */}
      <div className="flex-1 flex flex-col items-center justify-between">
        <div className="w-full max-w-md px-6 mx-auto">
          {/* Title and subtitle */}
          <div className="text-left pt-16 mb-12">
            <h1 className="text-4xl font-medium text-[#4fa87f] leading-tight mb-4">
              {t('landing.title.line1')}<br/>
              {t('landing.title.line2')}
            </h1>
            <p className="text-lg text-black font-normal leading-tight">
              {t('landing.subtitle.line1')}<br/>
              {t('landing.subtitle.line2')}
            </p>
          </div>
          
          {/* Spacer */}
          <div className="h-8"></div>
          
          {/* Privacy and terms text - same width as everything else */}
          <div className="space-y-5">
            <p className="text-xs text-gray-600 leading-snug">
              {t('landing.disclaimer1')}
              <a href="#" className="text-[#4fa87f] underline">{t('landing.disclaimer.privacy')}</a>
              {t('landing.disclaimer1.end')}
            </p>
            
            <p className="text-xs text-gray-600 leading-snug">
              {t('landing.disclaimer2.start')}
              <a href="#" className="text-[#4fa87f] underline">{t('landing.disclaimer.terms')}</a>
              {t('landing.disclaimer2.end')}
            </p>
          </div>
        </div>
        
        {/* Bottom button - same container width */}
        <div className="w-full max-w-md px-6 mx-auto pb-10">
          <button 
            onClick={handleContinue}
            className="w-full bg-black text-white py-4 rounded-full text-base font-medium flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors">
            <span>{t('landing.button.start')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}