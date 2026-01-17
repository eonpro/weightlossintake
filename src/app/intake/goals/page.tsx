'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function GoalsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

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

  // Single-select with auto-advance
  const handleSelect = (option: string) => {
    setSelected(option);
    sessionStorage.setItem('intake_goals', JSON.stringify([option]));
    setTimeout(() => {
      router.push('/intake/obesity-stats');
    }, 150);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col page-fade-in">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-[2%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <Link href="/" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo />
      
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 pb-40 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className={`space-y-8 transition-all duration-1000 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="space-y-4">
            <h1 className="page-title">{t('goals.title')}</h1>
          </div>
          
          <div className="space-y-3">
            {options.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`option-button w-full text-left p-4 rounded-2xl transition-all ${
                  selected === option ? 'selected' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-3 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected === option
                      ? 'bg-[#413d3d] border-[#413d3d]'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selected === option && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[16px] lg:text-lg leading-tight">{t(option)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Copyright footer */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="text-center">
          <p className="copyright-text">
            {language === 'es' ? (
              <>
                © 2026 EONPro, LLC. Todos los derechos reservados.<br/>
                Proceso exclusivo y protegido. Copiar o reproducir sin autorización está prohibido.
              </>
            ) : (
              <>
                © 2026 EONPro, LLC. All rights reserved.<br/>
                Exclusive and protected process. Copying or reproduction without authorization is prohibited.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
