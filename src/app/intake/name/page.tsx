'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';

export default function NamePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleContinue = () => {
    if (firstName && lastName) {
      sessionStorage.setItem('intake_name', JSON.stringify({ firstName, lastName }));
      router.push('/intake/dob');
    }
  };
  
  // Enable Enter key navigation
  useEnterNavigation(handleContinue);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-4/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/intake/state" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-medium">{t('name.title')}</h1>
            <p className="text-gray-500">{t('name.subtitle')}</p>
          </div>
          
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">{t('name.basicInfo')}</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t('name.firstName')}
                value={firstName}
                onChange={(e) => {
                  const value = e.target.value;
                  // Capitalize first letter, lowercase the rest
                  if (value.length > 0) {
                    const formatted = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                    setFirstName(formatted);
                  } else {
                    setFirstName('');
                  }
                }}
                className="w-full p-4 text-lg font-medium border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
              />
              <input
                type="text"
                placeholder={t('name.lastName')}
                value={lastName}
                onChange={(e) => {
                  const value = e.target.value;
                  // Capitalize first letter, lowercase the rest
                  if (value.length > 0) {
                    const formatted = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                    setLastName(formatted);
                  } else {
                    setLastName('');
                  }
                }}
                className="w-full p-4 text-lg font-medium border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!firstName || !lastName}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            firstName && lastName 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{t('name.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}