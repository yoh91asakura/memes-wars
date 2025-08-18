import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard as CardType } from '../../models/unified/Card';
import { COMPLETE_EMOJI_DATABASE } from '../../systems/emoji-database';
import { EmojiSynergyCalculator } from '../../services/EmojiSynergyCalculator';
import './Card.css';

interface CardProps {
  card: CardType;
  mode?: 'display' | 'combat' | 'collection' | 'preview';
  size?: 'small' | 'medium' | 'large';
  showAnimations?: boolean;
  showStats?: boolean;
  showSynergies?: boolean;
  onClick?: () => void;
  selected?: boolean;
  static?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  mode = 'display',
  size = 'medium',
  showAnimations = true,
  showStats = true,
  showSynergies = true,
  onClick,
  selected = false,
  static: isStatic = false 
}) => {
  // Suppress unused variable warnings for props that may be used in future
  void mode;
  void size;
  void showStats;
  void showSynergies;
  // Configuration de rareté pour le type simple Card
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
    sparkles: card.rarity === 'mythic' || card.rarity === 'cosmic',
    rainbow: card.rarity === 'cosmic'
  };
  
  // Calculer le drop rate basé sur la rareté
  const getDropRate = (rarity: string): string => {
    const rates = {
      COMMON: '1/2',
      UNCOMMON: '1/4', 
      RARE: '1/67',
      EPIC: '1/143',
      LEGENDARY: '1/400',
      MYTHIC: '1/2222',
      COSMIC: '1/1000000000000000'
    };
    return rates[rarity as keyof typeof rates] || '1/1';
  };


  const dropRate = getDropRate(card.rarity);
  
  // Déterminer si on affiche la rareté en haut ou en bas selon la longueur
  const useBottomRarity = dropRate.length > 6; // Si plus de 6 caractères, afficher en bas

  // Image placeholder basée sur la rareté
  const getPlaceholderImage = (rarity: string): string => {
    const images = {
      common: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
      uncommon: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=600&fit=crop',
      rare: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=400&h=600&fit=crop',
      epic: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      legendary: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop',
      mythic: 'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?w=400&h=600&fit=crop',
      cosmic: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop'
    };
    return images[rarity as keyof typeof images] || images.common;
  };

  const backgroundImage = getPlaceholderImage(card.rarity);

  // Obtenir la liste de tous les emojis à afficher (sans regroupement)
  const getAllEmojis = () => {
    const allEmojis: string[] = [];
    
    if (card.emojis && card.emojis.length > 0) {
      card.emojis.forEach(emoji => {
        // emoji is now an EmojiProjectile object with character property
        allEmojis.push(emoji.character);
      });
    } else if (card.emoji) {
      allEmojis.push(card.emoji);
    }
    
    return allEmojis;
  };

  const allEmojis = getAllEmojis();

  // Get emojis for synergy calculation (pour l'aura seulement)
  const emojisStrings = card.emojis?.map(emoji => emoji.character) || [];
  const synergies = EmojiSynergyCalculator.calculateSynergies(emojisStrings);
  const hasSynergies = synergies.length > 0;

  const CardContent = (
    <div 
      className={`card rarity-${card.rarity.toLowerCase()} ${selected ? 'selected' : ''} ${hasSynergies ? 'has-synergies' : ''}`}
      onClick={onClick}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        borderColor: rarityConfig.color
      }}
    >
      {/* Overlay subtil pour lisibilité */}
      <div className="card-overlay" />
      
      {/* Glow effect pour raretés élevées */}
      {(card.rarity === 'mythic' || card.rarity === 'cosmic') && (
        <div 
          className="card-glow-effect"
          style={{ 
            boxShadow: `0 0 30px ${rarityConfig.glowColor || rarityConfig.color}` 
          }}
        />
      )}

      {/* Header avec nom du meme - LAYOUT TCG ORIGINAL */}
      <div className="card-header-tcg">
        <h3 className="card-name-tcg">{card.name}</h3>
      </div>

      {/* Rareté en haut à droite - Seulement si courte */}
      {!useBottomRarity && (
        <div className="rarity-badge-top">
          <div className="rarity-display">
            <span className="rarity-chance">{dropRate}</span>
            <span className="rarity-name">{card.rarity.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Section des emojis rewards - LAYOUT TCG ORIGINAL */}
      <div className="emojis-rewards-section">
        <div className="emojis-rewards-grid">
          {allEmojis.map((emojiChar, index) => (
            <div 
              key={`${emojiChar}-${index}`}
              className="emoji-reward-large"
              title={COMPLETE_EMOJI_DATABASE[emojiChar]?.name || emojiChar}
            >
              <span className="emoji-icon-large">{emojiChar}</span>
            </div>
          ))}
        </div>
        
        {/* Section passive de la carte - LAYOUT TCG ORIGINAL */}
        {card.ability && (
          <div className="card-passive-text">
            <div className="passive-ability">{card.ability}</div>
            {card.flavor && <div className="passive-flavor">{card.flavor}</div>}
          </div>
        )}
      </div>

      {/* Effets spéciaux pour raretés élevées */}
      {!isStatic && showAnimations && rarityConfig.sparkles && (
        <div className="sparkles-overlay">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Rainbow effect pour Cosmic */}
      {rarityConfig.rainbow && (
        <div className="rainbow-border" />
      )}

      {/* Rareté sous la carte pour les longs nombres */}
      {useBottomRarity && (
        <div className="rarity-badge-bottom">
          <div className="rarity-display-bottom">
            <span className="rarity-chance-bottom">{dropRate}</span>
            <span className="rarity-name-bottom">{card.rarity.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (showAnimations) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {CardContent}
      </motion.div>
    );
  }

  return CardContent;
};

export default Card;

// Export aussi sous le nom CardTCG pour compatibilité
export { Card as CardTCG };