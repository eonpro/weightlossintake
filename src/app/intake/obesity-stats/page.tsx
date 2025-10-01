'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function ObesityStatsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger container animation after a delay
    const timer = setTimeout(() => {
      setShowContainer(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    router.push('/intake/medication-preference');
  };
  
  // Enable Enter key navigation
  useEnterNavigation(handleNext);

  const handleBack = () => {
    router.push('/intake/goals');
  };

  if (!mounted) return null;

  const isSpanish = language === 'es';
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[4%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="p-4">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />

      {/* Image and Reference */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={`relative w-full max-w-md transition-all duration-1000 ease-out transform ${
          showContainer ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
        }`}>
          <Image
            src={isSpanish 
              ? "https://static.wixstatic.com/media/c49a9b_97794b4b6d264743b5eb4ccd8dc1e7a2~mv2.webp"
              : "https://static.wixstatic.com/media/c49a9b_a9abfe04c0984333bd15070af7de2a72~mv2.webp"
            }
            alt="Obesity statistics"
            width={500}
            height={600}
            className="w-3/4 md:w-full h-auto mx-auto"
            priority
          />
          
          {/* Reference Link */}
          <div className="mt-4 text-left">
            <a 
              href={isSpanish 
                ? "https://minorityhealth.hhs.gov/obesity-and-hispanic-americans?utm_source=chatgpt.com"
                : "https://www.tfah.org/story/new-national-adult-obesity-data-show-level-trend/?utm_source=chatgpt.com"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              {isSpanish 
                ? 'Fuente: Oficina de Salud de Minorías - HHS' 
                : 'Source: Trust for America\'s Health'}
            </a>
          </div>
        </div>
      </div>

      {/* Next button */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={handleNext}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-900"
        >
          <span>{isSpanish ? 'Continuar' : 'Continue'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}