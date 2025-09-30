'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';

export default function DOBPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [dob, setDob] = useState('');
  const [certified, setCertified] = useState(false);
  const [isOver18, setIsOver18] = useState(true);

  // Format date with slashes and validate age
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Validate month (01-12)
    if (value.length >= 2) {
      let month = parseInt(value.slice(0, 2));
      if (month > 12) {
        value = '12' + value.slice(2);
      } else if (month < 1 && value.length === 2) {
        value = '01' + value.slice(2);
      }
    }
    
    // Validate day (01-31, with special cases for month)
    if (value.length >= 4) {
      const month = parseInt(value.slice(0, 2));
      let day = parseInt(value.slice(2, 4));
      
      // February max 29 days (we'll handle leap year validation below)
      if (month === 2 && day > 29) {
        day = 29;
        value = value.slice(0, 2) + '29' + value.slice(4);
      }
      // Months with 30 days: April, June, September, November
      else if ([4, 6, 9, 11].includes(month) && day > 30) {
        day = 30;
        value = value.slice(0, 2) + '30' + value.slice(4);
      }
      // All other months max 31 days
      else if (day > 31) {
        day = 31;
        value = value.slice(0, 2) + '31' + value.slice(4);
      }
      // Minimum day is 01
      else if (day < 1 && value.length === 4) {
        day = 1;
        value = value.slice(0, 2) + '01' + value.slice(4);
      }
    }
    
    // Format as MM/DD/YYYY
    let formattedValue = value;
    if (value.length >= 2) {
      formattedValue = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (formattedValue.length >= 5) {
      formattedValue = formattedValue.slice(0, 5) + '/' + formattedValue.slice(5, 9);
    }
    
    setDob(formattedValue);
    
    // Check if over 18 when date is complete
    if (formattedValue.length === 10) {
      const [month, day, year] = formattedValue.split('/').map(Number);
      
      // Additional validation for February 28 vs 29 (leap year)
      if (month === 2 && day === 29) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (!isLeapYear) {
          setDob(formattedValue.slice(0, 3) + '28' + formattedValue.slice(5));
          return;
        }
      }
      
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setIsOver18(age - 1 >= 18);
      } else {
        setIsOver18(age >= 18);
      }
    }
  };

  const handleContinue = () => {
    if (dob && certified && isOver18) {
      sessionStorage.setItem('intake_dob', dob);
      router.push('/intake/support-info');
    }
  };
  
  // Enable Enter key navigation
  useEnterNavigation(handleContinue);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-5/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/intake/name" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-medium">{t('dob.title')}</h1>
            <p className="text-gray-500 font-light">{t('dob.subtitle')}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <input
                type="text"
                placeholder={t('dob.placeholder')}
                value={dob}
                onChange={handleDateChange}
                maxLength={10}
                className="w-full p-4 text-base md:text-lg font-medium border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
              />
              {dob.length === 10 && !isOver18 && (
                <p className="text-red-500 text-sm mt-2">{t('dob.ageError')}</p>
              )}
            </div>
            
            <label className="flex items-start space-x-3 cursor-pointer" onClick={() => setCertified(!certified)}>
              <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                certified ? 'bg-[#4fa87f] border-[#4fa87f]' : 'border-gray-400'
              }`}>
                {certified && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-light">{t('dob.certifyAge')}</span>
            </label>
            
            <p className="text-sm text-gray-500 font-light">
              {t('dob.ageRequirement')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!dob || !certified}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            dob && certified 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{t('dob.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
