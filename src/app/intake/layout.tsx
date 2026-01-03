'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface IntakeLayoutProps {
  children: ReactNode;
}

// List of all intake-related sessionStorage keys to clear on refresh
const INTAKE_STORAGE_KEYS = [
  'intake_goals',
  'intake_name',
  'intake_state',
  'intake_contact',
  'intake_dob',
  'intake_address',
  'intake_sex',
  'intake_ideal_weight',
  'intake_current_weight',
  'intake_height',
  'intake_session_id',
  'intake_checkpoints',
  'intake_submitted',
  'intake_id',
  'intake_pending_sync',
  'activity_level',
  'medication_preference',
  'glp1_history',
  'glp1_type',
  'has_chronic_conditions',
  'chronic_conditions',
  'digestive_conditions',
  'taking_medications',
  'current_medications',
  'allergies',
  'has_mental_health_condition',
  'mental_health_conditions',
  'surgery_history',
  'surgery_details',
  'blood_pressure',
  'alcohol_consumption',
  'common_side_effects',
  'personalized_treatment_interest',
  'referral_sources',
  'referrer_name',
  'referrer_type',
  'health_improvements',
  'completed_checkpoints',
  'personal_thyroid_cancer',
  'personal_men',
  'personal_pancreatitis',
  'personal_gastroparesis',
  'personal_diabetes_t2',
  'pregnancy_breastfeeding',
  'semaglutide_dosage',
  'semaglutide_side_effects',
  'semaglutide_success',
  'tirzepatide_dosage',
  'tirzepatide_side_effects',
  'tirzepatide_success',
  'dosage_satisfaction',
  'dosage_interest',
  'recreational_drugs',
  'weight_loss_history',
  'weight_loss_support',
  'kidney_conditions',
  'medical_conditions',
  'family_conditions',
];

export default function IntakeLayout({ children }: IntakeLayoutProps) {
  const { language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    // Check if this is a page refresh (not initial load or navigation)
    const navigationType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationType?.type === 'reload') {
      // Clear all intake data on refresh
      INTAKE_STORAGE_KEYS.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Redirect to the start of the intake
      router.replace('/');
      return;
    }

    // Warning message based on language
    const warningMessage = language === 'es'
      ? '¿Estás seguro de que deseas salir? Si actualizas o cierras esta página, perderás todo tu progreso y tendrás que comenzar el formulario desde el principio.'
      : 'Are you sure you want to leave? If you refresh or close this page, you will lose all your progress and will have to start the form from the beginning.';

    // Handler for beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if user has started the intake (has any data in session)
      const hasStarted = sessionStorage.getItem('intake_goals') || 
                         sessionStorage.getItem('intake_name') ||
                         sessionStorage.getItem('intake_state') ||
                         sessionStorage.getItem('intake_contact');
      
      // Only show warning if user has entered some data
      if (hasStarted) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = warningMessage;
        return warningMessage;
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [language, router]);

  return <>{children}</>;
}

