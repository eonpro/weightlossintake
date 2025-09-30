'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MedicationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [medications, setMedications] = useState('');

  const handleContinue = () => {
    sessionStorage.setItem('current_medications', medications);
    router.push('/intake/allergies'); // Navigate to next page
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[85%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link href="/intake/chronic-conditions" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' 
              ? '¿Estás tomando algún medicamento actualmente?'
              : 'Are you currently taking any medications?'}
          </h1>
          
          <p className="text-gray-500 text-base">
            {language === 'es'
              ? 'Incluye todos los medicamentos recetados, de venta libre, vitaminas y suplementos.'
              : 'Include all prescription medications, over-the-counter medications, vitamins, and supplements.'}
          </p>
          
          <textarea
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder={language === 'es' 
              ? 'Escribe aquí tus medicamentos actuales...' 
              : 'List your current medications here...'}
            className="w-full h-32 p-4 text-base md:text-lg border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>
      </div>
      
      {/* Continue button */}
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors"
        >
          <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
