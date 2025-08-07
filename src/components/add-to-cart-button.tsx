
"use client";

import { useCart } from "@/hooks/use-cart.tsx";
import type { Meal } from "@/lib/data";
import { Button } from "./ui/button";
import { PlusCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function AddToCartButton({ meal }: { meal: Meal }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(meal);
    setIsAdded(true);
  };

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => setIsAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  return (
    <Button 
      onClick={handleAddToCart} 
      className="w-full font-bold"
      disabled={isAdded}
    >
      {isAdded ? (
        <>
          <CheckCircle className="mr-2 h-5 w-5" />
          Added!
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
