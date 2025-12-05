"use client";

import React, { useState, useEffect } from 'react';
import { isWebGLAvailable } from '@/lib/webgl-detection';
import { FoodCard2DFallback } from './food-card-2d-fallback';
import type { FoodCard3DProps } from './types';

/**
 * Main Food Card Component with automatic WebGL detection
 * Falls back to 2D implementation if WebGL is not available
 * 
 * Note: 3D rendering is currently disabled due to React version conflicts with react-three-fiber.
 * The 2D fallback provides the same drag-to-toss functionality with CSS animations.
 */
export function FoodCard3DWrapper(props: FoodCard3DProps) {
  const [mounted, setMounted] = useState(false);
  const [FoodCard3DComponent, setFoodCard3DComponent] = useState<React.ComponentType<FoodCard3DProps> | null>(null);

  useEffect(() => {
    // Only check after mount to ensure we're on client
    if (typeof window !== 'undefined') {
      setMounted(true);
      
      // Only attempt to load 3D component if WebGL is available and React is fully initialized
      if (isWebGLAvailable()) {
        // Wait for React to be fully ready before importing
        const load3DComponent = async () => {
          try {
            // Add a small delay to ensure React is fully initialized
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Check if React is available
            if (typeof window !== 'undefined' && (window as any).React) {
              const mod = await import('./food-card-3d');
              setFoodCard3DComponent(() => mod.FoodCard3D);
            }
          } catch (error) {
            console.warn('Failed to load 3D component, using 2D fallback:', error);
            // Stay with 2D fallback on error
          }
        };
        
        load3DComponent();
      }
    }
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR
    return <FoodCard2DFallback {...props} />;
  }

  // For now, always use 2D fallback to avoid React version conflicts
  // Uncomment below to enable 3D when the React issue is resolved
  // if (FoodCard3DComponent) {
  //   return <FoodCard3DComponent {...props} />;
  // }

  return <FoodCard2DFallback {...props} />;
}

