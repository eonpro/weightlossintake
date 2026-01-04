'use client';

import { useState, useEffect } from 'react';

interface BMIWidgetProps {
  bmi: number;
  language: 'en' | 'es';
}

export default function BMIWidget({ bmi, language }: BMIWidgetProps) {
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  // Calculate position on the scale (18.5 to 40 range mapped to 0-100%)
  const calculatePosition = (bmiValue: number) => {
    if (bmiValue <= 18.5) return 0;
    if (bmiValue <= 25) return ((bmiValue - 18.5) / 6.5) * 33;
    if (bmiValue <= 30) return 33 + ((bmiValue - 25) / 5) * 33;
    if (bmiValue <= 40) return 66 + ((bmiValue - 30) / 10) * 34;
    return 100;
  };

  useEffect(() => {
    if (bmi > 0) {
      const position = calculatePosition(bmi);
      
      // Animate the indicator after a short delay
      setTimeout(() => {
        setShowIndicator(true);
        setTimeout(() => {
          setIndicatorPosition(position);
        }, 100);
      }, 300);
    }
  }, [bmi]);

  const categoryLabels = language === 'es' 
    ? ['BAJO', 'NORMAL', 'SOBREPESO', 'OBESIDAD']
    : ['UNDER', 'NORMAL', 'OVER', 'OBESE'];

  return (
    <div className="relative w-full max-w-md mx-auto pt-2 pb-4">
      {/* Track */}
      <div className="relative h-3 w-full rounded-full bg-gray-200 overflow-visible">
        {/* Gradient - cleaner design matching screenshot */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #ff8a80 0%, #ffcc80 25%, #a5d6a7 50%, #4db6ac 75%, #4db6ac 100%)'
          }}
        />
        
        {/* Indicator Dot - only show if BMI is valid */}
        {showIndicator && bmi > 0 && (
          <div
            className="absolute top-1/2 z-10 transition-all duration-1000 ease-out"
            style={{
              left: `${indicatorPosition}%`,
              transform: 'translateX(-50%) translateY(-50%)'
            }}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-white">
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: '#4fa87f' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-2 px-0.5">
        <span className="text-[11px] font-medium text-gray-600">18.5</span>
        <span className="text-[11px] font-medium text-gray-600">25</span>
        <span className="text-[11px] font-medium text-gray-600">30</span>
        <span className="text-[11px] font-medium text-gray-600">40</span>
      </div>

      {/* Category Labels */}
      <div className="flex justify-between mt-1 px-0">
        {categoryLabels.map((label, index) => (
          <span key={index} className="text-[9px] font-semibold text-gray-500 tracking-wide">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

