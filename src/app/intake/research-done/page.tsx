'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';
import CopyrightText from '@/components/CopyrightText';

// Typewriter component
function Typewriter({ 
  text, 
  delay = 30, 
  onComplete,
  startDelay = 0,
  className = ''
}: { 
  text: string; 
  delay?: number; 
  onComplete?: () => void;
  startDelay?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Start delay before typing begins
    const startTimer = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [displayedText, text, delay, hasStarted, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
}

export default function ResearchDonePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [medicationPreference, setMedicationPreference] = useState<string | null>(null);
  const [line1Complete, setLine1Complete] = useState(false);
  const [line2Complete, setLine2Complete] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const preference = sessionStorage.getItem('medication_preference');
    setMedicationPreference(preference);
  }, []);

  // Auto-advance 1 second after all text is complete
  useEffect(() => {
    if (line2Complete && !hasNavigated.current) {
      const timer = setTimeout(() => {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.push('/intake/consent');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [line2Complete, router]);

  const handleNext = () => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.push('/intake/consent');
    }
  };

  // Get the text content based on language and preference
  const getText = () => {
    if (medicationPreference === 'recommendation') {
      return {
        line1: language === 'es' 
          ? 'Lo tienes. Comenzaremos con algunas preguntas sobre ti.' 
          : "You've got it. We'll begin with some questions about you.",
        line2: language === 'es' 
          ? 'Después de eso, profundizaremos en tu historial de salud para encontrar qué opción de tratamiento coincide con tus objetivos e historial de salud.' 
          : "After that, we'll dive into your health history to find which treatment option matches your goals and health history."
      };
    }
    return {
      line1: language === 'es' 
        ? 'Bien, parece que ya has hecho tu investigación.' 
        : "Nice, it sounds like you've already done your research.",
      line2: language === 'es' 
        ? 'Sigamos adelante para encontrar qué opción de tratamiento coincide con tus objetivos e historial de salud.' 
        : "Let's keep going to find which treatment option matches your goals and health history."
    };
  };

  const { line1, line2 } = getText();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-[7%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <Link href="/intake/medication-preference" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div 
        className="flex-1 flex flex-col px-6 lg:px-8 py-4 lg:py-8 pb-40 max-w-md lg:max-w-lg mx-auto w-full cursor-pointer"
        onClick={handleNext}
      >
        <div className="space-y-4 lg:space-y-8">
          <div className="space-y-4">
            {/* Title with typewriter effect */}
            <h1 
              className="text-[30px] lg:text-[34px] font-[550] leading-tight"
              style={{ color: '#4fa87f' }}
            >
              <Typewriter 
                text={line1}
                delay={25}
                startDelay={300}
                onComplete={() => setLine1Complete(true)}
              />
            </h1>
            
            {/* Subtitle with typewriter effect - starts after line1 completes */}
            {line1Complete && (
              <p 
                className="text-[30px] lg:text-[34px] font-[550] leading-tight"
                style={{ color: '#4fa87f' }}
              >
                <Typewriter 
                  text={line2}
                  delay={25}
                  startDelay={200}
                  onComplete={() => setLine2Complete(true)}
                />
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom section */}
      <div className="px-6 lg:px-8 pb-6 lg:pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        {/* Copyright text */}
        <CopyrightText className="mt-4" />
      </div>
    </div>
  );
}
