'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function SupportInfoPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    // Trigger container animation after a delay
    const timer = setTimeout(() => {
      setShowContainer(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar - full */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-full bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/intake/dob" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className={`bg-[#f0feab] rounded-3xl p-6 pb-0 space-y-3 overflow-hidden transition-all duration-1000 ease-out transform ${
          showContainer ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
        }`}>
          <h2 className="text-xl font-medium text-black">{t('support.didYouKnow')}</h2>
          
          <div className="flex justify-start">
            <img 
              src="https://static.wixstatic.com/media/c49a9b_60568a55413d471ba85d995d7da0d0f2~mv2.png"
              alt="EONMeds"
              className="h-10 w-auto"
            />
          </div>
          
          <h3 className="text-xl font-medium text-black leading-tight">
            {t('support.assigns')}
          </h3>
          
          <p className="text-sm text-gray-600">
            {t('support.description')}
          </p>
          
          {/* Customer Service Representative Image */}
          <div className="flex justify-start -ml-6 -mb-6 mt-4">
            <img 
              src="https://static.wixstatic.com/media/c49a9b_2c49b136f5ec49c787b37346cca7f47b~mv2.webp"
              alt="Customer Service Representative"
              className="w-80 h-auto object-contain"
            />
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={() => router.push('/intake/address')}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-900"
        >
          <span>{t('support.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}