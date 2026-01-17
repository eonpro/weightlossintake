'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import EonmedsLogo from '@/components/EonmedsLogo';
import CopyrightText from '@/components/CopyrightText';
import { useCheckoutStore, getPatientInfoFromIntake } from '@/store/checkoutStore';
import { ADDONS, EXPEDITED_SHIPPING_PRICE, formatPrice } from '@/lib/stripe';

const translations = {
  en: {
    title: 'Final Step',
    subtitle: 'Start your transformation today',
    orderSummary: 'Your Treatment Plan',
    product: 'Product',
    total: 'Total',
    payNow: 'Start My Treatment',
    processing: 'Processing...',
    backToProducts: 'Back to product selection',
    securePayment: 'Secure payment powered by Stripe',
    noProductSelected: 'No product selected. Please go back and select a treatment.',
    paymentError: 'Payment failed. Please try again.',
    perMonth: '/month',
    oneTime: 'one-time',
    whyStartNow: 'Why Start Today?',
    benefit1Title: 'Ships Within 24-48 Hours',
    benefit1Desc: 'Fast processing to get you started quickly',
    benefit2Title: 'Personal Health Advisor',
    benefit2Desc: 'Dedicated support throughout your journey',
    benefit3Title: 'Licensed Pharmacy Treatment',
    benefit3Desc: 'Medications from certified US pharmacies',
    limitedOffer: 'Limited Time',
    spotsRemaining: 'Only 3 spots left at this price',
    expeditedShipping: 'Expedited Shipping',
  },
  es: {
    title: 'Paso Final',
    subtitle: 'Comienza tu transformación hoy',
    orderSummary: 'Tu Plan de Tratamiento',
    product: 'Producto',
    total: 'Total',
    payNow: 'Iniciar Mi Tratamiento',
    processing: 'Procesando...',
    backToProducts: 'Volver a selección de productos',
    securePayment: 'Pago seguro procesado por Stripe',
    noProductSelected: 'No hay producto seleccionado. Por favor regresa y selecciona un tratamiento.',
    paymentError: 'El pago falló. Por favor intenta de nuevo.',
    perMonth: '/mes',
    oneTime: 'único pago',
    whyStartNow: '¿Por qué empezar hoy?',
    benefit1Title: 'Envío en 24-48 Horas',
    benefit1Desc: 'Procesamiento rápido para comenzar pronto',
    benefit2Title: 'Asesor Personal de Salud',
    benefit2Desc: 'Apoyo dedicado durante tu proceso',
    benefit3Title: 'Tratamiento de Farmacia Licenciada',
    benefit3Desc: 'Medicamentos de farmacias certificadas en EE.UU.',
    limitedOffer: 'Tiempo Limitado',
    spotsRemaining: 'Solo quedan 3 lugares a este precio',
    expeditedShipping: 'Envío Expedito',
  },
};

interface ProductInfo {
  medication: string;
  tierId: string;
  tierDose: string;
  billingType: 'monthly' | 'single' | 'three_month' | 'six_month';
  priceId: string;
  price: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const isSpanish = language === 'es';
  
  const { 
    selectedAddons,
    expeditedShipping,
    shippingAddress,
    setPaymentStatus, 
    setPaymentIntentId 
  } = useCheckoutStore();
  
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '' });

  // Load patient info and product info
  useEffect(() => {
    const info = getPatientInfoFromIntake();
    setPatientInfo(info);
    
    // Get product info from session
    const storedProduct = sessionStorage.getItem('checkout_product');
    if (storedProduct) {
      try {
        setProductInfo(JSON.parse(storedProduct));
      } catch {
        // Silent fail - invalid product data in session
      }
    }
  }, []);

  // Calculate total
  const calculateTotal = () => {
    let total = productInfo?.price || 0;
    
    // Add addons
    if (selectedAddons.includes('nausea_relief')) {
      total += ADDONS.nauseaRelief.price;
    }
    if (selectedAddons.includes('fat_burner')) {
      total += ADDONS.fatBurner.price;
    }
    
    // Add expedited shipping
    if (expeditedShipping) {
      total += EXPEDITED_SHIPPING_PRICE;
    }
    
    return total;
  };

  // Create PaymentIntent when component loads
  useEffect(() => {
    if (!productInfo) {
      setLoading(false);
      return;
    }

    async function createPaymentIntent() {
      try {
        setLoading(true);
        const totalAmount = calculateTotal();
        
        // Get Meta tracking data from session
        const metaEventId = sessionStorage.getItem('meta_event_id') || '';
        const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1] || '';
        const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1] || '';
        
        // Determine if recurring
        const isSubscription = productInfo!.billingType === 'monthly';
        
        // Map billing type to readable plan name
        const planName = {
          monthly: 'Monthly Subscription',
          single: 'One-Time Purchase',
          three_month: '3-Month Supply',
          six_month: '6-Month Supply',
        }[productInfo!.billingType];
        
        const response = await fetch('/api/stripe/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            currency: 'usd',
            customer_email: patientInfo.email,
            customer_name: `${patientInfo.firstName} ${patientInfo.lastName}`,
            customer_phone: patientInfo.phone,
            shipping_address: shippingAddress ? {
              addressLine1: shippingAddress.street,
              addressLine2: shippingAddress.unit,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zipCode: shippingAddress.zipCode,
              country: 'US',
            } : undefined,
            order_data: {
              medication: productInfo!.medication,
              dose: productInfo!.tierDose,
              plan: planName,
              priceId: productInfo!.priceId,
              isSubscription: isSubscription,
              addons: selectedAddons.map(id => {
                if (id === 'nausea_relief') return 'Nausea Relief (Ondansetron)';
                if (id === 'fat_burner') return 'Fat Burner (L-Carnitine + B Complex)';
                return id;
              }),
              expeditedShipping: expeditedShipping,
              subtotal: productInfo!.price,
              shippingCost: expeditedShipping ? EXPEDITED_SHIPPING_PRICE : 0,
              total: totalAmount,
            },
            language: language,
            // Meta CAPI tracking
            meta_event_id: metaEventId,
            fbp: fbp,
            fbc: fbc,
            page_url: typeof window !== 'undefined' ? window.location.href : '',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
        if (data.paymentIntentId) {
          setPaymentIntentId(data.paymentIntentId);
        }
      } catch (err) {
        // Payment initialization error - display to user
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }

    if (patientInfo.email && productInfo) {
      createPaymentIntent();
    }
  }, [productInfo, patientInfo.email, expeditedShipping, selectedAddons, shippingAddress, language, setPaymentIntentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation`,
          payment_method_data: {
            billing_details: {
              name: `${patientInfo.firstName} ${patientInfo.lastName}`,
              email: patientInfo.email,
            },
          },
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        throw paymentError;
      }

      if (paymentIntent?.status === 'succeeded') {
        setPaymentStatus('succeeded');
        
        // Store payment info in session for confirmation page
        sessionStorage.setItem('payment_success', JSON.stringify({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          medication: productInfo?.medication,
          dose: productInfo?.tierDose,
        }));
        
        // Clear checkout product
        sessionStorage.removeItem('checkout_product');
        
        router.push('/checkout/confirmation');
      }
    } catch (err) {
      // Payment failed - display error to user
      setPaymentStatus('failed');
      setError(err instanceof Error ? err.message : t.paymentError);
    } finally {
      setProcessing(false);
    }
  };

  // No product selected
  if (!productInfo && !loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-[#b8e64a] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[#413d3d] mb-6">{t.noProductSelected}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="continue-button"
          >
            <span>{t.backToProducts}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-2/3 bg-[#b8e64a] transition-all duration-300"></div>
      </div>

      {/* Back button */}
      <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      {/* Logo */}
      <EonmedsLogo />

      {/* Main content */}
      <div className="flex-1 px-6 lg:px-8 py-4 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <div className="space-y-5">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#413d3d] mb-1">{t.title}</h1>
            <p className="text-[#b8e64a] font-medium">{t.subtitle}</p>
          </div>

          {/* Limited Offer Banner */}
          <div className="bg-gradient-to-r from-[#b8e64a] to-[#9ad436] rounded-xl p-3 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm font-semibold">{t.limitedOffer}: {t.spotsRemaining}</span>
          </div>

          {/* Order Summary */}
          {productInfo && (
            <div className="bg-[#f0f9e0] rounded-2xl p-4">
              <h3 className="font-semibold text-[#413d3d] mb-3">{t.orderSummary}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#413d3d]/70">{t.product}</span>
                  <span className="text-[#413d3d] font-medium">{productInfo.medication} {productInfo.tierDose}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#413d3d]/70">Plan</span>
                  <span className="text-[#413d3d]">{formatPrice(productInfo.price)}</span>
                </div>
                {selectedAddons.map(addonId => {
                  const addon = Object.values(ADDONS).find(a => a.id === addonId);
                  if (!addon) return null;
                  return (
                    <div key={addonId} className="flex justify-between text-sm">
                      <span className="text-[#413d3d]/70">{isSpanish ? addon.name.es : addon.name.en}</span>
                      <span className="text-[#413d3d]">{formatPrice(addon.price)}</span>
                    </div>
                  );
                })}
                {expeditedShipping && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#413d3d]/70">{t.expeditedShipping}</span>
                    <span className="text-[#413d3d]">{formatPrice(EXPEDITED_SHIPPING_PRICE)}</span>
                  </div>
                )}
                <div className="border-t border-[#b8e64a]/30 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-[#413d3d]">{t.total}</span>
                    <span className="text-[#b8e64a]">
                      {formatPrice(calculateTotal())}
                      {productInfo.billingType === 'monthly' && (
                        <span className="text-xs text-[#413d3d]/60 font-normal ml-1">{t.perMonth}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#413d3d] text-center">{t.whyStartNow}</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-[#f0f9e0] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#b8e64a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#413d3d] text-sm">{t.benefit1Title}</h4>
                  <p className="text-xs text-[#413d3d]/60">{t.benefit1Desc}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-[#f0f9e0] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#b8e64a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#413d3d] text-sm">{t.benefit2Title}</h4>
                  <p className="text-xs text-[#413d3d]/60">{t.benefit2Desc}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-[#f0f9e0] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#b8e64a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#413d3d] text-sm">{t.benefit3Title}</h4>
                  <p className="text-xs text-[#413d3d]/60">{t.benefit3Desc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info - Compact */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#b8e64a] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{patientInfo.firstName?.charAt(0)}{patientInfo.lastName?.charAt(0)}</span>
            </div>
            <div className="text-sm text-[#413d3d]/80 overflow-hidden">
              <p className="font-medium truncate">{patientInfo.firstName} {patientInfo.lastName}</p>
              <p className="text-xs truncate">{patientInfo.email}</p>
            </div>
          </div>

          {/* Payment Form */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8e64a]"></div>
            </div>
          ) : clientSecret ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-2">
                <PaymentElement
                  options={{
                    layout: {
                      type: 'accordion',
                      defaultCollapsed: false,
                      radios: true,
                      spacedAccordionItems: true,
                    },
                  }}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Secure payment badge */}
              <div className="flex items-center justify-center text-sm text-[#413d3d]/60">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {t.securePayment}
              </div>
            </form>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={handleSubmit}
          disabled={!stripe || !clientSecret || processing}
          className="continue-button"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              <span>{t.processing}</span>
            </>
          ) : (
            <>
              <span>{t.payNow}</span>
              {productInfo && (
                <span className="ml-2">
                  ({formatPrice(calculateTotal())})
                </span>
              )}
            </>
          )}
        </button>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <CopyrightText />
        </div>
      </div>
    </div>
  );
}
