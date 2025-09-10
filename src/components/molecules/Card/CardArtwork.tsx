import React, { useState } from 'react';
import { Card, CardUtils } from '../../../models/Card';
import { getCardImageUrl, getPlaceholderImageUrl, generateCardPlaceholder } from '../../../utils/cardImageUtils';
import './CardArtwork.css';

interface CardArtworkProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'simple';
}

export const CardArtwork: React.FC<CardArtworkProps> = ({ card, size = 'md', variant = 'default' }) => {
  const [imageError, setImageError] = useState(false);
  const [usePlaceholder, setUsePlaceholder] = useState(false);

  const handleImageError = () => {
    if (!usePlaceholder) {
      setUsePlaceholder(true);
    } else {
      setImageError(true);
    }
  };

  const getImageSrc = () => {
    if (imageError) {
      // Generate dynamic placeholder with emoji
      return generateCardPlaceholder(card.name, card.emoji);
    }
    if (usePlaceholder) {
      return getPlaceholderImageUrl();
    }
    return getCardImageUrl(card.id);
  };

  if (variant === 'simple') {
    // Simple variant - just the image with no overlays
    return (
      <div className={`cardArtwork cardArtwork--${size}`}>
        <img 
          src={getImageSrc()}
          alt={card.name}
          onError={handleImageError}
          className="cardImage"
        />
      </div>
    );
  }

  // Default variant with overlays
  return (
    <div className={`cardArtwork cardArtwork--${size}`}>
      <img 
        src={getImageSrc()}
        alt={card.name}
        onError={handleImageError}
        className="cardImage"
      />
      
      {/* Rarity overlay effect */}
      <div className={`cardImageOverlay overlay--${CardUtils.getRarityName(card.rarity).toLowerCase()}`} />
      
      {/* Card name overlay */}
      <div className="cardNameOverlay">
        <span className="cardNameText">{card.name}</span>
      </div>
      
      {/* Visual glow effect using card's visual properties */}
      <div 
        className="cardArtworkGlow"
        style={{
          '--glow-color': card.visual?.glow || '#ffffff',
          '--border-color': card.visual?.borderColor || '#e9ecef'
        } as React.CSSProperties}
      />
    </div>
  );
};