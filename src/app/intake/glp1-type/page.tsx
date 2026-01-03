'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function GLP1TypePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState('');

  const medications = [
    {
      id: 'liraglutide',
      es: 'Liraglutida inyectable',
      en: 'Injectable liraglutide',
      subLabel: {
        es: 'Victoza, Saxenda',
        en: 'Victoza, Saxenda'
      }
    },
    {
      id: 'semaglutide',
      es: 'Semaglutida inyectable',
      en: 'Injectable semaglutide',
      subLabel: {
        es: 'Ozempic, Wegovy o compuesta',
        en: 'Ozempic, Wegovy or compounded'
      }
    },
    {
      id: 'tirzepatide',
      es: 'Tirzepatida inyectable',
      en: 'Injectable tirzepatide',
      subLabel: {
        es: 'Mounjaro, Zepbound o compuesta',
        en: 'Mounjaro, Zepbound or compounded'
      }
    },
    {
      id: 'oral_glp1',
      es: 'Medicamento GLP-1 Oral',
      en: 'Oral GLP-1 Medication',
      subLabel: null
    },
    {
      id: 'other',
      es: 'Otro medicamento',
      en: 'Other medication',
      subLabel: null
    }
  ];

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('glp1_type', selected);
      
      // Navigate based on selection
      if (selected === 'semaglutide') {
        router.push('/intake/semaglutide-dosage');
      } else if (selected === 'tirzepatide') {
        router.push('/intake/tirzepatide-dosage');
      } else {
        // For other medications, skip to digestive conditions
        router.push('/intake/dosage-satisfaction');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[83%] bg-[#b8e64a] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/glp1-history" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
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
          <h1 className="page-title">
            {language === 'es' 
              ? '¿Qué medicamento GLP-1 tomaste o estás tomando actualmente?'
              : 'Which GLP-1 medication did you take or are you currently taking?'}
          </h1>

          <div className="space-y-3">
            {medications.map((med) => (
              <button
                key={med.id}
                onClick={() => setSelected(med.id)}
                className={`option-button w-full p-4 text-left rounded-full transition-all flex items-center ${
                  selected === med.id ? 'selected' : ''
                }`}
              >
                <div className={`w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center mr-3 transition-all ${
                  selected === med.id ? 'bg-white/30 border-white/60' : 'border-white/40'
                }`}>
                  {selected === med.id && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-base lg:text-lg block text-white">
                    {language === 'es' ? med.es : med.en}
                  </span>
                  {med.subLabel && (
                    <span className="text-sm text-white/60">
                      ({language === 'es' ? med.subLabel.es : med.subLabel.en})
                    </span>
                  )}
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
