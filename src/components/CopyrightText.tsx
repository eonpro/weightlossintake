'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface CopyrightTextProps {
  className?: string;
}

export default function CopyrightText({ className = '' }: CopyrightTextProps) {
  const { language } = useLanguage();

  return (
    <p className={`copyright-text text-center ${className}`}>
      {language === 'es' ? (
        <>
          © 2025 EONPro, LLC. Todos los derechos reservados.<br/>
          Proceso exclusivo y protegido. Copiar o reproducir sin autorización está prohibido.
        </>
      ) : (
        <>
          © 2025 EONPro, LLC. All rights reserved.<br/>
          Exclusive and protected process. Copying or reproduction without authorization is prohibited.
        </>
      )}
    </p>
  );
}

