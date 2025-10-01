'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function MedicalHistoryOverviewPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    router.push('/intake/sex-assigned');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/testimonials" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className="flex-1 px-6 lg:px-8 py-12 max-w-md lg:max-w-lg mx-auto w-full">
        <div className="space-y-8">
          {/* Doctor Image - Left aligned */}
          <div className="flex justify-start">
            <img 
              src="https://static.wixstatic.com/media/c49a9b_7742352092de4c8e82b9e6e10cc20719~mv2.webp"
              alt="Medical Professional"
              className="w-[6.5rem] h-[6.5rem] rounded-full object-cover"
            />
          </div>

          {/* Title */}
          <div className="text-left">
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
            <div className="absolute left-2 top-8 h-32 w-0.5 bg-gray-300"></div>
            
            {/* Timeline dot with pulsing animation */}
            <div className="absolute left-0.5 top-4">
              <div className="absolute inset-0 w-4 h-4 bg-[#4fa87f] rounded-full opacity-75 animate-ping"></div>
              <div className="relative w-4 h-4 bg-[#4fa87f] rounded-full"></div>
            </div>
            
            {/* Medical History Card */}
            <div className="ml-10 bg-[#f0feab] rounded-2xl p-6 space-y-3">
              <h2 className="text-xl font-semibold text-black">{t('medical.history.title')}</h2>
              <p className="text-base text-gray-700">
                {t('medical.history.subtitle.line1')}<br/>
                {t('medical.history.subtitle.line2')}<br/>
                {t('medical.history.subtitle.line3')}
              </p>
            </div>
            
            {/* Treatment section with gray dot */}
            <div className="relative mt-8">
              {/* Gray dot for Treatment - at the end of timeline */}
              <div className="absolute left-0.5 -top-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              </div>
              
              {/* Treatment text */}
              <div className="ml-10">
                <p className="text-lg text-gray-300">{t('medical.overview.treatment')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
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
  );
}
