'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function ProgramsIncludePage() {
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
      setTimeout(() => setActiveCard(0), 2000), // Reset highlight
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Auto-advance after 4 seconds (extended to show animations)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/chronic-conditions');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  const programs = language === 'es' ? [
    {
      title: 'Chequeos Semanales',
      description: 'Un representate asignado estará contigo durante todo tu tratamiento*',
      bgColor: '#4ea77e',
      glowColor: 'rgba(78, 167, 126, 0.4)',
      image: 'https://static.wixstatic.com/media/c49a9b_2c49b136f5ec49c787b37346cca7f47b~mv2.webp',
      icon: '📞'
    },
    {
      title: 'Consultas Médicas',
      description: 'Tu proveedor en las palmas de tus manos. Consultas por telemedicina incluidas',
      bgColor: '#e4fb74',
      glowColor: 'rgba(228, 251, 116, 0.5)',
      image: 'https://static.wixstatic.com/media/c49a9b_5683be4d8e5a425a8cae0f35d26eb98b~mv2.webp',
      icon: '🩺'
    },
    {
      title: 'Ajuste de Dosis',
      description: 'Ajustamos tu dosis con el tiempo para un tratamiento 100% personalizado.',
      bgColor: '#edffa8',
      glowColor: 'rgba(237, 255, 168, 0.5)',
      image: 'https://static.wixstatic.com/media/c49a9b_9b3696821bfc4d84beb17a4266110488~mv2.webp',
      icon: '💊'
    }
  ] : [
    {
      title: 'Weekly Check-ins',
      description: 'An assigned representative will be with you throughout your treatment*',
      bgColor: '#4ea77e',
      glowColor: 'rgba(78, 167, 126, 0.4)',
      image: 'https://static.wixstatic.com/media/c49a9b_2c49b136f5ec49c787b37346cca7f47b~mv2.webp',
      icon: '📞'
    },
    {
      title: 'Medical Consultations',
      description: 'Your provider in the palm of your hands. Telemedicine consultations included',
      bgColor: '#e4fb74',
      glowColor: 'rgba(228, 251, 116, 0.5)',
      image: 'https://static.wixstatic.com/media/c49a9b_5683be4d8e5a425a8cae0f35d26eb98b~mv2.webp',
      icon: '🩺'
    },
    {
      title: 'Dose Adjustment',
      description: 'We adjust your dose over time for 100% personalized treatment.',
      bgColor: '#edffa8',
      glowColor: 'rgba(237, 255, 168, 0.5)',
      image: 'https://static.wixstatic.com/media/c49a9b_9b3696821bfc4d84beb17a4266110488~mv2.webp',
      icon: '💊'
    }
  ];

  const cardStates = [showCard1, showCard2, showCard3];

  const handleContinue = () => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.push('/intake/chronic-conditions');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link 
          href="/intake/mental-health" 
          className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg"
        >
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-6 pb-32 max-w-md lg:max-w-lg mx-auto w-full">
        {/* Header - Animated */}
        <div 
          className={`mb-6 transition-all duration-700 ease-out ${
            showTitle 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4'
          }`}
        >
          <h1 className="page-title">
            {language === 'es' ? (
              <>
                Todos nuestros <span className="text-[#4fa87f]">programas</span> incluyen
              </>
            ) : (
              <>
                All our <span className="text-[#4fa87f]">programs</span> include
              </>
            )}
          </h1>
        </div>

        {/* Program cards - Animated */}
        <div className="space-y-4 flex-1">
          {programs.map((program, index) => {
            const isVisible = cardStates[index];
            const isActive = activeCard === index + 1;
            
            return (
              <div
                key={index}
                className={`relative transition-all duration-700 ease-out ${
                  isVisible 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 -translate-x-12 scale-95'
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Glow effect when active */}
                <div 
                  className={`absolute -inset-1 rounded-[28px] transition-all duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    background: `radial-gradient(ellipse at center, ${program.glowColor}, transparent 70%)`,
                    filter: 'blur(8px)',
                  }}
                />
                
                {/* Card */}
                <div
                  className={`relative rounded-3xl overflow-hidden min-h-[100px] md:min-h-[120px] flex items-center transition-all duration-500 ${
                    isActive ? 'scale-[1.02] shadow-xl' : 'scale-100 shadow-md'
                  }`}
                  style={{ backgroundColor: program.bgColor }}
                >
                  {/* Image with subtle animation */}
                  <div className={`absolute bottom-0 left-0 transition-all duration-700 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}>
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-24 h-24 md:w-28 md:h-28 object-cover"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-3 md:p-4 pl-28 md:pl-32">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] md:text-[19px] font-bold text-black leading-tight">
                        {program.title}
                      </h3>
                    </div>
                    <p className={`text-[13px] md:text-[15px] leading-snug mt-1 transition-all duration-300 ${
                      index === 0 ? 'text-white/90' : 'text-gray-700'
                    }`}>
                      {program.description}
                    </p>
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
        {/* Copyright text */}
        <p className="copyright-text text-center">
          © 2025 EONPro, LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}
