'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function MentalHealthPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string>('');

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('has_mental_health_condition', selected);
      if (selected === 'yes') {
        router.push('/intake/mental-health-conditions');
      } else {
        router.push('/intake/programs-include');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[70%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/activity-level" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
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
              ? '¿Has sido diagnosticado con alguna condición de salud mental?'
              : 'Have you been diagnosed with any mental health conditions?'}
          </h1>
          
          {/* Description */}
          <p className="text-gray-500 text-base">
            {language === 'es'
              ? 'Preguntamos esto para que tu proveedor tenga una visión completa de tu historial médico y así pueda determinar el tratamiento más adecuado para ti. Por favor, asegúrate de informar cualquier condición por la que estés tomando medicinas.'
              : 'We ask this so your provider has a complete picture of your medical history and can determine the most appropriate treatment for you. Please be sure to report any conditions for which you are taking medication.'}
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
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
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
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
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
      </div>
    </div>
  );
}
