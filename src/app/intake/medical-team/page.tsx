'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';
import CopyrightText from '@/components/CopyrightText';

export default function MedicalTeamPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [showContainer, setShowContainer] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContainer(true), 100);

    // Auto-advance after 4 seconds (slightly longer to read content)
    const navigationTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/common-side-effects');
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col page-fade-in">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-[90%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/safety-quality" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col px-6 lg:px-8 py-4 max-w-md lg:max-w-lg mx-auto w-full transition-all duration-1000 ease-out transform ${
        showContainer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="space-y-5">
          {/* Doctor images - 3 photos in a row */}
          <div className="flex justify-center">
            <img 
              src="https://static.wixstatic.com/media/c49a9b_9897c419e55b402395e6dbdd20fa589d~mv2.webp"
              alt={language === 'es' ? 'Equipo médico de EONMeds' : 'EONMeds Medical Team'}
              className="w-full max-w-md h-auto rounded-xl"
            />
          </div>

          {/* Title and content */}
          <div className="space-y-3">
            <h1 className="text-[26px] lg:text-[30px] font-bold text-[#413d3d] leading-tight">
              {language === 'es' 
                ? '¿Efectos secundarios? Te tenemos cubierto.'
                : 'Side effects? We\'ve got you covered.'}
            </h1>

            <p className="text-[16px] leading-snug text-[#413d3d]">
              {language === 'es'
                ? 'Nuestros médicos personalizan tu tratamiento para minimizar efectos secundarios. Las siguientes preguntas nos ayudarán a crear el mejor plan para ti.'
                : 'Our doctors personalize your treatment to minimize side effects. The following questions will help us create the best plan for you.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <CopyrightText />
      </div>
    </div>
  );
}
