"use client";

import { useCart } from "@/hooks/use-cart.tsx";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  zip: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
  cardName: z.string().min(2, "Name on card is required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Invalid card number"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format (MM/YY)"),
  cardCVC: z.string().regex(/^\d{3,4}$/, "Invalid CVC"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      zip: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
    },
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/');
    }
  }, [cartItems, router]);

  const onSubmit = (data: CheckoutFormValues) => {
    console.log("Order placed:", data);
    clearCart();
    router.push('/confirmation');
  };

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold text-center mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-12">
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Order</CardTitle>
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
                        <div className="flex justify-between font-bold text-lg">
                            <p>Total</p>
                            <p>${cartTotal.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping & Payment</CardTitle>
                        <CardDescription>Please enter your details to complete the purchase.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <section>
                                    <h3 className="font-headline text-lg mb-4">Shipping Information</h3>
                                    <div className="space-y-4">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="address" render={({ field }) => (
                                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="city" render={({ field }) => (
                                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="zip" render={({ field }) => (
                                                <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </section>
                                <Separator />
                                <section>
                                     <h3 className="font-headline text-lg mb-4">Payment Details</h3>
                                     <div className="space-y-4">
                                        <FormField control={form.control} name="cardName" render={({ field }) => (
                                            <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="cardNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="cardExpiry" render={({ field }) => (
                                                <FormItem><FormLabel>Expiry (MM/YY)</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="cardCVC" render={({ field }) => (
                                                <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="•••" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                     </div>
                                </section>
                                <Button type="submit" className="w-full font-bold text-lg" size="lg" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                                </Button>
                            </form>
                         </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
