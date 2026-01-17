// ============================================================
// CHECKOUT TYPES
// ============================================================

export type CheckoutStep = 'product' | 'payment' | 'confirmation';

export interface ShippingAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  fullAddress?: string;
}

export interface CheckoutState {
  // Navigation
  currentStep: CheckoutStep;
  setCurrentStep: (step: CheckoutStep) => void;
  
  // Addons
  selectedAddons: string[];
  toggleAddon: (addonId: string) => void;
  
  // Shipping
  expeditedShipping: boolean;
  setExpeditedShipping: (expedited: boolean) => void;
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
  
  // Billing
  billingAddressSameAsShipping: boolean;
  setBillingAddressSameAsShipping: (same: boolean) => void;
  
  // Payment
  paymentIntentId: string | null;
  setPaymentIntentId: (id: string) => void;
  paymentStatus: 'idle' | 'processing' | 'succeeded' | 'failed';
  setPaymentStatus: (status: CheckoutState['paymentStatus']) => void;
  
  // Promo
  promoCode: string | null;
  promoDiscount: number;
  setPromoCode: (code: string | null, discount: number) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // Reset
  reset: () => void;
}

// API Response types
export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  customerId: string;
  isSubscription: boolean;
}

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  order_data?: {
    medication: string;
    dose?: string;
    plan: string;
    priceId?: string;
    isSubscription?: boolean;
    addons: string[];
    expeditedShipping: boolean;
    subtotal: number;
    shippingCost: number;
    total: number;
  };
  metadata?: Record<string, string>;
  language?: 'en' | 'es';
  // Meta CAPI tracking
  lead_id?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  meta_event_id?: string;
  page_url?: string;
  user_agent?: string;
}
