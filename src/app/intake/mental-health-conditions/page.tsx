'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';
import { useTranslation } from '@/hooks/useTranslation';

export default function MentalHealthConditionsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);

  const conditions = language === 'es' ? [
    { value: 'none', label: 'No, nunca.' },
    { value: 'depression', label: 'Depresión' },
    { value: 'bipolar', label: 'Trastorno bipolar' },
    { value: 'bpd', label: 'Trastorno límite de personalidad', subtext: '(TLP)' },
    { value: 'panic', label: 'Ataques de pánico' },
    { value: 'schizophrenia', label: 'Esquizofrenia' },
    { value: 'psychosis', label: 'Psicosis' }
  ] : [
    { value: 'none', label: 'No, never.' },
    { value: 'depression', label: 'Depression' },
    { value: 'bipolar', label: 'Bipolar disorder' },
    { value: 'bpd', label: 'Borderline personality disorder', subtext: '(BPD)' },
    { value: 'panic', label: 'Panic attacks' },
    { value: 'schizophrenia', label: 'Schizophrenia' },
    { value: 'psychosis', label: 'Psychosis' }
  ];

  const toggleCondition = (value: string) => {
    if (value === 'none') {
      setSelected(['none']);
    } else {
      if (selected.includes('none')) {
        setSelected([value]);
      } else {
        setSelected(prev => 
          prev.includes(value) 
            ? prev.filter(c => c !== value)
            : [...prev, value]
        );
      }
    }
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      sessionStorage.setItem('mental_health_conditions', JSON.stringify(selected));
      router.push('/intake/programs-include');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[72%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/mental-health" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
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
              ? '¿Has sido diagnosticado con alguno de los siguientes?'
              : 'Have you been diagnosed with any of the following?'}
          </h1>
          
          {/* Description */}
          <p className="text-gray-500 text-base">
            {language === 'es'
              ? 'Preguntamos esto porque algunas de estas condiciones pueden influir en el tipo de tratamiento más adecuado para ti.'
              : 'We ask this because some of these conditions may influence the type of treatment that is most appropriate for you.'}
          </p>
          
          {/* Options */}
          <div className="space-y-3">
            {conditions.map((condition) => (
              <button
                key={condition.value}
                onClick={() => toggleCondition(condition.value)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selected.includes(condition.value)
                    ? 'border-[#f0feab] bg-[#f0feab]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                    selected.includes(condition.value)
                      ? 'border-[#f0feab] bg-[#f0feab]'
                      : 'border-gray-300'
                  }`}>
                    {selected.includes(condition.value) && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-[16px] lg:text-lg font-medium leading-tight">{condition.label}</span>
                    {condition.subtext && (
                      <div className="text-sm text-gray-500 mt-0.5">{condition.subtext}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Continue button */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={selected.length === 0}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            selected.length > 0
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
