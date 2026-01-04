'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function TestimonialsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const hasNavigated = useRef(false);

  // Language-specific testimonial images
  const testimonialImages = language === 'es' ? [
    'https://static.wixstatic.com/media/c49a9b_b4dbc66741324c1f9124e3bff2094d84~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_b020b2170766409e850210d418615da1~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_e54335aad0164b22aa8a2b123bb34b7c~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_b020b2170766409e850210d418615da1~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_98e7e84f7213491a97bd9f27542c96af~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_84d69338ec814bcca3c4bacc9f1d0044~mv2.webp'
  ] : [
    'https://static.wixstatic.com/media/c49a9b_9aef40faf6684d73829744872b83dcce~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_366d79f5e59040a899c267d3675494c6~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_6bb33332ffa7459ba48bea94f24b5c5c~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_1c31b2006e6544a29aebb0e95342aecd~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_86cfd5b97dfe4d8787463f312fd03712~mv2.webp',
    'https://static.wixstatic.com/media/c49a9b_9799e7cab45f4491a2169c23be5ec63c~mv2.webp'
  ];

  // Reset slide when language changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [language]);

  // Auto-scroll functionality - faster (1.5 seconds per slide)
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonialImages.length);
      }, 1500); // Change slide every 1.5 seconds (faster)

      return () => clearInterval(interval);
    }
  }, [currentSlide, isPaused, testimonialImages.length]);

  // Auto-advance to next page after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/medical-history-overview');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-5/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 lg:px-8 pt-8 lg:pt-6">
        <Link href="/intake/bmi-result" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />
      
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-6 pb-40 max-w-md lg:max-w-lg mx-auto w-full">
        {/* Header with Icon */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-start">
            <img 
              src="https://static.wixstatic.com/shapes/c49a9b_d96c5f8c37844a39bfa47b0503e6167a.svg"
              alt="Check"
              className="w-14 h-14"
            />
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-left">
            {language === 'es' 
              ? 'Únete a los miles de transformaciones que hemos ayudado a lograr.'
              : 'Join the thousands of transformations we\'ve helped achieve.'}
          </h1>
          <p className="page-subtitle text-left">
            {language === 'es'
              ? 'Cada uno de estos casos presenta pacientes reales que transformaron sus vidas.'
              : 'Each of these cases features real patients who transformed their lives.'}
          </p>
        </div>

        {/* Image Carousel */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex gap-3 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 200}px)`
            }}
          >
            {testimonialImages.map((image, index) => (
              <div key={index} className="flex-shrink-0">
                <Image
                  src={image}
                  alt={`Testimonial ${index + 1}`}
                  width={230}
                  height={345}
                  className="w-[230px] h-auto rounded-2xl"
                  style={{
                    objectFit: 'contain'
                  }}
                  priority={index === 0}
                />
              </div>
            ))}
            {/* Duplicate first images for infinite loop effect */}
            {testimonialImages.slice(0, 2).map((image, index) => (
              <div key={`dup-${index}`} className="flex-shrink-0">
                <Image
                  src={image}
                  alt={`Testimonial duplicate ${index + 1}`}
                  width={230}
                  height={345}
                  className="w-[230px] h-auto rounded-2xl"
                  style={{
                    objectFit: 'contain'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center space-x-1.5 py-6">
          {testimonialImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsPaused(false);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-gray-800 w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="px-6 lg:px-8 pb-6 max-w-md lg:max-w-lg mx-auto w-full">
        {/* Disclaimer */}
        <p className="copyright-text text-center mt-4">
          {language === 'es'
            ? 'Los medicamentos son solo una parte del programa de pérdida de peso de EONMeds, que también incluye una dieta baja en calorías'
            : 'Medications are just one part of the EONMeds weight loss program, which also includes a low-calorie diet'}
        </p>
      </div>
    </div>
  );
}