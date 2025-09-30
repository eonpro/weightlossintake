'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function IdealWeightPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [idealWeight, setIdealWeight] = useState('');

  const handleContinue = () => {
    if (idealWeight) {
      sessionStorage.setItem('intake_ideal_weight', idealWeight);
      router.push('/intake/current-weight');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-2/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/intake/address" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          <h1 className="text-3xl font-medium">{t('idealWeight.title')}</h1>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{t('idealWeight.subtitle')}</p>
            
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder=""
                value={idealWeight}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setIdealWeight(value);
                }}
                className="w-full p-4 pr-12 text-base md:text-lg font-medium text-left border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">{t('common.lbs')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!idealWeight}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            idealWeight 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>{t('idealWeight.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
