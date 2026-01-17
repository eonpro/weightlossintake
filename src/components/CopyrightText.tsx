'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface CopyrightTextProps {
  className?: string;
}

export default function CopyrightText({ className = '' }: CopyrightTextProps) {
  const { language } = useLanguage();

  return (
    <div className={`copyright-text text-center ${className}`} style={{ lineHeight: '1.1' }}>
      <p className="text-gray-400 font-medium text-[11px]">
        {language === 'es' ? 'Formulario médico seguro conforme a HIPAA' : 'HIPAA-Secured Medical Intake'}
      </p>
      <p className="text-gray-400 text-[11px]">
        {language === 'es' ? (
          <>© 2026 EONPro, LLC. Todos los derechos reservados.<br/>Proceso exclusivo y protegido.</>
        ) : (
          <>© 2026 EONPro, LLC. All rights reserved.<br/>Exclusive and protected process.</>
        )}
      </p>
    </div>
  );
}

