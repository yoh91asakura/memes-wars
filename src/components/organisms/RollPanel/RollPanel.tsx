import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedCard } from '../../../models/unified/Card';
import { convertUnifiedCardToLegacy, rarityEnumToString } from '../../../utils/typeConversions';
import { usePlayerStore } from '../../../stores/playerStore';
import { useCardsStore } from '../../../stores/cardsStore';
import { RollButton } from '../../molecules/RollButton/RollButton';
import { Card } from '../../molecules/Card/Card';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';
import './RollPanel.css';

interface RollPanelProps {
  onRoll?: () => Promise<UnifiedCard>;
  className?: string;
  testId?: string;
}

export const RollPanel: React.FC<RollPanelProps> = ({
  onRoll,
  className = '',
  testId,
}) => {
  const [revealCard, setRevealCard] = useState<UnifiedCard | null>(null);
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
          <Icon emoji="💰" size="md" />
          <div className="roll-panel__stat-content">
            <Text variant="h4" weight="bold" color="warning">
              {coins}
            </Text>
            <Text variant="caption" color="muted">
              Coins
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
                <Card
                  card={convertUnifiedCardToLegacy(cardToShow)}
                  variant="tcg"
                  size="lg"
                  interactive={false}
                  className={showReveal ? 'roll-panel__card--revealed' : ''}
                />
                {showReveal && (
                  <motion.div
                    className="roll-panel__rarity-burst"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Badge variant="primary" size="lg" rounded>
                      <Icon name="star" size="sm" />
                      {rarityEnumToString(cardToShow.rarity).toUpperCase()}
                      <Icon name="star" size="sm" />
                    </Badge>
                  </motion.div>
                )}
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
            disabled={coins < 100}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="roll-panel__tips">
        <Text variant="caption" color="muted" align="center">
          💡 Tip: Higher rarity cards have special visual effects!
        </Text>
      </div>
    </div>
  );
};
