'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function BMIResultPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [bmi, setBmi] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [idealWeight, setIdealWeight] = useState(0);
  const [heightStr, setHeightStr] = useState('');
  const [firstName, setFirstName] = useState('');
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Get data from session storage
    const nameData = sessionStorage.getItem('intake_name');
    const weightData = sessionStorage.getItem('intake_current_weight');
    const idealWeightData = sessionStorage.getItem('intake_ideal_weight');
    const heightData = sessionStorage.getItem('intake_height');
    
    if (nameData) {
      setFirstName(JSON.parse(nameData).firstName);
    }
    
    if (weightData && heightData) {
      const weight = parseInt(weightData);
      const height = JSON.parse(heightData);
      const totalInches = parseInt(height.feet) * 12 + parseInt(height.inches);
      
      // Calculate BMI: (weight / (height^2)) * 703
      const calculatedBMI = (weight / (totalInches * totalInches)) * 703;
      const finalBMI = Math.round(calculatedBMI * 100) / 100;
      setBmi(finalBMI);
      setCurrentWeight(weight);
      setHeightStr(`${height.feet}'${height.inches}"`);
      
      // Calculate indicator position (BMI range is 18.5 to 40)
      const minBMI = 18.5;
      const maxBMI = 40;
      const position = ((finalBMI) - minBMI) / (maxBMI - minBMI) * 100;
      
      // Animate the indicator after a short delay
      setTimeout(() => {
        setShowIndicator(true);
        setTimeout(() => {
          setIndicatorPosition(Math.min(Math.max(position, 0), 100));
        }, 100);
      }, 500);
    }
    
    if (idealWeightData) {
      setIdealWeight(parseInt(idealWeightData));
    }
  }, []);

  const weightToLose = currentWeight - idealWeight;
  const goalBMI = idealWeight && currentWeight ? 
    Math.round(((idealWeight / Math.pow((parseInt(heightStr.split("'")[0]) * 12 + parseInt(heightStr.split("'")[1] || 0)), 2)) * 703) * 100) / 100 : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-4/6 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link href="/intake/current-weight" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-md mx-auto w-full">
        <div className="space-y-5">
          {/* Header Text */}
          <div className="text-left mb-5">
            <h2 className="text-2xl font-medium text-black leading-snug">
              {t('bmi.result.header.line1')}<br/>
              {t('bmi.result.header.line2')}<br/>
              {t('bmi.result.header.line3')}<br/>
              {t('bmi.result.header.line4')}
            </h2>
          </div>
          
          {/* BMI Result Card */}
          <div className="bg-[#f0feab] rounded-3xl p-5 space-y-3">
            <h1 className="text-xl font-semibold text-black">
              <span className="text-[#4fa87f]">{firstName || 'firstname'}</span>, {t('bmi.result.yourBMI')} {t('bmi.result.is')}
            </h1>
            
            <div className="text-5xl font-bold text-[#4fa87f] -mt-1">{bmi ? bmi.toFixed(2) : 'NaN'}</div>
            
            <div className="space-y-0 text-sm text-black">
              <p className="font-normal">{t('bmi.result.currentWeight')}: <span className="text-[#4fa87f] font-normal">{currentWeight ? `${currentWeight} ${t('common.lbs')}` : 'starting_weight lbs'}</span></p>
              <p className="font-normal">{t('bmi.result.height')}: <span className="text-[#4fa87f] font-normal">{heightStr || 'feet\'inches"'}</span></p>
            </div>
            
            <p className="text-xs text-gray-600 font-normal leading-relaxed mt-4">
              {t('bmi.result.disclaimer')}
            </p>
            
            {/* BMI Range Bar */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-end">
                <div className="bg-white rounded-full px-3 py-1">
                  <span className="font-medium text-black" style={{ fontSize: '11px' }}>{t('bmi.result.approvedBMI')}</span>
                </div>
              </div>
              
              <div className="relative h-7 bg-gradient-to-r from-[#f4c790] via-[#8ed5a1] to-[#8ed5a1] rounded-full overflow-visible">
                {showIndicator && (
                  <div 
                    className="absolute"
                    style={{ 
                      left: `${indicatorPosition}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      transition: 'left 1.5s ease-out'
                    }}
                  >
                    <div className="w-7 h-7 bg-white rounded-full border-2 border-gray-300 shadow-md"></div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between text-sm text-black font-normal px-1">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>
            
            {/* Approval Message */}
            <div className="bg-[#e4fb74] rounded-2xl p-3 flex items-start space-x-3 mt-3">
              <div className="w-7 h-7 bg-[#4fa87f] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-black font-normal leading-relaxed">
                {t('bmi.result.fallsWithinRange')}
              </p>
            </div>
          </div>

          {/* Goal Card */}
          <div className="bg-[#e4fb74] rounded-3xl p-5 space-y-3">
            <h2 className="text-xl font-semibold text-black">{t('bmi.result.yourGoal')}</h2>
            <div className="text-5xl font-bold text-[#5ab3a4] -mt-1">{weightToLose ? `${Math.abs(weightToLose).toFixed(2)}` : '0.00'} {t('common.lbs')}</div>
            <p className="text-sm text-black font-normal">{t('bmi.result.averageLoss')}</p>
            
            <div className="space-y-2 mt-4">
              <p className="text-base font-normal text-black">{t('bmi.result.bmiGoal')} <span className="text-[#5ab3a4] font-bold">{goalBMI ? goalBMI.toFixed(2) : 'NaN'}</span></p>
              <p className="text-[#4fa87f] text-sm font-normal">{t('bmi.result.whyImportant')}</p>
              <p className="text-sm text-black font-normal leading-relaxed">{t('bmi.result.doctorsUse')}</p>
            </div>

            {/* Doctor Image */}
            <div className="flex items-center space-x-4 bg-[#f0feab] rounded-2xl p-4 mt-3">
              <img 
                src="https://static.wixstatic.com/media/c49a9b_60e51d36e98e4128a6edb7987a3d6b8b~mv2.webp"
                alt="Doctor"
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: '106px', height: '106px' }}
              />
              <p className="text-xs text-black font-normal leading-relaxed">
                {t('bmi.result.restAssured')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={() => router.push('/intake/testimonials')}
          className="w-full bg-[#e4fb74] text-black py-4 px-8 rounded-full text-lg font-normal flex items-center justify-center space-x-3 hover:bg-[#d8e668] transition-colors"
        >
          <span>{t('bmi.result.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
