'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function ResearchDonePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [medicationPreference, setMedicationPreference] = useState<string | null>(null);
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);

  useEffect(() => {
    const preference = sessionStorage.getItem('medication_preference');
    setMedicationPreference(preference);
    
    // Trigger animations with staggered delays
    setTimeout(() => {
      setShowLine1(true);
    }, 300);
    
    setTimeout(() => {
      setShowLine2(true);
    }, 900);
  }, []);

  const handleNext = () => {
    router.push('/intake/consent');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[7%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/medication-preference" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-4 lg:py-8 pb-40 max-w-md lg:max-w-lg mx-auto w-full">
        <div className="space-y-4 lg:space-y-8">
          {medicationPreference === 'recommendation' ? (
            <>
              <div className="space-y-4">
                {/* Title animated in two parts */}
                <div>
                  <h1 className={`text-xl lg:text-2xl font-medium text-black leading-tight transition-all duration-800 ease-out ${
                    showLine1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                  }`}>
                    {language === 'es' ? 
                      'Lo tienes. Comenzaremos con algunas preguntas sobre ti.' : 
                      'You\'ve got it. We\'ll begin with some questions about you.'}
                  </h1>
                </div>
                
                {/* Subtitle animated */}
                <div>
                  <p className={`text-xl lg:text-2xl font-medium text-black leading-tight transition-all duration-800 ease-out ${
                    showLine2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                  }`}>
                    {language === 'es' ? 
                      'Después de eso, profundizaremos en tu historial de salud para encontrar qué opción de tratamiento coincide con tus objetivos e historial de salud.' : 
                      'After that, we\'ll dive into your health history to find which treatment option matches your goals and health history.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h1 className={`text-xl lg:text-2xl font-medium text-black leading-tight transition-all duration-800 ease-out ${
                  showLine1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}>
                  {language === 'es' ? 
                    'Bien, parece que ya has hecho tu investigación.' : 
                    'Nice, it sounds like you\'ve already done your research.'}
                </h1>
                
                <p className={`text-xl lg:text-2xl font-medium text-black leading-tight transition-all duration-800 ease-out ${
                  showLine2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}>
                  {language === 'es' ? 
                    'Sigamos adelante para encontrar qué opción de tratamiento coincide con tus objetivos e historial de salud.' : 
                    'Let\'s keep going to find which treatment option matches your goals and health history.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom button */}
      <div className="px-6 lg:px-8 pb-6 lg:pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={handleNext}
          className="continue-button"
        >
          <span className="text-white">{language === 'es' ? 'Siguiente' : 'Next'}</span>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright text */}
        <p className="copyright-text text-center mt-4">
          {language === 'es' 
            ? '© 2025 EONPro, LLC. Todos los derechos reservados.\nProceso exclusivo y protegido. Copiar o reproducir\nsin autorización está prohibido.'
            : '© 2025 EONPro, LLC. All rights reserved.\nExclusive and protected process. Copying or reproduction\nwithout authorization is prohibited.'}
        </p>
      </div>
    </div>
  );
}