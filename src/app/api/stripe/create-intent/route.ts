import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Note: STRIPE_SECRET_KEY should be configured in environment variables

const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion })
  : null;

// Price IDs from environment variables
const STRIPE_PRICES = {
  semaglutide: {
    monthly: process.env.STRIPE_PRICE_SEMAGLUTIDE_MONTHLY || '',
    threeMonth: process.env.STRIPE_PRICE_SEMAGLUTIDE_3MONTH || '',
    sixMonth: process.env.STRIPE_PRICE_SEMAGLUTIDE_6MONTH || '',
  },
  tirzepatide: {
    monthly: process.env.STRIPE_PRICE_TIRZEPATIDE_MONTHLY || '',
    threeMonth: process.env.STRIPE_PRICE_TIRZEPATIDE_3MONTH || '',
    sixMonth: process.env.STRIPE_PRICE_TIRZEPATIDE_6MONTH || '',
  },
  addons: {
    nauseaRelief: process.env.STRIPE_PRICE_NAUSEA_RELIEF || '',
    fatBurner: process.env.STRIPE_PRICE_FAT_BURNER || '',
  },
  shipping: {
    expedited: process.env.STRIPE_PRICE_EXPEDITED_SHIPPING || '',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getOrCreateCustomer(
  email: string | undefined,
  name?: string,
  phone?: string,
  address?: Stripe.AddressParam,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  if (!stripe) throw new Error('Stripe not configured');
  
  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  if (isValidEmail) {
    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      // Update existing customer with latest info
      return await stripe.customers.update(existingCustomers.data[0].id, {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        metadata: metadata || {},
      });
    }

    // Create new customer with full info
    return await stripe.customers.create({
      email: email,
      name: name || undefined,
      phone: phone || undefined,
      address: address || undefined,
      metadata: metadata || {},
    });
  }

  // Create customer without email (for anonymous checkouts)
  return await stripe.customers.create({
    name: name || undefined,
    phone: phone || undefined,
    address: address || undefined,
    metadata: {
      ...metadata,
      anonymous: 'true',
    },
  });
}

function getPriceId(medication: string, planType: string): string | null {
  if (!medication || !planType) return null;

  const med = medication.toLowerCase().replace(/\s+/g, '');
  const medKey = med.includes('semaglutide') ? 'semaglutide' : 'tirzepatide';
  
  const planLower = planType.toLowerCase();
  let mappedPlan: 'monthly' | 'threeMonth' | 'sixMonth' = 'monthly';
  
  if (planLower.includes('6') || planLower.includes('six')) {
    mappedPlan = 'sixMonth';
  } else if (planLower.includes('3') || planLower.includes('three')) {
    mappedPlan = 'threeMonth';
  }
  
  const medProducts = STRIPE_PRICES[medKey];
  return medProducts[mappedPlan] || null;
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    const { 
      amount, 
      currency = 'usd',
      customer_email, 
      customer_name,
      customer_phone,
      shipping_address, 
      order_data, 
      metadata = {},
      language = 'en',
      // Meta CAPI tracking fields
      lead_id,
      fbp,
      fbc,
      fbclid,
      meta_event_id,
      page_url,
      user_agent,
    } = body;

    // Validate amount
    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Normalize shipping address (optional - can be added later)
    const normalizedShippingAddress = shipping_address?.addressLine1?.trim?.() ? {
      line1: String(shipping_address.addressLine1 || '').trim(),
      line2: String(shipping_address.addressLine2 || '').trim() || undefined,
      city: String(shipping_address.city || '').trim(),
      state: String(shipping_address.state || '').trim().toUpperCase(),
      postal_code: String(shipping_address.zipCode || '').trim(),
      country: String(shipping_address.country || 'US').trim().toUpperCase(),
    } : null;

    // Create or retrieve customer
    const customer = await getOrCreateCustomer(
      customer_email,
      customer_name,
      customer_phone,
      normalizedShippingAddress || undefined,
      {
        medication: order_data?.medication || '',
        plan: order_data?.plan || '',
        source: 'intake.eonmeds.com',
      }
    );

    // Determine if this is a subscription
    const planType = order_data?.plan || '';
    const isSubscription = planType && planType.toLowerCase().includes('monthly');

    // Get product price ID
    const mainPriceId = getPriceId(order_data?.medication || '', planType);

    // Normalize plan name to English
    const normalizedPlanName = (() => {
      const p = (order_data?.plan || '').toLowerCase();
      if (p.includes('monthly')) return 'Monthly Recurring';
      if (p.includes('3')) return '3-Month Plan';
      if (p.includes('6')) return '6-Month Plan';
      return order_data?.plan || 'Monthly Recurring';
    })();

    // Build description
    const description = `${order_data?.medication || 'Medication'} - ${normalizedPlanName}${
      order_data?.addons?.length > 0 ? ` + ${order_data.addons.join(', ')}` : ''
    }${order_data?.expeditedShipping ? ' + Expedited Shipping' : ''}`;

    // Parse customer name
    const nameParts = (customer_name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Build metadata
    const orderMetadata: Record<string, string> = {
      ...metadata,
      customer_email: String(customer_email || ''),
      customer_first_name: firstName,
      customer_last_name: lastName,
      customer_phone: String(customer_phone || ''),
      customer_id: customer.id,
      language: String(language),
      // Meta CAPI tracking
      lead_id: lead_id || meta_event_id || '',
      fbp: fbp || '',
      fbc: fbc || '',
      fbclid: fbclid || '',
      meta_event_id: meta_event_id || '',
      page_url: page_url || '',
      user_agent: user_agent || '',
      source: 'intake.eonmeds.com',
      // Shipping (optional)
      shipping_line1: normalizedShippingAddress?.line1 || '',
      shipping_city: normalizedShippingAddress?.city || '',
      shipping_state: normalizedShippingAddress?.state || '',
      shipping_zip: normalizedShippingAddress?.postal_code || '',
      // Order
      timestamp: new Date().toISOString(),
      medication: order_data?.medication || '',
      plan: normalizedPlanName,
      is_subscription: isSubscription ? 'true' : 'false',
      main_price_id: mainPriceId || '',
      addons: JSON.stringify(order_data?.addons || []),
      expedited_shipping: order_data?.expeditedShipping ? 'yes' : 'no',
      total: order_data?.total?.toString() || '',
    };

    const isValidEmail = customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      description: description,
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: isSubscription ? 'off_session' : undefined,
      receipt_email: isValidEmail ? customer_email : undefined,
      metadata: orderMetadata,
      // Only include shipping if we have an address
      ...(normalizedShippingAddress && {
        shipping: {
          name: customer_name || (isValidEmail ? customer_email : 'Customer'),
          address: normalizedShippingAddress,
        },
      }),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      customerId: customer.id,
      isSubscription: isSubscription,
    });

  } catch (error) {
    // Payment intent creation failed - return safe error message
    return NextResponse.json(
      { error: 'Failed to create payment intent', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/stripe/create-intent',
    stripeConfigured: !!stripe,
  });
}
