'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChronicConditionsDetailPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredConditions, setFilteredConditions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Common chronic conditions
  const chronicConditions = language === 'es' ? [
    'Hipertensión', 'Diabetes tipo 1', 'Diabetes tipo 2', 'Prediabetes',
    'Enfermedad cardíaca', 'Insuficiencia cardíaca', 'Arritmia',
    'Asma', 'EPOC', 'Apnea del sueño',
    'Enfermedad renal crónica', 'Cálculos renales',
    'Cirrosis hepática', 'Hepatitis B', 'Hepatitis C', 'Hígado graso',
    'Artritis reumatoide', 'Osteoartritis', 'Fibromialgia', 'Gota',
    'Colesterol alto', 'Triglicéridos altos', 'Anemia',
    'Cáncer', 'Accidente cerebrovascular', 'Epilepsia',
    'Enfermedad de Crohn', 'Colitis ulcerosa', 'Reflujo gastroesofágico',
    'Hipotiroidismo', 'Hipertiroidismo', 'Migraña', 'Psoriasis'
  ] : [
    'Hypertension', 'Type 1 diabetes', 'Type 2 diabetes', 'Prediabetes',
    'Heart disease', 'Heart failure', 'Arrhythmia',
    'Asthma', 'COPD', 'Sleep apnea',
    'Chronic kidney disease', 'Kidney stones',
    'Cirrhosis', 'Hepatitis B', 'Hepatitis C', 'Fatty liver disease',
    'Rheumatoid arthritis', 'Osteoarthritis', 'Fibromyalgia', 'Gout',
    'High cholesterol', 'High triglycerides', 'Anemia',
    'Cancer', 'Stroke', 'Epilepsy',
    'Crohn\'s disease', 'Ulcerative colitis', 'GERD',
    'Hypothyroidism', 'Hyperthyroidism', 'Migraine', 'Psoriasis'
  ];

  // Filter conditions based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConditions([]);
      setShowSuggestions(false);
    } else {
      const filtered = chronicConditions
        .filter(condition => 
          condition.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedConditions.includes(condition)
        )
        .slice(0, 5); // Show max 5 suggestions
      setFilteredConditions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  }, [searchTerm, selectedConditions]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCondition = (condition: string) => {
    if (!selectedConditions.includes(condition)) {
      setSelectedConditions([...selectedConditions, condition]);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveCondition = (condition: string) => {
    setSelectedConditions(selectedConditions.filter(c => c !== condition));
  };

  const handleContinue = () => {
    sessionStorage.setItem('chronic_conditions', JSON.stringify(selectedConditions));
    router.push('/intake/medications');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[82%] bg-[#f0feab] transition-all duration-300"></div>
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
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' 
              ? '¿Qué tipo de condición o enfermedad crónica padeces?'
              : 'What type of chronic condition or disease do you have?'}
          </h1>
          
          {/* Search input with autocomplete */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'es' ? 'Condición cronica' : 'Chronic condition'}
              className="w-full p-4 text-base md:text-lg border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400"
              onFocus={() => {
                if (filteredConditions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            
            {/* Autocomplete suggestions */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto"
              >
                {filteredConditions.map((condition, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddCondition(condition)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-base">{condition}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected conditions */}
          {selectedConditions.length > 0 && (
            <div className="space-y-2">
              {selectedConditions.map((condition, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#f0feab] rounded-xl"
                >
                  <span className="text-base font-medium">{condition}</span>
                  <button
                    onClick={() => handleRemoveCondition(condition)}
                    className="ml-3 p-1 hover:bg-black/10 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
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