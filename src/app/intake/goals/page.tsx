'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';

export default function GoalsPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
        <div className="h-full w-1/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className={`space-y-8 transition-all duration-1000 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="space-y-4">
            <h1 className="text-3xl font-medium">{t('goals.title')}</h1>
            <p className="text-gray-500">{t('goals.subtitle')}</p>
          </div>
          
          <div className="space-y-4">
            {options.map(option => (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className={`w-full flex items-center p-4 rounded-2xl transition-all ${
                  selected.includes(option) 
                    ? 'bg-[#f0feab] border border-[#f0feab]' 
                    : 'bg-white border border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-5 h-5 mr-3 rounded border-2 flex items-center justify-center ${
                  selected.includes(option)
                    ? 'bg-[#4fa87f] border-[#4fa87f]'
                    : 'bg-white border-gray-400'
                }`}>
                  {selected.includes(option) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-lg text-left">{t(option)}</span>
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
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-900"
        >
          <span>{t('goals.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}