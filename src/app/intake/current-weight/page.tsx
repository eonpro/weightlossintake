'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function CurrentWeightPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentWeight, setCurrentWeight] = useState('');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('3');

  const handleContinue = () => {
    if (currentWeight && feet && inches !== '') {
      sessionStorage.setItem('intake_current_weight', currentWeight);
      sessionStorage.setItem('intake_height', JSON.stringify({ feet, inches }));
      
      // Navigate to BMI calculation page
      router.push('/intake/bmi-calculating');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-3/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/intake/ideal-weight" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          {/* Current Weight */}
          <div className="space-y-4">
            <h2 className="text-3xl font-medium">{t('currentWeight.title')}</h2>
            <p className="text-gray-500 font-light">{t('currentWeight.subtitle')}</p>
            
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder=""
                value={currentWeight}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setCurrentWeight(value);
                }}
                className="w-full p-4 pr-12 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-light">{t('common.lbs')}</span>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-4">
            <h2 className="text-3xl font-medium">{t('currentWeight.heightTitle')}</h2>
            
            <div className="space-y-3">
              {/* Feet dropdown */}
              <div className="relative">
                <select
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  className="w-full p-4 pr-12 text-lg font-medium border border-gray-300 rounded-2xl appearance-none focus:outline-none focus:border-gray-400 bg-white"
                >
                  <option value="" disabled>{t('common.feet')}</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Inches dropdown */}
              <div className="relative">
                <select
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  className="w-full p-4 pr-12 text-lg font-medium border border-gray-300 rounded-2xl appearance-none focus:outline-none focus:border-gray-400 bg-white"
                >
                  <option value="" disabled>{t('common.inches')}</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inch => (
                    <option key={inch} value={inch}>{inch}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full space-y-8">
        <button 
          onClick={handleContinue}
          disabled={!currentWeight}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            currentWeight 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>{t('currentWeight.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
