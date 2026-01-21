'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

// Check if Clerk is configured
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function ClientProviders({ children }: { children: ReactNode }) {
  // If Clerk is not configured, render without ClerkProvider
  if (!isClerkConfigured) {
    return (
      <LanguageProvider>
        <LanguageToggle />
        {children}
      </LanguageProvider>
    );
  }

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
          footerActionLink: 'text-emerald-600 hover:text-emerald-700',
        },
      }}
    >
      <LanguageProvider>
        <LanguageToggle />
        {children}
      </LanguageProvider>
    </ClerkProvider>
  );
}
