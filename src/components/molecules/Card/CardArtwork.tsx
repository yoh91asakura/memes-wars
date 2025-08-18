import React, { useState } from 'react';
import { UnifiedCard } from '../../../models/unified/Card';
import { getCardImageUrl, getPlaceholderImageUrl, generateCardPlaceholder } from '../../../utils/cardImageUtils';

interface CardArtworkProps {
  card: UnifiedCard;
  size?: 'sm' | 'md' | 'lg';
}

export const CardArtwork: React.FC<CardArtworkProps> = ({ card, size = 'md' }) => {
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

  return (
    <div className={`card__artwork card__artwork--${size}`}>
      <img 
        src={getImageSrc()}
        alt={card.name}
        onError={handleImageError}
        className="card__image"
      />
      
      {/* Rarity overlay effect */}
      <div className={`card__image-overlay card__image-overlay--${card.rarity.toLowerCase()}`} />
      
      {/* Card name overlay */}
      <div className="card__name-overlay">
        <span className="card__name-text">{card.name}</span>
      </div>
      
      {/* Visual glow effect using card's visual properties */}
      <div 
        className="card__artwork-glow"
        style={{
          '--glow-color': card.visual?.glow || '#ffffff',
          '--border-color': card.visual?.borderColor || '#e9ecef'
        } as React.CSSProperties}
      />
    </div>
  );
};