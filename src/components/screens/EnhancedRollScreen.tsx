import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useRollStore } from '../../stores/rollStore';
import { Card } from '../../types/card';
import { RollResult, RollStats, MultiRollResult } from '../../services/RollService';
import './EnhancedRollScreen.css';

// Particle System Component
const ParticleEffect: React.FC<{ rarity: string; count?: number }> = ({ rarity, count = 50 }) => {
  const particles = Array.from({ length: count }, (_, i) => i);
  
  const getParticleColor = () => {
    const colors = {
      'common': '#cccccc',
      'uncommon': '#1eff00',
      'rare': '#0070f3',
      'epic': '#8b5cf6',
      'legendary': '#f97316',
      'mythic': '#ffd700',
      'cosmic': '#ff00ff'
    };
    return colors[rarity as keyof typeof colors] || '#ffffff';
  };

  return (
    <div className="particle-container">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            background: getParticleColor(),
            boxShadow: `0 0 10px ${getParticleColor()}`
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: Math.random() * 0.5 + 0.5,
            opacity: 1 
          }}
          animate={{ 
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            scale: 0,
            opacity: 0
          }}
          transition={{ 
            duration: Math.random() * 2 + 1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Pity Tracker Component
const PityTracker: React.FC<{ stats: RollStats }> = ({ stats }) => {
  const pityData = [
    { rarity: 'Rare', current: stats.rollsSinceRare, max: 10, color: '#0070f3' },
    { rarity: 'Epic', current: stats.rollsSinceEpic, max: 30, color: '#8b5cf6' },
    { rarity: 'Legendary', current: stats.rollsSinceLegendary, max: 90, color: '#f97316' },
    { rarity: 'Mythic', current: stats.rollsSinceMythic, max: 200, color: '#ffd700' },
    { rarity: 'Cosmic', current: stats.rollsSinceCosmic, max: 1000, color: '#ff00ff' }
  ];

  return (
    <motion.div 
      className="pity-tracker"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3>Pity System</h3>
      {pityData.map((pity) => (
        <div key={pity.rarity} className="pity-item">
          <div className="pity-label">
            <span className="rarity-name">{pity.rarity}</span>
            <span className="pity-count">{pity.current}/{pity.max}</span>
          </div>
          <div className="pity-bar">
            <motion.div 
              className="pity-fill"
              style={{ backgroundColor: pity.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((pity.current / pity.max) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {pity.current >= pity.max * 0.8 && (
              <motion.div 
                className="pity-glow"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// Roll History Component
interface RollHistoryItem {
  id: string;
  card: Card;
  timestamp: Date;
  pityTriggered: boolean;
  isGuaranteed: boolean;
}

const RollHistory: React.FC<{ history: RollHistoryItem[] }> = ({ history }) => {
  return (
    <motion.div 
      className="roll-history"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3>Recent Rolls</h3>
      <div className="history-list">
        <AnimatePresence>
          {history.slice(0, 10).map((item, index) => (
            <motion.div
              key={item.id}
              className={`history-item rarity-${item.card.rarity}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="card-emoji">{item.card.emoji}</span>
              <div className="card-info">
                <span className="card-name">{item.card.name}</span>
                <span className="card-rarity">{item.card.rarity}</span>
              </div>
              {item.pityTriggered && <span className="pity-badge">PITY</span>}
              {item.isGuaranteed && <span className="guaranteed-badge">G</span>}
              <span className="timestamp">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Enhanced Card Reveal with Rarity Animations
const EnhancedCardReveal: React.FC<{ 
  card: Card; 
  onClose: () => void;
  pityTriggered?: boolean;
  isGuaranteed?: boolean;
}> = ({ card, onClose, pityTriggered, isGuaranteed }) => {
  const getRarityAnimation = () => {
    switch(card.rarity) {
      case 'cosmic':
        return {
          initial: { scale: 0, rotate: -180 },
          animate: { 
            scale: [0, 1.5, 1],
            rotate: [0, 360, 720],
            filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)']
          },
          transition: { duration: 2, ease: "easeInOut" }
        };
      case 'mythic':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { 
            scale: [0, 1.3, 1],
            opacity: [0, 1],
            boxShadow: ['0 0 0px gold', '0 0 100px gold', '0 0 50px gold']
          },
          transition: { duration: 1.5 }
        };
      case 'legendary':
        return {
          initial: { y: -500, opacity: 0 },
          animate: { 
            y: [500, -50, 0],
            opacity: [0, 1],
            rotate: [0, 10, -10, 0]
          },
          transition: { duration: 1.2, type: "spring" }
        };
      case 'epic':
        return {
          initial: { scale: 0.5, opacity: 0 },
          animate: { 
            scale: [0.5, 1.1, 1],
            opacity: [0, 1]
          },
          transition: { duration: 0.8 }
        };
      case 'rare':
        return {
          initial: { x: -300, opacity: 0 },
          animate: { 
            x: [300, -20, 0],
            opacity: [0, 1]
          },
          transition: { duration: 0.6 }
        };
      case 'uncommon':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { 
            scale: 1,
            opacity: 1
          },
          transition: { duration: 0.4 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 }
        };
    }
  };

  const animation = getRarityAnimation();

  return (
    <>
      <ParticleEffect rarity={card.rarity} count={card.rarity === 'cosmic' ? 100 : 50} />
      <motion.div 
        className={`enhanced-card-reveal rarity-${card.rarity}`}
        {...animation}
        onClick={onClose}
      >
        <div className={`card-container ${card.rarity}-glow`}>
          {pityTriggered && (
            <motion.div 
              className="pity-indicator"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              PITY TRIGGERED!
            </motion.div>
          )}
          {isGuaranteed && (
            <motion.div 
              className="guaranteed-indicator"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              GUARANTEED!
            </motion.div>
          )}
          <div className="card-emoji-large">{card.emoji}</div>
          <h2 className="card-name">{card.name}</h2>
          <div className={`rarity-badge ${card.rarity}`}>
            {card.rarity.toUpperCase()}
          </div>
          <p className="card-description">{card.description || card.flavor}</p>
          <div className="card-stats">
            {card.attack && <span>⚔️ {card.attack}</span>}
            {card.defense && <span>🛡️ {card.defense}</span>}
            <span>💰 {card.cost || 100}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Main Enhanced Roll Screen
export const EnhancedRollScreen: React.FC = () => {
  const [revealedCard, setRevealedCard] = useState<RollResult | null>(null);
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const [showMultiRoll, setShowMultiRoll] = useState(false);
  const [multiRollResults, setMultiRollResults] = useState<MultiRollResult | null>(null);
  const [, setCurrentCardIndex] = useState(0);
  
  const { coins, spendCoins, addToCollection } = useGameStore();
  const { 
    performSingleRoll, 
    performMultiRoll,
    getRollStats,
    isRolling, 
    completeRollAnimation 
  } = useRollStore();

  const stats = getRollStats();

  // Handle single roll
  const handleSingleRoll = useCallback(async () => {
    if (isRolling || coins < 100) return;
    
    try {
      const success = await spendCoins(100);
      if (!success) return;
      
      const rollResult = await performSingleRoll();
      
      // Add to history
      const historyItem: RollHistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        card: rollResult.card,
        timestamp: new Date(),
        pityTriggered: rollResult.pityTriggered,
        isGuaranteed: rollResult.isGuaranteed
      };
      
      setRollHistory(prev => [historyItem, ...prev].slice(0, 50));
      
      // Show reveal animation
      setTimeout(() => {
        setRevealedCard(rollResult);
        addToCollection(rollResult.card);
        completeRollAnimation();
      }, 1500);
      
    } catch (error) {
      console.error('Roll failed:', error);
      completeRollAnimation();
    }
  }, [isRolling, coins, performSingleRoll, spendCoins, addToCollection, completeRollAnimation]);

  // Handle 10x roll
  const handleTenRoll = useCallback(async () => {
    if (isRolling || coins < 900) return; // 10% discount
    
    try {
      const success = await spendCoins(900);
      if (!success) return;
      
      const results = await performMultiRoll(10);
      setMultiRollResults(results);
      setCurrentCardIndex(0);
      setShowMultiRoll(true);
      
      // Add all to history
      results.cards.forEach(result => {
        const historyItem: RollHistoryItem = {
          id: `${Date.now()}-${Math.random()}`,
          card: result.card,
          timestamp: new Date(),
          pityTriggered: result.pityTriggered,
          isGuaranteed: result.isGuaranteed
        };
        setRollHistory(prev => [historyItem, ...prev].slice(0, 50));
        addToCollection(result.card);
      });
      
      completeRollAnimation();
    } catch (error) {
      console.error('Multi-roll failed:', error);
      completeRollAnimation();
    }
  }, [isRolling, coins, performMultiRoll, spendCoins, addToCollection, completeRollAnimation]);

  // Handle 100x roll  
  const handleHundredRoll = useCallback(async () => {
    if (isRolling || coins < 8000) return; // 20% discount
    
    try {
      const success = await spendCoins(8000);
      if (!success) return;
      
      const results = await performMultiRoll(100);
      setMultiRollResults(results);
      setCurrentCardIndex(0);
      setShowMultiRoll(true);
      
      // Add all to history (last 50 only)
      results.cards.slice(-50).forEach(result => {
        const historyItem: RollHistoryItem = {
          id: `${Date.now()}-${Math.random()}`,
          card: result.card,
          timestamp: new Date(),
          pityTriggered: result.pityTriggered,
          isGuaranteed: result.isGuaranteed
        };
        setRollHistory(prev => [historyItem, ...prev].slice(0, 50));
        addToCollection(result.card);
      });
      
      completeRollAnimation();
    } catch (error) {
      console.error('Mega-roll failed:', error);
      completeRollAnimation();
    }
  }, [isRolling, coins, performMultiRoll, spendCoins, addToCollection, completeRollAnimation]);

  // Auto-dismiss card after reveal
  useEffect(() => {
    if (revealedCard) {
      const timer = setTimeout(() => {
        setRevealedCard(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [revealedCard]);

  return (
    <div className="enhanced-roll-screen">
      {/* Dynamic background based on last roll */}
      <div className={`animated-background ${revealedCard?.card.rarity || 'default'}`}>
        <div className="bg-gradient-1" />
        <div className="bg-gradient-2" />
        <div className="bg-particles" />
      </div>

      {/* Header with coins */}
      <motion.div 
        className="header-bar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="coin-display">
          <span className="coin-icon">🪙</span>
          <motion.span 
            className="coin-amount"
            key={coins}
            animate={{ scale: [1, 1.1, 1] }}
          >
            {coins.toLocaleString()}
          </motion.span>
        </div>
      </motion.div>

      {/* Left side - Pity Tracker */}
      <PityTracker stats={stats} />

      {/* Right side - Roll History */}
      <RollHistory history={rollHistory} />

      {/* Center - Roll buttons and animations */}
      <div className="roll-center">
        <AnimatePresence mode="wait">
          {!revealedCard && !isRolling && !showMultiRoll && (
            <motion.div 
              className="roll-buttons"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <motion.button
                className="roll-button single"
                onClick={handleSingleRoll}
                disabled={coins < 100}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="roll-icon">🎰</span>
                <span className="roll-text">Roll x1</span>
                <span className="roll-cost">100 🪙</span>
              </motion.button>

              <motion.button
                className="roll-button ten"
                onClick={handleTenRoll}
                disabled={coins < 900}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="roll-icon">🎰</span>
                <span className="roll-text">Roll x10</span>
                <span className="roll-cost">900 🪙</span>
                <span className="discount-badge">-10%</span>
              </motion.button>

              <motion.button
                className="roll-button hundred"
                onClick={handleHundredRoll}
                disabled={coins < 8000}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="roll-icon">🎰</span>
                <span className="roll-text">Roll x100</span>
                <span className="roll-cost">8000 🪙</span>
                <span className="discount-badge">-20%</span>
              </motion.button>
            </motion.div>
          )}

          {/* Rolling animation */}
          {isRolling && (
            <motion.div 
              className="rolling-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="rolling-card"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="card-back">
                  <span className="mystery">❓</span>
                </div>
              </motion.div>
              <motion.p 
                className="rolling-text"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                Rolling...
              </motion.p>
            </motion.div>
          )}

          {/* Card reveal */}
          {revealedCard && (
            <EnhancedCardReveal
              card={revealedCard.card}
              onClose={() => setRevealedCard(null)}
              pityTriggered={revealedCard.pityTriggered}
              isGuaranteed={revealedCard.isGuaranteed}
            />
          )}

          {/* Multi-roll results display */}
          {showMultiRoll && multiRollResults && (
            <motion.div 
              className="multi-roll-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2>Roll Results</h2>
              <div className="results-grid">
                {multiRollResults.cards.map((result, index) => (
                  <motion.div
                    key={index}
                    className={`result-card rarity-${result.card.rarity}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                  >
                    <span className="card-emoji">{result.card.emoji}</span>
                    <span className="card-name">{result.card.name}</span>
                    {result.pityTriggered && <span className="pity-mini">P</span>}
                  </motion.div>
                ))}
              </div>
              <div className="results-summary">
                <div className="rarity-breakdown">
                  {Object.entries(multiRollResults.rarityBreakdown || {}).map(([rarity, count]) => (
                    <span key={rarity} className={`rarity-count ${rarity}`}>
                      {rarity}: {count}
                    </span>
                  ))}
                </div>
                <button 
                  className="close-results"
                  onClick={() => {
                    setShowMultiRoll(false);
                    setMultiRollResults(null);
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
