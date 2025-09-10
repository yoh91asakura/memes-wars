// useTransitions - React hook for managing game phase transitions
// Provides easy integration of TransitionAnimationService in React components

import { useState, useEffect, useCallback, useRef } from 'react';
import TransitionAnimationService, { GamePhase, TransitionConfig } from '../services/TransitionAnimationService';

export interface UseTransitionsReturn {
  currentPhase: GamePhase;
  isTransitioning: boolean;
  transitionTo: (phase: GamePhase, config?: Partial<TransitionConfig>) => Promise<void>;
  playGameCycle: () => Promise<void>;
  addOverlay: (type: 'flash' | 'fade' | 'gradient' | 'particles', duration?: number) => Promise<void>;
  createParticles: (element: HTMLElement, type: 'sparkles' | 'coins' | 'stars' | 'confetti') => void;
  reset: () => void;
}

export const useTransitions = (): UseTransitionsReturn => {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('idle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionServiceRef = useRef<TransitionAnimationService>();

  // Initialize transition service
  useEffect(() => {
    transitionServiceRef.current = new TransitionAnimationService();
    return () => {
      transitionServiceRef.current?.reset();
    };
  }, []);

  // Update state when transition service state changes
  useEffect(() => {
    const checkState = () => {
      if (transitionServiceRef.current) {
        setCurrentPhase(transitionServiceRef.current.getCurrentPhase());
        setIsTransitioning(transitionServiceRef.current.isInTransition());
      }
    };

    // Poll for state changes (could be optimized with events)
    const interval = setInterval(checkState, 100);
    return () => clearInterval(interval);
  }, []);

  const transitionTo = useCallback(async (phase: GamePhase, config?: Partial<TransitionConfig>) => {
    if (transitionServiceRef.current) {
      await transitionServiceRef.current.transitionTo(phase, config);
    }
  }, []);

  const playGameCycle = useCallback(async () => {
    if (transitionServiceRef.current) {
      await transitionServiceRef.current.playGameCycle();
    }
  }, []);

  const addOverlay = useCallback(async (type: 'flash' | 'fade' | 'gradient' | 'particles', duration?: number) => {
    if (transitionServiceRef.current) {
      await transitionServiceRef.current.addTransitionOverlay(type, duration);
    }
  }, []);

  const createParticles = useCallback((element: HTMLElement, type: 'sparkles' | 'coins' | 'stars' | 'confetti') => {
    if (transitionServiceRef.current) {
      transitionServiceRef.current.createParticleEffect(element, type);
    }
  }, []);

  const reset = useCallback(() => {
    if (transitionServiceRef.current) {
      transitionServiceRef.current.reset();
      setCurrentPhase('idle');
      setIsTransitioning(false);
    }
  }, []);

  return {
    currentPhase,
    isTransitioning,
    transitionTo,
    playGameCycle,
    addOverlay,
    createParticles,
    reset
  };
};

export default useTransitions;