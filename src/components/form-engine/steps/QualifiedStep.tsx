'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIntakeStore } from '@/store/intakeStore';
import CopyrightText from '@/components/CopyrightText';

interface QualifiedStepProps {
  basePath: string;
  prevStep: string | null;
}

export default function QualifiedStep({
  basePath,
  prevStep,
}: QualifiedStepProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const responses = useIntakeStore((state) => state.responses);
  const [firstName, setFirstName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<boolean>(false);

  const isSpanish = language === 'es';

  useEffect(() => {
    const name = responses.firstName;
    if (name) {
      setFirstName(name);
    }

    // Fire confetti after a short delay
    setTimeout(() => {
      setShowConfetti(true);
      fireConfetti();
    }, 500);
  }, [responses.firstName]);

  const fireConfetti = () => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.0/dist/confetti.browser.min.js';
    script.onload = () => {
      const confetti = (window as unknown as { confetti: (opts: unknown) => void }).confetti;
      if (confetti) {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 10,
            angle: 270,
            spread: 180,
            origin: { x: 0.5, y: 0 },
            gravity: 1.5,
            startVelocity: 30,
            colors: ['#7cb342', '#aed581', '#e8f5d9', '#4fa87f', '#66bb6a', '#81c784']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };

        frame();
      }
    };
    document.head.appendChild(script);
  };

  const handleBack = () => {
    if (prevStep) {
      router.push(`${basePath}/${prevStep}`);
    }
  };

  const handleCheckout = () => {
    // Sync V2 store data to sessionStorage for checkout compatibility
    syncToSessionStorage();
    router.push('/checkout');
  };

  const syncToSessionStorage = () => {
    // Sync all V2 store data to sessionStorage for checkout
    Object.entries(responses).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          sessionStorage.setItem(`intake_${key}`, JSON.stringify(value));
        } else {
          sessionStorage.setItem(`intake_${key}`, String(value));
        }
      }
    });
    
    // Sync specific keys for checkout
    if (responses.firstName || responses.lastName) {
      sessionStorage.setItem('intake_name', JSON.stringify({
        firstName: responses.firstName || '',
        lastName: responses.lastName || ''
      }));
    }
    if (responses.glp1_history) {
      sessionStorage.setItem('intake_glp1_history', responses.glp1_history);
    }
    if (responses.glp1_type) {
      sessionStorage.setItem('intake_glp1_type', responses.glp1_type);
    }
    if (responses.semaglutide_dosage) {
      sessionStorage.setItem('intake_semaglutide_dosage', responses.semaglutide_dosage);
    }
    if (responses.tirzepatide_dosage) {
      sessionStorage.setItem('intake_tirzepatide_dosage', responses.tirzepatide_dosage);
    }
    if (responses.dosage_satisfaction) {
      sessionStorage.setItem('intake_dosage_satisfaction', responses.dosage_satisfaction);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-full bg-[#f0feab] transition-all duration-300" />
      </div>

      {/* Back button */}
      {prevStep && (
        <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
          <button
            onClick={handleBack}
            className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        {/* Happy couple image */}
        <div className="w-56 h-48 mb-6 rounded-xl overflow-hidden">
          <img
            src="https://static.wixstatic.com/media/c49a9b_e424b9a0a7264ab3a9f667231c71a57b~mv2.webp"
            alt="Happy couple"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
            <mark style={{ backgroundColor: '#f2fdb4' }}>
              {isSpanish ? '¡Excelentes noticias' : 'Great news'} {firstName}
            </mark>{' '}
            <span>🥳</span>{' '}
            <span className="text-[#413d3d]">—</span>
            <br />
            <span className="text-[#413d3d]">
              {isSpanish
                ? <>Según tus respuestas, calificas para tratamiento con <mark style={{ backgroundColor: '#f2fdb4' }}>Semaglutida</mark> o <mark style={{ backgroundColor: '#f2fdb4' }}>Tirzepatida</mark>.</>
                : <>Based on your answers, you qualify for treatment with either <mark style={{ backgroundColor: '#f2fdb4' }}>Semaglutide</mark> or <mark style={{ backgroundColor: '#f2fdb4' }}>Tirzepatide</mark>.</>
              }
            </span>
          </h1>

          <p className="text-base text-[#413d3d]">
            {isSpanish
              ? <>Ambos son <mark style={{ backgroundColor: '#f2fdb4' }}>medicamentos GLP-1</mark> altamente efectivos clínicamente comprobados para apoyar la pérdida de peso, mejorar la salud metabólica y ayudar a controlar el apetito.</>
              : <>Both are highly effective <mark style={{ backgroundColor: '#f2fdb4' }}>GLP-1 medications</mark> clinically proven to support weight loss, improve metabolic health, and help curb appetite.</>
            }
          </p>
        </div>

        {/* Checkout button */}
        <button
          onClick={handleCheckout}
          className="shine-button w-full max-w-sm bg-[#413d3d] hover:bg-[#2a2727] py-3 px-6 rounded-full flex items-center justify-between transition-colors"
        >
          <div className="text-left leading-tight">
            <div className="font-semibold text-base text-white">
              {isSpanish ? 'Selecciona tu tratamiento' : 'Select your treatment'}
            </div>
            <div className="text-xs text-white/70">
              {isSpanish ? 'Descuentos calificados serán aplicados' : 'Qualifying discounts will be applied'}
            </div>
          </div>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12m0 0l-4-4m4 4l-4 4" />
          </svg>
        </button>
      </div>

      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50" />
      )}

      {/* Copyright */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <CopyrightText />
      </div>
    </div>
  );
}
