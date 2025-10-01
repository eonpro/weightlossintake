'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function SexAssignedPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('intake_sex', selected);
      router.push('/intake/activity-level');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-1/3 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/medical-history-overview" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-medium">{t('sex.title')}</h1>
          
          {/* Description */}
          <p className="text-gray-500 font-light">
            {t('sex.subtitle')}
          </p>
          
          {/* Selection prompt */}
          <p className="text-lg font-normal mt-8">{t('sex.selectPrompt')}</p>
          
          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={() => setSelected('man')}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selected === 'man'
                  ? 'border-[#f0feab] bg-[#f0feab]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  selected === 'man'
                    ? 'border-[#f0feab] bg-[#f0feab]'
                    : 'border-gray-300'
                }`}>
                  {selected === 'man' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-base lg:text-lg font-medium">{t('sex.man')}</span>
              </div>
            </button>
            
            <button
              onClick={() => setSelected('woman')}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selected === 'woman'
                  ? 'border-[#f0feab] bg-[#f0feab]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  selected === 'woman'
                    ? 'border-[#f0feab] bg-[#f0feab]'
                    : 'border-gray-300'
                }`}>
                  {selected === 'woman' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-base lg:text-lg font-medium">{t('sex.woman')}</span>
              </div>
            </button>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-8">
            <p className="text-xs text-gray-500 leading-tight">
              {t('sex.disclaimer')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom section */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-colors ${
            selected ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>{t('sex.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] lg:text-[11px] text-gray-400 leading-tight">
            {language === 'es' ? (
              <>
                © 2025 EONPro, LLC. Todos los derechos reservados.<br/>
                Proceso exclusivo y protegido. Copiar o reproducir sin autorización está prohibido.
              </>
            ) : (
              <>
                © 2025 EONPro, LLC. All rights reserved.<br/>
                Exclusive and protected process. Copying or reproduction without authorization is prohibited.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
