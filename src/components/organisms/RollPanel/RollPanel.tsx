import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../models/Card';
import { usePlayerStore } from '../../../stores/playerStore';
import { useCardsStore } from '../../../stores/cardsStore';
import { RollButton } from '../../molecules/RollButton/RollButton';
import { AutoRollControls } from '../../molecules/AutoRollControls';
import { TCGCard } from '../TCGCard';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import './RollPanel.css';

interface RollPanelProps {
  onRoll?: () => Promise<Card>;
  className?: string;
  testId?: string;
}

export const RollPanel: React.FC<RollPanelProps> = ({
  onRoll,
  className = '',
  testId,
}) => {
  const [revealCard, setRevealCard] = useState<Card | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  
  // Store hooks
  const { coins, stats } = usePlayerStore();
  const { isRolling, lastRollResult } = useCardsStore();

  const handleRoll = async () => {
    if (!onRoll || isRolling) return;

    try {
      setShowReveal(false);
      setRevealCard(null);
      
      const newCard = await onRoll();
      
      // Delay reveal for dramatic effect
      setTimeout(() => {
        setRevealCard(newCard);
        setShowReveal(true);
      }, 1000);
    } catch (error) {
      console.error('Roll failed:', error);
    }
  };

  const cardToShow = revealCard || (lastRollResult && 'card' in lastRollResult ? lastRollResult.card : null);

  return (
    <div className={`roll-panel ${className}`.trim()} data-testid={testId}>
      {/* Stats Section */}
      <div className="roll-panel__stats">
        <div className="roll-panel__stat-item">
          <Icon name="roll" size="md" color="primary" />
          <div className="roll-panel__stat-content">
            <Text variant="h4" weight="bold" color="primary">
              {stats?.totalRolls || 0}
            </Text>
            <Text variant="caption" color="muted">
              Total Rolls
            </Text>
          </div>
        </div>

        <div className="roll-panel__stat-item">
          <Icon emoji="🎯" size="md" />
          <div className="roll-panel__stat-content">
            <Text variant="h4" weight="bold" color="primary">
              {stats?.cardsCollected || 0}
            </Text>
            <Text variant="caption" color="muted">
              Cards Collected
            </Text>
          </div>
        </div>
      </div>

      {/* Roll Area */}
      <div className="roll-panel__roll-area">
        <div className="roll-panel__card-reveal">
          <AnimatePresence mode="wait">
            {cardToShow ? (
              <motion.div
                key={cardToShow.id}
                className="roll-panel__revealed-card"
                initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                animate={{ 
                  scale: showReveal ? [0, 1.2, 1] : 1, 
                  rotateY: 0, 
                  opacity: 1 
                }}
                exit={{ scale: 0, rotateY: -180, opacity: 0 }}
                transition={{ 
                  duration: showReveal ? 0.8 : 0.3,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <TCGCard
                  card={cardToShow}
                  variant="collection"
                  size="large"
                  animated={false}
                  showStats={true}
                  showEmojis={true}
                  className={showReveal ? 'roll-panel__card--revealed' : ''}
                />
                {/* Rarity badge removed - rarity is shown in the card itself */}
              </motion.div>
            ) : (
              <motion.div
                className="roll-panel__placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="roll-panel__card-back">
                  <Icon name="cards" size="2xl" color="muted" />
                  <Text variant="h5" color="muted" align="center">
                    {isRolling ? 'Rolling...' : 'Ready to Roll'}
                  </Text>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Roll Button */}
        <div className="roll-panel__button">
          <RollButton
            onRoll={handleRoll}
            loading={isRolling}
            rollCount={stats?.totalRolls || 0}
            disabled={false}
            testId="roll-button"
          />
        </div>
      </div>

      {/* Auto Roll Controls */}
      <AutoRollControls testId="auto-roll-controls" />

      {/* Tips */}
      <div className="roll-panel__tips">
        <Text variant="caption" color="muted" align="center">
          🎲 Free rolls! Collect all the meme cards and build your deck!
        </Text>
      </div>
    </div>
  );
};
