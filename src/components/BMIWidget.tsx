'use client';

import { useState, useEffect } from 'react';

interface BMIWidgetProps {
  bmi: number;
  language: 'en' | 'es';
}

export default function BMIWidget({ bmi, language }: BMIWidgetProps) {
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  // Calculate position on the scale (18.5 to 40 range mapped to 0-100%)
  const calculatePosition = (bmiValue: number) => {
    if (bmiValue <= 18.5) return 0;
    if (bmiValue <= 25) return ((bmiValue - 18.5) / 6.5) * 33;
    if (bmiValue <= 30) return 33 + ((bmiValue - 25) / 5) * 33;
    if (bmiValue <= 40) return 66 + ((bmiValue - 30) / 10) * 34;
    return 100;
  };

  // Get BMI category
  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return language === 'es' ? 'Bajo Peso' : 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return language === 'es' ? 'Sobrepeso' : 'Overweight';
    if (bmiValue < 35) return language === 'es' ? 'Obesidad I' : 'Obesity I';
    if (bmiValue < 40) return language === 'es' ? 'Obesidad II' : 'Obesity II';
    return language === 'es' ? 'Obesidad III' : 'Obesity III';
  };

  // Check if BMI is approved (>= 23 for medication eligibility)
  const isApproved = bmi >= 23;
  const statusText = isApproved 
    ? (language === 'es' ? 'IMC Aprobado ✓' : 'BMI Approved ✓')
    : (language === 'es' ? 'IMC No Aprobado' : 'BMI Not Approved');

  useEffect(() => {
    if (bmi > 0) {
      const position = calculatePosition(bmi);
      
      // Animate the indicator after a short delay
      setTimeout(() => {
        setShowIndicator(true);
        setTimeout(() => {
          setIndicatorPosition(position);
          setTimeout(() => {
            setShowLabel(true);
          }, 1200);
        }, 100);
      }, 300);
    }
  }, [bmi]);

  const categoryLabels = language === 'es' 
    ? ['Bajo', 'Normal', 'Sobrepeso', 'Obesidad']
    : ['Under', 'Normal', 'Over', 'Obese'];

  return (
    <div className="relative w-full max-w-md mx-auto py-10 px-4">
      {/* Floating Label */}
      <div 
        className="absolute -top-2 transition-all duration-500"
        style={{ 
          left: `${indicatorPosition}%`,
          transform: 'translateX(-50%)',
          opacity: showLabel ? 1 : 0
        }}
      >
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white text-[11px] font-semibold tracking-wide px-4 py-2 rounded-full whitespace-nowrap shadow-lg">
            {statusText} · {getBMICategory(bmi)}
          </div>
          {/* Triangle pointer */}
          <div 
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #1f2937'
            }}
          />
        </div>
      </div>

      {/* Track */}
      <div className="relative h-3 w-full rounded-full bg-gray-200 shadow-inner overflow-visible">
        {/* Gradient */}
        <div 
          className="absolute inset-0 rounded-full opacity-90"
          style={{
            background: 'linear-gradient(90deg, #ff6b6b 0%, #feca57 20%, #48dbfb 40%, #1dd1a1 60%, #feca57 80%, #ff6b6b 100%)'
          }}
        />
        
        {/* Indicator Dot */}
        {showIndicator && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out"
            style={{ left: `${indicatorPosition}%`, transform: `translateX(-50%) translateY(-50%)` }}
          >
            <div className="relative">
              {/* Outer ring animation */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-emerald-400/40"
                style={{
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}
              />
              {/* Main dot */}
              <div className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #1dd1a1, #10ac84)'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-2 px-0.5">
        <span className="text-[10px] font-medium text-gray-500">18.5</span>
        <span className="text-[10px] font-medium text-gray-500">25</span>
        <span className="text-[10px] font-medium text-gray-500">30</span>
        <span className="text-[10px] font-medium text-gray-500">40</span>
      </div>

      {/* Category Labels */}
      <div className="flex justify-between mt-3 px-1">
        {categoryLabels.map((label, index) => (
          <span key={index} className="text-[8px] font-medium text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes ping {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          75%, 100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

