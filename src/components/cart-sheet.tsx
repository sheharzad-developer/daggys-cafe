"use client";

import { Button } from '@/components/ui/button';
import { MealImage } from '@/components/meal-image';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart.tsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function CartSheet({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/checkout');
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Your Cart ({cartCount})</SheetTitle>
          <SheetDescription>Review your items before checkout.</SheetDescription>
        </SheetHeader>
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-grow my-4 pr-6">
              <div className="flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden">
                      <MealImage meal={item} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                          className="w-16 h-8"
                        />
                         <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full font-bold text-lg" size="lg">
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4" onClick={() => onOpenChange(false)}>
                <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
