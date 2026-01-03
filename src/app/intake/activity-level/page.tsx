'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

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
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[65%] bg-[#b8e64a] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/sex-assigned" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          {/* Title */}
          <h1 className="page-title">
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
                className={`option-button w-full text-left p-4 rounded-full transition-all ${
                  selected === level.value ? 'selected' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded mr-3 mt-0.5 flex items-center justify-center flex-shrink-0 border ${
                    selected === level.value
                      ? 'bg-white/30 border-white/60'
                      : 'border-white/40'
                  }`}>
                    {selected === level.value && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-[16px] lg:text-lg font-medium leading-tight text-white">{level.label}</div>
                    {level.description && (
                      <div className="text-sm text-white/60 mt-1">{level.description}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sticky bottom button */}
      <div className="sticky-bottom-button max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!selected}
          className="continue-button"
        >
          <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
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
