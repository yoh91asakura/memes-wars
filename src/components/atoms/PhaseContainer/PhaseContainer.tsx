// PhaseContainer - Wrapper component for game phase transitions
// Provides animated container for different game phases

import React, { useEffect, useRef } from 'react';
import { GamePhase } from '../../../services/TransitionAnimationService';
import './PhaseContainer.css';

export interface PhaseContainerProps {
  phase: GamePhase;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  enableParticles?: boolean;
  particleType?: 'sparkles' | 'coins' | 'stars' | 'confetti';
  onPhaseEnter?: () => void;
  onPhaseExit?: () => void;
}

export const PhaseContainer: React.FC<PhaseContainerProps> = ({
  phase,
  children,
  isActive = false,
  className = '',
  enableParticles = false,
  particleType = 'sparkles',
  onPhaseEnter,
  onPhaseExit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef(isActive);

  // Handle phase transitions
  useEffect(() => {
    const wasActive = previousActiveRef.current;
    
    if (isActive && !wasActive) {
      // Phase becoming active
      onPhaseEnter?.();
      
      if (enableParticles && containerRef.current) {
        // Add particle effect when phase becomes active
        import('../../../services/TransitionAnimationService').then(({ default: TransitionService }) => {
          const service = new TransitionService();
          service.createParticleEffect(containerRef.current!, particleType);
        });
      }
    } else if (!isActive && wasActive) {
      // Phase becoming inactive
      onPhaseExit?.();
    }
    
    previousActiveRef.current = isActive;
  }, [isActive, enableParticles, particleType, onPhaseEnter, onPhaseExit]);

  // Add phase-specific animations on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add CSS class for phase-specific styling
    container.classList.add(`phase-${phase}`);

    return () => {
      container.classList.remove(`phase-${phase}`);
    };
  }, [phase]);

  return (
    <div
      ref={containerRef}
      className={`
        phase-container
        game-phase-container
        phase-${phase}
        ${isActive ? 'active' : 'inactive'}
        ${className}
      `}
      data-phase={phase}
      data-active={isActive}
    >
      {/* Phase indicator */}
      <div className="phase-indicator">
        <span className="phase-label">{phase.toUpperCase()}</span>
        <div className="phase-progress-bar">
          <div className={`phase-progress-fill ${isActive ? 'animated' : ''}`} />
        </div>
      </div>

      {/* Main content */}
      <div className="phase-content">
        {children}
      </div>

      {/* Background effects */}
      <div className="phase-background-effects">
        <div className="bg-gradient" />
        <div className="bg-pattern" />
        <div className="bg-glow" />
      </div>
    </div>
  );
};