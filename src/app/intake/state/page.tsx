'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function StatePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [selectedState, setSelectedState] = useState('Florida');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  const handleContinue = () => {
    if (selectedState && termsAccepted) {
      sessionStorage.setItem('intake_state', selectedState);
      router.push('/intake/name');
    }
  };
  
  // Enable Enter key navigation
  useEnterNavigation(handleContinue);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[10%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/consent" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo />
      
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-medium">{t('state.title')}</h1>
            <p className="text-gray-500">{t('state.subtitle')}</p>
          </div>
          
          {/* State Dropdown */}
          <div className="relative">
            <label className="block text-sm text-gray-500 mb-2">{t('state.label')}</label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full p-4 pr-12 text-base md:text-lg border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:border-gray-400 bg-white"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Terms and Conditions Checkbox */}
          <div className="mt-6">
            <label className="flex items-start cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                termsAccepted ? 'bg-[#f0feab] border-[#f0feab]' : 'border-gray-300'
              }`}>
                {termsAccepted && (
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="ml-3 text-[10.5px] md:text-[12.5px] text-gray-700 leading-tight">
                {selectedState === 'Florida' ? (
                  <>
                    {t('state.terms.agree')}<a href={isSpanish ? "https://www.eonmeds.com/terminosycondiciones" : "https://www.eonmeds.com/termsandconditions"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.link')}</a>, <a href={isSpanish ? "https://www.eonmeds.com/floridaweightlossconsumerbillofrights" : "https://www.eonmeds.com/floridaweightlossconsumerbillofrightseng"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.flBill')}</a>, <a href={isSpanish ? "https://www.eonmeds.com/floridatelehealthconsent" : "https://www.eonmeds.com/florida-telehealth-consent"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.flConsent')}</a>, <a href={isSpanish ? "https://www.eonmeds.com/consentimientodetelemedicina" : "https://www.eonmeds.com/telehealth-consent"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.telehealth')}</a>{t('state.terms.acknowledge')}<a href={isSpanish ? "https://www.eonmeds.com/politicadeprivacidad" : "https://www.eonmeds.com/privacypolicy"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.privacy')}</a>.
                  </>
                ) : selectedState === 'New Jersey' ? (
                  <>
                    {t('state.terms.agree')}<a href={isSpanish ? "https://www.eonmeds.com/terminosycondiciones" : "https://www.eonmeds.com/termsandconditions"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.link')}</a>, <a href="#" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.njConsent')}</a>, <a href={isSpanish ? "https://www.eonmeds.com/consentimientodetelemedicina" : "https://www.eonmeds.com/telehealth-consent"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.telehealth')}</a>{t('state.terms.acknowledge')}<a href={isSpanish ? "https://www.eonmeds.com/politicadeprivacidad" : "https://www.eonmeds.com/privacypolicy"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.privacy')}</a>.
                  </>
                ) : (
                  <>
                    {t('state.terms.generic')}<a href={isSpanish ? "https://www.eonmeds.com/terminosycondiciones" : "https://www.eonmeds.com/termsandconditions"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.link')}</a> {t('state.terms.and')} <a href={isSpanish ? "https://www.eonmeds.com/consentimientodetelemedicina" : "https://www.eonmeds.com/telehealth-consent"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.telehealth')}</a> {t('state.terms.acknowledge')}<a href={isSpanish ? "https://www.eonmeds.com/politicadeprivacidad" : "https://www.eonmeds.com/privacypolicy"} target="_blank" rel="noopener noreferrer" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>{t('state.terms.privacy')}</a>.
                  </>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!termsAccepted}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium transition-colors ${
            termsAccepted 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {t('state.continue')}
        </button>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] lg:text-[11px] text-gray-400 leading-tight">
            {isSpanish ? (
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