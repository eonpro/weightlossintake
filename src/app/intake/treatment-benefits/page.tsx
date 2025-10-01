'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function TreatmentBenefitsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContainer(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push('/intake/glp1-history');
  };

  const benefits = [
    {
      id: 'appetite',
      title: {
        es: 'Controla tu apetito',
        en: 'Control your appetite'
      },
      description: {
        es: 'Despídete del hambre y antojos',
        en: 'Say goodbye to hunger and cravings'
      },
      bgColor: 'bg-[#f7d06b]',
      image: 'https://static.wixstatic.com/media/c49a9b_b3c28fca89d5416a9f47ed2663230647~mv2.webp'
    },
    {
      id: 'digestion',
      title: {
        es: 'Mejor Digestión',
        en: 'Better Digestion'
      },
      description: {
        es: 'Te llenas más rápido y por más tiempo',
        en: 'Feel fuller faster and for longer'
      },
      bgColor: 'bg-[#4ea77d]',
      image: 'https://static.wixstatic.com/media/c49a9b_ea25d461f966422ca6f9a51a72b9e93b~mv2.webp'
    },
    {
      id: 'levels',
      title: {
        es: 'Niveles estables',
        en: 'Stable levels'
      },
      description: {
        es: 'Mantén tu nivel de azúcar bajo control',
        en: 'Keep your blood sugar under control'
      },
      bgColor: 'bg-[#b8e561]',
      image: 'https://static.wixstatic.com/media/c49a9b_d75d94d455584a6cb15d4faacf8011c7~mv2.webp'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[81%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/blood-pressure" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-lg mx-auto w-full transition-all duration-1000 ease-out transform ${
        showContainer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="space-y-6">
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' 
              ? 'Nuestros tratamientos te ayudan de la siguiente manera'
              : 'Our treatments help you in the following ways'}
          </h1>

          {/* Benefit cards */}
          <div className="space-y-4 md:space-y-6">
            {benefits.map((benefit) => (
              <div 
                key={benefit.id} 
                className={`${benefit.bgColor} rounded-3xl p-3 md:p-4 relative overflow-hidden min-h-[110px] md:min-h-[140px] flex items-center`}
              >
                {/* Image */}
                <img 
                  src={benefit.image}
                  alt={language === 'es' ? benefit.title.es : benefit.title.en}
                  className="absolute top-0 bottom-0 left-0 w-24 md:w-32 h-full object-cover"
                />
                
                {/* Text content */}
                <div className="pl-28 md:pl-36">
                  <h2 className="text-base md:text-lg font-semibold mb-1">
                    {language === 'es' ? benefit.title.es : benefit.title.en}
                  </h2>
                  <p className="text-xs md:text-sm leading-tight">
                    {language === 'es' ? benefit.description.es : benefit.description.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all bg-black text-white hover:bg-gray-900"
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
