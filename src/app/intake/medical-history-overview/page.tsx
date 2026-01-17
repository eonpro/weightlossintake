'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function MedicalHistoryOverviewPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const hasNavigated = useRef(false);
  
  // Animation states
  const [showDoctor, setShowDoctor] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showStep1, setShowStep1] = useState(false);
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);

  // Staggered animation triggers
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowDoctor(true), 100),
      setTimeout(() => setShowTitle(true), 300),
      setTimeout(() => setShowStep1(true), 500),
      setTimeout(() => setShowStep2(true), 700),
      setTimeout(() => setShowStep3(true), 900),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Auto-advance after 3 seconds (increased to allow animations)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/sex-assigned');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinue = () => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.push('/intake/sex-assigned');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <Link href="/intake/testimonials" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo with Lottie */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className="flex-1 px-6 lg:px-8 py-8 max-w-md lg:max-w-lg mx-auto w-full">
        <div className="space-y-8">
          {/* Doctor Image - Animated */}
          <div 
            className={`flex justify-start transition-all duration-700 ease-out ${
              showDoctor 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-90'
            }`}
          >
            <img 
              src="https://static.wixstatic.com/media/c49a9b_7742352092de4c8e82b9e6e10cc20719~mv2.webp"
              alt="Medical Professional"
              className="w-[6.5rem] h-[6.5rem] object-contain"
            />
          </div>

          {/* Title - Animated */}
          <div 
            className={`text-left transition-all duration-700 ease-out delay-100 ${
              showTitle 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="page-title">
              {t('medical.overview.title.line1')}<br/>
              {t('medical.overview.title.line2')}
            </h1>
          </div>

          {/* Timeline Progress - Animated */}
          <div className="relative">
            {/* Vertical timeline line - animated growth */}
            <div 
              className={`absolute left-[11px] top-3 w-[2px] bg-gradient-to-b from-gray-300 via-[#4fa87f] to-gray-200 transition-all duration-1000 ease-out ${
                showStep3 ? 'bottom-3' : 'bottom-full'
              }`}
            ></div>
            
            {/* Step 1: Weight Loss Profile - COMPLETED */}
            <div 
              className={`relative flex items-center gap-4 pb-6 transition-all duration-500 ease-out ${
                showStep1 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}
            >
              {/* Checkmark circle */}
              <div className="relative z-10 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {/* Step text */}
              <span className="text-lg text-gray-400">{t('medical.overview.weightLossProfile')}</span>
            </div>
            
            {/* Step 2: Medical History - CURRENT */}
            <div 
              className={`relative flex items-start gap-4 pb-6 transition-all duration-500 ease-out ${
                showStep2 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}
            >
              {/* Green pulsing dot */}
              <div className="relative z-10 mt-5">
                <div className="absolute inset-0 w-6 h-6 bg-[#4fa87f] rounded-full opacity-40 animate-ping"></div>
                <div className="absolute inset-[-4px] w-[34px] h-[34px] bg-[#4fa87f]/20 rounded-full animate-pulse"></div>
                <div className="relative w-6 h-6 bg-[#4fa87f] rounded-full shadow-lg shadow-[#4fa87f]/30"></div>
              </div>
              {/* Medical History Card */}
              <div className="flex-1 bg-[#f0feab] rounded-2xl p-5 shadow-lg shadow-[#f0feab]/30 transform hover:scale-[1.02] transition-transform">
                <h2 className="text-lg font-semibold text-[#413d3d] mb-1">{t('medical.history.title')}</h2>
                <p className="text-sm text-[#413d3d]/70 leading-snug">
                  {t('medical.history.subtitle.line1')} {t('medical.history.subtitle.line2')} {t('medical.history.subtitle.line3')}
                </p>
              </div>
            </div>
            
            {/* Step 3: Treatment - PENDING */}
            <div 
              className={`relative flex items-center gap-4 transition-all duration-500 ease-out ${
                showStep3 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}
            >
              {/* Gray circle */}
              <div className="relative z-10 w-6 h-6 bg-white border-2 border-gray-200 rounded-full shadow-sm"></div>
              {/* Step text */}
              <span className="text-lg text-gray-300">{t('medical.overview.treatment')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        {/* Copyright text */}
        <p className="copyright-text text-center mt-4">
          {t('medical.overview.copyright.line1')}<br/>
          {t('medical.overview.copyright.line2')}<br/>
          {t('medical.overview.copyright.line3')}
        </p>
      </div>

    </div>
  );
}