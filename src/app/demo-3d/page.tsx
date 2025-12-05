"use client";

import React from 'react';
import { FoodCard3DWrapper } from '@/components/food-card-3d';
import { CartIcon } from '@/components/cart-icon';
import { useCart } from '@/hooks/use-cart';
import { meals } from '@/lib/data';

/**
 * Demo page showcasing the 3D "Slide to Order" food interaction
 * 
 * Features:
 * - Drag/swipe cards to the right to add to cart
 * - 3D animation with parabolic flight path
 * - Automatic fallback to 2D for non-WebGL devices
 * - Keyboard accessible (Enter key to add)
 * - Respects prefers-reduced-motion
 */
export default function Demo3DPage() {
  const { addToCart } = useCart();

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          3D Slide to Order
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Drag or swipe food cards to the right to add them to your cart. 
          Watch them fly into the cart with a smooth 3D animation!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Works on desktop (mouse drag) and mobile (touch swipe). 
          Press Enter on a focused card to add it via keyboard.
        </p>
      </div>

      {/* Cart Icon - Fixed position top-right */}
      <CartIcon />

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {meals.map((meal) => (
          <FoodCard3DWrapper
            key={meal.id}
            meal={meal}
            onAddToCart={addToCart}
            enableEffects={true}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="font-headline text-2xl font-bold mb-4">How to Use</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <strong>Desktop:</strong> Click and drag a card to the right. Release when you've dragged far enough or fast enough.
          </li>
          <li>
            <strong>Mobile:</strong> Swipe a card to the right with your finger.
          </li>
          <li>
            <strong>Keyboard:</strong> Tab to focus a card, then press Enter to add it to the cart.
          </li>
          <li>
            <strong>Button:</strong> Click the "Add to Cart" button as an alternative.
          </li>
        </ul>
      </div>
    </div>
  );
}

