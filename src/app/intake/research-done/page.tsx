'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

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
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[12%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link href="/intake/medication-preference" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <div className="px-6 pt-6 max-w-md mx-auto w-full">
        <img 
          src="https://static.wixstatic.com/media/c49a9b_60568a55413d471ba85d995d7da0d0f2~mv2.png"
          alt="EONMeds"
          className="h-8 w-auto"
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          {medicationPreference === 'recommendation' ? (
            <>
              <div className="space-y-8">
                {/* Title animated in two parts */}
                <div>
                  <h1 className={`text-2xl font-medium text-gray-800 leading-relaxed transition-all duration-800 ease-out ${
                    showLine1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                  }`}>
                    {language === 'es' ? 'Perfecto. Comenzaremos con algunas preguntas sobre ti.' : 'Perfect. We\'ll start with some questions about you.'}
                  </h1>
                </div>
                
                {/* Subtitle animated */}
                <div>
                  <p className={`text-2xl font-medium text-gray-800 leading-relaxed transition-all duration-800 ease-out ${
                    showLine2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                  }`}>
                    {language === 'es' ? 
                      'Después de eso, revisaremos tu historial médico para encontrar la opción de tratamiento que coincida con tus objetivos e historial de salud.' : 
                      'After that, we\'ll review your medical history to find the treatment option that matches your goals and health history.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <h1 className={`text-2xl font-medium text-gray-800 leading-relaxed transition-all duration-800 ease-out ${
                  showLine1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}>
                  {t('research.title.haveinmind')}
                </h1>
                
                <p className={`text-2xl font-medium text-gray-800 leading-relaxed transition-all duration-800 ease-out ${
                  showLine2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}>
                  {t('research.subtitle.haveinmind')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom button */}
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleNext}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors"
        >
          <span>{t('research.next')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}