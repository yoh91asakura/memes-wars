import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useRollStore } from '../../stores/rollStore';
import { Card } from '../../types/card';
import { RollResult, RollStats } from '../../services/RollService';
import './RollScreenSolsRNG.css';

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

export const RollScreen: React.FC = () => {
  const [revealedCard, setRevealedCard] = useState<RollResult | null>(null);
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const [isAutoRolling, setIsAutoRolling] = useState(false);
  
  const { coins, addToCollection } = useGameStore();
  const { 
    performSingleRoll,
    getRollStats,
    isRolling, 
    completeRollAnimation 
  } = useRollStore();

  const stats = getRollStats();
  
  // DEV MODE: Add coins function (for testing)
  const addCoins = useCallback((amount: number) => {
    useGameStore.setState(state => ({ coins: state.coins + amount }));
  }, []);

  const handleSingleRoll = useCallback(async () => {
    if (isRolling) return;
    
    try {
      const rollResult = await performSingleRoll();
      
      // Calculate gold reward based on rarity
      const goldRewards = {
        common: 5,
        uncommon: 15,
        rare: 50,
        epic: 150,
        legendary: 500,
        mythic: 1500,
        cosmic: 5000
      };
      
      const reward = goldRewards[rollResult.card.rarity as keyof typeof goldRewards] || 5;
      addCoins(reward);
      
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
  }, [isRolling, performSingleRoll, addToCollection, completeRollAnimation]);


  // Handle auto-roll toggle
  const handleAutoRollToggle = useCallback(() => {
    setIsAutoRolling(!isAutoRolling);
  }, [isAutoRolling]);
  
  // Auto-roll interval effect
  useEffect(() => {
    if (!isAutoRolling) return;
    
    const interval = setInterval(() => {
      if (!isRolling) {
        handleSingleRoll();
      }
    }, 3000); // Roll every 3 seconds
    
    return () => clearInterval(interval);
  }, [isAutoRolling, isRolling, handleSingleRoll]);

  // Auto-dismiss card after reveal
  useEffect(() => {
    if (revealedCard && !isAutoRolling) {
      const timer = setTimeout(() => {
        setRevealedCard(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [revealedCard, isAutoRolling]);

  return (
    <div className="enhanced-roll-screen">
      {/* Background gradient */}
      <div className={`background-gradient ${revealedCard?.card.rarity.toLowerCase() || ''}`} />
      
      {/* DEV MODE: Add coins button */}
      <motion.button
        className="dev-add-coins"
        onClick={() => addCoins(10000)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '10px 20px',
          background: 'rgba(255, 215, 0, 0.2)',
          border: '2px solid gold',
          borderRadius: '10px',
          color: 'gold',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        +10,000 🪙 (DEV)
      </motion.button>
      
      {/* Header with coin counter and pity tracker */}
      <div className="roll-header">
        <motion.div 
          className="coin-counter"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="coin-emoji">🪙</span>
          <span className="coin-amount">{coins.toLocaleString()}</span>
        </motion.div>
        
        <PityTracker stats={stats} />
      </div>
      
      {/* Main content area */}
      <div className="roll-main">
        {/* Left sidebar - Recent rolls */}
        <RollHistory history={rollHistory} />
        
        {/* Center - Roll button and animations */}
        <div className="roll-center">
          <AnimatePresence mode="wait">
            {!revealedCard && !isRolling && (
              <motion.div
                className="roll-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <motion.button
                  className="roll-button single"
                  onClick={handleSingleRoll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="button-content">
                    <span className="button-icon">🎰</span>
                    <span className="button-title">ROLL</span>
                    <span className="button-cost">Free + Gold Reward</span>
                  </div>
                </motion.button>
                
                <motion.button
                  className={`auto-roll-toggle ${isAutoRolling ? 'active' : ''}`}
                  onClick={handleAutoRollToggle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    marginTop: '20px',
                    padding: '15px 30px',
                    background: isAutoRolling ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100, 100, 100, 0.3)',
                    border: `2px solid ${isAutoRolling ? '#10b981' : '#666'}`,
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <div className="button-content">
                    <span className="button-icon">{isAutoRolling ? '⏸️' : '▶️'}</span>
                    <span className="button-title">{isAutoRolling ? 'Stop Auto Roll' : 'Start Auto Roll'}</span>
                    <span className="button-cost">Every 3 seconds</span>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {isRolling && (
              <motion.div
                className="rolling-animation"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <motion.div
                  className="rolling-orb"
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
                <p className="rolling-text">Rolling...</p>
              </motion.div>
            )}

            {revealedCard && !isRolling && (
              <EnhancedCardReveal 
                card={revealedCard.card}
                onClose={() => setRevealedCard(null)}
                pityTriggered={revealedCard.pityTriggered}
                isGuaranteed={revealedCard.isGuaranteed}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Floating Roll Button */}
      {!isRolling && !revealedCard && (
        <motion.button
          className="floating-roll-button"
          onClick={handleSingleRoll}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            zIndex: 100
          }}
        >
          <span style={{ fontSize: '28px' }}>🎰</span>
          <span>ROLL</span>
        </motion.button>
      )}
      
      
      {/* Auto Roll Status */}
      {isAutoRolling && (
        <motion.div
          className="auto-roll-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: '120px',
            right: '20px',
            background: 'rgba(16, 185, 129, 0.9)',
            padding: '15px 25px',
            borderRadius: '15px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            ⚙️
          </motion.div>
          Auto Rolling Active
        </motion.div>
      )}
    </div>
  );
};
