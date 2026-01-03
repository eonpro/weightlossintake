'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function GLP1HistoryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState('');

  const options = [
    {
      id: 'currently_taking',
      es: 'Actualmente estoy tomando un medicamento GLP-1',
      en: 'I am currently taking a GLP-1 medication'
    },
    {
      id: 'previously_taken',
      es: 'He tomado un medicamento GLP-1 en el pasado, pero no actualmente',
      en: 'I have taken a GLP-1 medication in the past, but not currently'
    },
    {
      id: 'never_taken',
      es: 'Nunca he tomado un medicamento GLP-1',
      en: 'I have never taken a GLP-1 medication'
    }
  ];

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('glp1_history', selected);
      if (selected === 'currently_taking' || selected === 'previously_taken') {
        router.push('/intake/glp1-type');
      } else {
        router.push('/intake/dosage-satisfaction');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[82%] bg-[#b8e64a] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/treatment-benefits" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          <div>
            <h1 className="page-title mb-3">
              {language === 'es' 
                ? '¿Actualmente toma o ha tomado alguna vez un medicamento GLP-1 para perder peso?'
                : 'Do you currently take or have you ever taken a GLP-1 medication for weight loss?'}
            </h1>
            <p className="page-subtitle">
              {language === 'es'
                ? 'GLP-1s incluyen semaglutida compuesta, tirzepatida compuesta, Ozempic, Wegovy, Mounjaro o Zepbound'
                : 'GLP-1s include compounded semaglutide, compounded tirzepatide, Ozempic, Wegovy, Mounjaro or Zepbound'}
            </p>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`option-button w-full p-4 text-left rounded-full transition-all flex items-center ${
                  selected === option.id ? 'selected' : ''
                }`}
              >
                <div className={`w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center mr-3 transition-all ${
                  selected === option.id ? 'bg-white/30 border-white/60' : 'border-white/40'
                }`}>
                  {selected === option.id && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-base lg:text-lg text-white">
                  {language === 'es' ? option.es : option.en}
                </span>
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
