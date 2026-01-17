import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';

// ============================================================================
// STRIPE WEBHOOK HANDLER
// ============================================================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion })
  : null;

// ============================================================================
// AIRTABLE INTEGRATION
// ============================================================================

async function updateAirtablePaymentStatus(email: string, paymentData: {
  paymentAmount: number;
  paymentDate: string;
  paymentId: string;
  medication: string;
  plan: string;
  stripeCustomerId: string;
}) {
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Intakes';

  if (!airtableApiKey || !airtableBaseId) {
    logger.log('[webhook] Airtable not configured, skipping update');
    return null;
  }

  try {
    // Find record by email
    const searchUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}?filterByFormula=${encodeURIComponent(`{Email}='${email}'`)}&maxRecords=1`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      logger.error('[webhook] Airtable search failed:', searchResponse.status);
      return null;
    }

    const searchResult = await searchResponse.json();
    const record = searchResult.records?.[0];

    if (!record) {
      logger.warn(`[webhook] No Airtable record found for email: ${email}`);
      return null;
    }

    // Update record with payment info
    const updateUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}/${record.id}`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Payment Status': 'Paid',
          'Payment Amount': paymentData.paymentAmount / 100, // Convert cents to dollars
          'Payment Date': paymentData.paymentDate,
          'Stripe Payment ID': paymentData.paymentId,
          'Stripe Customer ID': paymentData.stripeCustomerId,
          'Selected Medication': paymentData.medication,
          'Selected Plan': paymentData.plan,
        },
      }),
    });

    if (!updateResponse.ok) {
      logger.error('[webhook] Airtable update failed:', updateResponse.status);
      return null;
    }

    logger.log(`[webhook] Updated Airtable record ${record.id} with payment data`);
    return record.id;

  } catch (error) {
    logger.error('[webhook] Airtable error:', error);
    return null;
  }
}

// ============================================================================
// META CAPI INTEGRATION
// ============================================================================

async function sendMetaPurchaseEvent(metadata: Record<string, string>, amount: number, currency: string) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSION_API_TOKEN;

  if (!pixelId || !accessToken) {
    logger.log('[webhook] Meta CAPI not configured, skipping purchase event');
    return null;
  }

  try {
    const eventData = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: metadata.meta_event_id || metadata.paymentIntentId,
      event_source_url: metadata.page_url || 'https://intake.eonmeds.com/checkout',
      action_source: 'website',
      user_data: {
        em: metadata.customer_email ? [hashSHA256(metadata.customer_email.toLowerCase())] : undefined,
        ph: metadata.customer_phone ? [hashSHA256(normalizePhone(metadata.customer_phone))] : undefined,
        fn: metadata.customer_first_name ? [hashSHA256(metadata.customer_first_name.toLowerCase())] : undefined,
        ln: metadata.customer_last_name ? [hashSHA256(metadata.customer_last_name.toLowerCase())] : undefined,
        ct: metadata.shipping_city ? [hashSHA256(metadata.shipping_city.toLowerCase().replace(/\s/g, ''))] : undefined,
        st: metadata.shipping_state ? [hashSHA256(metadata.shipping_state.toLowerCase())] : undefined,
        zp: metadata.shipping_zip ? [hashSHA256(metadata.shipping_zip)] : undefined,
        country: ['us'],
        fbp: metadata.fbp || undefined,
        fbc: metadata.fbc || undefined,
        lead_id: metadata.lead_id || undefined,
      },
      custom_data: {
        value: amount / 100,
        currency: currency.toUpperCase(),
        content_type: 'product',
        content_name: metadata.medication || 'GLP-1 Treatment',
        contents: [{ id: metadata.medication || 'glp1', quantity: 1 }],
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [eventData],
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[webhook] Meta CAPI error:', errorText);
      return null;
    }

    logger.log('[webhook] Meta CAPI Purchase event sent');
    return true;

  } catch (error) {
    logger.error('[webhook] Meta CAPI error:', error);
    return null;
  }
}

// Hash function for Meta CAPI
async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^1/, '');
}

// ============================================================================
// SUBSCRIPTION CREATION
// ============================================================================

async function createSubscriptionForPayment(paymentIntent: Stripe.PaymentIntent) {
  if (!stripe) return null;
  
  const metadata = paymentIntent.metadata;
  
  if (metadata.is_subscription !== 'true') {
    logger.log('[webhook] Not a subscription payment, skipping');
    return null;
  }

  const customerId = metadata.customer_id;
  const mainPriceId = metadata.main_price_id;

  if (!customerId || !mainPriceId) {
    logger.error('[webhook] Missing customer ID or price ID');
    return null;
  }

  // Check for existing subscription
  const existingSubscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 10,
  });

  const existingForPrice = existingSubscriptions.data.find(sub => 
    sub.items.data[0]?.price?.id === mainPriceId
  );

  if (existingForPrice) {
    logger.log(`[webhook] Subscription already exists: ${existingForPrice.id}`);
    return existingForPrice;
  }

  // Attach payment method
  const paymentMethodId = paymentIntent.payment_method as string;
  
  if (paymentMethodId) {
    try {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch (e: unknown) {
      const error = e as Error;
      if (!error.message?.includes('already been attached')) {
        throw e;
      }
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  // Calculate next billing date (1 month from now for monthly subscription)
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  const billingCycleAnchor = Math.floor(nextBillingDate.getTime() / 1000);

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: mainPriceId }],
    default_payment_method: paymentMethodId,
    billing_cycle_anchor: billingCycleAnchor,
    proration_behavior: 'none',
    metadata: {
      medication: metadata.medication,
      plan: metadata.plan,
      source: 'intake.eonmeds.com',
      initial_payment_intent_id: paymentIntent.id,
    },
  });

  logger.log(`[webhook] Created subscription ${subscription.id}`);
  return subscription;
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    logger.error('[webhook] Stripe webhook not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logger.log('[webhook] Event received:', event.type, event.id);
  } catch (err) {
    logger.error('[webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        logger.log('[webhook] Payment succeeded:', paymentIntent.id);
        logger.log('[webhook] Amount:', paymentIntent.amount, paymentIntent.currency);

        // Check if from our checkout
        const isFromOurCheckout = Boolean(
          metadata.customer_email || 
          metadata.medication || 
          metadata.source === 'intake.eonmeds.com'
        );

        if (!isFromOurCheckout) {
          logger.log('[webhook] Payment not from our checkout, skipping');
          return NextResponse.json({ received: true, skipped: true });
        }

        // Create subscription if applicable
        if (metadata.is_subscription === 'true') {
          try {
            await createSubscriptionForPayment(paymentIntent);
          } catch (error) {
            logger.error('[webhook] Subscription creation error:', error);
          }
        }

        // Update Airtable
        const email = metadata.customer_email || paymentIntent.receipt_email || '';
        if (email) {
          await updateAirtablePaymentStatus(email, {
            paymentAmount: paymentIntent.amount,
            paymentDate: new Date(paymentIntent.created * 1000).toISOString(),
            paymentId: paymentIntent.id,
            medication: metadata.medication || '',
            plan: metadata.plan || '',
            stripeCustomerId: paymentIntent.customer as string,
          });
        }

        // Send Meta CAPI Purchase event
        await sendMetaPurchaseEvent(metadata, paymentIntent.amount, paymentIntent.currency);

        logger.log('[webhook] Payment processing complete');
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.log(`[webhook] Subscription ${event.type}: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.log(`[webhook] Subscription cancelled: ${subscription.id}`);
        break;
      }

      default:
        logger.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    logger.error('[webhook] Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/stripe/webhook',
    configured: !!stripe && !!webhookSecret,
  });
}
