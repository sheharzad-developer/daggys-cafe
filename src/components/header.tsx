"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';
import { CartSheet } from './cart-sheet';

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-primary">Daggys Cafe</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Browse Meals</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
          <Button variant="outline" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            {isMounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </nav>
      </div>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
}
