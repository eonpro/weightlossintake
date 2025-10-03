'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function DigestiveConditionsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const conditions = isSpanish ? [
    { id: 'ibs', label: 'SII (Síndrome del Intestino Irritable)' },
    { id: 'celiac', label: 'Celiaquía' },
    { id: 'constipation', label: 'Estreñimiento crónico' },
    { id: 'heartburn', label: 'Acidez estomacal' },
    { id: 'gerd', label: 'ERGE o reflujo ácido' },
    { id: 'diverticulitis', label: 'Diverticulitis' },
    { id: 'crohns', label: 'Enfermedad de Crohn' },
    { id: 'colitis', label: 'Colitis ulcerosa' },
    { id: 'fatigue', label: 'Fatiga o bajos niveles de energía' },
    { id: 'none', label: 'No, ninguno de estos' }
  ] : [
    { id: 'ibs', label: 'IBS (Irritable Bowel Syndrome)' },
    { id: 'celiac', label: 'Celiac' },
    { id: 'constipation', label: 'Chronic constipation' },
    { id: 'heartburn', label: 'Heartburn' },
    { id: 'gerd', label: 'GERD or acid reflux' },
    { id: 'diverticulitis', label: 'Diverticulitis' },
    { id: 'crohns', label: 'Crohn\'s disease' },
    { id: 'colitis', label: 'Ulcerative Colitis' },
    { id: 'fatigue', label: 'Fatigue or low energy levels' },
    { id: 'none', label: 'No, none of these' }
  ];

  const handleConditionToggle = (conditionId: string) => {
    if (conditionId === 'none') {
      setSelectedConditions(selectedConditions.includes('none') ? [] : ['none']);
    } else {
      if (selectedConditions.includes('none')) {
        setSelectedConditions([conditionId]);
      } else {
        setSelectedConditions(prev => 
          prev.includes(conditionId)
            ? prev.filter(id => id !== conditionId)
            : [...prev, conditionId]
        );
      }
    }
  };

  const handleContinue = () => {
    sessionStorage.setItem('digestive_conditions', JSON.stringify(selectedConditions));
    router.push('/intake/medications');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[87%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/chronic-conditions-detail" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo />

      {/* Main Content */}
      <div className="flex-1 px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-left">
            <h1 className="text-3xl font-medium text-black">
              {isSpanish 
                ? '¿Has sido diagnosticado con alguna de las siguientes condiciones?'
                : 'Have you been diagnosed with any of the following conditions?'}
            </h1>
          </div>

          {/* Conditions List */}
          <div className="space-y-3">
            {conditions.map((condition) => (
              <button
                key={condition.id}
                onClick={() => handleConditionToggle(condition.id)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${
                  selectedConditions.includes(condition.id)
                    ? 'bg-gray-200 border-gray-400'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                    selectedConditions.includes(condition.id)
                      ? 'bg-gray-200 border-gray-400'
                      : 'bg-white border-gray-300'
                  }`}>
                    {selectedConditions.includes(condition.id) && (
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-base lg:text-lg">{condition.label}</span>
                </div>
                <div></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={selectedConditions.length === 0}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            selectedConditions.length > 0
              ? 'bg-black text-white hover:bg-gray-900'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{isSpanish ? 'Continuar' : 'Continue'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright text */}
        <p className="text-[9px] lg:text-[11px] text-gray-400 text-center mt-4 leading-tight">
          {isSpanish ? (
            <>© 2025 EONPro, LLC. Todos los derechos reservados.<br/>
            Proceso exclusivo y protegido. Copiar o reproducir<br/>
            sin autorización está prohibido.</>
          ) : (
            <>© 2025 EONPro, LLC. All rights reserved.<br/>
            Exclusive and protected process. Copying or reproduction<br/>
            without authorization is prohibited.</>
          )}
        </p>
      </div>
    </div>
  );
}
