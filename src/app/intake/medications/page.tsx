'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function MedicationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null);

  // Auto-advance on selection
  const handleSelect = (option: 'yes' | 'no') => {
    setSelected(option);
    sessionStorage.setItem('taking_medications', option);

    // Navigate after brief delay for visual feedback
    setTimeout(() => {
      if (option === 'yes') {
        router.push('/intake/medications-selection');
      } else {
        router.push('/intake/allergies');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[85%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <Link href="/intake/digestive-conditions" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          <h1 className="page-title">
            {language === 'es' 
              ? '¿Estás tomando algún medicamento o suplemento actualmente?'
              : 'Are you currently taking any medications or supplements?'}
          </h1>
          
          {/* Yes/No Options - auto-advance on selection */}
          <div className="space-y-3">
            <button
              onClick={() => handleSelect('yes')}
              className={`option-button w-full text-left p-4 rounded-full transition-all ${
                selected === 'yes' ? 'selected' : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center flex-shrink-0 border ${
                  selected === 'yes'
                    ? 'bg-white/30 border-white/60'
                    : 'border-white/40'
                }`}>
                  {selected === 'yes' && (
                    <svg className="w-3 h-3 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[16px] lg:text-lg font-medium leading-tight">
                  {language === 'es' ? 'Sí' : 'Yes'}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => handleSelect('no')}
              className={`option-button w-full text-left p-4 rounded-full transition-all ${
                selected === 'no' ? 'selected' : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center flex-shrink-0 border ${
                  selected === 'no'
                    ? 'bg-white/30 border-white/60'
                    : 'border-white/40'
                }`}>
                  {selected === 'no' && (
                    <svg className="w-3 h-3 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[16px] lg:text-lg font-medium leading-tight">
                  {language === 'es' ? 'No' : 'No'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Copyright footer */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <p className="copyright-text text-center">
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
  );
}
