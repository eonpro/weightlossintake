'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center bg-white rounded-full border border-gray-200">
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
          language === 'en' 
            ? 'bg-black text-white' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {/* US Flag SVG */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="18" height="12" rx="1" fill="#B22234"/>
          <rect y="1" width="18" height="1" fill="white"/>
          <rect y="3" width="18" height="1" fill="white"/>
          <rect y="5" width="18" height="1" fill="white"/>
          <rect y="7" width="18" height="1" fill="white"/>
          <rect y="9" width="18" height="1" fill="white"/>
          <rect y="11" width="18" height="1" fill="white"/>
          <rect width="7.2" height="6" rx="0.5" fill="#3C3B6E"/>
        </svg>
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
          language === 'es' 
            ? 'bg-black text-white' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {/* Spain Flag SVG */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="18" height="12" rx="1" fill="#FFC400"/>
          <rect width="18" height="3" fill="#C60A1D"/>
          <rect y="9" width="18" height="3" fill="#C60A1D"/>
        </svg>
        ES
      </button>
    </div>
  );
}