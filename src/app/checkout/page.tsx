"use client";

import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_your-stripe-publishable-key'
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function CheckoutForm() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!stripe || !elements) {
      setPaymentError("Stripe has not loaded yet. Please try again.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cartTotal,
          currency: 'usd',
          customerInfo: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: {
              line1: data.address,
              city: data.city,
              state: data.state,
              postal_code: data.zip,
              country: 'US',
            },
          },
          cartItems: cartItems.map(item => ({
            mealName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        } catch {
          throw new Error(`Server error: ${response.status}. Please try again later.`);
        }
      }

      const responseData = await response.json();
      const { clientSecret, error } = responseData;

      if (error) {
        throw new Error(error);
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              address: {
                line1: data.address,
                city: data.city,
                state: data.state,
                postal_code: data.zip,
                country: 'US',
              },
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        setPaymentSuccess(true);
        clearCart();
        
        // Redirect to confirmation page after a short delay
        setTimeout(() => {
          router.push('/confirmation?payment_intent=' + paymentIntent.id);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle specific error types
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Stripe not configured')) {
          errorMessage = 'Payment system is not configured. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
          <p className="text-green-700">Your order has been confirmed and is being processed.</p>
          <p className="text-sm text-green-600 mt-2">Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">Secure Checkout</h1>
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Order
              </CardTitle>
              <CardDescription>Review your items before payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>${cartTotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Delivery Fee</p>
                  <p>$2.99</p>
                </div>
                <div className="flex justify-between">
                  <p>Tax</p>
                  <p>${(cartTotal * 0.08).toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>${(cartTotal + 2.99 + cartTotal * 0.08).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>Secure payment powered by Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentError && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {paymentError}
                  </AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Customer Information */}
                  <section>
                    <h3 className="font-headline text-lg mb-4">Customer Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isProcessing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isProcessing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} disabled={isProcessing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </section>

                  {/* Shipping Address */}
                  <section>
                    <h3 className="font-headline text-lg mb-4">Delivery Address</h3>
                    <div className="space-y-4">
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isProcessing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isProcessing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isProcessing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="zip" render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isProcessing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </section>

                  {/* Payment Method */}
                  <section>
                    <h3 className="font-headline text-lg mb-4">Payment Method</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#424770',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your payment information is encrypted and secure.
                    </p>
                  </section>

                  <Button 
                    type="submit" 
                    className="w-full font-bold text-lg" 
                    size="lg" 
                    disabled={isProcessing || !stripe}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      `Pay $${(cartTotal + 2.99 + cartTotal * 0.08).toFixed(2)}`
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    Secured by Stripe • SSL Encrypted
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/');
    }
  }, [cartItems, router]);

  if (cartItems.length === 0) {
    return null;
  }

  if (!stripePromise) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            <strong>Payment System Not Available</strong>
            <br />
            The payment system is currently not configured. Please contact support or try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
