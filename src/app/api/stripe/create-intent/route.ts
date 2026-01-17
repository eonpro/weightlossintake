import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with the secret key
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { 
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

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

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    logger.error('Stripe not configured - missing STRIPE_SECRET_KEY');
    return NextResponse.json(
      { error: 'Stripe not configured', message: 'Payment system is not configured. Please contact support.' },
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
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid amount', message: 'Amount must be at least $0.50' },
        { status: 400 }
      );
    }

    // Normalize shipping address (optional)
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

    // Normalize plan name
    const normalizedPlanName = (() => {
      const p = (order_data?.plan || '').toLowerCase();
      if (p.includes('monthly')) return 'Monthly Recurring';
      if (p.includes('3')) return '3-Month Plan';
      if (p.includes('6')) return '6-Month Plan';
      return order_data?.plan || 'One-Time Purchase';
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
      addons: JSON.stringify(order_data?.addons || []),
      expedited_shipping: order_data?.expeditedShipping ? 'yes' : 'no',
      total: order_data?.total?.toString() || '',
    };

    const isValidEmail = customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email);

    // Create payment intent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
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
    };

    // Only include shipping if we have an address
    if (normalizedShippingAddress) {
      paymentIntentParams.shipping = {
        name: customer_name || (isValidEmail ? customer_email : 'Customer'),
        address: normalizedShippingAddress,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    logger.info('Payment intent created', { 
      paymentIntentId: paymentIntent.id, 
      amount: paymentIntent.amount,
      customerId: customer.id 
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      customerId: customer.id,
      isSubscription: isSubscription,
    });

  } catch (error) {
    logger.error('Payment intent creation failed', { error });
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Stripe error', 
          message: error.message,
          code: error.code 
        },
        { status: 400 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const isConfigured = !!stripe;
  const hasPublicKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  return NextResponse.json({
    status: isConfigured ? 'healthy' : 'not_configured',
    endpoint: '/api/stripe/create-intent',
    stripeConfigured: isConfigured,
    publicKeyConfigured: hasPublicKey,
    // Don't expose the actual key, just if it exists and starts with expected prefix
    secretKeyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 7) : null,
  });
}
