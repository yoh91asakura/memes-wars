// Animation Hooks - Custom React hooks for animations and visual effects

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  AnimationManager, 
  Tween, 
  AnimationConfig, 
  Easing,
  UIAnimations,
  ParticleSystem,
  globalAnimationManager
} from '../utils/animations';
import { Position, Vector2D } from '../models/Combat';

// Main animation hook
export function useAnimation() {
  const animationManager = useRef<AnimationManager>(globalAnimationManager);

  const createTween = useCallback((
    id: string,
    from: Record<string, number>,
    to: Record<string, number>,
    config: AnimationConfig,
    onUpdate: (values: Record<string, number>) => void,
    onComplete?: () => void
  ): Tween => {
    return animationManager.current.createTween(id, from, to, config, onUpdate, onComplete);
  }, []);

  const startAnimation = useCallback((id: string) => {
    animationManager.current.startAnimation(id);
  }, []);

  const pauseAnimation = useCallback((id: string) => {
    animationManager.current.pauseAnimation(id);
  }, []);

  const resumeAnimation = useCallback((id: string) => {
    animationManager.current.resumeAnimation(id);
  }, []);

  const stopAnimation = useCallback((id: string) => {
    animationManager.current.stopAnimation(id);
  }, []);

  const stopAllAnimations = useCallback(() => {
    animationManager.current.stopAllAnimations();
  }, []);

  const hasAnimation = useCallback((id: string) => {
    return animationManager.current.hasAnimation(id);
  }, []);

  return {
    createTween,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
    stopAllAnimations,
    hasAnimation,
    easing: Easing
  };
}

// Hook for element animations
export function useElementAnimation() {
  const animatedRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerElement = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      animatedRefs.current.set(id, element);
    } else {
      animatedRefs.current.delete(id);
    }
  }, []);

  const slideIn = useCallback(async (
    elementId: string,
    direction: 'left' | 'right' | 'up' | 'down' = 'left',
    duration: number = 300
  ) => {
    const element = animatedRefs.current.get(elementId);
    if (element) {
      return UIAnimations.slideIn(element, direction, duration);
    }
  }, []);

  const fadeIn = useCallback(async (elementId: string, duration: number = 300) => {
    const element = animatedRefs.current.get(elementId);
    if (element) {
      return UIAnimations.fadeIn(element, duration);
    }
  }, []);

  const scaleIn = useCallback(async (elementId: string, duration: number = 200) => {
    const element = animatedRefs.current.get(elementId);
    if (element) {
      return UIAnimations.scaleIn(element, duration);
    }
  }, []);

  const shake = useCallback(async (
    elementId: string,
    intensity: number = 10,
    duration: number = 600
  ) => {
    const element = animatedRefs.current.get(elementId);
    if (element) {
      return UIAnimations.shake(element, intensity, duration);
    }
  }, []);

  const pulse = useCallback(async (
    elementId: string,
    scale: number = 1.1,
    duration: number = 1000
  ) => {
    const element = animatedRefs.current.get(elementId);
    if (element) {
      return UIAnimations.pulse(element, scale, duration);
    }
  }, []);

  return {
    registerElement,
    slideIn,
    fadeIn,
    scaleIn,
    shake,
    pulse
  };
}

// Hook for value animations (numbers, positions, etc.)
export function useValueAnimation<T extends Record<string, number>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const { createTween, startAnimation } = useAnimation();

  const animateTo = useCallback((
    targetValues: Partial<T>,
    config: AnimationConfig
  ): Promise<void> => {
    return new Promise((resolve) => {
      const animationId = `value-animation-${Date.now()}`;
      
      createTween(
        animationId,
        values,
        { ...values, ...targetValues },
        config,
        (newValues) => setValues(newValues as T),
        () => resolve()
      );
      
      startAnimation(animationId);
    });
  }, [values, createTween, startAnimation]);

  const animateValue = useCallback((
    key: keyof T,
    targetValue: number,
    duration: number = 1000,
    easing: (t: number) => number = Easing.easeOutCubic
  ): Promise<void> => {
    return animateTo({ [key]: targetValue } as Partial<T>, { duration, easing });
  }, [animateTo]);

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return {
    values,
    animateTo,
    animateValue,
    reset,
    setValues
  };
}

// Hook for spring animations
export function useSpring(config?: { stiffness?: number; damping?: number; mass?: number }) {
  const { stiffness = 100, damping = 10, mass = 1 } = config || {};
  
  const [value, setValue] = useState(0);
  const [target, setTarget] = useState(0);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);

  const animate = useCallback(() => {
    setValue(currentValue => {
      const displacement = currentValue - target;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * velocityRef.current;
      
      const acceleration = (springForce + dampingForce) / mass;
      velocityRef.current += acceleration * 0.016; // Assume 60fps
      const newValue = currentValue + velocityRef.current * 0.016;
      
      // Stop animation when close enough to target
      if (Math.abs(newValue - target) < 0.01 && Math.abs(velocityRef.current) < 0.01) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        velocityRef.current = 0;
        return target;
      }
      
      animationRef.current = requestAnimationFrame(animate);
      return newValue;
    });
  }, [target, stiffness, damping, mass]);

  const springTo = useCallback((newTarget: number) => {
    setTarget(newTarget);
    if (!animationRef.current) {
      animate();
    }
  }, [animate]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { value, springTo };
}

// Hook for particle effects
export function useParticles(maxParticles: number = 100) {
  const particleSystem = useRef<ParticleSystem>(new ParticleSystem(maxParticles));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  const createExplosion = useCallback((position: Position, particleCount: number = 20) => {
    particleSystem.current.createExplosion(position, particleCount);
  }, []);

  const createTrail = useCallback((position: Position, velocity: Vector2D) => {
    particleSystem.current.createTrail(position, velocity);
  }, []);

  const startRenderLoop = useCallback(() => {
    if (!canvasRef.current || animationRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Clear canvas
      context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      // Update and render particles
      particleSystem.current.update(deltaTime);
      particleSystem.current.render(context);

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    animationRef.current = requestAnimationFrame(renderLoop);
  }, []);

  const stopRenderLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const clearParticles = useCallback(() => {
    particleSystem.current.clear();
  }, []);

  const getParticleCount = useCallback(() => {
    return particleSystem.current.getParticleCount();
  }, []);

  useEffect(() => {
    return () => {
      stopRenderLoop();
    };
  }, [stopRenderLoop]);

  return {
    setCanvas,
    createExplosion,
    createTrail,
    startRenderLoop,
    stopRenderLoop,
    clearParticles,
    getParticleCount
  };
}

// Hook for CSS keyframe animations
export function useKeyframes() {
  const keyframesRef = useRef<Map<string, string>>(new Map());

  const createKeyframes = useCallback((name: string, keyframes: string) => {
    if (keyframesRef.current.has(name)) return;

    const style = document.createElement('style');
    style.textContent = `@keyframes ${name} { ${keyframes} }`;
    document.head.appendChild(style);
    
    keyframesRef.current.set(name, keyframes);
  }, []);

  const applyAnimation = useCallback((
    element: HTMLElement,
    animationName: string,
    duration: string = '1s',
    easing: string = 'ease',
    fillMode: string = 'forwards'
  ) => {
    element.style.animation = `${animationName} ${duration} ${easing} ${fillMode}`;
  }, []);

  const removeAnimation = useCallback((element: HTMLElement) => {
    element.style.animation = '';
  }, []);

  // Predefined common keyframes
  useEffect(() => {
    createKeyframes('fadeIn', '0% { opacity: 0; } 100% { opacity: 1; }');
    createKeyframes('fadeOut', '0% { opacity: 1; } 100% { opacity: 0; }');
    createKeyframes('slideInUp', '0% { transform: translateY(100%); } 100% { transform: translateY(0); }');
    createKeyframes('slideInDown', '0% { transform: translateY(-100%); } 100% { transform: translateY(0); }');
    createKeyframes('slideInLeft', '0% { transform: translateX(-100%); } 100% { transform: translateX(0); }');
    createKeyframes('slideInRight', '0% { transform: translateX(100%); } 100% { transform: translateX(0); }');
    createKeyframes('scaleIn', '0% { transform: scale(0); } 100% { transform: scale(1); }');
    createKeyframes('scaleOut', '0% { transform: scale(1); } 100% { transform: scale(0); }');
    createKeyframes('rotateIn', '0% { transform: rotate(-180deg) scale(0); } 100% { transform: rotate(0deg) scale(1); }');
    createKeyframes('bounce', '0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0, -30px, 0); } 70% { transform: translate3d(0, -15px, 0); } 90% { transform: translate3d(0,-4px,0); }');
    createKeyframes('pulse', '0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); }');
    createKeyframes('shake', '0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } 20%, 40%, 60%, 80% { transform: translateX(10px); }');
  }, [createKeyframes]);

  return {
    createKeyframes,
    applyAnimation,
    removeAnimation
  };
}

// Hook for scroll-triggered animations
export function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return { ref, isVisible };
}

// Hook for performance monitoring of animations
export function useAnimationPerformance() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    droppedFrames: 0,
    isLagging: false
  });

  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef(performance.now());
  const monitoringRef = useRef<number | null>(null);

  const startMonitoring = useCallback(() => {
    if (monitoringRef.current) return;

    const monitor = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTime.current;
      lastFrameTime.current = now;

      frameTimeRef.current.push(frameTime);
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }

      // Calculate metrics
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);
      const droppedFrames = frameTimeRef.current.filter(ft => ft > 20).length;
      const isLagging = fps < 30;

      setMetrics({
        fps,
        frameTime: avgFrameTime,
        droppedFrames,
        isLagging
      });

      monitoringRef.current = requestAnimationFrame(monitor);
    };

    monitoringRef.current = requestAnimationFrame(monitor);
  }, []);

  const stopMonitoring = useCallback(() => {
    if (monitoringRef.current) {
      cancelAnimationFrame(monitoringRef.current);
      monitoringRef.current = null;
    }
  }, []);

  useEffect(() => {
    startMonitoring();
    return stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    startMonitoring,
    stopMonitoring
  };
}

// Hook for animation sequences
export function useAnimationSequence() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const sequenceRef = useRef<Array<() => Promise<void>>>([]);

  const addStep = useCallback((animation: () => Promise<void>) => {
    sequenceRef.current.push(animation);
  }, []);

  const play = useCallback(async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setCurrentStep(0);

    for (let i = 0; i < sequenceRef.current.length; i++) {
      setCurrentStep(i);
      await sequenceRef.current[i]();
    }

    setIsPlaying(false);
    setCurrentStep(0);
  }, [isPlaying]);

  const clear = useCallback(() => {
    sequenceRef.current = [];
    setCurrentStep(0);
  }, []);

  return {
    addStep,
    play,
    clear,
    isPlaying,
    currentStep,
    totalSteps: sequenceRef.current.length
  };
}