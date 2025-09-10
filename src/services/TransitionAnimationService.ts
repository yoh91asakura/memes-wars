// TransitionAnimationService - Manages smooth transitions between game phases
// Provides orchestrated animations for Roll→Equip→Battle→Reward cycle

export type GamePhase = 'roll' | 'equip' | 'battle' | 'reward' | 'idle';
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'spin' | 'bounce';

export interface TransitionConfig {
  duration: number;
  easing: string;
  delay?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

export interface PhaseTransitionDefinition {
  from: GamePhase;
  to: GamePhase;
  type: TransitionType;
  config: TransitionConfig;
  sounds?: string[];
  effects?: string[];
}

export class TransitionAnimationService {
  private currentPhase: GamePhase = 'idle';
  private isTransitioning = false;
  private transitionQueue: (() => Promise<void>)[] = [];
  
  // Default transition configurations
  private static readonly DEFAULT_TRANSITIONS: Record<string, PhaseTransitionDefinition> = {
    'roll-to-equip': {
      from: 'roll',
      to: 'equip',
      type: 'slide',
      config: {
        duration: 800,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        delay: 500,
      },
      sounds: ['transition_swoosh', 'cards_shuffle'],
      effects: ['particle_burst', 'glow_fade']
    },
    'equip-to-battle': {
      from: 'equip',
      to: 'battle',
      type: 'zoom',
      config: {
        duration: 1200,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        delay: 300,
      },
      sounds: ['battle_horn', 'energy_charge'],
      effects: ['screen_flash', 'battle_ready']
    },
    'battle-to-reward': {
      from: 'battle',
      to: 'reward',
      type: 'bounce',
      config: {
        duration: 1000,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        delay: 800,
      },
      sounds: ['victory_fanfare', 'coins_drop'],
      effects: ['confetti', 'golden_shower']
    },
    'reward-to-roll': {
      from: 'reward',
      to: 'roll',
      type: 'fade',
      config: {
        duration: 600,
        easing: 'ease-in-out',
        delay: 2000,
      },
      sounds: ['page_turn'],
      effects: ['fade_overlay']
    }
  };

  /**
   * Execute transition between game phases
   */
  public async transitionTo(targetPhase: GamePhase, customConfig?: Partial<TransitionConfig>): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Transition already in progress, queueing request');
      return new Promise((resolve) => {
        this.transitionQueue.push(async () => {
          await this.transitionTo(targetPhase, customConfig);
          resolve();
        });
      });
    }

    if (this.currentPhase === targetPhase) {
      console.log('Already in target phase:', targetPhase);
      return;
    }

    const transitionKey = `${this.currentPhase}-to-${targetPhase}`;
    const transitionDef = TransitionAnimationService.DEFAULT_TRANSITIONS[transitionKey];

    if (!transitionDef) {
      console.warn(`No transition defined for ${transitionKey}, using instant transition`);
      this.currentPhase = targetPhase;
      return;
    }

    this.isTransitioning = true;

    try {
      const config = { ...transitionDef.config, ...customConfig };
      
      console.log(`Starting transition: ${this.currentPhase} → ${targetPhase}`);
      
      // Trigger start callback
      config.onStart?.();

      // Apply initial animation state
      await this.applyTransitionStyles(transitionDef.type, 'start', config);

      // Add delay if specified
      if (config.delay) {
        await this.delay(config.delay);
      }

      // Execute main transition
      await this.executeTransition(transitionDef.type, config);

      // Update current phase
      this.currentPhase = targetPhase;

      // Trigger completion callback
      config.onComplete?.();

      console.log(`Transition completed: ${targetPhase}`);

    } catch (error) {
      console.error('Transition failed:', error);
    } finally {
      this.isTransitioning = false;
      
      // Process queued transitions
      if (this.transitionQueue.length > 0) {
        const nextTransition = this.transitionQueue.shift();
        nextTransition?.();
      }
    }
  }

  /**
   * Execute the complete game cycle with smooth transitions
   */
  public async playGameCycle(): Promise<void> {
    console.log('Starting complete game cycle animation');
    
    await this.transitionTo('roll');
    await this.delay(2000); // Time for roll animation
    
    await this.transitionTo('equip');
    await this.delay(1500); // Time for deck selection
    
    await this.transitionTo('battle');
    await this.delay(3000); // Time for combat
    
    await this.transitionTo('reward');
    await this.delay(2500); // Time to show rewards
    
    console.log('Game cycle completed');
  }

  /**
   * Apply CSS transition styles based on transition type
   */
  private async applyTransitionStyles(type: TransitionType, stage: 'start' | 'end', config: TransitionConfig): Promise<void> {
    const elements = document.querySelectorAll('.game-phase-container');
    
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      switch (type) {
        case 'fade':
          if (stage === 'start') {
            htmlElement.style.opacity = '0';
            htmlElement.style.transition = `opacity ${config.duration}ms ${config.easing}`;
          } else {
            htmlElement.style.opacity = '1';
          }
          break;

        case 'slide':
          if (stage === 'start') {
            htmlElement.style.transform = 'translateX(-100%)';
            htmlElement.style.transition = `transform ${config.duration}ms ${config.easing}`;
          } else {
            htmlElement.style.transform = 'translateX(0)';
          }
          break;

        case 'zoom':
          if (stage === 'start') {
            htmlElement.style.transform = 'scale(0.3)';
            htmlElement.style.opacity = '0';
            htmlElement.style.transition = `transform ${config.duration}ms ${config.easing}, opacity ${config.duration * 0.6}ms ${config.easing}`;
          } else {
            htmlElement.style.transform = 'scale(1)';
            htmlElement.style.opacity = '1';
          }
          break;

        case 'spin':
          if (stage === 'start') {
            htmlElement.style.transform = 'rotate(-180deg) scale(0.5)';
            htmlElement.style.opacity = '0';
            htmlElement.style.transition = `transform ${config.duration}ms ${config.easing}, opacity ${config.duration * 0.7}ms ${config.easing}`;
          } else {
            htmlElement.style.transform = 'rotate(0deg) scale(1)';
            htmlElement.style.opacity = '1';
          }
          break;

        case 'bounce':
          if (stage === 'start') {
            htmlElement.style.transform = 'translateY(-50px) scale(0.8)';
            htmlElement.style.opacity = '0';
            htmlElement.style.transition = `transform ${config.duration}ms ${config.easing}, opacity ${config.duration * 0.5}ms ease-in`;
          } else {
            htmlElement.style.transform = 'translateY(0) scale(1)';
            htmlElement.style.opacity = '1';
          }
          break;
      }
    });

    // Force reflow
    document.body.offsetHeight;
  }

  /**
   * Execute transition animation
   */
  private async executeTransition(type: TransitionType, config: TransitionConfig): Promise<void> {
    return new Promise((resolve) => {
      // Apply end state
      this.applyTransitionStyles(type, 'end', config);

      // Wait for animation to complete
      setTimeout(() => {
        // Clean up inline styles
        const elements = document.querySelectorAll('.game-phase-container');
        elements.forEach(element => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.transition = '';
          htmlElement.style.transform = '';
          htmlElement.style.opacity = '';
        });
        
        resolve();
      }, config.duration);
    });
  }

  /**
   * Add screen overlay effects during transitions
   */
  public addTransitionOverlay(type: 'flash' | 'fade' | 'gradient' | 'particles', duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = `transition-overlay transition-${type}`;
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity ${duration}ms ease-in-out;
      `;

      switch (type) {
        case 'flash':
          overlay.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)';
          break;
        case 'fade':
          overlay.style.background = 'rgba(0,0,0,0.7)';
          break;
        case 'gradient':
          overlay.style.background = 'linear-gradient(45deg, rgba(100,181,246,0.3) 0%, rgba(156,39,176,0.3) 100%)';
          break;
        case 'particles':
          overlay.style.background = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'stars\' x=\'0\' y=\'0\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'><circle cx=\'10\' cy=\'10\' r=\'1\' fill=\'%23fff\' opacity=\'0.3\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23stars)\'/></svg>")';
          break;
      }

      document.body.appendChild(overlay);

      // Fade in
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });

      // Fade out and remove
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(overlay);
          resolve();
        }, duration);
      }, duration);
    });
  }

  /**
   * Create particle effect during phase transitions
   */
  public createParticleEffect(element: HTMLElement, type: 'sparkles' | 'coins' | 'stars' | 'confetti'): void {
    const particleContainer = document.createElement('div');
    particleContainer.className = `particles-${type}`;
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 1000;
    `;

    const particleCount = type === 'confetti' ? 50 : 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = `particle particle-${type}`;
      
      // Position and animation properties
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 10 + 5;
      const duration = Math.random() * 2000 + 1000;
      const delay = Math.random() * 500;

      particle.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        opacity: 0;
        animation: particle-${type} ${duration}ms ease-out ${delay}ms forwards;
      `;

      // Particle appearance based on type
      switch (type) {
        case 'sparkles':
          particle.style.background = 'radial-gradient(circle, #fff 30%, transparent 70%)';
          particle.style.borderRadius = '50%';
          break;
        case 'coins':
          particle.style.background = 'linear-gradient(45deg, #ffd700, #ffed4a)';
          particle.style.borderRadius = '50%';
          particle.style.border = '2px solid #b8860b';
          break;
        case 'stars':
          particle.innerHTML = '★';
          particle.style.color = '#fff';
          particle.style.fontSize = `${size}px`;
          particle.style.textShadow = '0 0 10px rgba(255,255,255,0.8)';
          break;
        case 'confetti':
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
          particle.style.background = colors[Math.floor(Math.random() * colors.length)];
          particle.style.transform = `rotate(${Math.random() * 360}deg)`;
          break;
      }

      particleContainer.appendChild(particle);
    }

    element.style.position = 'relative';
    element.appendChild(particleContainer);

    // Remove after animation
    setTimeout(() => {
      if (particleContainer.parentNode) {
        particleContainer.parentNode.removeChild(particleContainer);
      }
    }, 3000);
  }

  /**
   * Get current game phase
   */
  public getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  /**
   * Check if transition is in progress
   */
  public isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset to idle state
   */
  public reset(): void {
    this.currentPhase = 'idle';
    this.isTransitioning = false;
    this.transitionQueue = [];
  }

  /**
   * Add CSS keyframes for particle animations
   */
  public static injectParticleAnimations(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes particle-sparkles {
        0% { opacity: 0; transform: scale(0) translateY(0); }
        50% { opacity: 1; transform: scale(1) translateY(-20px); }
        100% { opacity: 0; transform: scale(0.5) translateY(-40px); }
      }
      
      @keyframes particle-coins {
        0% { opacity: 0; transform: scale(0) translateY(0) rotateY(0deg); }
        20% { opacity: 1; transform: scale(1) translateY(-10px) rotateY(180deg); }
        100% { opacity: 0; transform: scale(0.8) translateY(-50px) rotateY(360deg); }
      }
      
      @keyframes particle-stars {
        0% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
        100% { opacity: 0; transform: scale(1.2) rotate(360deg); }
      }
      
      @keyframes particle-confetti {
        0% { opacity: 1; transform: translateY(0) rotate(0deg); }
        100% { opacity: 0; transform: translateY(100px) rotate(720deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize particle animations on module load
if (typeof document !== 'undefined') {
  TransitionAnimationService.injectParticleAnimations();
}

export default TransitionAnimationService;