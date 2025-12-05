"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import Image from 'next/image';
import type { Meal } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { DRAG_THRESHOLDS, ANIMATION_CONFIG } from './types';
import { prefersReducedMotion } from '@/lib/webgl-detection';

interface FoodCard2DFallbackProps {
  meal: Meal;
  onAddToCart?: (meal: Meal) => void;
  disabled?: boolean;
}

/**
 * 2D fallback component for devices without WebGL support
 * Provides similar drag-to-toss behavior using DOM transforms
 */
export function FoodCard2DFallback({ meal, onAddToCart, disabled }: FoodCard2DFallbackProps) {
  const [isThrowing, setIsThrowing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = prefersReducedMotion();

  const [state, setState] = useState({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    shadow: 0,
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  });

  const setTransform = (next: Partial<typeof state>) =>
    setState((prev) => ({ ...prev, ...next }));

  const bind = useDrag(
    ({ down, movement: [mx, my], velocity: [vx], direction: [dx], last, cancel }) => {
      if (disabled || isThrowing) {
        cancel();
        return;
      }

      if (down) {
        // Update position and transforms during drag
        setTransform({
          transition: 'none',
          x: mx,
          y: my,
          rotateX: Math.min(mx * 0.1, DRAG_THRESHOLDS.MAX_TILT),
          rotateY: mx * 0.05,
          scale: DRAG_THRESHOLDS.DRAG_SCALE,
          shadow: 20,
        });
      } else if (last) {
        // Check if we should toss or spring back
        const shouldToss =
          Math.abs(mx) > DRAG_THRESHOLDS.DISPLACEMENT ||
          Math.abs(vx) > DRAG_THRESHOLDS.VELOCITY;

        if (shouldToss && dx > 0 && onAddToCart) {
          // Toss animation
          setIsThrowing(true);
          if (!reducedMotion) {
            // Animate to cart position (top-right)
            const cardRect = cardRef.current?.getBoundingClientRect();
            const cartX = window.innerWidth - 100;
            const cartY = 100;

            if (cardRect) {
              const startX = cardRect.left + cardRect.width / 2;
              const startY = cardRect.top + cardRect.height / 2;

              setTransform({
                transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.7s ease',
                x: cartX - startX,
                y: cartY - startY,
                rotateX: 360,
                rotateY: 360,
                scale: 0.3,
                shadow: 10,
              });

              setTimeout(() => {
                onAddToCart(meal);
                // Reset after animation
                setTimeout(() => {
                  setTransform({
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    x: 0,
                    y: 0,
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    shadow: 0,
                  });
                  setIsThrowing(false);
                }, 100);
              }, ANIMATION_CONFIG.TOSS_DURATION);
            }
          } else {
            // Reduced motion: just add to cart
            onAddToCart(meal);
            setTimeout(() => {
              setTransform({
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                shadow: 0,
              });
              setIsThrowing(false);
            }, 100);
          }
        } else {
          // Spring back to original position
          setTransform({
            transition: 'transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.35s ease',
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            shadow: 0,
          });
        }
      }
    },
    {
      axis: 'x',
      threshold: 10,
    }
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (disabled || isThrowing) return;
    if (e.key === 'Enter' && onAddToCart) {
      if (reducedMotion) {
        onAddToCart(meal);
      } else {
        setIsThrowing(true);
        const cardRect = cardRef.current?.getBoundingClientRect();
        const cartX = window.innerWidth - 100;
        const cartY = 100;

        if (cardRect) {
          const startX = cardRect.left + cardRect.width / 2;
          const startY = cardRect.top + cardRect.height / 2;

          setTransform({
            transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.7s ease',
            x: cartX - startX,
            y: cartY - startY,
            rotateX: 360,
            rotateY: 360,
            scale: 0.3,
            shadow: 10,
          });

          setTimeout(() => {
            onAddToCart(meal);
            setTimeout(() => {
              setTransform({
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                shadow: 0,
              });
              setIsThrowing(false);
            }, 100);
          }, ANIMATION_CONFIG.TOSS_DURATION);
        }
      }
    }
  };

  const transformStyle = {
    transform: `translate3d(${state.x}px, ${state.y}px, 0px) rotateX(${state.rotateY}deg) rotateY(${state.rotateX}deg) scale(${state.scale})`,
    boxShadow: `0 ${state.shadow}px ${state.shadow * 2}px rgba(0,0,0,0.3)`,
    transition: state.transition,
    touchAction: 'none' as const,
  };

  return (
    <div
      ref={cardRef}
      {...bind()}
      style={transformStyle}
      onKeyDown={handleKeyPress}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Add ${meal.name} to cart`}
      className="cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    >
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] w-full">
            <Image src={meal.image} alt={meal.name} fill className="object-cover" />
          </div>
          <div className="p-6 pb-2">
            <CardTitle className="font-headline text-2xl">{meal.name}</CardTitle>
            <CardDescription className="text-primary font-bold text-lg">
              ${meal.price.toFixed(2)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6 pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <span>{meal.macros.calories} kcal</span>
            </div>
            <div className="flex items-center gap-2">
              <Beef className="w-5 h-5 text-primary" />
              <span>{meal.macros.protein}g Protein</span>
            </div>
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-primary" />
              <span>{meal.macros.carbs}g Carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              <span>{meal.macros.fats}g Fats</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(meal);
            }}
            className="w-full"
            disabled={disabled}
            aria-label={`Add ${meal.name} to cart`}
          >
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

