import React, { useState } from 'react';
import { UnifiedCard, CardRarity } from '../../models/unified/Card';
import { TCGCard } from '../organisms/TCGCard';
import { commonCards } from '../../data/cards/common';
import { rareCards } from '../../data/cards/rare';
import { epicCards } from '../../data/cards/epic';
import { legendaryCards } from '../../data/cards/legendary';
import styles from './TCGCardDemo.module.css';

const TCGCardDemo: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<UnifiedCard | null>(null);
  const [viewSize, setViewSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [viewVariant, setViewVariant] = useState<'collection' | 'battle' | 'detail'>('collection');

  // Sample cards from different rarities
  const sampleCards: UnifiedCard[] = [
    ...commonCards.slice(0, 2),
    ...rareCards.slice(0, 2),
    ...epicCards.slice(0, 1),
    ...legendaryCards.slice(0, 1)
  ];

  const handleCardClick = (card: UnifiedCard) => {
    setSelectedCard(card);
  };

  return (
    <div className={styles.demoPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎮 TCG Card System Demo</h1>
        <p className={styles.subtitle}>
          New Atomic Design architecture with enhanced visual effects
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="size-select">Size:</label>
          <select 
            id="size-select"
            value={viewSize} 
            onChange={(e) => setViewSize(e.target.value as any)}
            className={styles.select}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="variant-select">Variant:</label>
          <select 
            id="variant-select"
            value={viewVariant} 
            onChange={(e) => setViewVariant(e.target.value as any)}
            className={styles.select}
          >
            <option value="collection">Collection</option>
            <option value="battle">Battle</option>
            <option value="detail">Detail</option>
          </select>
        </div>
      </div>

      <div className={styles.cardGrid}>
        {sampleCards.map((card) => (
          <TCGCard
            key={card.id}
            card={card}
            size={viewSize}
            variant={viewVariant}
            onClick={handleCardClick}
            selected={selectedCard?.id === card.id}
            animated={true}
            showStats={true}
            showEmojis={true}
            className={styles.demoCard}
          />
        ))}
      </div>

      {selectedCard && (
        <div className={styles.selectedCard}>
          <h2>Selected Card Details</h2>
          <div className={styles.cardDetails}>
            <div className={styles.detailCard}>
              <TCGCard
                card={selectedCard}
                size="large"
                variant="detail"
                selected={true}
                animated={true}
                showStats={true}
                showEmojis={true}
              />
            </div>
            <div className={styles.cardInfo}>
              <h3>{selectedCard.name}</h3>
              <p><strong>Rarity:</strong> {selectedCard.rarity}</p>
              <p><strong>Health:</strong> {selectedCard.health}</p>
              <p><strong>Luck:</strong> {selectedCard.luck}</p>
              <p><strong>Family:</strong> {selectedCard.family}</p>
              <p><strong>Description:</strong> {selectedCard.description}</p>
              {selectedCard.emojis && selectedCard.emojis.length > 0 && (
                <div>
                  <strong>Emojis:</strong>
                  <div className={styles.emojiList}>
                    {selectedCard.emojis.map((emoji, index) => (
                      <span key={index} className={styles.emojiItem}>
                        {emoji.character} ({emoji.damage} DMG)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button 
                onClick={() => setSelectedCard(null)}
                className={styles.closeButton}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.features}>
        <h2>✨ New Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <h3>🎨 Atomic Design</h3>
            <p>Clean separation: Atoms → Molecules → Organisms</p>
          </div>
          <div className={styles.feature}>
            <h3>🌈 Rarity Effects</h3>
            <p>Visual effects and animations based on card rarity</p>
          </div>
          <div className={styles.feature}>
            <h3>📱 Responsive</h3>
            <p>Adapts perfectly to all screen sizes</p>
          </div>
          <div className={styles.feature}>
            <h3>🎮 Interactive</h3>
            <p>Smooth animations and hover effects</p>
          </div>
          <div className={styles.feature}>
            <h3>🔧 Customizable</h3>
            <p>Multiple sizes and variants available</p>
          </div>
          <div className={styles.feature}>
            <h3>♿ Accessible</h3>
            <p>Full accessibility support with ARIA labels</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCGCardDemo;
