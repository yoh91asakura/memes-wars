import React from 'react';
import { UnifiedCard } from '../../../models/unified/Card';
import { Icon } from '../../atoms/Icon';

interface CardInventoryProps {
  card: UnifiedCard;
  maxEmojis?: number;
}

export const CardInventory: React.FC<CardInventoryProps> = ({ 
  card, 
  maxEmojis = 5 
}) => {
  // Get emojis from the card's emojis array
  const emojis = card.emojis || [];
  const displayEmojis = emojis.slice(0, maxEmojis);

  if (displayEmojis.length === 0) {
    return (
      <div className="card__inventory card__inventory--empty">
        <span className="card__inventory-empty-text">No projectiles</span>
      </div>
    );
  }

  return (
    <div className="card__inventory">
      <div className="card__inventory-grid">
        {displayEmojis.map((emoji, index) => (
          <div 
            key={index} 
            className="card__inventory-item"
            title={`${emoji.character} - ${emoji.damage} dmg - ${emoji.effects?.join(', ') || 'No effects'}`}
          >
            <Icon 
              emoji={emoji.character} 
              size="md" 
            />
            {/* Damage indicator */}
            <span className="card__inventory-damage">{emoji.damage}</span>
            
            {/* Fire rate indicator if different from default */}
            {emoji.fireRate && emoji.fireRate !== 1.0 && (
              <span className="card__inventory-firerate">
                {emoji.fireRate.toFixed(1)}x
              </span>
            )}
          </div>
        ))}
        
        {/* Empty slots if less than maxEmojis */}
        {Array.from({ length: maxEmojis - displayEmojis.length }).map((_, index) => (
          <div 
            key={`empty-${index}`} 
            className="card__inventory-item card__inventory-item--empty"
          />
        ))}
      </div>
      
      {/* Total emojis count if more than displayed */}
      {emojis.length > maxEmojis && (
        <div className="card__inventory-overflow">
          +{emojis.length - maxEmojis} more
        </div>
      )}
    </div>
  );
};