'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function MENPersonalPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('personal_men', selected);
      router.push('/intake/pancreatitis-personal');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[93%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/thyroid-cancer-personal" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-medium leading-tight">
              {language === 'es' 
                ? '¿Tienes antecedentes personales de neoplasia endocrina múltiple tipo 2?'
                : 'Do you have a personal history of multiple endocrine neoplasia type 2?'}
            </h1>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              {language === 'es'
                ? 'Explicación: La neoplasia endocrina múltiple tipo 2 (MEN 2) es un síndrome genético raro que hace que ciertas glándulas del cuerpo produzcan demasiadas hormonas o desarrollen tumores (neoplasias). Es hereditario, lo que significa que se transmite de padres a hijos a través de los genes.'
                : 'Explanation: Multiple endocrine neoplasia type 2 (MEN 2) is a rare genetic syndrome that causes certain glands in the body to produce too many hormones or develop tumors (neoplasias). It is hereditary, meaning it is transmitted from parents to children through genes.'}
            </p>
          </div>
          
          {/* Yes/No options */}
          <div className="space-y-3">
            <button
              onClick={() => setSelected('yes')}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selected === 'yes'
                  ? 'border-[#f0feab] bg-[#f0feab]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  selected === 'yes'
                    ? 'border-[#f0feab] bg-[#f0feab]'
                    : 'border-gray-300'
                }`}>
                  {selected === 'yes' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[16px] lg:text-lg font-medium leading-tight">
                  {language === 'es' ? 'Sí' : 'Yes'}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setSelected('no')}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selected === 'no'
                  ? 'border-[#f0feab] bg-[#f0feab]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  selected === 'no'
                    ? 'border-[#f0feab] bg-[#f0feab]'
                    : 'border-gray-300'
                }`}>
                  {selected === 'no' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[16px] lg:text-lg font-medium leading-tight">
                  No
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Continue button */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-colors ${
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
