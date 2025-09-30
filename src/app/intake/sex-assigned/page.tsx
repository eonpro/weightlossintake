'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function SexAssignedPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('intake_sex', selected);
      router.push('/intake/medical-conditions'); // Update this to the next page
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-1/3 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link href="/intake/medical-history-overview" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
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
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelected('man')}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === 'man' ? 'border-[#4fa87f]' : 'border-gray-400'
              }`}>
                {selected === 'man' && (
                  <div className="w-3 h-3 rounded-full bg-[#4fa87f]"></div>
                )}
              </div>
              <span className="text-base md:text-lg">{t('sex.man')}</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelected('woman')}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === 'woman' ? 'border-[#4fa87f]' : 'border-gray-400'
              }`}>
                {selected === 'woman' && (
                  <div className="w-3 h-3 rounded-full bg-[#4fa87f]"></div>
                )}
              </div>
              <span className="text-base md:text-lg">{t('sex.woman')}</span>
            </label>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('sex.disclaimer')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom section */}
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
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
      </div>
    </div>
  );
}
