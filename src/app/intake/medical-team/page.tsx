'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function MedicalTeamPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContainer(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push('/intake/common-side-effects');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[90%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/safety-quality" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
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
          {/* Doctor images */}
          <div className="flex justify-center">
            <img 
              src="https://static.wixstatic.com/media/c49a9b_e3b5b1388aab4fb4b005bf6f54a54df4~mv2.webp"
              alt={language === 'es' ? 'Equipo médico' : 'Medical team'}
              className="w-full max-w-md h-auto rounded-2xl"
            />
          </div>

          {/* Title and content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-medium leading-tight text-[#4ea77d]">
              {language === 'es' 
                ? 'Mensaje de nuestro equipo médico'
                : 'Message from our medical team'}
            </h1>

            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                {language === 'es'
                  ? 'Si bien los medicamentos para perder peso son altamente efectivos, es común experimentar efectos secundarios como náuseas.'
                  : 'While weight loss medications are highly effective, it\'s common to experience side effects like nausea.'}
              </p>

              <p>
                {language === 'es'
                  ? 'En EONMeds, un médico licenciado puede personalizar tu plan de tratamiento para ayudarte a alcanzar tus objetivos sin tener que lidiar con esos efectos.'
                  : 'At EONMeds, a licensed physician can customize your treatment plan to help you achieve your goals without having to deal with those effects.'}
              </p>

              <p>
                {language === 'es'
                  ? 'Las siguientes preguntas permitirán a tu proveedor determinar el mejor enfoque clínico para ti.'
                  : 'The following questions will allow your provider to determine the best clinical approach for you.'}
              </p>
            </div>
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
