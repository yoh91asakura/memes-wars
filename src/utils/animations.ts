// Animation Utilities - Helper functions for animations and visual effects

import { Position, Vector2D } from '../models/Combat';

export interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  delay?: number;
  repeat?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

export type EasingFunction = (t: number) => number;

// Easing Functions
export const Easing = {
  linear: (t: number): number => t,
  
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  easeInSine: (t: number): number => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t: number): number => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
  
  easeInExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  
  easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number): number => {
    if (t < (1 / 2.75)) {
      return (7.5625 * t * t);
    } else if (t < (2 / 2.75)) {
      return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
    } else if (t < (2.5 / 2.75)) {
      return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
    } else {
      return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
    }
  },
  easeInOutBounce: (t: number): number => t < 0.5 ? Easing.easeInBounce(t * 2) * 0.5 : Easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
  
  elastic: (amplitude: number = 1, period: number = 0.4) => (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const s = period / 4;
    return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / period));
  }
};

// Animation Classes
export class Tween {
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private pauseTime: number = 0;
  private elapsedPausedTime: number = 0;
  
  constructor(
    private from: Record<string, number>,
    private to: Record<string, number>,
    private config: AnimationConfig,
    private onUpdate: (values: Record<string, number>) => void,
    private onComplete?: () => void
  ) {}

  start(): void {
    this.startTime = performance.now();
    this.isPlaying = true;
    this.isPaused = false;
    this.elapsedPausedTime = 0;
    this.tick();
  }

  pause(): void {
    if (this.isPlaying && !this.isPaused) {
      this.isPaused = true;
      this.pauseTime = performance.now();
    }
  }

  resume(): void {
    if (this.isPaused) {
      this.elapsedPausedTime += performance.now() - this.pauseTime;
      this.isPaused = false;
      this.tick();
    }
  }

  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
  }

  private tick = (): void => {
    if (!this.isPlaying || this.isPaused) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime - this.elapsedPausedTime;
    const progress = Math.min(elapsed / this.config.duration, 1);
    const easedProgress = this.config.easing(progress);

    const currentValues: Record<string, number> = {};
    for (const key in this.from) {
      const fromValue = this.from[key];
      const toValue = this.to[key];
      currentValues[key] = fromValue + (toValue - fromValue) * easedProgress;
    }

    this.onUpdate(currentValues);

    if (progress < 1) {
      requestAnimationFrame(this.tick);
    } else {
      this.isPlaying = false;
      this.onComplete?.();
    }
  };
}

export class AnimationManager {
  private animations: Map<string, Tween> = new Map();

  createTween(
    id: string,
    from: Record<string, number>,
    to: Record<string, number>,
    config: AnimationConfig,
    onUpdate: (values: Record<string, number>) => void,
    onComplete?: () => void
  ): Tween {
    const tween = new Tween(from, to, config, onUpdate, onComplete);
    this.animations.set(id, tween);
    return tween;
  }

  startAnimation(id: string): void {
    const animation = this.animations.get(id);
    animation?.start();
  }

  pauseAnimation(id: string): void {
    const animation = this.animations.get(id);
    animation?.pause();
  }

  resumeAnimation(id: string): void {
    const animation = this.animations.get(id);
    animation?.resume();
  }

  stopAnimation(id: string): void {
    const animation = this.animations.get(id);
    animation?.stop();
    this.animations.delete(id);
  }

  stopAllAnimations(): void {
    for (const animation of this.animations.values()) {
      animation.stop();
    }
    this.animations.clear();
  }

  hasAnimation(id: string): boolean {
    return this.animations.has(id);
  }
}

// Specialized Animation Functions
export class ProjectileAnimations {
  static createTrailEffect(positions: Position[]): string {
    if (positions.length < 2) return '';

    const pathPoints = positions
      .map((pos, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${pos.x} ${pos.y}`;
      })
      .join(' ');

    return pathPoints;
  }

  static calculateTrajectory(
    start: Position,
    target: Position,
    velocity: number,
    gravity: number = 0
  ): Position[] {
    const distance = Math.sqrt(
      Math.pow(target.x - start.x, 2) + Math.pow(target.y - start.y, 2)
    );
    
    const time = distance / velocity;
    const steps = Math.ceil(time * 60); // 60 FPS
    const trajectory: Position[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = start.x + (target.x - start.x) * t;
      const y = start.y + (target.y - start.y) * t + 0.5 * gravity * t * t * time * time;
      
      trajectory.push({ x, y });
    }

    return trajectory;
  }

  static calculateBounceTrajectory(
    position: Position,
    velocity: Vector2D,
    bounds: { width: number; height: number },
    bounceCount: number = 3,
    damping: number = 0.8
  ): Position[] {
    const trajectory: Position[] = [{ ...position }];
    let currentPos = { ...position };
    let currentVel = { ...velocity };
    
    const timeStep = 1 / 60; // 60 FPS
    const maxSteps = bounceCount * 120; // Max 2 seconds per bounce

    for (let step = 0; step < maxSteps; step++) {
      // Update position
      currentPos.x += currentVel.x * timeStep;
      currentPos.y += currentVel.y * timeStep;

      // Check bounds and bounce
      if (currentPos.x <= 0 || currentPos.x >= bounds.width) {
        currentVel.x *= -damping;
        currentPos.x = Math.max(0, Math.min(bounds.width, currentPos.x));
        bounceCount--;
      }
      
      if (currentPos.y <= 0 || currentPos.y >= bounds.height) {
        currentVel.y *= -damping;
        currentPos.y = Math.max(0, Math.min(bounds.height, currentPos.y));
        bounceCount--;
      }

      trajectory.push({ ...currentPos });

      if (bounceCount <= 0) break;
    }

    return trajectory;
  }
}

export class UIAnimations {
  static slideIn(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down' = 'left',
    duration: number = 300
  ): Promise<void> {
    return new Promise((resolve) => {
      const transforms = {
        left: 'translateX(-100%)',
        right: 'translateX(100%)',
        up: 'translateY(-100%)',
        down: 'translateY(100%)'
      };

      element.style.transform = transforms[direction];
      element.style.opacity = '0';
      element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;

      requestAnimationFrame(() => {
        element.style.transform = 'translate(0, 0)';
        element.style.opacity = '1';
      });

      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  static fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease-in-out`;

      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });

      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  static scaleIn(element: HTMLElement, duration: number = 200): Promise<void> {
    return new Promise((resolve) => {
      element.style.transform = 'scale(0.8)';
      element.style.opacity = '0';
      element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;

      requestAnimationFrame(() => {
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
      });

      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  static shake(element: HTMLElement, intensity: number = 10, duration: number = 600): Promise<void> {
    return new Promise((resolve) => {
      const originalTransform = element.style.transform;
      const startTime = performance.now();

      const shakeAnimation = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          const shakeX = (Math.random() - 0.5) * intensity * (1 - progress);
          const shakeY = (Math.random() - 0.5) * intensity * (1 - progress);
          element.style.transform = `${originalTransform} translate(${shakeX}px, ${shakeY}px)`;
          requestAnimationFrame(shakeAnimation);
        } else {
          element.style.transform = originalTransform;
          resolve();
        }
      };

      requestAnimationFrame(shakeAnimation);
    });
  }

  static pulse(element: HTMLElement, scale: number = 1.1, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      element.style.animation = `pulse ${duration}ms ease-in-out`;
      
      const keyframes = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(${scale}); }
          100% { transform: scale(1); }
        }
      `;

      if (!document.head.querySelector('#pulse-keyframes')) {
        const style = document.createElement('style');
        style.id = 'pulse-keyframes';
        style.textContent = keyframes;
        document.head.appendChild(style);
      }

      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 100;

  constructor(maxParticles: number = 100) {
    this.maxParticles = maxParticles;
  }

  createExplosion(position: Position, particleCount: number = 20): void {
    for (let i = 0; i < particleCount && this.particles.length < this.maxParticles; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 100 + Math.random() * 100;
      
      this.particles.push({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity
        },
        life: 1.0,
        lifeDecay: 0.02,
        size: 2 + Math.random() * 4,
        color: `hsl(${Math.random() * 60 + 10}, 70%, 50%)`, // Orange to red
        gravity: 200
      });
    }
  }

  createTrail(position: Position, velocity: Vector2D): void {
    if (this.particles.length >= this.maxParticles) return;

    this.particles.push({
      position: { ...position },
      velocity: {
        x: velocity.x * -0.1 + (Math.random() - 0.5) * 20,
        y: velocity.y * -0.1 + (Math.random() - 0.5) * 20
      },
      life: 1.0,
      lifeDecay: 0.05,
      size: 1 + Math.random() * 2,
      color: `hsla(${Math.random() * 360}, 50%, 70%, ${Math.random() * 0.5 + 0.5})`,
      gravity: 50
    });
  }

  update(deltaTime: number): void {
    this.particles = this.particles.filter(particle => {
      // Update physics
      particle.velocity.y += particle.gravity * deltaTime;
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;

      // Update life
      particle.life -= particle.lifeDecay;

      return particle.life > 0;
    });
  }

  render(context: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      context.save();
      context.globalAlpha = particle.life;
      context.fillStyle = particle.color;
      
      context.beginPath();
      context.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      context.fill();
      
      context.restore();
    }
  }

  clear(): void {
    this.particles = [];
  }

  getParticleCount(): number {
    return this.particles.length;
  }
}

interface Particle {
  position: Position;
  velocity: Vector2D;
  life: number;
  lifeDecay: number;
  size: number;
  color: string;
  gravity: number;
}

// Utility Functions
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function lerpPosition(start: Position, end: Position, t: number): Position {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t)
  };
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function calculateBezierPoint(
  p0: Position,
  p1: Position,
  p2: Position,
  p3: Position,
  t: number
): Position {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
  };
}

export function createSpringAnimation(
  stiffness: number = 100,
  damping: number = 10,
  mass: number = 1
): EasingFunction {
  return (t: number): number => {
    const omega = Math.sqrt(stiffness / mass);
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
    
    if (dampingRatio < 1) {
      const dampedOmega = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
      return 1 - Math.exp(-dampingRatio * omega * t) * Math.cos(dampedOmega * t);
    } else if (dampingRatio === 1) {
      return 1 - Math.exp(-omega * t) * (1 + omega * t);
    } else {
      const r1 = -omega * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
      const r2 = -omega * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1));
      const c1 = 1;
      const c2 = -1;
      return 1 + c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
    }
  };
}

// Global Animation Manager Instance
export const globalAnimationManager = new AnimationManager();