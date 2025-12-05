"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import { useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Meal } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { DRAG_THRESHOLDS, ANIMATION_CONFIG, type TossAnimation } from './types';
import { prefersReducedMotion } from '@/lib/webgl-detection';
import type { FoodCard3DProps } from './types';

// Context to share drag state between DOM and 3D
interface CardDragState {
  isDragging: boolean;
  x: number;
  y: number;
  shouldToss: boolean;
}

const DragContext = React.createContext<{ state: CardDragState; setState: (state: CardDragState) => void } | null>(null);

/**
 * 3D Card Mesh Component
 * Receives drag state from parent via context
 */
function CardMesh({ meal, onTossComplete, disabled }: { meal: Meal; onTossComplete: () => void; disabled?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [tossAnimation, setTossAnimation] = useState<TossAnimation | null>(null);
  const { viewport } = useThree();
  const reducedMotion = prefersReducedMotion();
  const dragContext = React.useContext(DragContext);

  // Create texture from image
  const texture = useTexture(meal.image);
  React.useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    }
  }, [texture]);

  // Animate based on drag state
  useFrame((_: RootState, delta: number) => {
    if (!meshRef.current || !dragContext) return;

    const { state: dragState } = dragContext;

    if (tossAnimation?.isActive) {
      // Handle toss animation
      const { startX, startY, startZ, targetX, targetY, targetZ, progress } = tossAnimation;

      if (reducedMotion) {
        meshRef.current.position.set(targetX, targetY, targetZ);
        meshRef.current.scale.setScalar(0.1);
        setTossAnimation(null);
        onTossComplete();
        return;
      }

      const newProgress = Math.min(progress + delta * (1000 / ANIMATION_CONFIG.TOSS_DURATION), 1);
      const eased = 1 - Math.pow(1 - newProgress, 3); // easeOutCubic

      // Parabolic path
      const x = THREE.MathUtils.lerp(startX, targetX, eased);
      const archProgress = Math.sin(Math.PI * eased);
      const y = THREE.MathUtils.lerp(startY, targetY, eased) + archProgress * (ANIMATION_CONFIG.ARCH_HEIGHT * 0.01);
      const z = THREE.MathUtils.lerp(startZ, targetZ, eased);

      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.x += delta * 2;
      meshRef.current.rotation.z += delta * 1.5;

      const scale = THREE.MathUtils.lerp(1, 0.1, eased);
      meshRef.current.scale.setScalar(scale);

      if (newProgress >= 1) {
        setTossAnimation(null);
        onTossComplete();
        meshRef.current.position.set(0, 0, 0);
        meshRef.current.rotation.set(0, 0, 0);
        meshRef.current.scale.setScalar(1);
      } else {
        setTossAnimation({ ...tossAnimation, progress: newProgress });
      }
    } else if (dragState.isDragging && !tossAnimation) {
      // Update transform during drag
      const maxTilt = (DRAG_THRESHOLDS.MAX_TILT * Math.PI) / 180;
      meshRef.current.rotation.x = Math.min(dragState.x * 0.01, maxTilt);
      meshRef.current.rotation.z = dragState.x * 0.005;
      meshRef.current.position.x = dragState.x * 0.01;
      meshRef.current.position.y = -dragState.y * 0.01;
      meshRef.current.scale.setScalar(DRAG_THRESHOLDS.DRAG_SCALE);
    } else if (!dragState.isDragging && !tossAnimation) {
      // Spring back to original position
      const targetPos = new THREE.Vector3(0, 0, 0);
      const targetRot = new THREE.Euler(0, 0, 0);
      const targetScale = new THREE.Vector3(1, 1, 1);

      const currentPos = meshRef.current.position.clone();
      const currentRot = meshRef.current.rotation.clone();
      const currentScale = meshRef.current.scale.clone();

      // Smooth lerp back
      meshRef.current.position.lerp(targetPos, 0.1);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(currentRot.x, targetRot.x, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(currentRot.z, targetRot.z, 0.1);
      meshRef.current.scale.lerp(targetScale, 0.1);
    }

    // Check if we should start toss
    if (dragState.shouldToss && !tossAnimation && !dragState.isDragging) {
      const startPos = meshRef.current.position.clone();
      const cartX = viewport.width / 2 - 1.5;
      const cartY = viewport.height / 2 - 1.5;
      const cartZ = 0;

      setTossAnimation({
        isActive: true,
        startX: startPos.x,
        startY: startPos.y,
        startZ: startPos.z,
        targetX: cartX,
        targetY: cartY,
        targetZ: cartZ,
        progress: 0,
      });

      // Reset drag state
      dragContext.setState({ isDragging: false, x: 0, y: 0, shouldToss: false });
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]}>
      <RoundedBox args={[2, 1.5, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial 
          map={texture} 
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.5}
        />
      </RoundedBox>
    </mesh>
  );
}

/**
 * 3D Scene Component
 * Only renders on client-side to avoid SSR issues
 */
function CardScene({ meal, onTossComplete, disabled }: { meal: Meal; onTossComplete: () => void; disabled?: boolean }) {
  const [isClient, setIsClient] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    // Ensure we're on client and React is fully initialized
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Small delay to ensure React is fully ready
      const timer = setTimeout(() => {
        setIsClient(true);
        setCanvasReady(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isClient || !canvasReady) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading 3D...</div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true
      }}
      style={{ width: '100%', height: '100%', background: 'transparent', display: 'block' }}
      dpr={[1, 2]}
      frameloop="always"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <Suspense fallback={
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 1.5, 0.1]} />
          <meshStandardMaterial color="#8B5CF6" />
        </mesh>
      }>
        <CardMesh meal={meal} onTossComplete={onTossComplete} disabled={disabled} />
      </Suspense>
    </Canvas>
  );
}

/**
 * Main 3D Food Card Component
 * Handles drag on DOM and communicates with 3D scene
 */
export function FoodCard3D({ meal, onAddToCart, enableEffects = false, disabled }: FoodCard3DProps) {
  const [isThrowing, setIsThrowing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = prefersReducedMotion();
  const [dragState, setDragState] = useState<CardDragState>({ isDragging: false, x: 0, y: 0, shouldToss: false });

  const handleTossComplete = () => {
    if (onAddToCart) {
      onAddToCart(meal);
    }
    setIsThrowing(false);
  };

  // Drag gesture on DOM element
  const bind = useDrag(
    ({
      down,
      movement: [mx, my],
      velocity: [vx],
      direction: [dx],
      last,
      cancel,
    }) => {
      if (disabled || isThrowing) {
        cancel();
        return;
      }

      if (down) {
        setDragState({ isDragging: true, x: mx, y: my, shouldToss: false });
      } else if (last) {
        const shouldToss =
          Math.abs(mx) > DRAG_THRESHOLDS.DISPLACEMENT ||
          Math.abs(vx) > DRAG_THRESHOLDS.VELOCITY;

        if (shouldToss && dx > 0) {
          setIsThrowing(true);
          setDragState({ isDragging: false, x: mx, y: my, shouldToss: true });
        } else {
          setDragState({ isDragging: false, x: 0, y: 0, shouldToss: false });
        }
      }
    },
    {
      axis: 'x',
      threshold: 10,
    }
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || isThrowing) return;
    if (e.key === 'Enter' && onAddToCart) {
      setIsThrowing(true);
      if (reducedMotion) {
        onAddToCart(meal);
        setIsThrowing(false);
      } else {
        // Trigger toss
        setDragState({ isDragging: false, x: 0, y: 0, shouldToss: true });
      }
    }
  };

  return (
    <DragContext.Provider value={{ state: dragState, setState: setDragState }}>
      <div
        ref={cardRef}
        {...bind()}
        onKeyDown={handleKeyPress}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`Add ${meal.name} to cart`}
        className="cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      >
        <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
          {/* 3D Canvas Overlay */}
          <div className="relative aspect-[4/3] w-full pointer-events-none bg-gradient-to-br from-muted/50 to-muted/30">
            <CardScene meal={meal} onTossComplete={handleTossComplete} disabled={disabled} />
          </div>

          {/* DOM Content */}
          <CardHeader className="p-0 pointer-events-auto">
            <div className="p-6 pb-2">
              <CardTitle className="font-headline text-2xl">{meal.name}</CardTitle>
              <CardDescription className="text-primary font-bold text-lg">
                ${meal.price.toFixed(2)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-6 pt-0 pointer-events-auto">
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
          <CardFooter className="p-6 pt-0 pointer-events-auto">
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
    </DragContext.Provider>
  );
}
