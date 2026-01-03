'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function HealthImprovementsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const improvements = [
    {
      id: 'better_sex',
      es: 'Mejor sexo',
      en: 'Better sex'
    },
    {
      id: 'meal_replacements',
      es: 'Reemplazos de comidas',
      en: 'Meal replacements'
    },
    {
      id: 'hair_regrowth',
      es: 'Crecimiento del cabello',
      en: 'Hair regrowth'
    },
    {
      id: 'heart_health',
      es: 'Salud del corazón',
      en: 'Heart health'
    },
    {
      id: 'nutrition_coaching',
      es: 'Asesoramiento nutricional',
      en: 'Nutrition coaching'
    },
    {
      id: 'testosterone_support',
      es: 'Soporte de testosterona',
      en: 'Testosterone support'
    },
    {
      id: 'vitamins_supplements',
      es: 'Vitaminas y suplementos',
      en: 'Vitamins & supplements'
    },
    {
      id: 'sleep',
      es: 'Sueño',
      en: 'Sleep'
    },
    {
      id: 'none',
      es: 'Ninguno de estos',
      en: 'None of these'
    }
  ];

  const handleToggle = (improvementId: string) => {
    if (improvementId === 'none') {
      setSelectedItems(selectedItems.includes('none') ? [] : ['none']);
    } else {
      if (selectedItems.includes('none')) {
        setSelectedItems([improvementId]);
      } else {
        if (selectedItems.includes(improvementId)) {
          setSelectedItems(selectedItems.filter(item => item !== improvementId));
        } else {
          setSelectedItems([...selectedItems, improvementId]);
        }
      }
    }
  };

  const handleContinue = () => {
    if (selectedItems.length > 0) {
      sessionStorage.setItem('health_improvements', JSON.stringify(selectedItems));
      router.push('/intake/review');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[96%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/referral-source" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
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
            <h1 className="text-3xl font-medium leading-tight mb-3">
              {language === 'es' 
                ? 'Aparte de perder peso, ¿hay otra área de tu salud que te gustaría mejorar?'
                : 'Aside from losing weight, is there another area of your health you\'d like to improve?'}
            </h1>
            <p className="text-gray-500">
              {language === 'es'
                ? 'Esto nos ayuda a obtener una imagen completa de tus objetivos de salud y encontrar las opciones de tratamiento adecuadas para ti.'
                : 'This helps us get a full picture of your health goals and find the right treatment options for you.'}
            </p>
          </div>

          <div className="space-y-3">
            {improvements.map((improvement) => (
              <button
                key={improvement.id}
                onClick={() => handleToggle(improvement.id)}
                className={`w-full p-4 text-left rounded-2xl transition-all flex items-center ${
                  selectedItems.includes(improvement.id)
                    ? 'bg-[#f0feab] border-2 border-[#f0feab]'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center mr-3 transition-all ${
                  selectedItems.includes(improvement.id) ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
                }`}>
                  {selectedItems.includes(improvement.id) && (
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-base lg:text-lg ${improvement.id === 'none' ? 'text-gray-400' : ''}`}>
                  {language === 'es' ? improvement.es : improvement.en}
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
          disabled={selectedItems.length === 0}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            selectedItems.length > 0
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{language === 'es' ? 'Envía tu Calificación' : 'Submit Your Qualification'}</span>
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
