import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard as Card } from '../../models/unified/Card';
import { Card } from '../cards/Card';
import './CardReveal.css';

interface CardRevealProps {
  card: Card;
  onClose: () => void;
  hideRoll: boolean;
}

export const CardReveal: React.FC<CardRevealProps> = ({ card, onClose, hideRoll }) => {
  // Configuration simple pour les raretés
  const rarityColors = {
    common: '#808080',
    uncommon: '#40C057',
    rare: '#339AF0',
    epic: '#9775FA',
    legendary: '#FD7E14',
    mythic: '#FA5252',
    cosmic: '#FF00FF'
  };
  
  const rarityConfig = {
    color: rarityColors[card.rarity as keyof typeof rarityColors] || '#808080',
    glowColor: rarityColors[card.rarity as keyof typeof rarityColors],
  };
  
  // Skip animation for common-legendary if hideRoll is on
  const shouldSkipAnimation = hideRoll && 
    card.rarity !== 'mythic' && 
    card.rarity !== 'cosmic';
  
  const animationDuration = shouldSkipAnimation ? 0.25 : 
    card.rarity === 'cosmic' ? 6 :
    card.rarity === 'mythic' ? 4.5 :
    card.rarity === 'legendary' ? 3.5 :
    card.rarity === 'epic' ? 2.5 :
    card.rarity === 'rare' ? 2.5 : 1.5;


  return (
    <motion.div 
      className="card-reveal-container"
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
      {/* Background glow effect */}
      <motion.div 
        className="reveal-background-glow"
        style={{ 
          backgroundColor: rarityConfig.glowColor || rarityConfig.color,
          boxShadow: `0 0 ${100 + (card.rarity === 'cosmic' ? 200 : 0)}px ${rarityConfig.glowColor || rarityConfig.color}`
        }}
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity
        }}
      />
      
      {/* Use the new Card component */}
      <Card 
        card={card as any} 
        showAnimations={true}
        size="large"
        mode="preview"
        onClick={onClose}
      />
      
      {/* Additional reveal effects for ultra-rare cards */}
      {card.rarity === 'cosmic' && (
        <motion.div
          className="cosmic-reveal-effect"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="cosmic-particles">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="cosmic-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
