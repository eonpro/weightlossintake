'use client';

import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

export default function QualifiedPage() {
  const { language } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<boolean>(false);

  useEffect(() => {
    // Get first name from session
    const nameData = sessionStorage.getItem('intake_name');
    if (nameData) {
      try {
        const parsed = JSON.parse(nameData);
        setFirstName(parsed.firstName || '');
      } catch {
        setFirstName('');
      }
    }

    // Fire confetti after a short delay
    setTimeout(() => {
      setShowConfetti(true);
      fireConfetti();
    }, 500);
  }, []);

  // Confetti function
  const fireConfetti = () => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    // Load confetti library dynamically
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
            colors: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#a55eea', '#fd9644']
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

  const handleCheckout = () => {
    // Set flag for seamless redirect
    sessionStorage.setItem('checkout_redirect_in_progress', 'true');
    window.onbeforeunload = null;
    
    // Get the intake ID if available
    const intakeId = sessionStorage.getItem('submitted_intake_id');
    let checkoutUrl = 'https://checkout.eonmeds.com';
    
    if (intakeId) {
      checkoutUrl = `https://checkout.eonmeds.com?ref=${intakeId}`;
    }
    
    window.location.replace(checkoutUrl);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-full bg-gradient-to-r from-[#4fa87f] to-[#f0feab] transition-all duration-300"></div>
      </div>

      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={() => window.history.back()}
          className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        {/* Happy couple image */}
        <div className="relative w-64 h-64 mb-6">
          <Image
            src="https://static.wixstatic.com/media/c49a9b_e424b9a0a7264ab3a9f667231c71a57b~mv2.webp"
            alt="Happy couple"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 256px, 256px"
          />
        </div>

        {/* Title with emoji */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-[#4fa87f]">
              {language === 'es' ? '¡Excelentes noticias' : 'Great news'} {firstName}
            </span>{' '}
            <span>🥳</span>{' '}
            <span className="text-[#413d3d]">—</span>
          </h1>
          
          <p className="text-xl lg:text-2xl font-semibold text-[#413d3d] leading-tight">
            {language === 'es' 
              ? <>Según tus respuestas, calificas para tratamiento con <span className="text-[#4fa87f]">Semaglutida</span> o <span className="text-[#4fa87f]">Tirzepatida</span>.</>
              : <>Based on your answers, you qualify for treatment with either <span className="text-[#4fa87f]">Semaglutide</span> or <span className="text-[#4fa87f]">Tirzepatide</span>.</>
            }
          </p>

          <p className="text-base text-gray-600">
            {language === 'es'
              ? <>Ambos son <span className="text-[#4fa87f] font-medium">medicamentos GLP-1</span> altamente efectivos clínicamente comprobados para apoyar la pérdida de peso, mejorar la salud metabólica y ayudar a controlar el apetito.</>
              : <>Both are highly effective <span className="text-[#4fa87f] font-medium">GLP-1 medications</span> clinically proven to support weight loss, improve metabolic health, and help curb appetite.</>
            }
          </p>
        </div>

        {/* Checkout button */}
        <button
          onClick={handleCheckout}
          className="w-full max-w-sm bg-[#413d3d] hover:bg-[#2a2727] py-4 px-8 rounded-full flex items-center justify-between transition-colors"
          style={{ color: '#ffffff' }}
        >
          <div className="text-left">
            <div className="font-semibold text-base" style={{ color: '#ffffff' }}>
              {language === 'es' ? 'Completar Checkout' : 'Complete Check Out'}
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {language === 'es' ? 'Descuentos aplicados al checkout' : 'Discounts applied at check out'}
            </div>
          </div>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>

      {/* Confetti canvas will be added by the library */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50" />
      )}

      {/* Copyright footer */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <p className="text-[9px] lg:text-[11px] text-gray-400 text-center leading-tight">
          {language === 'es' ? (
            <>
              © 2025 EONPro, LLC. Todos los derechos reservados.<br/>
              Proceso exclusivo y protegido. Copiar o reproducir sin autorización está prohibido.
            </>
          ) : (
            <>
              © 2025 EONPro, LLC. All rights reserved.<br/>
              Exclusive and protected process. Copying or reproduction without authorization is prohibited.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

