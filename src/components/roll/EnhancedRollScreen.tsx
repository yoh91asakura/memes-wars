import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRollStore } from '../../stores/rollStore';
import { useGameStore } from '../../stores/gameStore';
import { RollResult } from '../../services/RollService';
import { Card } from '../../types/card';
import rollConfig from '../../../config/game/roll.config.json';
import './EnhancedRollScreen.css';

interface EnhancedRollScreenProps {
  onClose?: () => void;
}

export const EnhancedRollScreen: React.FC<EnhancedRollScreenProps> = ({ onClose }) => {
  const [showResult, setShowResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'rolling' | 'revealing' | 'complete'>('idle');
  const [currentlyShowing, setCurrentlyShowing] = useState<RollResult | null>(null);
  const [queuedResults, setQueuedResults] = useState<RollResult[]>([]);
  
  const {
    performSingleRoll,
    performTenRoll,
    isRolling,
    currentRoll,
    animationQueue,
    completeRollAnimation,
    skipAnimation,
    canAffordRoll,
    getRollCost,
    getPityProgress,
    stats,
    history
  } = useRollStore();

  const { coins, spendCoins, addToCollection } = useGameStore();

  // Handle roll animation queue
  useEffect(() => {
    if (animationQueue.length > 0 && !isRolling) {
      setQueuedResults(animationQueue);
      playNextAnimation();
    }
  }, [animationQueue]);

  const playNextAnimation = useCallback(() => {
    if (queuedResults.length > 0) {
      const [nextResult, ...remaining] = queuedResults;
      setCurrentlyShowing(nextResult);
      setQueuedResults(remaining);
      setAnimationPhase('revealing');
      
      const duration = rollConfig.animations.rollDuration[nextResult.card.rarity as keyof typeof rollConfig.animations.rollDuration];
      
      setTimeout(() => {
        if (remaining.length > 0) {
          playNextAnimation();
        } else {
          setAnimationPhase('complete');
        }
      }, duration);
    }
  }, [queuedResults]);

  const handleSingleRoll = async () => {
    if (!canAffordRoll('single', coins)) return;
    
    setAnimationPhase('rolling');
    try {
      await spendCoins(getRollCost('single'));
      const result = await performSingleRoll();
      
      setCurrentlyShowing(result);
      addToCollection(result.card);
      
      setTimeout(() => {
        setAnimationPhase('revealing');
        setShowResult(true);
      }, 1000);
      
    } catch (error) {
      console.error('Roll failed:', error);
      setAnimationPhase('idle');
    }
  };

  const handleTenRoll = async () => {
    if (!canAffordRoll('ten', coins)) return;
    
    setAnimationPhase('rolling');
    try {
      await spendCoins(getRollCost('ten'));
      const result = await performTenRoll();
      
      // Add all cards to collection
      result.cards.forEach(rollResult => addToCollection(rollResult.card));
      
      // Start animation sequence
      setQueuedResults(result.cards);
      playNextAnimation();
      
    } catch (error) {
      console.error('Ten roll failed:', error);
      setAnimationPhase('idle');
    }
  };

  const handleSkipAnimation = () => {
    skipAnimation();
    setAnimationPhase('idle');
    setShowResult(false);
    setCurrentlyShowing(null);
    setQueuedResults([]);
  };

  const getRarityColor = (rarity: string): string => {
    const colors = {
      common: '#9E9E9E',
      uncommon: '#4CAF50', 
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800',
      mythic: '#FFD700',
      cosmic: 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b, #fb5607)'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityEffects = (rarity: string) => {
    return rollConfig.animations.effects[rarity as keyof typeof rollConfig.animations.effects] || [];
  };

  const pityProgress = getPityProgress();

  return (
    <div className="enhanced-roll-screen">
      <div className="roll-header">
        <div className="currency-display">
          <span className="coins">💰 {coins.toLocaleString()}</span>
        </div>
        
        <div className="pity-tracker">
          <h3>Pity Progress</h3>
          <div className="pity-bars">
            {Object.entries(pityProgress).map(([rarity, progress]) => (
              <div key={rarity} className="pity-bar">
                <span className="pity-label">{rarity.toUpperCase()}</span>
                <div className="pity-progress">
                  <div 
                    className="pity-fill"
                    style={{ 
                      width: `${Math.min(progress.percentage, 100)}%`,
                      backgroundColor: getRarityColor(rarity)
                    }}
                  />
                  <span className="pity-text">
                    {progress.current}/{progress.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {onClose && (
          <button className="close-button" onClick={onClose}>✕</button>
        )}
      </div>

      <div className="roll-area">
        <AnimatePresence mode="wait">
          {animationPhase === 'idle' && (
            <motion.div
              className="roll-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.button
                className="roll-button single"
                onClick={handleSingleRoll}
                disabled={!canAffordRoll('single', coins)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="button-content">
                  <span className="button-title">Single Roll</span>
                  <span className="button-cost">💰 {getRollCost('single').toLocaleString()}</span>
                </div>
              </motion.button>

              <motion.button
                className="roll-button ten"
                onClick={handleTenRoll}
                disabled={!canAffordRoll('ten', coins)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="button-content">
                  <span className="button-title">10x Roll</span>
                  <span className="button-cost">💰 {getRollCost('ten').toLocaleString()}</span>
                  <span className="button-bonus">Guaranteed Rare+</span>
                </div>
              </motion.button>
            </motion.div>
          )}

          {animationPhase === 'rolling' && (
            <motion.div
              className="rolling-animation"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <div className="rolling-orb">
                <motion.div
                  className="orb-inner"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                >
                  ✨
                </motion.div>
              </div>
              <p className="rolling-text">Rolling...</p>
            </motion.div>
          )}

          {(animationPhase === 'revealing' || animationPhase === 'complete') && currentlyShowing && (
            <motion.div
              className="card-reveal"
              initial={{ opacity: 0, rotateY: 180, scale: 0.5 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -180, scale: 0.5 }}
            >
              <CardRevealComponent 
                result={currentlyShowing}
                onAnimationComplete={() => {
                  if (queuedResults.length === 0) {
                    setAnimationPhase('complete');
                  }
                }}
              />
              
              {animationPhase === 'complete' && (
                <motion.button
                  className="continue-button"
                  onClick={handleSkipAnimation}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  delay={0.5}
                >
                  Continue
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="roll-stats">
        <div className="stats-section">
          <h3>Roll Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Rolls</span>
              <span className="stat-value">{stats.totalRolls}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Collection</span>
              <span className="stat-value">
                {Object.values(stats.collectedByRarity).reduce((sum, count) => sum + count, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="rarity-distribution">
          <h3>Collection by Rarity</h3>
          <div className="rarity-bars">
            {Object.entries(stats.collectedByRarity).map(([rarity, count]) => (
              <div key={rarity} className="rarity-stat">
                <span className="rarity-name">{rarity.toUpperCase()}</span>
                <span className="rarity-count" style={{ color: getRarityColor(rarity) }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-history">
        <h3>Recent Rolls</h3>
        <div className="history-list">
          {history.slice(0, 5).map((entry) => (
            <div key={entry.id} className="history-item">
              <span className="history-type">{entry.type.toUpperCase()}</span>
              <span className="history-time">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              <div className="history-cards">
                {entry.cards.slice(0, 3).map((result, index) => (
                  <span 
                    key={index}
                    className="history-emoji"
                    style={{ color: getRarityColor(result.card.rarity) }}
                  >
                    {result.card.emoji}
                  </span>
                ))}
                {entry.cards.length > 3 && (
                  <span className="history-more">+{entry.cards.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CardRevealComponentProps {
  result: RollResult;
  onAnimationComplete: () => void;
}

const CardRevealComponent: React.FC<CardRevealComponentProps> = ({ result, onAnimationComplete }) => {
  const { card, isGuaranteed, pityTriggered } = result;
  const effects = getRarityEffects(card.rarity);

  useEffect(() => {
    const timer = setTimeout(onAnimationComplete, 3000);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const getRarityEffects = (rarity: string) => {
    return rollConfig.animations.effects[rarity as keyof typeof rollConfig.animations.effects] || [];
  };

  return (
    <motion.div 
      className={`card-reveal-container rarity-${card.rarity}`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {effects.includes('screen_flash') && (
        <motion.div
          className="screen-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.3 }}
        />
      )}

      <div className="card-display">
        <div className="card-emoji-large">
          {card.emoji}
        </div>
        
        <div className="card-info">
          <h2 className="card-name">{card.name}</h2>
          <div className="card-rarity" style={{ color: getRarityColor(card.rarity) }}>
            {card.rarity.toUpperCase()}
          </div>
          <div className="card-stats">
            <span>⚔️ {card.attack}</span>
            <span>🛡️ {card.defense}</span>
            <span>💰 {card.cost}</span>
          </div>
        </div>

        {(isGuaranteed || pityTriggered) && (
          <motion.div
            className="guarantee-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {pityTriggered ? "PITY ACTIVATED!" : "GUARANTEED!"}
          </motion.div>
        )}
      </div>

      {effects.includes('particles_10') && <ParticleEffect count={10} />}
      {effects.includes('particles_20') && <ParticleEffect count={20} />}
      {effects.includes('particles_30') && <ParticleEffect count={30} />}
      {effects.includes('particles_50') && <ParticleEffect count={50} />}
      {effects.includes('particles_100') && <ParticleEffect count={100} />}
      {effects.includes('particles_200') && <ParticleEffect count={200} />}
    </motion.div>
  );
};

interface ParticleEffectProps {
  count: number;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ count }) => {
  const particles = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="particle-container">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="particle"
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            opacity: 0,
            scale: 0
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            ease: "easeOut"
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

function getRarityColor(rarity: string): string {
  const colors = {
    common: '#9E9E9E',
    uncommon: '#4CAF50', 
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
    mythic: '#FFD700',
    cosmic: '#ff006e'
  };
  return colors[rarity as keyof typeof colors] || colors.common;
}