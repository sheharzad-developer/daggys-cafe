# Payment Module Setup Guide

This guide will help you set up the complete payment system for Daggy's Cafe using Stripe integration.

## Overview

The payment module includes:
- **Stripe Integration**: Secure payment processing with Stripe Elements
- **Payment Intent Management**: Server-side payment handling
- **Webhook Processing**: Real-time payment status updates
- **Admin Dashboard**: Payment monitoring and management
- **Database Schema**: Complete payment and order tracking

## Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **Supabase Project**: Ensure your Supabase project is set up and connected
3. **Environment Variables**: Configure your `.env.local` file

## Step 1: Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account verification process

### 1.2 Get API Keys
1. Navigate to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** > **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 1.3 Set Up Webhooks
1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/api/payments/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 2: Environment Configuration

Update your `.env.local` file with the following variables:

```env
# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

**Important Security Notes:**
- Never commit your `.env.local` file to version control
- The `NEXT_PUBLIC_` prefixed variables are safe for the browser
- Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` server-side only

## Step 3: Database Schema

The payment module creates the following tables:

### Core Tables
- **`payment_intents`**: Stripe payment intent tracking
- **`orders`**: Enhanced order management with payment integration
- **`customers`**: Customer information and statistics
- **`payment_methods`**: Saved payment methods
- **`order_tracking`**: Order status history

### Features
- **Row Level Security (RLS)**: Secure data access
- **Automatic Triggers**: Update timestamps and customer stats
- **Indexes**: Optimized for performance
- **Order Number Generation**: Automatic unique order numbers

## Step 4: API Endpoints

The payment module includes these API endpoints:

### `/api/payments/create-intent`
- **Method**: POST
- **Purpose**: Create Stripe payment intent
- **Body**: Order details, customer info, shipping address

### `/api/payments/webhook`
- **Method**: POST
- **Purpose**: Handle Stripe webhook events
- **Security**: Webhook signature verification

## Step 5: Frontend Components

### Enhanced Checkout Page
- **Stripe Elements**: Secure card input
- **Payment Intent**: Server-side payment processing
- **Order Summary**: Real-time cart display
- **Address Collection**: Shipping information

### Admin Payment Management
- **Payment Dashboard**: Real-time payment monitoring
- **Transaction History**: Searchable payment records
- **Revenue Analytics**: Daily/monthly revenue tracking
- **Export Functionality**: CSV export for accounting

## Step 6: Testing

### Test Card Numbers
Use these test cards in development:

```
# Successful payments
4242424242424242 (Visa)
4000056655665556 (Visa Debit)
5555555555554444 (Mastercard)

# Failed payments
4000000000000002 (Card declined)
4000000000009995 (Insufficient funds)

# Use any future expiry date and any 3-digit CVC
```

### Testing Workflow
1. **Place Test Order**: Use test card numbers
2. **Check Payment Intent**: Verify in Stripe Dashboard
3. **Webhook Testing**: Use Stripe CLI for local testing
4. **Admin Dashboard**: Monitor payments in admin panel

## Step 7: Production Deployment

### 7.1 Switch to Live Mode
1. Complete Stripe account activation
2. Get live API keys from Stripe Dashboard
3. Update environment variables with live keys
4. Update webhook endpoint to production URL

### 7.2 Security Checklist
- [ ] Environment variables properly configured
- [ ] Webhook signature verification enabled
- [ ] RLS policies active on all tables
- [ ] HTTPS enabled on production domain
- [ ] API rate limiting configured

## Step 8: Monitoring and Maintenance

### Payment Monitoring
- **Stripe Dashboard**: Real-time payment monitoring
- **Admin Panel**: Internal payment management
- **Webhook Logs**: Debug payment issues
- **Database Logs**: Track order processing

### Regular Tasks
- Monitor failed payments
- Review webhook delivery status
- Update payment method support
- Analyze revenue trends

## Troubleshooting

### Common Issues

**Payment Intent Creation Fails**
- Check Stripe API keys
- Verify amount is in cents
- Ensure customer email is provided

**Webhook Not Receiving Events**
- Verify webhook URL is accessible
- Check webhook signing secret
- Review Stripe webhook logs

**Database Connection Issues**
- Verify Supabase credentials
- Check RLS policies
- Ensure tables exist

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
STRIPE_DEBUG=true
```

## Support

### Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Getting Help
- Check browser console for client-side errors
- Review server logs for API errors
- Use Stripe Dashboard for payment debugging
- Check Supabase logs for database issues

## Security Best Practices

1. **Never log sensitive data** (card numbers, secrets)
2. **Validate all inputs** on both client and server
3. **Use HTTPS** for all payment-related requests
4. **Implement rate limiting** on payment endpoints
5. **Monitor for suspicious activity** in payment patterns
6. **Keep dependencies updated** for security patches
7. **Use environment variables** for all configuration
8. **Enable webhook signature verification** always

---

**Next Steps**: After completing this setup, you'll have a fully functional payment system ready for production use. Consider implementing additional features like:
- Subscription billing
- Multi-currency support
- Advanced fraud detection
- Customer payment method management
- Automated refund processing