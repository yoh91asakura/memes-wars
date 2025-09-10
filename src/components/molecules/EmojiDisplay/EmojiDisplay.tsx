// EmojiDisplay - Show loaded emojis and their stats during combat
// Displays real emoji information from player deck

import React from 'react';
import { Badge } from '../../atoms/Badge';
import './EmojiDisplay.module.css';

export interface EmojiDisplayProps {
  emojis: string[];
  averageDamage?: number;
  totalEmojis?: number;
  specialEffectsCount?: number;
  className?: string;
}

export const EmojiDisplay: React.FC<EmojiDisplayProps> = ({
  emojis,
  averageDamage = 0,
  totalEmojis = 0,
  specialEffectsCount = 0,
  className = ''
}) => {
  // Show only the first few emojis to avoid clutter
  const displayEmojis = emojis.slice(0, 8);
  const hasMore = emojis.length > displayEmojis.length;

  return (
    <div className={`emoji-display ${className}`}>
      <div className="emoji-header">
        <h4>Combat Emojis</h4>
        <div className="emoji-stats">
          <Badge variant="info" size="sm">
            {totalEmojis} total
          </Badge>
          {averageDamage > 0 && (
            <Badge variant="warning" size="sm">
              ~{averageDamage} dmg
            </Badge>
          )}
          {specialEffectsCount > 0 && (
            <Badge variant="success" size="sm">
              {specialEffectsCount} effects
            </Badge>
          )}
        </div>
      </div>
      
      <div className="emoji-grid">
        {displayEmojis.map((emoji, index) => (
          <div key={index} className="emoji-item">
            <span className="emoji-character">{emoji}</span>
          </div>
        ))}
        {hasMore && (
          <div className="emoji-item more-indicator">
            <span className="more-text">+{emojis.length - displayEmojis.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiDisplay;