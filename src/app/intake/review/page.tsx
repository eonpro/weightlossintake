'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { submitIntake, collectIntakeData, markCheckpointCompleted, submitCheckpoint } from '@/lib/api';

export default function ReviewPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [state, setState] = useState('');
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const hasNavigated = useRef(false);

  // Get user data on mount
  useEffect(() => {
    const nameData = sessionStorage.getItem('intake_name');
    const stateData = sessionStorage.getItem('intake_state');
    
    if (nameData) {
      try {
        const parsed = JSON.parse(nameData);
        setFirstName(parsed.firstName || '');
      } catch {
        setFirstName('');
      }
    }
    
    if (stateData) {
      try {
        const parsed = JSON.parse(stateData);
        // Convert state code to full name
        const stateNames: { [key: string]: string } = {
          'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
          'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
          'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
          'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
          'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
          'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
          'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
          'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
          'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
          'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
        };
        setState(stateNames[parsed.state] || parsed.state || '');
      } catch {
        setState('');
      }
    }
  }, []);

  // Handle animation and navigation
  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          // Redirect to checkout after progress completes
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            setTimeout(async () => {
              // Prepare qualification data to pass to checkout
              const qualificationData = {
                firstName: sessionStorage.getItem('intake_name') ? JSON.parse(sessionStorage.getItem('intake_name')!).firstName : '',
                lastName: sessionStorage.getItem('intake_name') ? JSON.parse(sessionStorage.getItem('intake_name')!).lastName : '',
                email: sessionStorage.getItem('intake_contact') ? JSON.parse(sessionStorage.getItem('intake_contact')!).email : '',
                phone: sessionStorage.getItem('intake_contact') ? JSON.parse(sessionStorage.getItem('intake_contact')!).phone : '',
                state: sessionStorage.getItem('intake_state') ? JSON.parse(sessionStorage.getItem('intake_state')!).state : '',
                address: sessionStorage.getItem('intake_address') || '{}',
                medication_preference: sessionStorage.getItem('medication_preference') || '',
                weight: sessionStorage.getItem('intake_weight') || '{}',
                dob: sessionStorage.getItem('intake_dob') || '{}',
                language: sessionStorage.getItem('language') || 'en',
                qualified: true,
                timestamp: new Date().toISOString(),
                // Enhanced data for smart recommendations
                digestive_conditions: sessionStorage.getItem('digestive_conditions') || '[]',
                chronic_conditions: sessionStorage.getItem('chronic_conditions') || '[]',
                glp1_history: sessionStorage.getItem('glp1_history') || '',
                goals: sessionStorage.getItem('goals') || '[]',
                side_effects: sessionStorage.getItem('common_side_effects') || '[]',
                activity_level: sessionStorage.getItem('activity_level') || ''
              };
              
              // Mark final checkpoint as completed
              markCheckpointCompleted('qualification-complete');
              
              // Submit final checkpoint with qualification data
              await submitCheckpoint('qualification-complete', qualificationData, 'qualified');
              
              // Submit complete intake data to API
              const intakeData = collectIntakeData();
              const submissionResult = await submitIntake(intakeData);
              
              if (submissionResult.success && submissionResult.intakeId) {
                // Store intake ID for reference
                sessionStorage.setItem('submitted_intake_id', submissionResult.intakeId);
              }
              
              // Encode data as base64 to pass through URL
              const encodedData = btoa(JSON.stringify(qualificationData));
              
              // Redirect to checkout platform with data in URL
              const checkoutUrl = `https://eonmedscheckout.vercel.app?q=${encodedData}`;
              
              console.log('Redirecting to checkout:', checkoutUrl);
              window.location.href = checkoutUrl;
            }, 1500);
          }
          return 100;
        }
        return newProgress;
      });
    }, 90); // Update every 90ms to reach 100% in ~4.5 seconds

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#d2c7bb] to-[#e9e1d7] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-3xl font-medium">
            <span className="text-gray-400">
              {language === 'es' ? 'Gracias, ' : 'Thank you, '}
            </span>
            <span className="text-black">{firstName || ''}</span>
          </h1>
          
          {/* Lottie Animation - using the same medical/processing animation */}
          <div className="flex justify-center">
            <div className="w-56 h-56 relative">
              <iframe
                src="https://lottie.host/embed/dc97beb4-edb5-4eb6-93d3-b263f384588b/duQ85tdg83.lottie"
                style={{ 
                  width: '224px', 
                  height: '224px',
                  border: 'none',
                  background: 'transparent'
                }}
                title="Processing animation"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl text-gray-400 leading-tight">
              {language === 'es' 
                ? 'Tu información esta siendo asignada a un médico licenciado en'
                : 'Your information is being assigned to a licensed physician in'}
            </p>
            <p className="text-2xl text-black font-medium">
              {state || ''} <span className="text-gray-400">{language === 'es' ? 'via' : 'via'}</span>
            </p>
            <p className="text-2xl text-black font-medium">
              EONPro MedLink.
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 px-8">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-600">{progress}%</p>
          </div>
          
          <div className="mt-4 h-8">
            <p className="text-sm text-gray-500 italic">
              {language === 'es' 
                ? `Procesando tu información${dots}`
                : `Processing your information${dots}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}