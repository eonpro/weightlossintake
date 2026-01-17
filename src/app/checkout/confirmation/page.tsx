'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import EonmedsLogo from '@/components/EonmedsLogo';
import CopyrightText from '@/components/CopyrightText';
import { useCheckoutStore } from '@/store/checkoutStore';
import { formatPrice } from '@/lib/stripe';
import { logger } from '@/lib/logger';

const translations = {
  en: {
    title: 'Welcome to EONMeds!',
    subtitle: "Your treatment journey begins now",
    orderConfirmed: 'Order Confirmed',
    orderNumber: 'Order Number',
    emailSent: "We've sent a confirmation email to",
    nextSteps: 'What Happens Next?',
    step1Title: 'Physician Review',
    step1Desc: 'Our licensed physician will review your intake within 24 hours',
    step2Title: 'Prescription Approval',
    step2Desc: "If approved, your prescription will be sent to our pharmacy partner",
    step3Title: 'Fast Shipping',
    step3Desc: 'Your medication ships within 24-48 hours of approval',
    step4Title: 'Ongoing Support',
    step4Desc: "You'll have access to our care team throughout your journey",
    questions: 'Have Questions?',
    contactSupport: 'Contact Support',
    returnHome: 'Return to Home',
    thankYou: 'Thank you for choosing EONMeds',
  },
  es: {
    title: '¡Bienvenido a EONMeds!',
    subtitle: 'Tu viaje de tratamiento comienza ahora',
    orderConfirmed: 'Pedido Confirmado',
    orderNumber: 'Número de Pedido',
    emailSent: 'Hemos enviado un correo de confirmación a',
    nextSteps: '¿Qué Sigue?',
    step1Title: 'Revisión Médica',
    step1Desc: 'Nuestro médico licenciado revisará tu información dentro de 24 horas',
    step2Title: 'Aprobación de Receta',
    step2Desc: 'Si se aprueba, tu receta será enviada a nuestra farmacia asociada',
    step3Title: 'Envío Rápido',
    step3Desc: 'Tu medicamento se envía dentro de 24-48 horas de la aprobación',
    step4Title: 'Soporte Continuo',
    step4Desc: 'Tendrás acceso a nuestro equipo de atención durante todo tu proceso',
    questions: '¿Tienes Preguntas?',
    contactSupport: 'Contactar Soporte',
    returnHome: 'Volver al Inicio',
    thankYou: 'Gracias por elegir EONMeds',
  },
};

interface PaymentSuccessData {
  paymentIntentId: string;
  amount: number;
  medication?: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const { reset } = useCheckoutStore();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get payment success data from session
    const successData = sessionStorage.getItem('payment_success');
    if (successData) {
      try {
        setPaymentData(JSON.parse(successData));
      } catch (e) {
        logger.error('Failed to parse payment data');
      }
    }

    // Get email from intake
    const contactData = sessionStorage.getItem('intake_contact');
    if (contactData) {
      try {
        const parsed = JSON.parse(contactData);
        setEmail(parsed.email || '');
      } catch (e) {
        logger.error('Failed to parse contact data');
      }
    }

    // Clear checkout store
    reset();
    
    // Clear payment success data after reading
    sessionStorage.removeItem('payment_success');
  }, [reset]);

  const orderNumber = paymentData?.paymentIntentId 
    ? paymentData.paymentIntentId.slice(-8).toUpperCase() 
    : 'XXXXXX';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar - complete */}
      <div className="w-full h-1 bg-[#b8e64a]"></div>

      {/* Logo */}
      <div className="pt-8">
        <EonmedsLogo />
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 lg:px-8 py-8 max-w-md lg:max-w-lg mx-auto w-full">
        <div className="space-y-8">
          {/* Success Animation */}
          <div className="text-center">
            <div className="w-20 h-20 bg-[#b8e64a] rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-[#413d3d] mb-2">{t.title}</h1>
            <p className="text-[#b8e64a] font-medium">{t.subtitle}</p>
          </div>

          {/* Order Confirmation Card */}
          <div className="bg-[#f0f9e0] rounded-2xl p-6 text-center">
            <div className="text-sm text-[#413d3d]/70 mb-1">{t.orderConfirmed}</div>
            <div className="text-lg font-bold text-[#413d3d]">
              {t.orderNumber}: #{orderNumber}
            </div>
            {paymentData?.amount && (
              <div className="mt-2 text-[#b8e64a] font-semibold">
                {formatPrice(paymentData.amount)}
              </div>
            )}
            {email && (
              <p className="text-sm text-[#413d3d]/70 mt-4">
                {t.emailSent} <span className="font-medium text-[#413d3d]">{email}</span>
              </p>
            )}
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h2 className="font-semibold text-[#413d3d] text-center">{t.nextSteps}</h2>
            
            <div className="space-y-3">
              {[
                { icon: '📋', title: t.step1Title, desc: t.step1Desc },
                { icon: '✅', title: t.step2Title, desc: t.step2Desc },
                { icon: '📦', title: t.step3Title, desc: t.step3Desc },
                { icon: '💬', title: t.step4Title, desc: t.step4Desc },
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-[#f0f9e0] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#413d3d] text-sm">{step.title}</h3>
                    <p className="text-xs text-[#413d3d]/60 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-sm text-[#413d3d]/70 mb-3">{t.questions}</p>
            <a 
              href="mailto:support@eonmeds.com"
              className="inline-flex items-center gap-2 text-[#b8e64a] font-medium hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t.contactSupport}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={() => router.push('/')}
          className="continue-button bg-[#413d3d] hover:bg-[#2a2727]"
        >
          <span>{t.returnHome}</span>
        </button>
        
        <p className="text-center text-sm text-[#413d3d]/60 mt-4">{t.thankYou}</p>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <CopyrightText />
        </div>
      </div>
    </div>
  );
}
