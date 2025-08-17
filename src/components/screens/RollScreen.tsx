import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RollButton } from '../roll/RollButton';
import { CardReveal } from '../roll/CardReveal';
import { AutoRollPanel } from '../roll/AutoRollPanel';
import { useGameStore } from '../../stores/gameStore';
import { useRollStore } from '../../stores/rollStore';
import { Card } from '../../types/card';
import { Card as ComplexCard, Rarity, TrajectoryPattern } from '../../models/Card';
import './RollScreen.css';

// Helper function to convert simple Card to complex Card for reveal
const convertToComplexCard = (simpleCard: Card): ComplexCard => {
  return {
    id: simpleCard.id,
    name: simpleCard.name,
    description: simpleCard.description || simpleCard.flavor || '',
    rarity: simpleCard.rarity.toUpperCase() as Rarity,
    emojis: [{
      character: simpleCard.emoji,
      damage: simpleCard.attack || 1,
      speed: 300,
      trajectory: TrajectoryPattern.STRAIGHT
    }],
    hp: simpleCard.defense || 10,
    attackSpeed: 1.0,
    passive: {
      id: 'basic',
      name: 'Basic',
      description: simpleCard.ability || 'No special effect',
      triggerChance: 0.1,
      effect: () => {}
    },
    stackLevel: 1,
    experience: 0,
    borderColor: getRarityColor(simpleCard.rarity),
    glowIntensity: 1
  };
};

const getRarityColor = (rarity: string): string => {
  const colors = {
    'common': '#ffffff',
    'uncommon': '#1eff00',
    'rare': '#0070f3',
    'epic': '#8b5cf6',
    'legendary': '#f97316',
    'mythic': '#ffd700',
    'cosmic': '#ff00ff'
  };
  return colors[rarity as keyof typeof colors] || '#ffffff';
};

export const RollScreen: React.FC = () => {
  const [revealedCard, setRevealedCard] = useState<Card | null>(null);
  const [showAutoRoll, setShowAutoRoll] = useState(false);
  const [autoRollActive, setAutoRollActive] = useState(false);
  const [hideRoll, setHideRoll] = useState(false);
  
  const { coins, spendCoins, addToCollection } = useGameStore();
  const { performSingleRoll, isRolling, completeRollAnimation } = useRollStore();

  const handleSingleRoll = useCallback(async () => {
    if (isRolling || coins < 100) return;
    
    setRevealedCard(null);
    
    try {
      // Spend coins first
      const success = await spendCoins(100);
      if (!success) {
        return;
      }
      
      // Perform roll using RollService
      const rollResult = await performSingleRoll();
      
      // Get animation duration based on hideRoll setting
      const animationDuration = hideRoll ? 250 : 2000;
      
      // Wait for suspense animation
      setTimeout(() => {
        setRevealedCard(rollResult.card);
        
        // Add to collection
        addToCollection(rollResult.card);
        
        // Complete roll animation
        completeRollAnimation();
        
        // Auto-hide card after reveal
        setTimeout(() => {
          if (!autoRollActive) {
            setRevealedCard(null);
          }
        }, 3000);
      }, animationDuration);
      
    } catch (error) {
      console.error('Roll failed:', error);
      completeRollAnimation();
    }
  }, [isRolling, coins, performSingleRoll, spendCoins, addToCollection, completeRollAnimation, hideRoll, autoRollActive]);

  const handleAutoRoll = useCallback(async (count: number) => {
    const totalCost = count * 100;
    if (coins < totalCost) return;
    
    setAutoRollActive(true);
    setShowAutoRoll(false);
    
    // For now, just do single rolls in sequence
    // TODO: Implement proper 10x and 100x roll logic
    for (let i = 0; i < count; i++) {
      await handleSingleRoll();
      // Small delay between rolls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setAutoRollActive(false);
  }, [coins, handleSingleRoll]);

  const toggleAutoRollPanel = () => {
    setShowAutoRoll(!showAutoRoll);
  };

  return (
    <div className="roll-screen">
      {/* Background gradient based on last card rarity */}
      <div className={`background-gradient ${revealedCard?.rarity.toLowerCase() || ''}`} />
      
      {/* Coin counter (subtle, top-right) */}
      <motion.div 
        className="coin-counter"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="coin-emoji">🪙</span>
        <span className="coin-amount">{coins.toLocaleString()}</span>
      </motion.div>
      
      {/* Main Roll Button - Center of screen */}
      <div className="roll-container">
        <AnimatePresence>
          {!revealedCard && !isRolling && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <RollButton 
                onClick={handleSingleRoll}
                disabled={coins < 100 || isRolling}
                cost={100}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Rolling animation */}
        <AnimatePresence>
          {isRolling && (
            <motion.div 
              className="rolling-animation"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <motion.div 
                className="card-back"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: hideRoll ? 0.25 : 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="card-mystery">
                  <span className="mystery-emoji">❓</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Card Reveal */}
        <AnimatePresence>
          {revealedCard && !isRolling && (
            <CardReveal 
              card={convertToComplexCard(revealedCard)}
              onClose={() => setRevealedCard(null)}
              hideRoll={hideRoll}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Auto-Roll Toggle (bottom) */}
      <motion.button
        className="auto-roll-toggle"
        onClick={toggleAutoRollPanel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="auto-icon">🎰</span> Auto Roll
      </motion.button>
      
      {/* Auto-Roll Panel */}
      <AnimatePresence>
        {showAutoRoll && (
          <AutoRollPanel
            onAutoRoll={handleAutoRoll}
            onClose={() => setShowAutoRoll(false)}
            hideRoll={hideRoll}
            onHideRollToggle={() => setHideRoll(!hideRoll)}
            coins={coins}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
