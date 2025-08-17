import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useRollStore } from '../../stores/rollStore';
import { Card } from '../../types/card';
import { RollResult, RollStats } from '../../services/RollService';
import { AutoRollPanel } from '../roll/AutoRollPanel';
import { CardTCG } from '../cards/CardTCG';
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
          {/* Use our CardTCG component */}
          <CardTCG 
            card={card}
            showAnimations={false}
            onClick={onClose}
          />
        </div>
      </motion.div>
    </>
  );
};

interface RollScreenProps {
  onNavigateToCombat?: () => void;
}

export const RollScreen: React.FC<RollScreenProps> = ({ onNavigateToCombat }) => {
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
    if (revealedCard) {
      const timer = setTimeout(() => {
        setRevealedCard(null);
      }, isAutoRolling ? 2000 : 5000); // Shorter time in auto-roll mode
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
        
        {/* Center - Card reveals over the interface */}
        <div className="roll-center">
          <AnimatePresence>
            {revealedCard && (
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
      
      {/* Bottom Center Roll Button */}
      <motion.button
        className="main-roll-button"
        onClick={handleSingleRoll}
        disabled={isRolling}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          boxShadow: isAutoRolling 
            ? ['0 15px 35px rgba(102, 126, 234, 0.4)', '0 15px 45px rgba(16, 185, 129, 0.6)', '0 15px 35px rgba(102, 126, 234, 0.4)']
            : '0 15px 35px rgba(102, 126, 234, 0.4)'
        }}
        transition={{
          scale: { duration: 0.5, ease: "easeOut" },
          opacity: { duration: 0.5 },
          boxShadow: isAutoRolling ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
        }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          background: isRolling 
            ? 'linear-gradient(135deg, #6b7280, #4b5563)'
            : isAutoRolling
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '50%',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          cursor: isRolling ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'all 0.3s ease'
        }}
      >
        <motion.div
          animate={{
            rotate: isRolling || isAutoRolling ? 360 : 0,
            scale: isAutoRolling ? [1, 1.1, 1] : 1
          }}
          transition={{
            rotate: (isRolling || isAutoRolling) ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0.3 },
            scale: isAutoRolling ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
          }}
        >
          {isRolling ? '⏳' : isAutoRolling ? '⚡' : '🎰'}
        </motion.div>
      </motion.button>

      {/* Discrete Auto Roll Toggle */}
      <motion.button
        className="auto-roll-toggle-discrete"
        onClick={handleAutoRollToggle}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.05, x: 5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          width: '60px',
          height: '60px',
          background: isAutoRolling 
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'rgba(100, 100, 100, 0.3)',
          border: `2px solid ${isAutoRolling ? '#10b981' : '#666'}`,
          borderRadius: '50%',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'all 0.3s ease'
        }}
        title={isAutoRolling ? 'Stop Auto Roll (3s interval)' : 'Start Auto Roll (3s interval)'}
      >
        <motion.div
          animate={isAutoRolling ? { rotate: [0, 10, -10, 0] } : {}}
          transition={isAutoRolling ? { duration: 2, repeat: Infinity } : {}}
        >
          {isAutoRolling ? '⏸️' : '▶️'}
        </motion.div>
      </motion.button>

      {/* Battle Navigation Button */}
      {onNavigateToCombat && (
        <motion.button
          className="battle-nav-button"
          onClick={onNavigateToCombat}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: '2px solid #ef4444',
            borderRadius: '50%',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            transition: 'all 0.3s ease'
          }}
          title="Go to Battle Arena"
        >
          ⚔️
        </motion.button>
      )}

      {/* Auto Roll Status Indicator */}
      <AnimatePresence>
        {isAutoRolling && (
          <motion.div
            className="auto-roll-indicator"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '30px',
              background: 'rgba(16, 185, 129, 0.9)',
              padding: '8px 12px',
              borderRadius: '20px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 99
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              AUTO
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
