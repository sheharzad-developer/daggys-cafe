// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmount } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your-stripe-secret-key') {
      return NextResponse.json(
        { 
          error: 'Stripe not configured', 
          message: 'Please configure your Stripe API keys in .env.local file. See PAYMENT_SETUP.md for instructions.' 
        },
        { status: 500 }
      );
    }

    const { amount, currency = 'usd', customerInfo, cartItems } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    if (customerInfo?.email) {
      const existingCustomers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address ? {
            line1: customerInfo.address.line1,
            line2: customerInfo.address.line2,
            city: customerInfo.address.city,
            state: customerInfo.address.state,
            postal_code: customerInfo.address.postal_code,
            country: customerInfo.address.country || 'US',
          } : undefined,
        });
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmount(amount),
      currency,
      customer: customer?.id,
      metadata: {
        orderItems: JSON.stringify(cartItems),
        customerName: customerInfo?.name || 'Guest',
        customerEmail: customerInfo?.email || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment intent in Supabase for tracking
    const { error: dbError } = await supabase
      .from('payment_intents')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency,
        status: paymentIntent.status,
        customer_email: customerInfo?.email,
        customer_name: customerInfo?.name,
        order_items: cartItems,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway, payment intent was created successfully
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer?.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}