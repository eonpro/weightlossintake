'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function BMICalculatingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [thinkingText, setThinkingText] = useState('');
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [firstName, setFirstName] = useState('there');
  const hasNavigated = useRef(false);

  // Get name on mount
  useEffect(() => {
    const nameData = sessionStorage.getItem('intake_name');
    if (nameData) {
      try {
        const parsed = JSON.parse(nameData);
        setFirstName(parsed.firstName || 'there');
      } catch {
        setFirstName('there');
      }
    }
  }, []);

  // Handle animation and navigation
  useEffect(() => {
    // Set initial thinking text
    const messages = {
      analyzing: t('bmi.calculating.analyzing'),
      calculatingBMI: t('bmi.calculating.calculatingBMI'),
      checkingGuidelines: t('bmi.calculating.checkingGuidelines'),
      evaluatingCriteria: t('bmi.calculating.evaluatingCriteria'),
      finalizingResults: t('bmi.calculating.finalizingResults')
    };
    
    setThinkingText(messages.analyzing);
    
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          // Navigate immediately when progress reaches 100%
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            setTimeout(() => {
              router.push('/intake/bmi-result');
            }, 500);
          }
          return 100;
        }
        return newProgress;
      });
    }, 90); // Update every 90ms to reach 100% in ~4.5 seconds

    // Change thinking text
    const textSequence = [
      messages.analyzing,
      messages.calculatingBMI,
      messages.checkingGuidelines,
      messages.evaluatingCriteria,
      messages.finalizingResults
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex++;
      if (textIndex < textSequence.length) {
        setThinkingText(textSequence[textIndex]);
      }
    }, 800);
    
    // Backup navigation timer in case progress doesn't trigger
    const backupTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push('/intake/bmi-result');
      }
    }, 5500);

    return () => {
      clearTimeout(backupTimer);
      clearInterval(dotsInterval);
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [router, t]); // Add proper dependencies

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
        <Link href="/intake/current-weight" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-3xl font-medium text-gray-400">
          {t('bmi.calculating.greeting')} <span className="text-black">{firstName}</span>...
        </h1>
        
        {/* Lottie Animation - Your exact animation via iframe */}
        <div className="flex justify-center">
          <div className="w-56 h-56 relative">
            <iframe
              src="https://lottie.host/embed/dc97beb4-edb5-4eb6-93d3-b263f384588b/duQ85tdg83.lottie"
              style={{ 
                width: '224px', 
                height: '224px',
                border: 'none',
                background: 'transparent'
              }}
              title="Loading animation"
            />
          </div>
        </div>
        
        <div className="space-y-0">
          <p className="text-2xl text-gray-400 leading-tight">{t('bmi.calculating.eonpro')}</p>
          <p className="text-2xl text-gray-400 leading-tight">{t('bmi.calculating.yourBmi')}</p>
          <p className="text-2xl text-gray-400 leading-tight">{t('bmi.calculating.bmi')}</p>
          
          {/* Progress Bar */}
          <div className="mt-6 px-8">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-600">{progress}%</p>
          </div>
          
          <div className="mt-4 h-8">
            <p className="text-sm text-gray-500 italic">
              {thinkingText}{dots}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
