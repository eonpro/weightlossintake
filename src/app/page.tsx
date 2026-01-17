'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import EonmedsLogo from '@/components/EonmedsLogo';
import ViewportAwareLayout from '@/components/ViewportAwareLayout';

// Dynamic import to avoid SSR issues
const IntroLottie = dynamic(() => import('@/components/IntroLottie'), {
  ssr: false
});

// Rating image URL
const RATING_IMAGE_URL = 'https://static.wixstatic.com/shapes/c49a9b_ea75afc771f74c108742b781ab47157d.svg';

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true); // Always start with intro showing
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle navigation to goals page
  const handleContinue = () => {
    // Track Privacy Policy acceptance from landing page
    sessionStorage.setItem('privacy_policy_accepted', 'true');
    sessionStorage.setItem('privacy_policy_accepted_at', new Date().toISOString());
    router.push('/intake/goals');
  };

  // Enable Enter key navigation when not showing intro
  useEnterNavigation(handleContinue, showIntro);

  useEffect(() => {
    setMounted(true);

    // Always show intro for 3 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShowIntro(false);
      }, 500);
    }, 3000); // 3 seconds duration

    return () => clearTimeout(timer);
  }, []);

  // Show intro animation if needed (either not mounted yet or showIntro is true)
  if (!mounted || showIntro) {
    return (
      <div className={`min-h-screen bg-white flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-center">
          <IntroLottie />
        </div>
      </div>
    );
  }

  // Progress bar component
  const progressBar = <div className="w-full h-1 bg-[#f0feab]"></div>;

  // Logo component - use inline mode since ViewportAwareLayout handles the container
  const logo = <EonmedsLogo inline />;

  // Button with disclaimers
  const buttonWithDisclaimer = (
    <>
      {/* Privacy and terms text - closer to button */}
      <div className="mb-4">
        <p className="text-[11px] lg:text-[13px] leading-tight" style={{ fontWeight: 450, color: 'rgba(65, 61, 61, 0.6)' }}>
          {t('landing.disclaimer1')}
          <a href="#" className="underline" style={{ color: 'rgba(65, 61, 61, 0.6)' }}>{t('landing.disclaimer.privacy')}</a>
          {t('landing.disclaimer1.end')}
        </p>
      </div>

      <button
        onClick={handleContinue}
        className="continue-button shine-button">
        <span className="!text-white">{t('landing.button.start')}</span>
        <svg className="w-4 h-4 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      {/* Copyright footer - matching other pages */}
      <div className="mt-6 text-center">
        <p className="copyright-text">
          © 2026 EONPro, LLC. All rights reserved.<br/>
          Exclusive and protected process. Copying or reproduction without authorization is prohibited.
        </p>
      </div>
    </>
  );

  return (
    <ViewportAwareLayout
      progressBar={progressBar}
      logo={logo}
      button={buttonWithDisclaimer}
      compactMode={true}
    >
      {/* Nurse Image - Circular */}
      <div className="mb-4">
        <div className="w-32 h-32 rounded-full overflow-hidden relative">
          <Image
            src="https://static.wixstatic.com/media/c49a9b_3505f05c6c774d748c2e20f178e7c917~mv2.png"
            alt="Healthcare professional"
            fill
            sizes="128px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Title and subtitle */}
      <div className="text-left">
        <h1 className="page-title" style={{ color: '#4fa87f' }}>
          {language === 'es' ? (
            <>Evaluemos tus<br />opciones de tratamiento.</>
          ) : (
            <>Let&apos;s evaluate your<br />treatment options.</>
          )}
        </h1>
        <p className="page-subtitle">
          {language === 'es' ? (
            <>Descubre soluciones personalizadas basadas en<br />tus objetivos, hábitos e historial médico.</>
          ) : (
            <>Discover personalized solutions based on<br />your goals, habits, and health history.</>
          )}
        </p>
      </div>

      {/* Trust section */}
      <div className="mt-6 space-y-3">
        {/* Trusted by text */}
        <p className="text-[15px] font-medium text-[#413d3d]">
          {language === 'es' ? 'Confiado por más de 20,000 pacientes' : 'Trusted by over 20,000 patients'}
        </p>

        {/* Patient photos */}
        <div className="flex -space-x-3">
          <Image
            src="https://static.wixstatic.com/media/c49a9b_eb72f3aa74474c7bb2e447a5e852a8f7~mv2.webp"
            alt="Happy patients"
            width={150}
            height={48}
            className="rounded-lg"
            priority
          />
        </div>

        {/* 5 Star rating with "rated 4.3 on 5" badge */}
        <div className="flex items-center">
          <Image
            src={RATING_IMAGE_URL}
            alt="Rated 4.3 based on 5 stars"
            width={200}
            height={50}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </ViewportAwareLayout>
  );
}