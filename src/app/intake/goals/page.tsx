'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function GoalsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  }, []);

  const options = [
    'goals.option1',
    'goals.option2',
    'goals.option3',
    'goals.option4',
    'goals.option5'
  ];

  const toggleOption = (option: string) => {
    setSelected(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
    setShowError(false); // Hide error when user selects an option
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      setShowError(true);
      return;
    }
    sessionStorage.setItem('intake_goals', JSON.stringify(selected));
    router.push('/intake/obesity-stats');
  };

  // Enable Enter key navigation
  useEnterNavigation(handleContinue);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar - 1/6 progress */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[2%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo />
      
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className={`space-y-8 transition-all duration-1000 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="space-y-4">
            <h1 className="text-3xl font-medium">{t('goals.title')}</h1>
            <p className="text-gray-500">{t('goals.subtitle')}</p>
          </div>
          
          <div className="space-y-3">
            {options.map(option => (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selected.includes(option) 
                    ? 'border-[#f0feab] bg-[#f0feab]' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-3 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.includes(option)
                      ? 'bg-gray-200 border-gray-400'
                      : 'border-gray-300'
                  }`}>
                    {selected.includes(option) && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[16px] lg:text-lg font-medium leading-tight">{t(option)}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Error message */}
          {showError && (
            <div className="text-red-500 text-sm text-center">
              {t('goals.error.selectOne')}
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-900"
        >
          <span>{t('goals.continue')}</span>
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