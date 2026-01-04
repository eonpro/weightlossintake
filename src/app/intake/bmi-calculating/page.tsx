'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function BMICalculatingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [firstName, setFirstName] = useState('there');
  const hasNavigated = useRef(false);

  // Get name on mount
  useEffect(() => {
    const nameData = sessionStorage.getItem('intake_name');
    if (nameData) {
      try {
        const parsed = JSON.parse(nameData);
        setFirstName(parsed.firstName || 'there');
      } catch {
        setFirstName('there');
      }
    }
  }, []);

  // Handle animation and navigation
  useEffect(() => {
    // Navigate after animation completes (~4.5 seconds)
    const navigationTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/bmi-result');
      }
    }, 4500);

    return () => {
      clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <Link href="/intake/current-weight" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Title - Large text matching screenshot */}
          <h1 className="text-[40px] lg:text-[45px] font-bold leading-tight">
            <span className="text-gray-300">
              {language === 'es' ? 'Un momento' : 'One moment'}
            </span>{' '}
            <span className="text-[#413d3d]">{firstName}</span>
            <span className="text-gray-300">...</span>
          </h1>
          
          {/* Lottie Animation - Scale/BMI calculating animation */}
          <div className="flex justify-center">
            <div className="w-40 h-40 relative">
              <iframe
                src="https://lottie.host/embed/9ac83824-a212-4120-a230-69bb96ec0aab/DmWr5YKiHt.lottie"
                style={{ 
                  width: '160px', 
                  height: '160px',
                  border: 'none',
                  background: 'transparent'
                }}
                title="Loading animation"
              />
            </div>
          </div>
          
          {/* BMI Text - Matching screenshot styling */}
          <div className="space-y-0">
            <p className="text-[40px] lg:text-[45px] font-bold leading-tight text-gray-300">
              {language === 'es' ? 'EONPro está calculando' : 'EONPro is calculating'}
            </p>
            <p className="text-[40px] lg:text-[45px] font-bold leading-tight">
              <span className="text-gray-300">
                {language === 'es' ? 'tu ' : 'your '}
              </span>
              <span className="text-[#413d3d]">
                {language === 'es' ? 'Índice de Masa' : 'Body Mass Index'}
              </span>
            </p>
            <p className="text-[40px] lg:text-[45px] font-bold leading-tight">
              {language === 'es' ? (
                <span className="text-[#413d3d]">Corporal </span>
              ) : null}
              <span className="text-gray-300">
                ({language === 'es' ? 'IMC' : 'BMI'})
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
