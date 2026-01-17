import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckoutState, ShippingAddress, CheckoutStep } from '@/types/checkout';
import { DoseTier, MEDICATIONS, getRecommendedTier, parseDosageMg } from '@/lib/stripe';

// ============================================================
// INTAKE DATA TYPES
// ============================================================

export interface IntakeGlp1Data {
  hasGlp1Experience: boolean; // "currently taking" or "taken before"
  glp1Status: 'currently_taking' | 'taken_before' | 'never' | null;
  previousMedication: 'semaglutide' | 'tirzepatide' | 'liraglutide' | 'oral' | 'other' | null;
  currentDoseMg: number;
  doseSatisfaction: 'increase' | 'maintain' | 'reduce' | null;
  wantsToIncrease: boolean;
}

// ============================================================
// CHECKOUT STATE
// ============================================================

interface ExtendedCheckoutState extends Omit<CheckoutState, 'selectedProduct' | 'setSelectedProduct'> {
  // Intake-derived data
  intakeData: IntakeGlp1Data;
  setIntakeData: (data: IntakeGlp1Data) => void;
  
  // Medication selection (derived from intake or user choice)
  selectedMedication: 'semaglutide' | 'tirzepatide';
  setSelectedMedication: (med: 'semaglutide' | 'tirzepatide') => void;
  
  // Dose tier
  selectedTier: DoseTier | null;
  setSelectedTier: (tier: DoseTier) => void;
  recommendedTier: DoseTier | null;
  setRecommendedTier: (tier: DoseTier | null) => void;
  
  // Billing type
  billingType: 'monthly' | 'single' | 'three_month' | 'six_month';
  setBillingType: (type: ExtendedCheckoutState['billingType']) => void;
  
  // Show upgrade prompt for Tirzepatide
  showTirzepatideUpgrade: boolean;
  setShowTirzepatideUpgrade: (show: boolean) => void;
  
  // Load intake data from session
  loadIntakeData: () => void;
}

const initialIntakeData: IntakeGlp1Data = {
  hasGlp1Experience: false,
  glp1Status: null,
  previousMedication: null,
  currentDoseMg: 0,
  doseSatisfaction: null,
  wantsToIncrease: false,
};

const initialState = {
  currentStep: 'product' as CheckoutStep,
  intakeData: initialIntakeData,
  selectedMedication: 'semaglutide' as const,
  selectedTier: null as DoseTier | null,
  recommendedTier: null as DoseTier | null,
  billingType: 'monthly' as const,
  showTirzepatideUpgrade: false,
  selectedAddons: [] as string[],
  expeditedShipping: false,
  shippingAddress: null as ShippingAddress | null,
  billingAddressSameAsShipping: true,
  paymentIntentId: null as string | null,
  paymentStatus: 'idle' as ExtendedCheckoutState['paymentStatus'],
  promoCode: null as string | null,
  promoDiscount: 0,
  error: null as string | null,
};

export const useCheckoutStore = create<ExtendedCheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentStep: (step: CheckoutStep) => 
        set({ currentStep: step }),
      
      setIntakeData: (data: IntakeGlp1Data) => {
        set({ intakeData: data });
        
        // Auto-set medication and recommended tier based on intake
        if (data.previousMedication === 'tirzepatide') {
          const tier = getRecommendedTier('tirzepatide', data.currentDoseMg, data.wantsToIncrease);
          set({ 
            selectedMedication: 'tirzepatide',
            recommendedTier: tier,
            selectedTier: tier,
            showTirzepatideUpgrade: false,
          });
        } else if (data.previousMedication === 'semaglutide' || data.hasGlp1Experience) {
          const tier = getRecommendedTier('semaglutide', data.currentDoseMg, data.wantsToIncrease);
          set({ 
            selectedMedication: 'semaglutide',
            recommendedTier: tier,
            selectedTier: tier,
            showTirzepatideUpgrade: true, // Show upgrade option
          });
        } else {
          // New patient - default to semaglutide with upgrade option
          const tier = MEDICATIONS.semaglutide.doseTiers[0];
          set({
            selectedMedication: 'semaglutide',
            recommendedTier: tier,
            selectedTier: tier,
            showTirzepatideUpgrade: true,
          });
        }
      },
      
      setSelectedMedication: (med: 'semaglutide' | 'tirzepatide') => {
        const { intakeData } = get();
        const tier = getRecommendedTier(
          med, 
          med === intakeData.previousMedication ? intakeData.currentDoseMg : 0,
          med === intakeData.previousMedication ? intakeData.wantsToIncrease : false
        );
        set({ 
          selectedMedication: med,
          selectedTier: tier,
          recommendedTier: tier,
          showTirzepatideUpgrade: med === 'semaglutide',
        });
      },
      
      setSelectedTier: (tier: DoseTier) => 
        set({ selectedTier: tier }),
      
      setRecommendedTier: (tier: DoseTier | null) =>
        set({ recommendedTier: tier }),
      
      setBillingType: (type: ExtendedCheckoutState['billingType']) =>
        set({ billingType: type }),
      
      setShowTirzepatideUpgrade: (show: boolean) =>
        set({ showTirzepatideUpgrade: show }),
      
      toggleAddon: (addonId: string) =>
        set((state) => ({
          selectedAddons: state.selectedAddons.includes(addonId)
            ? state.selectedAddons.filter(id => id !== addonId)
            : [...state.selectedAddons, addonId]
        })),
      
      setExpeditedShipping: (expedited: boolean) =>
        set({ expeditedShipping: expedited }),
      
      setShippingAddress: (address: ShippingAddress) => 
        set({ shippingAddress: address }),
      
      setBillingAddressSameAsShipping: (same: boolean) => 
        set({ billingAddressSameAsShipping: same }),
      
      setPaymentIntentId: (id: string) => 
        set({ paymentIntentId: id }),
      
      setPaymentStatus: (status: ExtendedCheckoutState['paymentStatus']) => 
        set({ paymentStatus: status }),
      
      setPromoCode: (code: string | null, discount: number) =>
        set({ promoCode: code, promoDiscount: discount }),
      
      setError: (error: string | null) => 
        set({ error }),
      
      reset: () => set(initialState),
      
      // Load intake data from sessionStorage
      loadIntakeData: () => {
        if (typeof window === 'undefined') return;
        
        const glp1Data: IntakeGlp1Data = {
          hasGlp1Experience: false,
          glp1Status: null,
          previousMedication: null,
          currentDoseMg: 0,
          doseSatisfaction: null,
          wantsToIncrease: false,
        };
        
        // Get GLP-1 history status (key: 'glp1_history')
        // Values: 'currently_taking', 'previously_taken', 'never_taken'
        const glp1History = sessionStorage.getItem('glp1_history');
        if (glp1History) {
          if (glp1History === 'currently_taking') {
            glp1Data.glp1Status = 'currently_taking';
            glp1Data.hasGlp1Experience = true;
          } else if (glp1History === 'previously_taken') {
            glp1Data.glp1Status = 'taken_before';
            glp1Data.hasGlp1Experience = true;
          } else {
            glp1Data.glp1Status = 'never';
          }
        }
        
        // Get which GLP-1 medication type (key: 'glp1_type')
        // Values: 'liraglutide', 'semaglutide', 'tirzepatide', 'oral_glp1', 'other'
        const glp1Type = sessionStorage.getItem('glp1_type');
        if (glp1Type) {
          if (glp1Type === 'tirzepatide') {
            glp1Data.previousMedication = 'tirzepatide';
          } else if (glp1Type === 'semaglutide') {
            glp1Data.previousMedication = 'semaglutide';
          } else if (glp1Type === 'liraglutide') {
            glp1Data.previousMedication = 'liraglutide';
          } else if (glp1Type === 'oral_glp1') {
            glp1Data.previousMedication = 'oral';
          } else {
            glp1Data.previousMedication = 'other';
          }
        }
        
        // Get current dosage (keys: 'semaglutide_dosage', 'tirzepatide_dosage')
        // Semaglutide values: '0.25mg', '0.50mg', '0.75mg', '1mg', '1.25mg', '1.7mg', '2mg', '2.4mg', 'oral'
        // Tirzepatide values: '2.5mg', '5.0mg', '7.5mg', '10mg', '12.5mg', '15mg', 'oral'
        const semaDosage = sessionStorage.getItem('semaglutide_dosage');
        const tirzDosage = sessionStorage.getItem('tirzepatide_dosage');
        
        if (glp1Data.previousMedication === 'semaglutide' && semaDosage && semaDosage !== 'oral') {
          glp1Data.currentDoseMg = parseDosageMg(semaDosage);
        } else if (glp1Data.previousMedication === 'tirzepatide' && tirzDosage && tirzDosage !== 'oral') {
          glp1Data.currentDoseMg = parseDosageMg(tirzDosage);
        }
        
        // Get dose satisfaction (key: 'dosage_satisfaction')
        // Values: 'increase', 'maintain', 'reduce'
        const satisfaction = sessionStorage.getItem('dosage_satisfaction');
        if (satisfaction) {
          if (satisfaction === 'increase') {
            glp1Data.doseSatisfaction = 'increase';
            glp1Data.wantsToIncrease = true;
          } else if (satisfaction === 'maintain') {
            glp1Data.doseSatisfaction = 'maintain';
          } else if (satisfaction === 'reduce') {
            glp1Data.doseSatisfaction = 'reduce';
          }
        }
        
        // Also check medication preference (for new patients who haven't used GLP-1 before)
        const medPref = sessionStorage.getItem('intake_medication_preference');
        if (medPref && !glp1Data.hasGlp1Experience) {
          const lower = medPref.toLowerCase();
          if (lower.includes('tirzepatide')) {
            glp1Data.previousMedication = 'tirzepatide';
          } else if (lower.includes('semaglutide')) {
            glp1Data.previousMedication = 'semaglutide';
          }
        }
        
        // Update store with loaded data
        get().setIntakeData(glp1Data);
      },
    }),
    {
      name: 'eonmeds-checkout-storage',
      // Only persist selected options
      partialize: (state) => ({
        selectedMedication: state.selectedMedication,
        selectedTier: state.selectedTier,
        billingType: state.billingType,
        selectedAddons: state.selectedAddons,
        expeditedShipping: state.expeditedShipping,
        shippingAddress: state.shippingAddress,
        billingAddressSameAsShipping: state.billingAddressSameAsShipping,
      }),
    }
  )
);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Safe JSON parse helper
function safeJsonParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  
  const trimmed = data.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return fallback;
  }
  
  try {
    return JSON.parse(data) as T;
  } catch {
    // Silent fallback - no console output in production
    return fallback;
  }
}

// Helper to get V2 intake data from localStorage
function getV2IntakeData(): {
  personalInfo?: { firstName?: string; lastName?: string; email?: string; phone?: string; dob?: string };
  address?: { street?: string; unit?: string; city?: string; state?: string; zipCode?: string; fullAddress?: string };
  responses?: Record<string, any>;
} | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const v2Data = localStorage.getItem('eon-intake-storage');
    if (v2Data) {
      const parsed = JSON.parse(v2Data);
      return parsed.state || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Load shipping address from intake sessionStorage or V2 localStorage
export function loadShippingFromIntake(): ShippingAddress | null {
  if (typeof window === 'undefined') return null;
  
  // First check V1 sessionStorage
  const addressData = sessionStorage.getItem('intake_address');
  let parsed = safeJsonParse<{
    street?: string;
    unit?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
  }>(addressData, {});
  
  // If not found, check V2 localStorage
  if (!parsed.street && !parsed.fullAddress) {
    const v2Data = getV2IntakeData();
    if (v2Data?.address) {
      parsed = v2Data.address;
    }
    // Also check responses for address data
    if (v2Data?.responses) {
      const r = v2Data.responses;
      if (!parsed.street && r.address_street) parsed.street = r.address_street;
      if (!parsed.city && r.address_city) parsed.city = r.address_city;
      if (!parsed.state && r.address_state) parsed.state = r.address_state;
      if (!parsed.zipCode && r.address_zip) parsed.zipCode = r.address_zip;
      if (!parsed.unit && r.address_unit) parsed.unit = r.address_unit;
    }
  }
  
  if (!parsed.street && !parsed.fullAddress && !parsed.city) return null;
  
  return {
    street: parsed.street || '',
    unit: parsed.unit || '',
    city: parsed.city || '',
    state: parsed.state || '',
    zipCode: parsed.zipCode || '',
    fullAddress: parsed.fullAddress || '',
  };
}

// Get patient info from intake sessionStorage or V2 localStorage
export function getPatientInfoFromIntake(): {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
} {
  if (typeof window === 'undefined') {
    return { firstName: '', lastName: '', email: '', phone: '', dob: '' };
  }
  
  let firstName = '';
  let lastName = '';
  let email = '';
  let phone = '';
  let dob = '';
  
  // First check V1 sessionStorage
  const nameData = sessionStorage.getItem('intake_name');
  const nameParsed = safeJsonParse<{ firstName?: string; lastName?: string }>(nameData, {});
  firstName = nameParsed.firstName || '';
  lastName = nameParsed.lastName || '';
  
  const contactData = sessionStorage.getItem('intake_contact');
  const contactParsed = safeJsonParse<{ email?: string; phone?: string }>(contactData, {});
  email = contactParsed.email || '';
  phone = contactParsed.phone || '';
  
  const dobData = sessionStorage.getItem('intake_dob');
  const dobParsed = safeJsonParse<{ month?: string; day?: string; year?: string }>(dobData, {});
  if (dobParsed.month && dobParsed.day && dobParsed.year) {
    dob = `${dobParsed.month}/${dobParsed.day}/${dobParsed.year}`;
  }
  
  // If not found, check V2 localStorage
  if (!firstName && !email) {
    const v2Data = getV2IntakeData();
    if (v2Data) {
      // Check personalInfo
      if (v2Data.personalInfo) {
        const p = v2Data.personalInfo;
        if (!firstName && p.firstName) firstName = p.firstName;
        if (!lastName && p.lastName) lastName = p.lastName;
        if (!email && p.email) email = p.email;
        if (!phone && p.phone) phone = p.phone;
        if (!dob && p.dob) dob = p.dob;
      }
      // Also check responses for individual fields
      if (v2Data.responses) {
        const r = v2Data.responses;
        if (!firstName && r.firstName) firstName = r.firstName;
        if (!lastName && r.lastName) lastName = r.lastName;
        if (!email && r.email) email = r.email;
        if (!phone && r.phone) phone = r.phone;
        // Handle DOB in various formats
        if (!dob) {
          if (r.dob) {
            dob = r.dob;
          } else if (r.dob_month && r.dob_day && r.dob_year) {
            dob = `${r.dob_month}/${r.dob_day}/${r.dob_year}`;
          }
        }
      }
    }
  }
  
  return { firstName, lastName, email, phone, dob };
}
