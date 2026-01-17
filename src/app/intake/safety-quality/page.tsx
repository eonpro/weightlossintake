'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';
import CopyrightText from '@/components/CopyrightText';

export default function SafetyQualityPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const hasNavigated = useRef(false);
  
  // Animation states
  const [showShield, setShowShield] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showBadge1, setShowBadge1] = useState(false);
  const [showBadge2, setShowBadge2] = useState(false);
  const [showBadge3, setShowBadge3] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [pulseShield, setPulseShield] = useState(false);

  // Staggered animations
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowShield(true), 100),
      setTimeout(() => setPulseShield(true), 400),
      setTimeout(() => setShowTitle(true), 500),
      setTimeout(() => setShowBadge1(true), 800),
      setTimeout(() => setShowBadge2(true), 1000),
      setTimeout(() => setShowBadge3(true), 1200),
      setTimeout(() => setShowImage(true), 1400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Auto-advance after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/medical-team');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinue = () => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.push('/intake/medical-team');
    }
  };

  const badges = language === 'es' ? [
    { icon: 'pharmacy', text: 'Farmacias 503A Licenciadas', delay: 0 },
    { icon: 'certified', text: 'Tratamientos Personalizados', delay: 1 },
    { icon: 'lab', text: 'Control de Calidad', delay: 2 },
  ] : [
    { icon: 'pharmacy', text: '503A Licensed Pharmacies', delay: 0 },
    { icon: 'certified', text: 'Personalized Treatments', delay: 1 },
    { icon: 'lab', text: 'Quality Control', delay: 2 },
  ];

  const badgeStates = [showBadge1, showBadge2, showBadge3];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fff0] to-white flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-[89%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/alcohol-consumption" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Logo */}
      <EonmedsLogo compact={true} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-4 pb-32 max-w-md lg:max-w-lg mx-auto w-full">
        
        {/* Shield Icon - Animated */}
        <div className={`flex justify-center mb-4 transition-all duration-700 ease-out ${
          showShield ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}>
          <div className={`relative ${pulseShield ? 'animate-pulse' : ''}`}>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#4fa87f] rounded-full blur-xl opacity-30 scale-150"></div>
            {/* Shield */}
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#4fa87f] to-[#3d8a66] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Title - Animated */}
        <div className={`text-center mb-6 transition-all duration-700 ease-out ${
          showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-[#413d3d] mb-3">
            {language === 'es' 
              ? 'Tu Seguridad es Nuestra Prioridad'
              : 'Your Safety is Our Priority'}
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            {language === 'es'
              ? 'Comprometidos con la máxima calidad en cada paso de tu tratamiento.'
              : 'Committed to the highest quality at every step of your treatment.'}
          </p>
        </div>

        {/* Trust Badges - Animated */}
        <div className="space-y-3 mb-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all duration-500 ease-out ${
                badgeStates[index]
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            >
              <div className="w-12 h-12 bg-[#f0feab] rounded-xl flex items-center justify-center flex-shrink-0">
                {badge.icon === 'pharmacy' && (
                  <svg className="w-6 h-6 text-[#4fa87f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
                {badge.icon === 'certified' && (
                  <svg className="w-6 h-6 text-[#4fa87f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                )}
                {badge.icon === 'lab' && (
                  <svg className="w-6 h-6 text-[#4fa87f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )}
              </div>
              <span className="text-base font-medium text-[#413d3d]">{badge.text}</span>
              <div className={`ml-auto w-6 h-6 rounded-full bg-[#4fa87f] flex items-center justify-center transition-all duration-300 ${
                badgeStates[index] ? 'scale-100' : 'scale-0'
              }`} style={{ transitionDelay: '300ms' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Image Card - Animated */}
        <div className={`relative transition-all duration-700 ease-out ${
          showImage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}>
          {/* Decorative background */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#4fa87f]/20 to-[#f0feab]/40 rounded-3xl blur-lg"></div>
          
          <div className="relative bg-[#f0feab] rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-[#4fa87f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#413d3d]">
                {language === 'es' ? 'Hecho en USA' : 'Made in USA'}
              </span>
            </div>
            <img 
              src="https://static.wixstatic.com/media/c49a9b_08d4b9a9d0394b3a83c2284def597b09~mv2.webp"
              alt={language === 'es' ? 'Farmacia de calidad' : 'Quality pharmacy'}
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-1 mt-6">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div 
              key={dot}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                dot <= 3 ? 'w-4 bg-[#4fa87f]' : 'w-1.5 bg-gray-300'
              }`}
              style={{ transitionDelay: `${dot * 100}ms` }}
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
