'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function SafetyQualityPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContainer(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push('/intake/medical-team');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[89%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/alcohol-consumption" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
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
        <div className="bg-[#e5fbab] rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-medium leading-tight mb-2">
              {language === 'es' 
                ? 'Comprometidos con la seguridad y la máxima calidad en cada paso.'
                : 'Committed to safety and the highest quality at every step.'}
            </h1>
            <h2 className="text-xl text-[#4ea77d] font-medium mb-3">
              {language === 'es' ? 'seguridad' : 'safety'}
            </h2>
            <h2 className="text-xl text-[#4ea77d] font-medium mb-4">
              {language === 'es' ? 'calidad' : 'quality'}
            </h2>
          </div>

          <p className="text-gray-700 leading-relaxed">
            {language === 'es'
              ? 'EONMeds colabora con algunas de las mejores farmacias 503A licenciadas del país para elaborar tratamientos personalizados y seguros para ti.'
              : 'EONMeds collaborates with some of the best 503A licensed pharmacies in the country to develop personalized and safe treatments for you.'}
          </p>

          {/* Image */}
          <div className="rounded-2xl overflow-hidden">
            <img 
              src="https://static.wixstatic.com/media/c49a9b_08d4b9a9d0394b3a83c2284def597b09~mv2.webp"
              alt={language === 'es' ? 'Farmacia de calidad' : 'Quality pharmacy'}
              className="w-full h-auto"
            />
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
