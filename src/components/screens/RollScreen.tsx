import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RollButton } from '../roll/RollButton';
import { CardReveal } from '../roll/CardReveal';
import { AutoRollPanel } from '../roll/AutoRollPanel';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../../types/card';
import './RollScreen.css';

export const RollScreen: React.FC = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [revealedCard, setRevealedCard] = useState<Card | null>(null);
  const [showAutoRoll, setShowAutoRoll] = useState(false);
  const [autoRollActive, setAutoRollActive] = useState(false);
  const [hideRoll, setHideRoll] = useState(false);
  
  const { rollCard, coins, spendCoins } = useGameStore();

  const handleSingleRoll = useCallback(async () => {
    if (isRolling || coins < 100) return;
    
    setIsRolling(true);
    setRevealedCard(null);
    
    // Spend coins
    const success = await spendCoins(100);
    if (!success) {
      setIsRolling(false);
      return;
    }
    
    // Get animation duration based on hideRoll setting
    const animationDuration = hideRoll ? 250 : 2000;
    
    // Wait for suspense animation
    setTimeout(async () => {
      const card = await rollCard();
      setRevealedCard(card);
      setIsRolling(false);
      
      // Auto-hide card after reveal
      setTimeout(() => {
        if (!autoRollActive) {
          setRevealedCard(null);
        }
      }, 3000);
    }, animationDuration);
  }, [isRolling, coins, rollCard, spendCoins, hideRoll, autoRollActive]);

  const handleAutoRoll = useCallback(async (count: number) => {
    const totalCost = count * 100;
    if (coins < totalCost) return;
    
    setAutoRollActive(true);
    setShowAutoRoll(false);
    
    // Auto-roll logic would go here
    // For now, just do a single roll as example
    await handleSingleRoll();
    
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
              card={revealedCard as any}
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
