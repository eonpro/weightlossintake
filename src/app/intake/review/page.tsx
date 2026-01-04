'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'submitting' | 'success' | 'error'>('pending');
  const hasSubmitted = useRef(false);

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

  // Submit data to Airtable
  const submitToAirtable = useCallback(async () => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    
    setSubmissionStatus('submitting');

    try {
      // Collect all intake data
      const intakeData = collectIntakeData();

      // Mark checkpoint
      markCheckpointCompleted('qualification-complete');
      
      // Submit to Airtable
      const result = await submitIntake(intakeData);

      if (result.success && result.intakeId) {
        sessionStorage.setItem('submitted_intake_id', result.intakeId);
        sessionStorage.setItem('submission_status', 'success');
        setSubmissionStatus('success');
        
        // Navigate after successful submission
        setTimeout(() => {
          router.push('/intake/qualified');
        }, 500);
      } else {
        console.error('❌ FAILED:', result.error);
        sessionStorage.setItem('submission_status', 'failed');
        sessionStorage.setItem('submission_error', result.error || 'Unknown error');
        setSubmissionStatus('error');
        
        // Still navigate after delay
        setTimeout(() => {
          router.push('/intake/qualified');
        }, 2000);
      }
    } catch (error) {
      console.error('💥 EXCEPTION:', error);
      sessionStorage.setItem('submission_status', 'error');
      sessionStorage.setItem('submission_error', String(error));
      setSubmissionStatus('error');
      
      // Still navigate after delay
      setTimeout(() => {
        router.push('/intake/qualified');
      }, 2000);
    }
  }, [router]);

  // Handle animation and trigger submission when progress hits 100%
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
          // Trigger submission when progress completes
          submitToAirtable();
          return 100;
        }
        return newProgress;
      });
    }, 90); // Update every 90ms to reach 100% in ~4.5 seconds

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, [submitToAirtable]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl">
            <span className="text-gray-400">
              {language === 'es' ? 'Gracias, ' : 'Thank you, '}
            </span>
            <span className="text-black font-semibold">{firstName || ''}</span>
          </h1>
          
          {/* Lottie Animation - Medical processing animation */}
          <div className="flex justify-center">
            <div className="w-40 h-40 relative">
              <iframe
                src="https://lottie.host/embed/9fb843e1-1010-4dd3-bb0c-c9e194ec74ef/FPTlU6rmSq.lottie"
                style={{ 
                  width: '160px', 
                  height: '160px',
                  border: 'none',
                  background: 'transparent'
                }}
                title="Processing animation"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-lg text-gray-400 leading-tight">
              {language === 'es' 
                ? 'Tu información esta siendo asignada a un'
                : 'Your information is being assigned to a'}
            </p>
            <p className="text-lg">
              <span className="text-[#4fa87f] font-semibold">{state || ''}</span>
              <span className="text-gray-400"> {language === 'es' ? 'médico licenciado via' : 'licensed physician via'}</span>
            </p>
          </div>
          
          {/* MedLink Logo */}
          <div className="flex justify-center mt-2">
            <img 
              src="https://static.wixstatic.com/shapes/c49a9b_f5e1ceda9f1341bc9e97cc0a6b4d19a3.svg"
              alt="MedLink"
              className="h-10"
            />
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 px-8">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-600">{progress}%</p>
          </div>
          
          <div className="mt-2 h-6">
            <p className="text-sm text-gray-500 italic">
              {submissionStatus === 'submitting' && (
                language === 'es' 
                  ? `Guardando tu información${dots}`
                  : `Saving your information${dots}`
              )}
              {submissionStatus === 'success' && (
                language === 'es' 
                  ? '✓ Información guardada correctamente'
                  : '✓ Information saved successfully'
              )}
              {submissionStatus === 'error' && (
                language === 'es' 
                  ? 'Continuando...'
                  : 'Continuing...'
              )}
              {submissionStatus === 'pending' && (
                language === 'es' 
                  ? `Procesando tu información${dots}`
                  : `Processing your information${dots}`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}