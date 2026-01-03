'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function BloodPressurePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState('');

  const bloodPressureOptions = [
    { 
      id: 'normal', 
      es: 'Menos de 120 / Menos de 80', 
      en: 'Less than 120 / Less than 80',
      subLabel: { es: 'Normal', en: 'Normal' }
    },
    { 
      id: 'elevated', 
      es: '120-129 / Menos de 80', 
      en: '120-129 / Less than 80',
      subLabel: { es: 'Elevada', en: 'Elevated' }
    },
    { 
      id: 'high_stage1', 
      es: '130-139 / 80-89', 
      en: '130-139 / 80-89',
      subLabel: { es: 'Presión Alta – Etapa 1', en: 'High Blood Pressure – Stage 1' }
    },
    { 
      id: 'high_stage2', 
      es: '140 o más / 90 o más', 
      en: '140 or higher / 90 or higher',
      subLabel: { es: 'Presión Alta – Etapa 2', en: 'High Blood Pressure – Stage 2' }
    },
    { 
      id: 'crisis', 
      es: 'Más de 180 / Más de 120', 
      en: 'Higher than 180 / Higher than 120',
      subLabel: { es: 'Crisis hipertensiva', en: 'Hypertensive crisis' }
    },
    { 
      id: 'unknown', 
      es: 'No lo sé', 
      en: "I don't know",
      subLabel: null
    },
    { 
      id: 'not_measured', 
      es: 'No me la he medido recientemente', 
      en: "I haven't measured it recently",
      subLabel: null
    }
  ];

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('blood_pressure', selected);
      router.push('/intake/treatment-benefits');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#d2c7bb] to-[#e9e1d7] flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[80%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/surgery" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 pb-40 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-medium leading-tight mb-2">
              {language === 'es' 
                ? '¿Cuál fue su lectura de presión arterial más reciente?'
                : 'What was your most recent blood pressure reading?'}
            </h1>
            <p className="text-gray-500">
              {language === 'es'
                ? '(Si la conoce, seleccione la opción más cercana.)'
                : '(If you know it, select the closest option.)'}
            </p>
          </div>

          <div className="space-y-3">
            {bloodPressureOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`w-full p-4 text-left rounded-2xl transition-all flex items-center ${
                  selected === option.id
                    ? 'bg-[#f0feab] border-2 border-[#f0feab]'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center mr-3 transition-all ${
                  selected === option.id ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
                }`}>
                  {selected === option.id && (
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-base lg:text-lg block">
                    {language === 'es' ? option.es : option.en}
                  </span>
                  {option.subLabel && (
                    <span className="text-sm text-gray-500">
                      ({language === 'es' ? option.subLabel.es : option.subLabel.en})
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
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
            ? '© 2025 EONPro, LLC. Todos los derechos reservados. Proceso exclusivo y protegido. Prohibida su copia o reproducción sin autorización.'
            : '© 2025 EONPro, LLC. All rights reserved. Exclusive and protected process. Copying or reproduction without authorization is prohibited.'}
        </p>
      </div>
    </div>
  );
}
