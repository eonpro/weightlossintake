'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';

export default function ConsentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  
  const handleContinue = () => {
    if (agreed) {
      router.push('/intake/state');
    }
  };
  
  // Enable Enter key navigation
  useEnterNavigation(handleContinue);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-2/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/intake/research-done" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-medium mb-4">{t('consent.title')}</h1>
            <p className="text-gray-600 mb-2">{t('consent.subtitle')}</p>
            <p className="text-gray-600">{t('consent.remember')}</p>
          </div>

          <div className="space-y-3">
            {/* Health Priority Card */}
            <div className="bg-[#f0feab] rounded-2xl overflow-hidden flex h-28">
              <div className="flex-shrink-0 relative w-28">
                <Image 
                  src="https://static.wixstatic.com/media/c49a9b_23b226f763e04a678830d974e42cbf2d~mv2.webp" 
                  alt="Healthcare professional"
                  fill
                  sizes="(max-width: 768px) 112px, 112px"
                  className="object-cover"
                  style={{ objectPosition: 'center 20%' }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-center px-4 py-3">
                <h3 className="font-bold text-base leading-tight mb-1">{t('consent.health.title')}</h3>
                <p className="text-xs leading-snug">{t('consent.health.subtitle')}</p>
              </div>
            </div>

            {/* Doctor Review Card */}
            <div className="bg-[#e4fb74] rounded-2xl overflow-hidden flex h-28">
              <div className="flex-shrink-0 relative w-32">
                <Image 
                  src="https://static.wixstatic.com/media/c49a9b_4f62708aea0f4b2da0450a97e2e03653~mv2.webp" 
                  alt="Licensed medical provider"
                  fill
                  sizes="(max-width: 768px) 128px, 128px"
                  className="object-cover"
                  style={{ objectPosition: 'center 30%' }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-center px-4 py-3">
                <h3 className="font-bold text-base leading-tight mb-1">{t('consent.doctor.title')}</h3>
                <p className="text-xs leading-snug">{t('consent.doctor.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Consent Section */}
          <div className="border border-[#4fa87f] bg-[#f9f9f9] rounded-2xl p-4 space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <div className="mt-0.5 flex-shrink-0">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  agreed ? 'bg-[#4fa87f] border-[#4fa87f]' : 'bg-white border-gray-300'
                }`}>
                  {agreed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div className="text-sm">
                {t('consent.agreement.start')}
                <a href="#" className="text-[#4fa87f] underline">{t('consent.agreement.terms')}</a>
                {t('consent.agreement.and')}
                <a href="#" className="text-[#4fa87f] underline">{t('consent.agreement.privacy')}</a>, 
                <a href="#" className="text-[#4fa87f] underline">{t('consent.agreement.telehealth')}</a> and{' '}
                <a href="#" className="text-[#4fa87f] underline">{t('consent.agreement.cancellation')}</a>
                {t('consent.agreement.florida')}
                <a href="#" className="text-[#4fa87f] underline">{t('consent.agreement.florida.bill')}</a> and the{' '}
                <a href="#" className="text-[#4fa87f] underline">{t('consent.agreement.florida.consent')}</a>.
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!agreed}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            agreed 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{t('consent.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
