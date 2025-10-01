'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';

export default function AllergiesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [noAllergiesSelected, setNoAllergiesSelected] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Common medications and supplements database
  const database = language === 'es' ? [
    // Medications in Spanish
    'Ibuprofeno', 'Paracetamol', 'Aspirina', 'Amoxicilina', 'Azitromicina',
    'Metformina', 'Omeprazol', 'Loratadina', 'Cetirizina', 'Fluoxetina',
    'Sertralina', 'Escitalopram', 'Alprazolam', 'Lorazepam', 'Clonazepam',
    'Atorvastatina', 'Simvastatina', 'Metoprolol', 'Lisinopril', 'Enalapril',
    'Losartan', 'Amlodipina', 'Prednisona', 'Diclofenaco', 'Naproxeno',
    'Tramadol', 'Codeína', 'Gabapentina', 'Levotiroxina', 'Insulina',
    'Warfarina', 'Clopidogrel', 'Furosemida', 'Hidroclorotiazida', 'Espironolactona',
    'Albuterol', 'Montelukast', 'Ranitidina', 'Famotidina', 'Pantoprazol',
    
    // Supplements in Spanish
    'Vitamina A', 'Vitamina B1 (Tiamina)', 'Vitamina B2 (Riboflavina)', 
    'Vitamina B3 (Niacina)', 'Vitamina B5 (Ácido Pantoténico)', 
    'Vitamina B6 (Piridoxina)', 'Vitamina B7 (Biotina)', 'Vitamina B9 (Ácido Fólico)',
    'Vitamina B12 (Cobalamina)', 'Vitamina C', 'Vitamina D', 'Vitamina D3',
    'Vitamina E', 'Vitamina K', 'Calcio', 'Hierro', 'Magnesio', 'Zinc',
    'Potasio', 'Selenio', 'Yodo', 'Cobre', 'Manganeso', 'Cromo',
    'Omega-3', 'Aceite de Pescado', 'Probióticos', 'Prebióticos',
    'Colágeno', 'Glucosamina', 'Condroitina', 'MSM (Metilsulfonilmetano)',
    'Coenzima Q10', 'Ácido Hialurónico', 'Cúrcuma', 'Jengibre', 'Ajo',
    'Equinácea', 'Ginseng', 'Ashwagandha', 'Melatonina', 'Valeriana',
    'L-Arginina', 'L-Carnitina', 'L-Glutamina', 'Creatina', 'Proteína de Suero',
    'Espirulina', 'Clorela', 'Té Verde', 'Resveratrol', 'Quercetina'
  ] : [
    // Medications in English
    'Ibuprofen', 'Acetaminophen', 'Aspirin', 'Amoxicillin', 'Azithromycin',
    'Metformin', 'Omeprazole', 'Loratadine', 'Cetirizine', 'Fluoxetine',
    'Sertraline', 'Escitalopram', 'Alprazolam', 'Lorazepam', 'Clonazepam',
    'Atorvastatin', 'Simvastatin', 'Metoprolol', 'Lisinopril', 'Enalapril',
    'Losartan', 'Amlodipine', 'Prednisone', 'Diclofenac', 'Naproxen',
    'Tramadol', 'Codeine', 'Gabapentin', 'Levothyroxine', 'Insulin',
    'Warfarin', 'Clopidogrel', 'Furosemide', 'Hydrochlorothiazide', 'Spironolactone',
    'Albuterol', 'Montelukast', 'Ranitidine', 'Famotidine', 'Pantoprazole',
    
    // Supplements in English
    'Vitamin A', 'Vitamin B1 (Thiamine)', 'Vitamin B2 (Riboflavin)', 
    'Vitamin B3 (Niacin)', 'Vitamin B5 (Pantothenic Acid)', 
    'Vitamin B6 (Pyridoxine)', 'Vitamin B7 (Biotin)', 'Vitamin B9 (Folic Acid)',
    'Vitamin B12 (Cobalamin)', 'Vitamin C', 'Vitamin D', 'Vitamin D3',
    'Vitamin E', 'Vitamin K', 'Calcium', 'Iron', 'Magnesium', 'Zinc',
    'Potassium', 'Selenium', 'Iodine', 'Copper', 'Manganese', 'Chromium',
    'Omega-3', 'Fish Oil', 'Probiotics', 'Prebiotics',
    'Collagen', 'Glucosamine', 'Chondroitin', 'MSM (Methylsulfonylmethane)',
    'Coenzyme Q10', 'Hyaluronic Acid', 'Turmeric', 'Ginger', 'Garlic',
    'Echinacea', 'Ginseng', 'Ashwagandha', 'Melatonin', 'Valerian',
    'L-Arginine', 'L-Carnitine', 'L-Glutamine', 'Creatine', 'Whey Protein',
    'Spirulina', 'Chlorella', 'Green Tea', 'Resveratrol', 'Quercetin'
  ];

  const handleContinue = () => {
    if (noAllergiesSelected) {
      sessionStorage.setItem('allergies', JSON.stringify(['None']));
    } else {
      sessionStorage.setItem('allergies', JSON.stringify(selectedItems));
    }
    router.push('/intake/kidney-conditions');
  };

  const handleAddItem = (item: string) => {
    if (!selectedItems.includes(item)) {
      setSelectedItems([...selectedItems, item]);
      setNoAllergiesSelected(false); // Clear "No allergies" when adding an item
    }
    setSearchValue('');
    setShowSuggestions(false);
  };

  const handleRemoveItem = (item: string) => {
    const updatedItems = selectedItems.filter(i => i !== item);
    setSelectedItems(updatedItems);
    
    // Reset "no allergies" state when removing the last allergy
    if (updatedItems.length === 0) {
      setNoAllergiesSelected(false);
    }
  };

  const filteredSuggestions = database
    .filter(item => 
      item.toLowerCase().includes(searchValue.toLowerCase()) &&
      !selectedItems.includes(item)
    )
    .slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[88%] bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/medications" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* EONMeds Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' 
              ? '¿Eres alérgico a algún medicamento o suplemento?'
              : 'Are you allergic to any medications or supplements?'}
          </h1>
          
          {/* Description */}
          <p className="text-gray-500 text-base">
            {language === 'es'
              ? 'Incluya todos los medicamentos recetados, medicamentos de venta libre, vitaminas y suplementos a los que sea alérgico.'
              : 'Include all prescription medications, over-the-counter medications, vitamins, and supplements you are allergic to.'}
          </p>
          
          {/* Search input */}
          <div ref={searchRef} className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={language === 'es' 
                ? 'Buscar medicamentos o suplementos...'
                : 'Search medications or supplements...'}
              className="w-full p-4 text-base lg:text-lg border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && searchValue && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-10">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddItem(suggestion)}
                    className="w-full text-left p-3 hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected items */}
          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                {language === 'es' ? 'Alergias seleccionadas:' : 'Selected allergies:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 px-3 py-2 rounded-full flex items-center gap-2"
                  >
                    <span className="text-sm">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No allergies button - only show when no items are selected */}
          {selectedItems.length === 0 && (
            <button
                onClick={() => {
                  setNoAllergiesSelected(!noAllergiesSelected);
                  if (!noAllergiesSelected) {
                    setSelectedItems([]); // Clear selected items when choosing "No allergies"
                  }
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  noAllergiesSelected
                    ? 'border-[#f0feab] bg-[#f0feab]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    noAllergiesSelected
                      ? 'border-[#f0feab] bg-[#f0feab]'
                      : 'border-gray-300'
                  }`}>
                    {noAllergiesSelected && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-base lg:text-lg font-medium">
                    {language === 'es' 
                      ? 'No tengo alergias a medicamentos o suplementos'
                      : 'I have no allergies to medications or supplements'}
                  </span>
                </div>
              </button>
          )}
        </div>
      </div>
      
      {/* Continue button */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all bg-black text-white hover:bg-gray-800"
        >
          <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] lg:text-[11px] text-gray-400 leading-tight">
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
