'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function ConsentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  
  const handleContinue = () => {
    if (agreed) {
      router.push('/intake/state');
    }
  };
  
  // Enable Enter key navigation
  useEnterNavigation(handleContinue);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/20">
        <div className="h-full w-[8%] bg-[#b8e64a] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/research-done" className="inline-block p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />
      
      <div className="flex-1 px-6 lg:px-8 py-8 pb-52 max-w-md lg:max-w-lg mx-auto w-full overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h1 className="page-title mb-4">{t('consent.title')}</h1>
            <p className="page-subtitle mb-2">{t('consent.subtitle')}</p>
            <p className="page-subtitle">{t('consent.remember')}</p>
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
                <h3 className="font-bold text-[18px] leading-tight mb-1">{t('consent.health.title')}</h3>
                <p className="text-[14px] leading-snug">{t('consent.health.subtitle')}</p>
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
                <h3 className="font-bold text-[18px] leading-tight mb-1">{t('consent.doctor.title')}</h3>
                <p className="text-[14px] leading-snug">{t('consent.doctor.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Consent Section */}
          <div className="border border-white/30 bg-white/10 rounded-2xl p-4 space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <div className="mt-0.5 flex-shrink-0">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  agreed ? 'bg-white border-[#413d3d]' : 'bg-transparent border-white/60'
                }`}>
                  {agreed && (
                    <svg className="w-3 h-3 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
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
              <div className="text-[9px] md:text-[12.5px] text-white/80">
                {t('consent.agreement.start')}
                <a href="#" className="text-[#f0feab] underline">{t('consent.agreement.terms')}</a>
                {t('consent.agreement.and')}
                <a href="#" className="text-[#f0feab] underline">{t('consent.agreement.privacy')}</a>, 
                <a href="#" className="text-[#f0feab] underline">{t('consent.agreement.telehealth')}</a> and{' '}
                <a href="#" className="text-[#f0feab] underline">{t('consent.agreement.cancellation')}</a>
                {t('consent.agreement.florida')}
                <a href="#" className="text-[#f0feab] underline">{t('consent.agreement.florida.bill')}</a> and the{' '}
                <a href="#" className="text-[#f0feab] underline">{t('consent.agreement.florida.consent')}</a>.
              </div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Sticky bottom button */}
      <div className="sticky-bottom-button max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!agreed}
          className="continue-button"
        >
          <span>{t('consent.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <p className="copyright-text">
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
    </div>
  );
}
