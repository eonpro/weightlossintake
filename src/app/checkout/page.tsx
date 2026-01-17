'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import CopyrightText from '@/components/CopyrightText';
import { useCheckoutStore, loadShippingFromIntake, getPatientInfoFromIntake } from '@/store/checkoutStore';
import { 
  MEDICATIONS, 
  ADDONS, 
  EXPEDITED_SHIPPING_PRICE, 
  formatPrice,
  DoseTier,
} from '@/lib/stripe';
import type { ShippingAddress } from '@/types/checkout';

// Product images from EONMeds
const PRODUCT_IMAGES = {
  semaglutide: 'https://static.wixstatic.com/media/c49a9b_7adb19325cea4ad8b15d6845977fc42a~mv2.png',
  tirzepatide: 'https://static.wixstatic.com/media/c49a9b_00c1ff5076814c8e93e3c53a132b962e~mv2.png',
};

const ADDON_IMAGES = {
  nauseaRelief: 'https://static.wixstatic.com/media/c49a9b_6388967b1dfa4b25a1a08bf235023e66~mv2.webp',
  fatBurner: 'https://static.wixstatic.com/media/c49a9b_603d154460b44f4197168694262a2605~mv2.png',
};

const translations = {
  en: {
    greeting: 'Select Your Plan & Add-ons',
    subtitle: 'Choose your subscription plan and optional enhancements',
    hsaFsa: 'HSA/FSA cards accepted',
    compounded: 'Compounded',
    description: 'Personalized weekly GLP-1 injection for weight management',
    chooseYourPlan: 'Choose Your Plan',
    monthlyRecurring: 'Monthly Recurring',
    threeMonth: '3 Month Package',
    sixMonth: '6 Month Package',
    oneTime: 'One Time Purchase',
    planBreakdown: 'Plan breakdown:',
    chargedEveryMonth: 'charged every month',
    chargedEvery3Months: 'charged every 3 months',
    chargedEvery6Months: 'charged every 6 months',
    oneTimeCharge: 'one-time charge',
    shipsEveryMonth: 'Ships every month',
    shipsEvery3Months: 'Ships every 3 months',
    shipsEvery6Months: 'Ships every 6 months',
    shipsOnce: 'Ships once',
    includesMonths: 'Includes {months} month(s) of medication and ongoing support',
    paidUpfront: '*Paid upfront in full. Cancel or change your plan any time in your online account.',
    save: 'Save',
    optionalAddons: 'Optional Add-ons',
    nauseaRelief: 'Nausea Relief Prescription',
    nauseaDesc: 'Prescription medication to manage GLP-1 side effects',
    fatBurner: 'Fat Burner (L-Carnitine + B Complex)',
    fatBurnerDesc: 'Boost metabolism and energy during weight loss',
    perMonth: '/month',
    back: 'Back',
    continueToShipping: 'Continue to Shipping',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'FREE',
    total: 'Total',
    encrypted: 'Encrypted & secure check out',
    legitScript: 'LegitScript Certified',
    trusted: 'Trusted by 20,000+ patients nationwide',
    fastDelivery: 'Fast and discreet delivery to your home',
    moreEffective: 'More Effective',
  },
  es: {
    greeting: 'Selecciona Tu Plan y Complementos',
    subtitle: 'Elige tu plan de suscripción y mejoras opcionales',
    hsaFsa: 'Tarjetas HSA/FSA aceptadas',
    compounded: 'Compuesto',
    description: 'Inyección GLP-1 semanal personalizada para control de peso',
    chooseYourPlan: 'Elige Tu Plan',
    monthlyRecurring: 'Mensual Recurrente',
    threeMonth: 'Paquete de 3 Meses',
    sixMonth: 'Paquete de 6 Meses',
    oneTime: 'Compra Única',
    planBreakdown: 'Desglose del plan:',
    chargedEveryMonth: 'cobrado cada mes',
    chargedEvery3Months: 'cobrado cada 3 meses',
    chargedEvery6Months: 'cobrado cada 6 meses',
    oneTimeCharge: 'cargo único',
    shipsEveryMonth: 'Envío cada mes',
    shipsEvery3Months: 'Envío cada 3 meses',
    shipsEvery6Months: 'Envío cada 6 meses',
    shipsOnce: 'Envío único',
    includesMonths: 'Incluye {months} mes(es) de medicamento y soporte continuo',
    paidUpfront: '*Pago total por adelantado. Cancela o cambia tu plan en cualquier momento desde tu cuenta.',
    save: 'Ahorra',
    optionalAddons: 'Complementos Opcionales',
    nauseaRelief: 'Receta Anti-Náuseas',
    nauseaDesc: 'Medicamento recetado para manejar efectos secundarios del GLP-1',
    fatBurner: 'Quemador de Grasa (L-Carnitina + Complejo B)',
    fatBurnerDesc: 'Aumenta el metabolismo y energía durante la pérdida de peso',
    perMonth: '/mes',
    back: 'Atrás',
    continueToShipping: 'Continuar a Envío',
    orderSummary: 'Resumen del Pedido',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    free: 'GRATIS',
    total: 'Total',
    encrypted: 'Pago encriptado y seguro',
    legitScript: 'Certificado LegitScript',
    trusted: 'Confiado por más de 20,000 pacientes',
    fastDelivery: 'Entrega rápida y discreta a tu hogar',
    moreEffective: 'Más Efectivo',
  },
};

type BillingType = 'monthly' | 'single' | 'three_month' | 'six_month';

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const isSpanish = language === 'es';
  
  const {
    intakeData,
    loadIntakeData,
    selectedMedication,
    setSelectedMedication,
    selectedTier,
    setSelectedTier,
    recommendedTier,
    billingType,
    setBillingType,
    showTirzepatideUpgrade,
    shippingAddress,
    setShippingAddress,
    selectedAddons,
    toggleAddon,
    expeditedShipping,
  } = useCheckoutStore();
  
  const [patientInfo, setPatientInfo] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '' });

  // Load patient info, address, and intake data on mount
  useEffect(() => {
    const info = getPatientInfoFromIntake();
    setPatientInfo(info);
    
    // Load shipping address
    const address = shippingAddress || loadShippingFromIntake();
    if (address) {
      setShippingAddress(address);
    }
    
    // Load GLP-1 intake data
    loadIntakeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get current medication config
  const medicationConfig = MEDICATIONS[selectedMedication];
  const availableTiers = medicationConfig.doseTiers;
  const currentTier = selectedTier || recommendedTier || availableTiers[0];
  const defaultTier = availableTiers.find(t => t.id === medicationConfig.defaultTierId) || availableTiers[0];

  // Calculate price based on billing type
  const getPrice = (tier: DoseTier, type: BillingType): number => {
    switch (type) {
      case 'monthly': return tier.plans.monthlyRecurring;
      case 'single': return tier.plans.singleMonth;
      case 'three_month': return tier.plans.threeMonth;
      case 'six_month': return tier.plans.sixMonth;
    }
  };

  const getMonthlyPrice = (tier: DoseTier): number => {
    return tier.plans.monthlyRecurring;
  };

  const getPriceId = (tier: DoseTier, type: BillingType): string => {
    switch (type) {
      case 'monthly': return tier.plans.monthlyRecurringPriceId;
      case 'single': return tier.plans.singleMonthPriceId;
      case 'three_month': return tier.plans.threeMonthPriceId;
      case 'six_month': return tier.plans.sixMonthPriceId;
    }
  };

  // Calculate savings
  const calculateSavings = (type: BillingType): number => {
    const monthlyTotal = getMonthlyPrice(currentTier);
    const price = getPrice(currentTier, type);
    switch (type) {
      case 'three_month': return (monthlyTotal * 3) - price;
      case 'six_month': return (monthlyTotal * 6) - price;
      default: return 0;
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    let total = getPrice(currentTier, billingType);
    
    if (selectedAddons.includes('nausea_relief')) {
      total += ADDONS.nauseaRelief.price;
    }
    if (selectedAddons.includes('fat_burner')) {
      total += ADDONS.fatBurner.price;
    }
    
    return total;
  };

  const calculateTotal = () => {
    let total = calculateSubtotal();
    if (expeditedShipping) {
      total += EXPEDITED_SHIPPING_PRICE;
    }
    return total;
  };

  const handleContinue = () => {
    const productInfo = {
      medication: medicationConfig.name,
      tierId: currentTier.id,
      tierDose: currentTier.dose,
      billingType: billingType,
      priceId: getPriceId(currentTier, billingType),
      price: getPrice(currentTier, billingType),
    };
    sessionStorage.setItem('checkout_product', JSON.stringify(productInfo));
    router.push('/checkout/payment');
  };

  const getPlanLabel = (type: BillingType) => {
    switch (type) {
      case 'monthly': return t.monthlyRecurring;
      case 'three_month': return t.threeMonth;
      case 'six_month': return t.sixMonth;
      case 'single': return t.oneTime;
    }
  };

  const getMonths = (type: BillingType): number => {
    switch (type) {
      case 'monthly': return 1;
      case 'three_month': return 3;
      case 'six_month': return 6;
      case 'single': return 1;
    }
  };

  const billingOptions: BillingType[] = ['monthly', 'three_month', 'six_month', 'single'];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Orange Gradient Header */}
      <div className="bg-gradient-to-b from-[#f97316] to-[#fbbf24] pt-14 pb-6">
        {/* Progress Steps - positioned below the language toggle */}
        <div className="px-6 mb-6">
          <div className="max-w-md mx-auto flex items-center justify-center">
            {[1, 2, 3, 4].map((step, idx) => (
              <div key={step} className="flex items-center">
                {/* Connector line before circle (except first) */}
                {idx > 0 && (
                  <div className={`w-16 sm:w-24 h-0.5 ${step <= 2 ? 'bg-[#413d3d]' : 'bg-white/50'}`} />
                )}
                {/* Circle with number */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    step <= 2 ? 'bg-[#413d3d] checkout-dark-bg' : 'bg-white'
                  }`}
                  style={{ color: step <= 2 ? '#ffffff' : '#413d3d' }}
                >
                  {step === 1 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#ffffff' }}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : <span style={{ color: step <= 2 ? '#ffffff' : '#413d3d' }}>{step}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Header Content */}
        <div className="px-6 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white mb-1">
            {patientInfo.firstName ? `${patientInfo.firstName}, ` : ''}{t.greeting}
          </h1>
          <p className="text-white/80 text-sm mb-4">{t.subtitle}</p>
          
          {/* HSA/FSA Badge */}
          <div className="checkout-dark-bg inline-flex items-center gap-2 bg-[#413d3d] px-4 py-2 rounded-full text-sm font-medium" style={{ color: '#ffffff' }}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#ffffff' }}>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span style={{ color: '#ffffff' }}>{t.hsaFsa}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#fbbf24] to-[#fef3c7]">

        {/* Medication Toggle (if showing upgrade option) */}
        {showTirzepatideUpgrade && intakeData.previousMedication !== 'tirzepatide' && (
          <div className="px-6 max-w-md mx-auto mb-4 pt-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-full overflow-visible">
              <button
                onClick={() => setSelectedMedication('semaglutide')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                  selectedMedication === 'semaglutide'
                    ? 'bg-white shadow text-[#413d3d]'
                    : 'text-[#413d3d]/60'
                }`}
              >
                Semaglutide
              </button>
              <button
                onClick={() => setSelectedMedication('tirzepatide')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all relative ${
                  selectedMedication === 'tirzepatide'
                    ? 'bg-white shadow text-[#413d3d]'
                    : 'text-[#413d3d]/60'
                }`}
              >
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#413d3d] text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap checkout-dark-bg" style={{ color: '#ffffff' }}>
                  {t.moreEffective}
                </span>
                Tirzepatide
              </button>
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="flex justify-center py-6">
          <img
            src={PRODUCT_IMAGES[selectedMedication]}
            alt={`${medicationConfig.name} vial`}
            className="h-48 object-contain drop-shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div className="px-6 max-w-md mx-auto mb-6">
          <h2 className="text-2xl font-bold text-[#413d3d] mb-1">
            {t.compounded} {medicationConfig.name}
          </h2>
          <p className="text-[#413d3d]/70 text-sm">{t.description}</p>
        </div>

        {/* Plan Selection */}
        <div className="px-6 max-w-md mx-auto mb-6">
          <h3 className="text-lg font-bold text-[#413d3d] mb-4">{t.chooseYourPlan}</h3>
          
          <div className="space-y-3">
            {billingOptions.map((type) => {
              const price = getPrice(currentTier, type);
              const savings = calculateSavings(type);
              const isSelected = billingType === type;
              const months = getMonths(type);
              const monthlyEquiv = months > 1 ? Math.round(price / months) : price;
              
              return (
                <div key={type} className="relative">
                  {savings > 0 && (
                    <span className="absolute -top-2 right-4 bg-[#ff6b35] text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                      {t.save} {formatPrice(savings)}
                    </span>
                  )}
                  <button
                    onClick={() => setBillingType(type)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#00a67c] bg-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#00a67c] bg-[#00a67c]'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-semibold text-[#413d3d]">{getPlanLabel(type)}</span>
                      </div>
                      <div className="text-right">
                        {months > 1 && (
                          <span className="text-gray-400 line-through text-sm mr-2">
                            {formatPrice(getMonthlyPrice(currentTier))}/mo
                          </span>
                        )}
                        <span className="text-xl font-bold text-[#00a67c]">
                          {formatPrice(monthlyEquiv)}/mo*
                        </span>
                      </div>
                    </div>

                    {/* Plan breakdown when selected */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="font-semibold text-[#413d3d] text-sm mb-2">{t.planBreakdown}</p>
                        <ul className="space-y-1 text-sm text-[#413d3d]/70">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            {formatPrice(price)} {type === 'monthly' ? t.chargedEveryMonth : 
                              type === 'three_month' ? t.chargedEvery3Months :
                              type === 'six_month' ? t.chargedEvery6Months : t.oneTimeCharge}
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            {type === 'monthly' ? t.shipsEveryMonth :
                              type === 'three_month' ? t.shipsEvery3Months :
                              type === 'six_month' ? t.shipsEvery6Months : t.shipsOnce}
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            {t.includesMonths.replace('{months}', String(months))}
                          </li>
                        </ul>
                        <p className="text-xs text-[#413d3d]/50 mt-3 italic">{t.paidUpfront}</p>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Add-ons */}
        <div className="px-6 max-w-md mx-auto mb-6">
          <h3 className="text-lg font-bold text-[#413d3d] mb-4">{t.optionalAddons}</h3>
          
          <div className="space-y-3">
            {/* Nausea Relief */}
            <button
              onClick={() => toggleAddon('nausea_relief')}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                selectedAddons.includes('nausea_relief')
                  ? 'border-[#00a67c] bg-white'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={ADDON_IMAGES.nauseaRelief}
                  alt="Nausea Relief"
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#413d3d]">{t.nauseaRelief}</div>
                  <div className="text-xs text-[#413d3d]/60">{t.nauseaDesc}</div>
                  <div className="text-sm font-semibold text-[#413d3d] mt-1">
                    {formatPrice(ADDONS.nauseaRelief.price)}{t.perMonth}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  selectedAddons.includes('nausea_relief')
                    ? 'border-[#00a67c] bg-[#00a67c]'
                    : 'border-gray-300'
                }`}>
                  {selectedAddons.includes('nausea_relief') && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            {/* Fat Burner */}
            <button
              onClick={() => toggleAddon('fat_burner')}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                selectedAddons.includes('fat_burner')
                  ? 'border-[#00a67c] bg-white'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={ADDON_IMAGES.fatBurner}
                  alt="Fat Burner"
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#413d3d]">{t.fatBurner}</div>
                  <div className="text-xs text-[#413d3d]/60">{t.fatBurnerDesc}</div>
                  <div className="text-sm font-semibold text-[#413d3d] mt-1">
                    {formatPrice(ADDONS.fatBurner.price)}{t.perMonth}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  selectedAddons.includes('fat_burner')
                    ? 'border-[#00a67c] bg-[#00a67c]'
                    : 'border-gray-300'
                }`}>
                  {selectedAddons.includes('fat_burner') && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 max-w-md mx-auto mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 rounded-full border-2 border-gray-300 font-semibold text-[#413d3d] hover:bg-gray-50 transition-colors"
            >
              {t.back}
            </button>
            <button
              onClick={handleContinue}
              className="checkout-dark-bg flex-1 py-3 rounded-full bg-[#413d3d] font-semibold hover:bg-[#2d2a2a] transition-colors"
              style={{ color: '#ffffff' }}
            >
              <span style={{ color: '#ffffff' }}>{t.continueToShipping}</span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-6 max-w-md mx-auto mb-6">
          <div className="bg-[#f0f9e8] rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#413d3d] mb-4">{t.orderSummary}</h3>
            
            {/* Patient Info */}
            {patientInfo.firstName && (
              <div className="bg-white rounded-xl p-4 mb-4">
                <p className="font-semibold text-[#413d3d]">{patientInfo.firstName} {patientInfo.lastName}</p>
                {patientInfo.email && (
                  <p className="text-sm text-[#413d3d]/70">{patientInfo.email}</p>
                )}
                {patientInfo.phone && (
                  <p className="text-sm text-[#413d3d]/70">{patientInfo.phone}</p>
                )}
                {shippingAddress && (shippingAddress.street || shippingAddress.city) && (
                  <div className="text-sm text-[#413d3d]/70 mt-2 pt-2 border-t border-gray-100">
                    {shippingAddress.street && <p>{shippingAddress.street}{shippingAddress.unit ? `, ${shippingAddress.unit}` : ''}</p>}
                    {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && (
                      <p>
                        {shippingAddress.city}{shippingAddress.city && shippingAddress.state ? ', ' : ''}
                        {shippingAddress.state} {shippingAddress.zipCode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-[#413d3d]">{medicationConfig.name}</p>
                  <p className="text-sm text-[#413d3d]/60">{getPlanLabel(billingType)}</p>
                </div>
                <span className="font-semibold text-[#413d3d]">{formatPrice(getPrice(currentTier, billingType))}</span>
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
            </div>

            {/* Totals */}
            <div className="border-t border-[#413d3d]/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#413d3d]/70">{t.subtotal}</span>
                <span className="text-[#413d3d]">{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#413d3d]/70">{t.shipping}</span>
                <span className="text-[#00a67c] font-semibold">{t.free}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#413d3d]/10">
                <span className="font-bold text-[#413d3d]">{t.total}</span>
                <span className="font-bold text-[#413d3d]">{formatPrice(calculateTotal())} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="px-6 max-w-md mx-auto pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00a67c] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-[#413d3d]/80">{t.encrypted}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00a67c] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-[#413d3d]/80">{t.legitScript}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-sm text-[#413d3d]/80">{t.trusted}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00a67c] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="text-sm text-[#413d3d]/80">{t.fastDelivery}</span>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 text-center">
            <CopyrightText />
          </div>
        </div>
      </div>
    </div>
  );
}
