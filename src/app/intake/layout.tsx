'use client';

import { useEffect, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface IntakeLayoutProps {
  children: ReactNode;
}

export default function IntakeLayout({ children }: IntakeLayoutProps) {
  const { language } = useLanguage();

  useEffect(() => {
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
  }, [language]);

  return <>{children}</>;
}

