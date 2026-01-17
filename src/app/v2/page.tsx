'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';

// Rating image URL
const RATING_IMAGE_URL = 'https://static.wixstatic.com/shapes/c49a9b_ea75afc771f74c108742b781ab47157d.svg';

export default function V2LandingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [mounted, setMounted] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [currentStep, setCurrentStepLocal] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger animations after mount
    setTimeout(() => setAnimate(true), 100);
    
    // Check for saved progress in localStorage
    try {
      const stored = localStorage.getItem('eon-intake-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const state = parsed.state;
        if (state && state.completedSteps && state.completedSteps.length > 0) {
          setHasProgress(true);
          setStepCount(state.completedSteps.length);
          setCurrentStepLocal(state.currentStep || null);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleStart = useCallback(async () => {
    // Dynamically import to avoid SSR issues
    const { useIntakeStore } = await import('@/store/intakeStore');
    const store = useIntakeStore.getState();
    store.resetIntake();
    store.setCurrentStep('goals');
    router.push('/v2/intake/goals');
  }, [router]);

  const handleResume = useCallback(() => {
    if (currentStep) {
      router.push(`/v2/intake/${currentStep}`);
    }
  }, [currentStep, router]);

  // Show loading state while checking localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-full h-1 bg-[#f0feab]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar - lime green on landing */}
      <div className="w-full h-1 bg-[#f0feab]" />

      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 pt-8 lg:pt-12 pb-6 max-w-md lg:max-w-2xl mx-auto w-full">
        {/* Logo - aligned with content below */}
        <EonmedsLogo inline={true} />

        {/* Nurse Image - Circular with animation */}
        <div 
          className={`mb-4 transform transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'}`}
        >
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

        {/* Title and subtitle with staggered animation */}
        <div className="text-left mb-6">
          <h1 
            className={`page-title transform transition-all duration-700 ease-out delay-150 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ color: '#4fa87f' }}
          >
            {isSpanish ? (
              <>Evaluemos tus<br />opciones de tratamiento.</>
            ) : (
              <>Let&apos;s evaluate your<br />treatment options.</>
            )}
          </h1>
          <p 
            className={`page-subtitle leading-tight transform transition-all duration-700 ease-out delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {isSpanish ? (
              <>Descubre soluciones personalizadas basadas en<br />tus objetivos, hábitos e historial médico.</>
            ) : (
              <>Discover personalized solutions based on<br />your goals, habits, and health history.</>
            )}
          </p>
        </div>

        {/* Trust section with staggered animation */}
        <div className="space-y-3">
          {/* Trusted by text */}
          <p 
            className={`text-[15px] font-medium text-[#413d3d] transform transition-all duration-700 ease-out delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {isSpanish ? 'Confiado por más de 20,000 pacientes' : 'Trusted by over 20,000 patients'}
          </p>

          {/* Patient photos */}
          <div 
            className={`flex -space-x-3 transform transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '600ms' }}
          >
            <Image
              src="https://static.wixstatic.com/media/c49a9b_eb72f3aa74474c7bb2e447a5e852a8f7~mv2.webp"
              alt="Happy patients"
              width={150}
              height={48}
              className="rounded-lg"
              priority
            />
          </div>

          {/* 5 Star rating */}
          <div 
            className={`flex items-center transform transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '700ms' }}
          >
            <Image
              src={RATING_IMAGE_URL}
              alt="Rated 4.9 based on 434 reviews"
              width={200}
              height={50}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Resume progress message */}
        {hasProgress && (
          <div className="mt-6 p-4 bg-[#f0feab]/30 rounded-xl border border-[#d4f084]">
            <p className="text-sm text-[#413d3d]">
              {isSpanish
                ? `Tienes progreso guardado (${stepCount} pasos completados). ¿Deseas continuar?`
                : `You have saved progress (${stepCount} steps completed). Would you like to continue?`}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div 
        className={`px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full space-y-3 transform transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        style={{ transitionDelay: '800ms' }}
      >
        {/* Privacy and terms text */}
        <div className="mb-4">
          <p className="text-[11px] lg:text-[13px] leading-tight" style={{ fontWeight: 450, color: 'rgba(65, 61, 61, 0.6)' }}>
            {isSpanish ? (
              <>Al hacer clic en &quot;Continuar&quot;, aceptas que EONMeds puede usar tus respuestas para personalizar tu experiencia y para otros propósitos de acuerdo con nuestra <a href="#" className="underline" style={{ color: 'rgba(65, 61, 61, 0.6)' }}>Política de Privacidad</a>. La información que proporciones se utilizará como parte de tu evaluación médica.</>
            ) : (
              <>By clicking &quot;Continue&quot;, you agree that EONMeds may use your responses to personalize your experience and for other purposes in accordance with our <a href="#" className="underline" style={{ color: 'rgba(65, 61, 61, 0.6)' }}>Privacy Policy</a>. The information you provide will be used as part of your medical evaluation.</>
            )}
          </p>
        </div>

        {hasProgress && (
          <button
            onClick={handleResume}
            className="continue-button shine-button w-full"
          >
            <span className="!text-white">{isSpanish ? 'Continuar donde dejé' : 'Continue where I left off'}</span>
            <svg className="w-4 h-4 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        <button
          onClick={handleStart}
          className={hasProgress
            ? 'w-full py-4 px-8 rounded-full text-lg font-medium bg-white border-2 border-[#413d3d] text-[#413d3d] hover:bg-gray-50 transition-all flex items-center justify-center gap-3'
            : 'continue-button shine-button w-full'
          }
        >
          <span className={hasProgress ? '' : '!text-white'}>
            {hasProgress 
              ? (isSpanish ? 'Comenzar de nuevo' : 'Start fresh') 
              : (isSpanish ? 'Comenzar' : 'Start')
            }
          </span>
          {!hasProgress && (
            <svg className="w-4 h-4 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        
        {/* Copyright */}
        <div className="mt-6 text-center" style={{ lineHeight: '1.2' }}>
          <p className="text-gray-400 font-medium">
            {isSpanish ? 'Formulario médico seguro conforme a HIPAA' : 'HIPAA-Secured Medical Intake'}
          </p>
          <p className="text-gray-400">
            {isSpanish ? (
              <>© 2026 EONPro, LLC. Todos los derechos reservados. Proceso exclusivo y protegido.</>
            ) : (
              <>© 2026 EONPro, LLC. All rights reserved. Exclusive and protected process.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
