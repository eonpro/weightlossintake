'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';
import CopyrightText from '@/components/CopyrightText';

export default function TreatmentBenefitsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const hasNavigated = useRef(false);
  
  // Animation states
  const [showTitle, setShowTitle] = useState(false);
  const [showCard1, setShowCard1] = useState(false);
  const [showCard2, setShowCard2] = useState(false);
  const [showCard3, setShowCard3] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  // Staggered animation triggers
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowTitle(true), 100),
      setTimeout(() => { setShowCard1(true); setActiveCard(1); }, 400),
      setTimeout(() => { setShowCard2(true); setActiveCard(2); }, 800),
      setTimeout(() => { setShowCard3(true); setActiveCard(3); }, 1200),
      setTimeout(() => setActiveCard(0), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Auto-advance after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/glp1-history');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  const benefits = [
    {
      id: 'appetite',
      title: {
        es: 'Controla tu apetito',
        en: 'Control your appetite'
      },
      description: {
        es: 'Despídete del hambre y antojos',
        en: 'Say goodbye to hunger and cravings'
      },
      bgColor: '#f7d06b',
      glowColor: 'rgba(247, 208, 107, 0.5)',
      image: 'https://static.wixstatic.com/media/c49a9b_b3c28fca89d5416a9f47ed2663230647~mv2.webp',
    },
    {
      id: 'digestion',
      title: {
        es: 'Mejor Digestión',
        en: 'Better Digestion'
      },
      description: {
        es: 'Te llenas más rápido y por más tiempo',
        en: 'Feel fuller faster and for longer'
      },
      bgColor: '#4ea77d',
      glowColor: 'rgba(78, 167, 125, 0.4)',
      image: 'https://static.wixstatic.com/media/c49a9b_ea25d461f966422ca6f9a51a72b9e93b~mv2.webp',
    },
    {
      id: 'levels',
      title: {
        es: 'Niveles estables',
        en: 'Stable levels'
      },
      description: {
        es: 'Mantén tu nivel de azúcar bajo control',
        en: 'Keep your blood sugar under control'
      },
      bgColor: '#b8e561',
      glowColor: 'rgba(184, 229, 97, 0.5)',
      image: 'https://static.wixstatic.com/media/c49a9b_d75d94d455584a6cb15d4faacf8011c7~mv2.webp',
    }
  ];

  const cardStates = [showCard1, showCard2, showCard3];

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-[81%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/blood-pressure" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo with Lottie */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-6 pb-32 max-w-md lg:max-w-lg mx-auto w-full">
        {/* Title - animated */}
        <div 
          className={`mb-6 transition-all duration-700 ease-out ${
            showTitle 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4'
          }`}
        >
          <h1 className="page-title">
            {language === 'es' 
              ? 'Nuestros tratamientos te ayudan de la siguiente manera'
              : 'Our treatments help you in the following ways'}
          </h1>
        </div>

        {/* Benefit cards - animated like programs-include */}
        <div className="space-y-4 flex-1">
          {benefits.map((benefit, index) => {
            const isVisible = cardStates[index];
            const isActive = activeCard === index + 1;
            
            return (
              <div
                key={benefit.id}
                className={`relative transition-all duration-700 ease-out ${
                  isVisible 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 -translate-x-12 scale-95'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Glow effect when active */}
                <div 
                  className={`absolute -inset-1 rounded-[28px] transition-all duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    background: `radial-gradient(ellipse at center, ${benefit.glowColor}, transparent 70%)`,
                    filter: 'blur(8px)',
                  }}
                />
                
                {/* Card */}
                <div
                  className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
                    isActive ? 'scale-[1.02] shadow-xl' : 'scale-100 shadow-md'
                  }`}
                  style={{ backgroundColor: benefit.bgColor }}
                >
                  <div className="flex items-stretch min-h-[100px] md:min-h-[120px]">
                    {/* Text content */}
                    <div className="flex-1 py-3 pl-7 pr-3 md:py-4 md:pl-8 md:pr-4 flex flex-col justify-center">
                      <h2 className="text-[17px] md:text-[19px] font-bold text-black leading-tight">
                        {language === 'es' ? benefit.title.es : benefit.title.en}
                      </h2>
                      <p className={`text-[13px] md:text-[15px] leading-snug mt-1 ${
                        index === 1 ? 'text-white/90' : 'text-gray-700'
                      }`}>
                        {language === 'es' ? benefit.description.es : benefit.description.en}
                      </p>
                    </div>
                    
                    {/* Image with animation */}
                    <div className={`w-28 md:w-36 flex-shrink-0 transition-all duration-700 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}>
                      <img 
                        src={benefit.image}
                        alt={language === 'es' ? benefit.title.es : benefit.title.en}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Checkmark indicator when active */}
                  <div className={`absolute top-3 right-3 transition-all duration-300 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map((num) => (
            <div 
              key={num}
              className={`h-2 rounded-full transition-all duration-500 ${
                activeCard >= num 
                  ? 'w-6 bg-[#4fa87f]' 
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <CopyrightText className="mt-4" />
      </div>
    </div>
  );
}
