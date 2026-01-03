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
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[2%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <Link href="/" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <h1 className="page-title">{t('goals.title')}</h1>
            <p className="page-subtitle">{t('goals.subtitle')}</p>
          </div>
          
          <div className="space-y-3">
            {options.map(option => (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className={`option-button w-full text-left p-4 rounded-full transition-all ${
                  selected.includes(option) ? 'selected' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-3 rounded flex items-center justify-center flex-shrink-0 border ${
                    selected.includes(option)
                      ? 'bg-white border-[#413d3d]'
                      : 'border-[#413d3d]/40 bg-transparent'
                  }`}>
                    {selected.includes(option) && (
                      <svg className="w-3 h-3 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
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
            <div className="text-red-300 text-sm text-center">
              {t('goals.error.selectOne')}
            </div>
          )}
        </div>
      </div>
      
      {/* Sticky bottom button */}
      <div className="sticky-bottom-button max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="continue-button"
        >
          <span>{t('goals.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <p className="copyright-text">
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