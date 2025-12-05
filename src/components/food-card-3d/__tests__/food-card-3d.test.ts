import { describe, it, expect } from 'vitest';
import { DRAG_THRESHOLDS, ANIMATION_CONFIG } from '../types';

describe('FoodCard3D Drag Thresholds', () => {
  describe('Displacement Threshold', () => {
    it('should trigger toss when displacement exceeds threshold', () => {
      const displacement = DRAG_THRESHOLDS.DISPLACEMENT + 10;
      const velocity = 0.1;
      
      const shouldToss = 
        Math.abs(displacement) > DRAG_THRESHOLDS.DISPLACEMENT ||
        Math.abs(velocity) > DRAG_THRESHOLDS.VELOCITY;
      
      expect(shouldToss).toBe(true);
    });

    it('should not trigger toss when displacement is below threshold and velocity is low', () => {
      const displacement = DRAG_THRESHOLDS.DISPLACEMENT - 10;
      const velocity = 0.1;
      
      const shouldToss = 
        Math.abs(displacement) > DRAG_THRESHOLDS.DISPLACEMENT ||
        Math.abs(velocity) > DRAG_THRESHOLDS.VELOCITY;
      
      expect(shouldToss).toBe(false);
    });
  });

  describe('Velocity Threshold', () => {
    it('should trigger toss when velocity exceeds threshold', () => {
      const displacement = 50;
      const velocity = DRAG_THRESHOLDS.VELOCITY + 0.1;
      
      const shouldToss = 
        Math.abs(displacement) > DRAG_THRESHOLDS.DISPLACEMENT ||
        Math.abs(velocity) > DRAG_THRESHOLDS.VELOCITY;
      
      expect(shouldToss).toBe(true);
    });

    it('should not trigger toss when velocity is below threshold and displacement is low', () => {
      const displacement = 50;
      const velocity = DRAG_THRESHOLDS.VELOCITY - 0.1;
      
      const shouldToss = 
        Math.abs(displacement) > DRAG_THRESHOLDS.DISPLACEMENT ||
        Math.abs(velocity) > DRAG_THRESHOLDS.VELOCITY;
      
      expect(shouldToss).toBe(false);
    });
  });

  describe('Direction Check', () => {
    it('should only toss when dragging to the right (positive direction)', () => {
      const displacement = DRAG_THRESHOLDS.DISPLACEMENT + 10;
      const velocity = 0.1;
      const direction = 1; // Right
      
      const shouldToss = 
        (Math.abs(displacement) > DRAG_THRESHOLDS.DISPLACEMENT ||
         Math.abs(velocity) > DRAG_THRESHOLDS.VELOCITY) &&
        direction > 0;
      
      expect(shouldToss).toBe(true);
    });

    it('should not toss when dragging to the left (negative direction)', () => {
      const displacement = -(DRAG_THRESHOLDS.DISPLACEMENT + 10);
      const velocity = 0.1;
      const direction = -1; // Left
      
      const shouldToss = 
        (Math.abs(displacement) > DRAG_THRESHOLDS.DISPLACEMENT ||
         Math.abs(velocity) > DRAG_THRESHOLDS.VELOCITY) &&
        direction > 0;
      
      expect(shouldToss).toBe(false);
    });
  });

  describe('Threshold Values', () => {
    it('should have reasonable default values', () => {
      expect(DRAG_THRESHOLDS.DISPLACEMENT).toBeGreaterThan(0);
      expect(DRAG_THRESHOLDS.DISPLACEMENT).toBeLessThan(500);
      expect(DRAG_THRESHOLDS.VELOCITY).toBeGreaterThan(0);
      expect(DRAG_THRESHOLDS.VELOCITY).toBeLessThan(10);
      expect(DRAG_THRESHOLDS.MAX_TILT).toBeGreaterThan(0);
      expect(DRAG_THRESHOLDS.MAX_TILT).toBeLessThan(45);
      expect(DRAG_THRESHOLDS.DRAG_SCALE).toBeGreaterThan(1);
      expect(DRAG_THRESHOLDS.DRAG_SCALE).toBeLessThan(2);
    });
  });
});

describe('Animation Config', () => {
  it('should have reasonable animation durations', () => {
    const { TOSS_DURATION, SPRING_BACK_DURATION } = require('../types').ANIMATION_CONFIG;
    
    expect(TOSS_DURATION).toBeGreaterThan(0);
    expect(TOSS_DURATION).toBeLessThan(2000);
    expect(SPRING_BACK_DURATION).toBeGreaterThan(0);
    expect(SPRING_BACK_DURATION).toBeLessThan(1000);
  });
});

