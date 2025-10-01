'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

// Comprehensive medication and supplement database
const medicationsDatabase = {
  es: [
    // Medicamentos comunes
    'Aspirina', 'Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Omeprazol',
    'Losartán', 'Metformina', 'Atorvastatina', 'Levotiroxina', 'Amlodipino',
    'Simvastatina', 'Lisinopril', 'Enalapril', 'Diclofenaco', 'Loratadina',
    'Prednisona', 'Alprazolam', 'Clonazepam', 'Sertralina', 'Fluoxetina',
    'Tramadol', 'Codeína', 'Morfina', 'Warfarina', 'Clopidogrel',
    'Furosemida', 'Hidroclorotiazida', 'Propranolol', 'Atenolol', 'Carvedilol',
    'Insulina', 'Glibenclamida', 'Ranitidina', 'Esomeprazol', 'Pantoprazol',
    
    // Suplementos y vitaminas
    'Vitamina A', 'Vitamina B1', 'Vitamina B2', 'Vitamina B3', 'Vitamina B5',
    'Vitamina B6', 'Vitamina B7', 'Vitamina B9', 'Vitamina B12', 'Vitamina C',
    'Vitamina D', 'Vitamina E', 'Vitamina K', 'Complejo B', 'Multivitamínico',
    'Calcio', 'Hierro', 'Magnesio', 'Zinc', 'Potasio', 'Selenio', 'Yodo',
    'Omega 3', 'Aceite de pescado', 'Probióticos', 'Prebióticos', 'Colágeno',
    'Glucosamina', 'Condroitina', 'Coenzima Q10', 'Melatonina', 'Valeriana',
    'Ginseng', 'Ginkgo biloba', 'Echinacea', 'Ajo', 'Cúrcuma', 'Jengibre',
    'Proteína en polvo', 'Creatina', 'L-carnitina', 'BCAA', 'Glutamina',
    
    // Anticonceptivos
    'Píldoras anticonceptivas', 'Yasmin', 'Diane', 'Microgynon', 'Nordette'
  ],
  en: [
    // Common medications
    'Aspirin', 'Acetaminophen', 'Ibuprofen', 'Amoxicillin', 'Omeprazole',
    'Losartan', 'Metformin', 'Atorvastatin', 'Levothyroxine', 'Amlodipine',
    'Simvastatin', 'Lisinopril', 'Enalapril', 'Diclofenac', 'Loratadine',
    'Prednisone', 'Alprazolam', 'Clonazepam', 'Sertraline', 'Fluoxetine',
    'Tramadol', 'Codeine', 'Morphine', 'Warfarin', 'Clopidogrel',
    'Furosemide', 'Hydrochlorothiazide', 'Propranolol', 'Atenolol', 'Carvedilol',
    'Insulin', 'Glyburide', 'Ranitidine', 'Esomeprazole', 'Pantoprazole',
    'Metoprolol', 'Gabapentin', 'Zolpidem', 'Trazodone', 'Duloxetine',
    'Venlafaxine', 'Escitalopram', 'Citalopram', 'Bupropion', 'Buspirone',
    
    // Supplements and vitamins
    'Vitamin A', 'Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Vitamin B5',
    'Vitamin B6', 'Vitamin B7', 'Vitamin B9', 'Vitamin B12', 'Vitamin C',
    'Vitamin D', 'Vitamin E', 'Vitamin K', 'B Complex', 'Multivitamin',
    'Calcium', 'Iron', 'Magnesium', 'Zinc', 'Potassium', 'Selenium', 'Iodine',
    'Omega 3', 'Fish oil', 'Probiotics', 'Prebiotics', 'Collagen',
    'Glucosamine', 'Chondroitin', 'Coenzyme Q10', 'Melatonin', 'Valerian',
    'Ginseng', 'Ginkgo biloba', 'Echinacea', 'Garlic', 'Turmeric', 'Ginger',
    'Protein powder', 'Creatine', 'L-carnitine', 'BCAA', 'Glutamine',
    'St. John\'s Wort', 'Saw Palmetto', 'Milk Thistle', 'Green Tea Extract',
    
    // Birth control
    'Birth control pills', 'Yasmin', 'Diane', 'Microgynon', 'Nordette',
    'Plan B', 'Depo-Provera', 'NuvaRing', 'Mirena', 'Nexplanon'
  ]
};

export default function MedicationsSelectionPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const medications = medicationsDatabase[language as 'es' | 'en'] || medicationsDatabase.en;

  useEffect(() => {
    // Filter suggestions based on search term
    if (searchTerm.trim()) {
      const filtered = medications
        .filter(item => 
          item.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedMedications.includes(item)
        )
        .slice(0, 5); // Show max 5 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, selectedMedications, medications]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMedication = (medication: string) => {
    if (!selectedMedications.includes(medication)) {
      setSelectedMedications([...selectedMedications, medication]);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setSelectedMedications(selectedMedications.filter(c => c !== medication));
  };

  const handleContinue = () => {
    sessionStorage.setItem('current_medications', JSON.stringify(selectedMedications));
    router.push('/intake/allergies');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[87%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link href="/intake/medications" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
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
              ? '¿Qué medicamentos o suplementos estás tomando?'
              : 'What medications or supplements are you currently taking?'}
          </h1>
          
          <p className="text-gray-500 text-base">
            {language === 'es'
              ? 'Incluye todos los medicamentos recetados, de venta libre, vitaminas y suplementos.'
              : 'Include all prescription medications, over-the-counter medications, vitamins, and supplements.'}
          </p>
          
          {/* Search input with autocomplete */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder={language === 'es' 
                ? 'Busca y selecciona tus medicamentos...'
                : 'Search and select your medications...'}
              className="w-full p-4 text-base md:text-lg border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400"
            />
            
            {/* Autocomplete suggestions */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto"
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddMedication(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected medications */}
          {selectedMedications.length > 0 && (
            <div className="space-y-2">
              {selectedMedications.map((medication, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-base">{medication}</span>
                  <button
                    onClick={() => handleRemoveMedication(medication)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
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
      
      {/* Footer and Continue button */}
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
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-gray-400 leading-tight">
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
