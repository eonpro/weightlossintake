'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function SupportInfoPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const hasNavigated = useRef(false);

  // Staggered animation states
  const [showCard, setShowCard] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    // Staggered animations
    const timers = [
      setTimeout(() => setShowCard(true), 100),
      setTimeout(() => setShowTitle(true), 300),
      setTimeout(() => setShowLogo(true), 500),
      setTimeout(() => setShowText(true), 700),
      setTimeout(() => setShowImage(true), 900),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Auto-advance after 3.5 seconds (more time to see animations)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/address');
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[18%] bg-[#f0feab] transition-all duration-300"></div>
      </div>

      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/contact-info" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>

      {/* EONMeds Logo */}
      <EonmedsLogo />

      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 pb-40 max-w-md lg:max-w-lg mx-auto w-full">
        {/* Main card with staggered content */}
        <div className={`bg-[#f0feab] rounded-3xl p-5 pb-0 overflow-hidden transition-all duration-700 ease-out ${
          showCard ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-90'
        }`}>

          {/* "Did you know that" - animated */}
          <h2 className={`text-[24px] lg:text-[26px] font-semibold text-[#413d3d] mb-0 transition-all duration-500 ease-out ${
            showTitle ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {language === 'es' ? '¿Sabías que' : 'Did you know that'}
          </h2>

          {/* EONMeds logo - animated */}
          <div className={`flex justify-start mb-1 transition-all duration-500 ease-out ${
            showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <img
              src="https://static.wixstatic.com/media/c49a9b_60568a55413d471ba85d995d7da0d0f2~mv2.png"
              alt="EONMeds"
              className="h-12 w-auto"
            />
          </div>

          {/* Main text - animated */}
          <div className={`space-y-1 transition-all duration-500 ease-out ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <h3 className="text-[20px] lg:text-[22px] font-semibold text-[#413d3d] leading-snug">
              {language === 'es'
                ? 'Te asigna un representante para guiarte y apoyarte en cada paso del camino.'
                : 'Assigns a representative to your case to guide and support you every step of the way.'}
            </h3>

            <p className="text-[15px] text-[#413d3d]/70 leading-tight">
              {language === 'es'
                ? 'Sabemos que las cosas pueden ser confusas a veces, por eso estamos aquí para guiarte y apoyarte.'
                : "We know things can sometimes be confusing, which is why we're here to guide and support you."}
            </p>
          </div>

          {/* Customer Service Representative Image - animated slide up */}
          <div className={`flex justify-center mt-4 -mx-5 transition-all duration-700 ease-out ${
            showImage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <img
              src="https://static.wixstatic.com/media/c49a9b_2c49b136f5ec49c787b37346cca7f47b~mv2.webp"
              alt="Customer Service Representative"
              className="w-full max-w-sm h-auto object-contain"
            />
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <p className="copyright-text text-center">
          {language === 'es' ? (
            <>© 2026 EONPro, LLC. Todos los derechos reservados.<br/>Proceso exclusivo y protegido.</>
          ) : (
            <>© 2026 EONPro, LLC. All rights reserved.<br/>Exclusive and protected process.</>
          )}
        </p>
      </div>

    </div>
  );
}
