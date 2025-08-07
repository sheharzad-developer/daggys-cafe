// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment intent status in database
    const { error: updateError } = await supabase
      .from('payment_intents')
      .update({ 
        status: 'succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (updateError) {
      console.error('Failed to update payment intent:', updateError);
    }

    // Create order record
    const orderData = {
      id: `ORD-${Date.now()}`,
      customer_name: paymentIntent.metadata.customerName || 'Guest',
      customer_email: paymentIntent.metadata.customerEmail || '',
      total: paymentIntent.amount / 100, // Convert from cents
      status: 'Pending' as const,
      payment_intent_id: paymentIntent.id,
      items: JSON.parse(paymentIntent.metadata.orderItems || '[]'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: orderError } = await supabase
      .from('orders')
      .insert(orderData);

    if (orderError) {
      console.error('Failed to create order:', orderError);
    } else {
      console.log('Order created successfully:', orderData.id);
      
      // Send confirmation email (if SendGrid is configured)
      await sendOrderConfirmationEmail(orderData);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { error } = await supabase
      .from('payment_intents')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Failed to update payment intent:', error);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { error } = await supabase
      .from('payment_intents')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Failed to update payment intent:', error);
    }
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

async function sendOrderConfirmationEmail(orderData: any) {
  try {
    // This would integrate with SendGrid if configured
    // For now, just log the confirmation
    console.log('Order confirmation email would be sent to:', orderData.customer_email);
    
    // TODO: Implement SendGrid email sending
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: orderData.customer_email,
    //   from: 'orders@daggyscafe.com',
    //   subject: `Order Confirmation - ${orderData.id}`,
    //   html: generateOrderEmailTemplate(orderData)
    // });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}