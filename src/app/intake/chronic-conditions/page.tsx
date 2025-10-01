'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function ChronicConditionsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string>('');

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('has_chronic_conditions', selected);
      if (selected === 'yes') {
        router.push('/intake/chronic-conditions-detail');
      } else {
        router.push('/intake/medications');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[80%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/programs-include" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' 
              ? '¿Tienes alguna condición médica o enfermedad crónica?'
              : 'Do you have any medical conditions or chronic diseases?'}
          </h1>
          
          {/* Description */}
          <p className="text-gray-500 text-base">
            {language === 'es'
              ? 'Esto ayuda a tu proveedor a tener una visión completa de tu historial médico. Incluye cualquier condición que afecte tu presión arterial, corazón, riñones (incluyendo cálculos renales) o hígado, así como enfermedades como diabetes, colesterol alto, accidente cerebrovascular, cáncer o gota.'
              : 'This helps your provider get a complete picture of your medical history. Include any conditions that affect your blood pressure, heart, kidneys (including kidney stones) or liver, as well as diseases such as diabetes, high cholesterol, stroke, cancer, or gout.'}
          </p>
          
          {/* Options */}
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
                <span className="text-base lg:text-lg font-medium">
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
                <span className="text-base lg:text-lg font-medium">
                  {language === 'es' ? 'No' : 'No'}
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
