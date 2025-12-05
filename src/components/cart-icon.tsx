"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { prefersReducedMotion } from '@/lib/webgl-detection';

interface CartIconProps {
  className?: string;
  onAnimationComplete?: () => void;
}

export function CartIcon({ className = '', onAnimationComplete }: CartIconProps) {
  const { cartCount } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);
  const [badgeScale, setBadgeScale] = useState(0);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (cartCount > prevCount && !reducedMotion) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete?.();
      }, 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount, reducedMotion, onAnimationComplete]);

  useEffect(() => {
    if (cartCount > 0) {
      setBadgeScale(1);
    }
  }, [cartCount]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounceScale {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.3) rotate(-10deg); }
            50% { transform: scale(1.3) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .cart-bounce {
            animation: bounceScale 0.6s ease-out;
          }
        `
      }} />
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div
          className={`relative ${isAnimating && !reducedMotion ? 'cart-bounce' : ''}`}
        >
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow">
            <ShoppingCart className="w-6 h-6" />
          </div>
          {cartCount > 0 && (
            <div
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-transform duration-300"
              style={{
                transform: `scale(${badgeScale})`,
              }}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </div>
          )}
        </div>
        {/* Accessible announcement for screen readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {cartCount > prevCount && `Added to cart. Cart now has ${cartCount} item${cartCount !== 1 ? 's' : ''}.`}
        </div>
      </div>
    </>
  );
}

