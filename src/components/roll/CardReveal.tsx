import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, RARITY_CONFIGS } from '../../models/Card';
import './CardReveal.css';

interface CardRevealProps {
  card: Card;
  onClose: () => void;
  hideRoll: boolean;
}

export const CardReveal: React.FC<CardRevealProps> = ({ card, onClose, hideRoll }) => {
  const [showDetails, setShowDetails] = useState(false);
  const rarityConfig = RARITY_CONFIGS[card.rarity];
  
  // Skip animation for common-legendary if hideRoll is on
  const shouldSkipAnimation = hideRoll && 
    card.rarity !== 'MYTHIC' && 
    card.rarity !== 'COSMIC';
  
  const animationDuration = shouldSkipAnimation ? 0.25 : 
    card.rarity === 'COSMIC' ? 6 :
    card.rarity === 'MYTHIC' ? 4.5 :
    card.rarity === 'LEGENDARY' ? 3.5 :
    card.rarity === 'EPIC' ? 2.5 :
    card.rarity === 'RARE' ? 2.5 : 1.5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDetails(true);
    }, animationDuration * 500);
    
    return () => clearTimeout(timer);
  }, [animationDuration]);

  return (
    <motion.div 
      className={`card-reveal rarity-${card.rarity.toLowerCase()}`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        duration: animationDuration,
        type: "spring",
        stiffness: 100
      }}
      onClick={onClose}
    >
      {/* Rarity glow effect */}
      <motion.div 
        className="card-glow"
        style={{ 
          backgroundColor: rarityConfig.glowColor || rarityConfig.color,
          boxShadow: `0 0 ${50 + (card.rarity === 'COSMIC' ? 150 : 0)}px ${rarityConfig.glowColor || rarityConfig.color}`
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      />
      
      {/* Card Content */}
      <div className="card-content">
        <div className="card-header">
          <h2 className="card-name">{card.name}</h2>
          <div className="card-rarity" style={{ color: rarityConfig.color }}>
            {card.rarity}
          </div>
        </div>
        
        {showDetails && (
          <motion.div 
            className="card-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-stats">
              <div className="stat">
                <span className="stat-label">HP</span>
                <span className="stat-value">{card.hp}</span>
              </div>
              <div className="stat">
                <span className="stat-label">ATK SPD</span>
                <span className="stat-value">{card.attackSpeed.toFixed(1)}/s</span>
              </div>
            </div>
            
            <div className="card-emojis">
              {card.emojis.map((emoji, index) => (
                <motion.span 
                  key={index}
                  className="emoji-display"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {emoji.character}
                </motion.span>
              ))}
            </div>
            
            {card.passive && (
              <div className="card-passive">
                <div className="passive-name">{card.passive.name}</div>
                <div className="passive-desc">{card.passive.description}</div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Special effects for high rarity */}
      {rarityConfig.sparkles && (
        <div className="sparkles-effect">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 2,
                repeat: Infinity,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
      
      {rarityConfig.rainbow && (
        <div className="rainbow-effect" />
      )}
    </motion.div>
  );
};
