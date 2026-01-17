import { loadStripe, Stripe } from '@stripe/stripe-js';
import { logger } from './logger';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      logger.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// ============================================================
// PRICING CONFIGURATION - Based on Stripe Products
// Updated: January 2026 with exact price IDs
// ============================================================

export const EXPEDITED_SHIPPING_PRICE = 1500; // $15 in cents
export const EXPEDITED_SHIPPING_PRICE_ID = 'price_1Sp0iHGzKhM7cZeGgAOX6ikc';

// Plan type definition
export interface PlanConfig {
  label: { en: string; es: string };
  monthlyRecurring: number;
  monthlyRecurringPriceId: string;
  singleMonth: number;
  singleMonthPriceId: string;
  threeMonth: number;
  threeMonthPriceId: string;
  sixMonth: number;
  sixMonthPriceId: string;
}

export interface DoseTier {
  id: string;
  dose: string;
  description: { en: string; es: string };
  minDoseThreshold?: number; // Minimum current dose in mg to qualify for this tier
  plans: PlanConfig;
}

export interface MedicationConfig {
  name: string;
  description: { en: string; es: string };
  image: string;
  defaultTierId: string;
  doseTiers: DoseTier[];
}

// ============================================================
// SEMAGLUTIDE PRICING
// ============================================================

const SEMAGLUTIDE_TIERS: DoseTier[] = [
  {
    id: 'semaglutide-default',
    dose: '2.5mg/1mL or 2.5mg/2mL',
    description: { 
      en: 'Standard dose - Perfect for starting or maintaining', 
      es: 'Dosis estándar - Perfecta para comenzar o mantener' 
    },
    minDoseThreshold: 0,
    plans: {
      label: { en: 'Semaglutide 2.5mg/2mL', es: 'Semaglutida 2.5mg/2mL' },
      monthlyRecurring: 22900,       // $229
      monthlyRecurringPriceId: 'price_1S9XKOGzKhM7cZeGkV0VrEVc',
      singleMonth: 29900,            // $299
      singleMonthPriceId: 'price_1S9XK0GzKhM7cZeGtMz5kzYG',
      threeMonth: 54900,             // $549
      threeMonthPriceId: 'price_1S9XKOGzKhM7cZeGlraKvRpX',
      sixMonth: 99900,               // $999
      sixMonthPriceId: 'price_1S9XKOGzKhM7cZeGeDXQVFvg',
    },
  },
  {
    id: 'semaglutide-medium',
    dose: '2.5mg/3mL',
    description: { 
      en: 'Higher dose - For patients on 1mg+ weekly', 
      es: 'Dosis más alta - Para pacientes en 1mg+ semanal' 
    },
    minDoseThreshold: 1, // > 1mg/week
    plans: {
      label: { en: 'Semaglutide 2.5mg/3mL', es: 'Semaglutida 2.5mg/3mL' },
      monthlyRecurring: 32900,       // $329
      monthlyRecurringPriceId: 'price_1Sp01UGzKhM7cZeGeTm4hTXB',
      singleMonth: 37900,            // $379
      singleMonthPriceId: 'price_1Sp03wGzKhM7cZeGlpg5rKpC',
      threeMonth: 77500,             // $775
      threeMonthPriceId: 'price_1Sp0EOGzKhM7cZeGXKKRkMRd',
      sixMonth: 134900,              // $1,349
      sixMonthPriceId: 'price_1Sp0ElGzKhM7cZeGebLpFHVL',
    },
  },
  {
    id: 'semaglutide-high',
    dose: '2.5mg/4mL',
    description: { 
      en: 'Maximum dose - For patients on 1.75mg+ weekly', 
      es: 'Dosis máxima - Para pacientes en 1.75mg+ semanal' 
    },
    minDoseThreshold: 1.75, // > 1.75mg/week
    plans: {
      label: { en: 'Semaglutide 2.5mg/4mL', es: 'Semaglutida 2.5mg/4mL' },
      monthlyRecurring: 39900,       // $399
      monthlyRecurringPriceId: 'price_1Sp0H3GzKhM7cZeGlkhMbhkh',
      singleMonth: 44900,            // $449
      singleMonthPriceId: 'price_1Sp0HKGzKhM7cZeGALl3jQjM',
      threeMonth: 89900,             // $899
      threeMonthPriceId: 'price_1Sp0HXGzKhM7cZeGyQMakaZg',
      sixMonth: 149900,              // $1,499
      sixMonthPriceId: 'price_1Sp0HkGzKhM7cZeGyE7ogS8A',
    },
  },
];

// ============================================================
// TIRZEPATIDE PRICING
// ============================================================

const TIRZEPATIDE_TIERS: DoseTier[] = [
  {
    id: 'tirzepatide-default',
    dose: '10mg/1mL or 10mg/2mL',
    description: { 
      en: 'Standard dose - Perfect for starting or maintaining', 
      es: 'Dosis estándar - Perfecta para comenzar o mantener' 
    },
    minDoseThreshold: 0,
    plans: {
      label: { en: 'Tirzepatide 10mg/2mL', es: 'Tirzepatida 10mg/2mL' },
      monthlyRecurring: 32900,       // $329
      monthlyRecurringPriceId: 'price_1S9XT6GzKhM7cZeGYAluSrLk',
      singleMonth: 39900,            // $399
      singleMonthPriceId: 'price_1S9XT6GzKhM7cZeGHp6wzVHJ',
      threeMonth: 89900,             // $899
      threeMonthPriceId: 'price_1S9XT6GzKhM7cZeGCpXjW8UI',
      sixMonth: 159900,              // $1,599
      sixMonthPriceId: 'price_1S9XT6GzKhM7cZeGnbOelbb2',
    },
  },
  {
    id: 'tirzepatide-medium',
    dose: '10mg/3mL',
    description: { 
      en: 'Higher dose - For patients on 5mg+ weekly', 
      es: 'Dosis más alta - Para pacientes en 5mg+ semanal' 
    },
    minDoseThreshold: 5, // > 5mg/week
    plans: {
      label: { en: 'Tirzepatide 10mg/3mL', es: 'Tirzepatida 10mg/3mL' },
      monthlyRecurring: 42900,       // $429
      monthlyRecurringPriceId: 'price_1Sp0VhGzKhM7cZeGKXIbR5zS',
      singleMonth: 49900,            // $499
      singleMonthPriceId: 'price_1Sp0WfGzKhM7cZeGU6B2b4jL',
      threeMonth: 112500,            // $1,125
      threeMonthPriceId: 'price_1Sp0XNGzKhM7cZeGlnMB4car',
      sixMonth: 209900,              // $2,099
      sixMonthPriceId: 'price_1Sp0XaGzKhM7cZeGZFe54LJc',
    },
  },
  {
    id: 'tirzepatide-high',
    dose: '10mg/4mL',
    description: { 
      en: 'Higher dose - For patients on 7.5mg+ weekly', 
      es: 'Dosis más alta - Para pacientes en 7.5mg+ semanal' 
    },
    minDoseThreshold: 7.5, // > 7.5mg/week
    plans: {
      label: { en: 'Tirzepatide 10mg/4mL', es: 'Tirzepatida 10mg/4mL' },
      monthlyRecurring: 49900,       // $499
      monthlyRecurringPriceId: 'price_1Sp0YbGzKhM7cZeGBOmzf6fN',
      singleMonth: 59900,            // $599
      singleMonthPriceId: 'price_1Sp0YtGzKhM7cZeGpralXDeU',
      threeMonth: 120000,            // $1,200
      threeMonthPriceId: 'price_1Sp0ZFGzKhM7cZeG3Z5MxcfY',
      sixMonth: 219900,              // $2,199
      sixMonthPriceId: 'price_1Sp0ZSGzKhM7cZeGSgYaUzYk',
    },
  },
  {
    id: 'tirzepatide-max',
    dose: '30mg/2mL',
    description: { 
      en: 'Maximum dose - For patients on 10mg+ weekly', 
      es: 'Dosis máxima - Para pacientes en 10mg+ semanal' 
    },
    minDoseThreshold: 10, // > 10mg/week
    plans: {
      label: { en: 'Tirzepatide 30mg/2mL', es: 'Tirzepatida 30mg/2mL' },
      monthlyRecurring: 59900,       // $599
      monthlyRecurringPriceId: 'price_1Sp0clGzKhM7cZeGGXcFNrJU',
      singleMonth: 69900,            // $699
      singleMonthPriceId: 'price_1Sp0crGzKhM7cZeGxPYrlWmE',
      threeMonth: 149900,            // $1,499
      threeMonthPriceId: 'price_1Sp0d8GzKhM7cZeGWQR4CRZz',
      sixMonth: 249900,              // $2,499
      sixMonthPriceId: 'price_1Sp0diGzKhM7cZeGyMEBemxu',
    },
  },
];

// ============================================================
// MEDICATIONS CONFIG
// ============================================================

export const MEDICATIONS: Record<'semaglutide' | 'tirzepatide', MedicationConfig> = {
  semaglutide: {
    name: 'Semaglutide',
    description: { 
      en: 'GLP-1 weight loss medication', 
      es: 'Medicamento GLP-1 para pérdida de peso' 
    },
    image: 'https://static.wixstatic.com/media/c49a9b_7adb19325cea4ad8b15d6845977fc42a~mv2.png',
    defaultTierId: 'semaglutide-default',
    doseTiers: SEMAGLUTIDE_TIERS,
  },
  tirzepatide: {
    name: 'Tirzepatide',
    description: { 
      en: 'Dual GIP/GLP-1 - More powerful weight loss', 
      es: 'GIP/GLP-1 dual - Pérdida de peso más potente' 
    },
    image: 'https://static.wixstatic.com/media/c49a9b_00c1ff5076814c8e93e3c53a132b962e~mv2.png',
    defaultTierId: 'tirzepatide-default',
    doseTiers: TIRZEPATIDE_TIERS,
  },
};

// ============================================================
// TIRZEPATIDE UPGRADE BENEFITS
// ============================================================

export const TIRZEPATIDE_UPGRADE_BENEFITS = {
  en: [
    'Dual-action GIP + GLP-1 mechanism',
    'Clinically shown to be more effective',
    'May help break through weight loss plateaus',
    'Favorable side effect profile',
  ],
  es: [
    'Mecanismo dual GIP + GLP-1',
    'Clínicamente más efectivo',
    'Puede ayudar a superar estancamientos',
    'Perfil favorable de efectos secundarios',
  ],
};

// ============================================================
// ADD-ON PRODUCTS (Upsales)
// ============================================================

export const ADDONS = {
  nauseaRelief: {
    id: 'nausea_relief',
    name: { en: 'Nausea Relief (Ondansetron)', es: 'Alivio de Náuseas (Ondansetrón)' },
    description: { en: 'Prescription medication to manage GLP-1 side effects', es: 'Medicamento recetado para manejar efectos secundarios de GLP-1' },
    price: 3999, // $39.99
    priceId: 'price_1S9dxiGzKhM7cZeGkRO7PxC4',
    image: 'https://static.wixstatic.com/media/c49a9b_6388967b1dfa4b25a1a08bf235023e66~mv2.webp',
  },
  fatBurner: {
    id: 'fat_burner',
    name: { en: 'Fat Burner (L-Carnitine + B Complex)', es: 'Quemador de Grasa (L-Carnitina + Complejo B)' },
    description: { en: 'Boost metabolism and energy during weight loss', es: 'Aumenta el metabolismo y energía durante la pérdida de peso' },
    price: 9999, // $99.99
    priceId: 'price_1S9dyqGzKhM7cZeGYNqYGR55',
    image: 'https://static.wixstatic.com/media/c49a9b_603d154460b44f4197168694262a2605~mv2.png',
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function formatPrice(amount: number, currency: string = 'usd', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function getMonthlyEquivalent(totalPrice: number, months: number): number {
  return Math.round(totalPrice / months);
}

/**
 * Determine which dose tier the patient qualifies for based on their current dose
 * and whether they want to increase
 */
export function getRecommendedTier(
  medication: 'semaglutide' | 'tirzepatide',
  currentDoseMg: number,
  wantsToIncrease: boolean
): DoseTier {
  const config = MEDICATIONS[medication];
  const tiers = config.doseTiers;
  
  // If patient doesn't want to increase or has no prior experience, use default
  if (!wantsToIncrease || currentDoseMg === 0) {
    return tiers.find(t => t.id === config.defaultTierId) || tiers[0];
  }
  
  // Find the appropriate tier based on current dose
  // Sort tiers by threshold descending to find highest qualifying tier
  const sortedTiers = [...tiers].sort((a, b) => 
    (b.minDoseThreshold || 0) - (a.minDoseThreshold || 0)
  );
  
  for (const tier of sortedTiers) {
    if (currentDoseMg >= (tier.minDoseThreshold || 0)) {
      return tier;
    }
  }
  
  return tiers.find(t => t.id === config.defaultTierId) || tiers[0];
}

/**
 * Parse the dosage string from intake form to a numeric mg value
 */
export function parseDosageMg(dosageString: string): number {
  if (!dosageString) return 0;
  
  // Extract the first number from strings like "2.5mg", "5.0mg", "7.5mg", etc.
  const match = dosageString.match(/(\d+\.?\d*)\s*mg/i);
  if (match) {
    return parseFloat(match[1]);
  }
  
  // Handle edge cases
  const lower = dosageString.toLowerCase();
  if (lower.includes('2.5')) return 2.5;
  if (lower.includes('5.0') || lower === '5mg') return 5;
  if (lower.includes('7.5')) return 7.5;
  if (lower.includes('10')) return 10;
  if (lower.includes('12.5')) return 12.5;
  if (lower.includes('15')) return 15;
  if (lower.includes('1.0') || lower === '1mg') return 1;
  if (lower.includes('0.5')) return 0.5;
  if (lower.includes('0.25')) return 0.25;
  
  return 0;
}
