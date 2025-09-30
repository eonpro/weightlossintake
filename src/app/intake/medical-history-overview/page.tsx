'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function MedicalHistoryOverviewPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    router.push('/intake/sex-assigned');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link href="/intake/testimonials" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Doctor Image - Green circle background */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#4fa87f] rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-medium text-black">
              {t('medical.overview.title.line1')}<br/>
              {t('medical.overview.title.line2')}
            </h1>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center space-x-3 text-gray-400">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-lg">{t('medical.overview.weightLossProfile')}</span>
          </div>

          {/* Timeline with Medical History card */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-300"></div>
            
            {/* Timeline dot */}
            <div className="absolute left-1.5 top-4 w-4 h-4 bg-[#4fa87f] rounded-full"></div>
            
            {/* Medical History Card */}
            <div className="ml-10 bg-[#f0feab] rounded-2xl p-6 space-y-3">
              <h2 className="text-xl font-semibold text-black">{t('medical.history.title')}</h2>
              <p className="text-base text-gray-700">
                {t('medical.history.subtitle.line1')}<br/>
                {t('medical.history.subtitle.line2')}<br/>
                {t('medical.history.subtitle.line3')}
              </p>
            </div>
            
            {/* Treatment text */}
            <div className="ml-10 mt-12">
              <p className="text-lg text-gray-300">{t('medical.overview.treatment')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-8">
        <div className="max-w-md mx-auto w-full">
          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="w-full bg-black text-white py-4 rounded-full text-lg font-medium hover:bg-gray-900 transition-colors"
          >
            {t('medical.overview.continue')}
          </button>
          
          {/* Copyright text */}
          <p className="text-xs text-gray-400 text-center mt-4">
            {t('medical.overview.copyright.line1')}<br/>
            {t('medical.overview.copyright.line2')}<br/>
            {t('medical.overview.copyright.line3')}
          </p>
        </div>
      </div>
    </div>
  );
}
