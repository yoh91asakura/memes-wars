import React from 'react';
import { Card } from '../../types/card';
import { EmojiSynergyCalculator } from '../../services/EmojiSynergyCalculator';

interface CardDisplayProps {
  card: Card;
  showSynergies?: boolean;
  compact?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ 
  card, 
  showSynergies = true, 
  compact = false 
}) => {
  // Get emojis (new system or legacy)
  const emojis = card.emojis || (card.emoji ? [card.emoji] : []);
  const emojiData = card.emojiData;
  
  // Calculate synergies if not available
  const synergies = emojiData?.activeSynergies || 
                   (emojis.length > 1 ? EmojiSynergyCalculator.calculateSynergies(emojis) : []);
  
  const synergyScore = emojiData?.synergyBonus || 
                      EmojiSynergyCalculator.getSynergyScore(emojis);

  return (
    <div className={`card-display ${card.rarity} ${compact ? 'compact' : ''}`}>
      {/* Card Header */}
      <div className="card-header">
        <h3 className="card-name">{card.name}</h3>
        <span className="card-cost">{card.cost}</span>
      </div>

      {/* Multi-Emoji Display */}
      <div className="emoji-section">
        <div className="emoji-list">
          {emojis.map((emoji, index) => (
            <span 
              key={index} 
              className="emoji-display"
              title={emojiData?.emojiPowers[index]?.name || `Emoji ${index + 1}`}
            >
              {emoji}
            </span>
          ))}
        </div>
        
        {emojis.length > 1 && (
          <div className="emoji-count">
            <span className="count-badge">{emojis.length}</span>
          </div>
        )}
      </div>

      {/* Card Stats */}
      <div className="card-stats">
        {card.attack !== undefined && (
          <div className="stat attack">
            <span className="stat-icon">⚔️</span>
            <span className="stat-value">{card.attack}</span>
          </div>
        )}
        {card.defense !== undefined && (
          <div className="stat defense">
            <span className="stat-icon">🛡️</span>
            <span className="stat-value">{card.defense}</span>
          </div>
        )}
        {card.stats?.health && (
          <div className="stat health">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{card.stats.health}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {card.description && (
        <div className="card-description">
          {card.description}
        </div>
      )}

      {/* Synergies Section */}
      {showSynergies && synergies.length > 0 && (
        <div className="synergies-section">
          <div className="synergy-header">
            <span className="synergy-title">Synergies</span>
            <span className="synergy-score">+{synergyScore}</span>
          </div>
          
          <div className="synergy-list">
            {synergies.slice(0, compact ? 2 : 4).map((synergy, index) => (
              <div key={index} className="synergy-item">
                <span className="synergy-name">{synergy.name}</span>
                <span className="synergy-bonus">+{synergy.bonusValue}%</span>
              </div>
            ))}
            
            {synergies.length > (compact ? 2 : 4) && (
              <div className="synergy-more">
                +{synergies.length - (compact ? 2 : 4)} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Perfect Synergy Indicator */}
      {EmojiSynergyCalculator.isPerfectSynergy(emojis) && (
        <div className="perfect-synergy">
          <span className="perfect-icon">✨</span>
          Perfect Synergy!
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`rarity-badge ${card.rarity}`}>
        {card.rarity.toUpperCase()}
      </div>
    </div>
  );
};

export default CardDisplay;