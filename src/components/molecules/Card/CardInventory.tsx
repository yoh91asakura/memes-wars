import React from 'react';
import { Card } from '../../../models';
import { Icon } from '../../atoms/Icon';
import styles from './Card.module.css';

interface CardInventoryProps {
  card: Card;
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
        {displayEmojis.map((emoji, index) => {
          // Handle both string and EmojiAttack formats
          const isEmojiAttack = typeof emoji === 'object' && emoji !== null;
          const character = isEmojiAttack ? emoji.character : emoji;
          const damage = isEmojiAttack ? emoji.damage : undefined;
          const effects = isEmojiAttack ? emoji.effects : undefined;
          
          return (
            <div 
              key={index} 
              className={styles.cardInventoryItem}
              title={`${character}${damage ? ` - ${damage} dmg` : ''}${effects ? ` - ${effects.join(', ')}` : ''}`}
            >
              <Icon 
                emoji={character} 
                size="sm" 
              />
              {/* Damage indicator for EmojiAttack objects */}
              {damage && (
                <span className={styles.cardInventoryDamage}>{damage}</span>
              )}
            </div>
          );
        })}
        
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