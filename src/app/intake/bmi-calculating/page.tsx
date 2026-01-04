'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BMICalculatingPage() {
  const router = useRouter();
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

  // Handle navigation after delay
  useEffect(() => {
    const navigationTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/bmi-result');
      }
    }, 4000);

    return () => {
      clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top greeting - positioned at top */}
      <div className="pt-16 lg:pt-20 px-6 text-center">
        <h1 className="text-[28px] lg:text-[32px] font-medium leading-tight">
          <span className="text-gray-400">
            {language === 'es' ? 'Un momento' : 'One moment'}
          </span>{' '}
          <span className="text-[#413d3d] font-bold">{firstName}</span>
          <span className="text-[#413d3d] font-bold">...</span>
        </h1>
      </div>

      {/* Center content - Lottie and text */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Lottie Animation - Scale with fire icon */}
          <div className="flex justify-center mb-12">
            <div className="w-48 h-48 lg:w-56 lg:h-56 relative">
              <iframe
                src="https://lottie.host/embed/8d60540b-e634-4247-9b7b-dada7087a87c/7hOThmLlIm.lottie"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'transparent'
                }}
                title="BMI calculating animation"
              />
            </div>
          </div>

          {/* BMI Text - Matching screenshot styling */}
          <div className="space-y-0">
            <p className="text-[24px] lg:text-[28px] leading-tight text-gray-400">
              {language === 'es' ? 'EONPro está calculando' : 'EONPro is calculating'}
            </p>
            <p className="text-[24px] lg:text-[28px] leading-tight">
              <span className="text-gray-400">
                {language === 'es' ? 'tu ' : 'your '}
              </span>
              <span className="text-[#413d3d] font-bold">
                {language === 'es' ? 'Índice de Masa' : 'Body Mass Index'}
              </span>
            </p>
            <p className="text-[24px] lg:text-[28px] leading-tight">
              {language === 'es' ? (
                <span className="text-[#413d3d] font-bold">Corporal </span>
              ) : null}
              <span className="text-gray-400">
                ({language === 'es' ? 'IMC' : 'BMI'})
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
