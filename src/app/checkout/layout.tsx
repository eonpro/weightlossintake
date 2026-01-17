'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="relative min-h-screen">
        {/* Language Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageToggle />
        </div>
        {children}
      </div>
    </LanguageProvider>
  );
}
