'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function ActivityLevelPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string>('');

  const activityLevels = [
    {
      value: '5',
      label: language === 'es' ? '5 - Muy Activo' : '5 - Very Active',
      description: language === 'es' 
        ? 'Ejercicio 5 a 7 veces por semana' 
        : 'Exercise 5 to 7 times per week'
    },
    {
      value: '4',
      label: '4',
      description: ''
    },
    {
      value: '3',
      label: language === 'es' ? '3 - Moderadamente Activo' : '3 - Moderately Active',
      description: language === 'es'
        ? 'Ejercicio 3 a 4 veces por semana'
        : 'Exercise 3 to 4 times per week'
    },
    {
      value: '2',
      label: '2',
      description: ''
    },
    {
      value: '1',
      label: language === 'es' ? '1 - No soy muy activo' : '1 - Not very active',
      description: language === 'es'
        ? 'Usualmente no hago ejercicio'
        : 'Usually don\'t exercise'
    }
  ];

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('activity_level', selected);
      router.push('/intake/mental-health');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[65%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link href="/intake/sex-assigned" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          {/* Title */}
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' 
              ? '¿Cuál es tu nivel habitual de actividad física diaria?'
              : 'What is your usual level of daily physical activity?'}
          </h1>
          
          {/* Options */}
          <div className="space-y-3">
            {activityLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelected(level.value)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selected === level.value
                    ? 'border-[#f0feab] bg-[#f0feab]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                    selected === level.value
                      ? 'border-[#f0feab] bg-[#f0feab]'
                      : 'border-gray-300'
                  }`}>
                    {selected === level.value && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-medium">{level.label}</div>
                    {level.description && (
                      <div className="text-sm text-gray-500 mt-1">{level.description}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Continue button */}
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            selected 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
