'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function TirzepatideSuccessPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState('');

  const successOptions = [
    {
      id: 'very_successful',
      es: 'Muy exitosa, bajé de peso y lo mantuve',
      en: 'Very successful, I lost weight and kept it off'
    },
    {
      id: 'somewhat_successful',
      es: 'Algo exitosa, bajé de peso pero volví a subir algo',
      en: 'Somewhat successful, I lost weight but gained some back'
    },
    {
      id: 'not_successful',
      es: 'No fue exitosa, no bajé mucho de peso',
      en: "Not successful, I didn't lose much weight"
    },
    {
      id: 'hard_consistency',
      es: 'Me costó mantener la constancia',
      en: 'I had trouble maintaining consistency'
    }
  ];

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('tirzepatide_success', selected);
      router.push('/intake/dosage-satisfaction');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[86%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/tirzepatide-side-effects" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' 
              ? '¿Qué tan exitosa ha sido su experiencia con tirzepatide (Mounjaro®, Zepbound®)?'
              : 'How successful has your experience been with tirzepatide (Mounjaro®, Zepbound®)?'}
          </h1>

          <div className="space-y-3">
            {successOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`w-full p-4 text-left rounded-2xl transition-all flex items-center ${
                  selected === option.id
                    ? 'bg-[#f0feab] border-2 border-[#f0feab]'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 transition-all ${
                  selected === option.id ? 'bg-[#f0feab] border-[#f0feab]' : 'bg-white border-gray-300'
                }`}>
                  {selected === option.id && (
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-base lg:text-lg">
                  {language === 'es' ? option.es : option.en}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            selected 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright text */}
        <p className="text-[9px] lg:text-[11px] text-gray-400 text-center mt-4 leading-tight">
          {language === 'es' 
            ? '© 2025 EONPro, LLC. Todos los derechos reservados.\nProceso exclusivo y protegido. Copiar o reproducir\nsin autorización está prohibido.'
            : '© 2025 EONPro, LLC. All rights reserved.\nExclusive and protected process. Copying or reproduction\nwithout authorization is prohibited.'}
        </p>
      </div>
    </div>
  );
}
