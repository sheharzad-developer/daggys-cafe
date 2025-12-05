import type { Meal } from '@/lib/data';

export interface FoodCard3DProps {
  meal: Meal;
  onAddToCart?: (meal: Meal) => void;
  enableEffects?: boolean;
  disabled?: boolean;
}

export interface DragState {
  isDragging: boolean;
  x: number;
  y: number;
  rotationX: number;
  scale: number;
}

export interface TossAnimation {
  isActive: boolean;
  startX: number;
  startY: number;
  startZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  progress: number;
}

// Thresholds for drag-to-toss behavior
export const DRAG_THRESHOLDS = {
  // Minimum horizontal displacement (px) to trigger toss
  DISPLACEMENT: 100,
  // Minimum horizontal velocity (px/ms) to trigger toss
  VELOCITY: 0.5,
  // Maximum tilt angle during drag (degrees)
  MAX_TILT: 15,
  // Scale factor during drag
  DRAG_SCALE: 1.05,
} as const;

// Animation timing
export const ANIMATION_CONFIG = {
  // Duration of toss animation (ms)
  TOSS_DURATION: 700,
  // Duration of spring-back animation (ms)
  SPRING_BACK_DURATION: 400,
  // Arch height for parabolic flight (relative units)
  ARCH_HEIGHT: 150,
  // Easing function for toss
  TOSS_EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' as const,
} as const;

