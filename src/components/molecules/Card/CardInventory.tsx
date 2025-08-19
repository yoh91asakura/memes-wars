import React from 'react';
import { UnifiedCard } from '../../../models/unified/Card';
import { Icon } from '../../atoms/Icon';
import styles from './Card.module.css';

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
      <div className={`${styles.cardInventory} ${styles.cardInventoryEmpty}`}>
        <span className={styles.cardInventoryEmptyText}>No projectiles</span>
      </div>
    );
  }

  return (
    <div className={styles.cardInventory}>
      <div className={styles.cardInventoryGrid}>
        {displayEmojis.map((emoji, index) => (
          <div 
            key={index} 
            className={styles.cardInventoryItem}
            title={`${emoji.character} - ${emoji.damage} dmg - ${emoji.effects?.join(', ') || 'No effects'}`}
          >
            <Icon 
              emoji={emoji.character} 
              size="sm" 
            />
            {/* Damage indicator */}
            <span className={styles.cardInventoryDamage}>{emoji.damage}</span>
            
            {/* Fire rate indicator if different from default */}
            {emoji.fireRate && emoji.fireRate !== 1.0 && (
              <span className={styles.cardInventoryFirerate}>
                {emoji.fireRate.toFixed(1)}x
              </span>
            )}
          </div>
        ))}
        
        {/* Empty slots if less than maxEmojis */}
        {Array.from({ length: maxEmojis - displayEmojis.length }).map((_, index) => (
          <div 
            key={`empty-${index}`} 
            className={`${styles.cardInventoryItem} ${styles.cardInventoryItemEmpty}`}
          />
        ))}
      </div>
      
      {/* Total emojis count if more than displayed */}
      {emojis.length > maxEmojis && (
        <div className={styles.cardInventoryOverflow}>
          +{emojis.length - maxEmojis} more
        </div>
      )}
    </div>
  );
};