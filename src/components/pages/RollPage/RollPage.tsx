import React, { useState, useCallback } from 'react';
import { UnifiedCard } from '../../../models/unified/Card';
import { convertUnifiedCardsToLegacy } from '../../../utils/typeConversions';
import { Card } from '../../../components/types';
import { RollPanel } from '../../organisms/RollPanel/RollPanel';
import { CardGrid } from '../../organisms/CardGrid/CardGrid';
import { Text } from '../../atoms/Text';
import { useCardsStore } from '../../../stores/cardsStore';
import { usePlayerStore } from '../../../stores/playerStore';
import './RollPage.css';

interface RollPageProps {
  className?: string;
  testId?: string;
}


export const RollPage: React.FC<RollPageProps> = ({
  className = '',
  testId,
}) => {
  const [rolledCards, setRolledCards] = useState<UnifiedCard[]>([]);
  
  // Store hooks - using new consolidated stores
  const { performSingleRoll, isRolling } = useCardsStore();
  const { spendCoins } = usePlayerStore();

  const handleRoll = useCallback(async (): Promise<UnifiedCard> => {
    try {
      // Rolls are free - no cost required
      
      // Perform the roll using the roll store
      const rollResult = await performSingleRoll();
      const newCard = rollResult.card;
      
      // Update local state for display (card is automatically added to collection by cardsStore)
      setRolledCards(prev => [newCard, ...prev]);
      
      return newCard;
    } catch (error) {
      console.error('Roll failed:', error);
      throw error;
    }
  }, [performSingleRoll]);

  const handleCardClick = (_card: Card) => {
    // Card clicked - could open modal or navigate to details
    // Debug log removed
  };

  return (
    <div className={`roll-page ${className}`.trim()} data-testid={testId}>
      {/* Roll Panel */}
      <section className="roll-page__roll-section">
        <RollPanel
          onRoll={handleRoll}
        />
      </section>

      {/* Recent Rolls */}
      {rolledCards.length > 0 && (
        <section className="roll-page__recent-section">
          <div className="roll-page__section-header">
            <Text variant="h3" weight="bold" color="inherit">
              Recent Rolls
            </Text>
            <Text variant="subtitle" color="muted">
              Your latest card discoveries
            </Text>
          </div>
          
          <CardGrid
            cards={convertUnifiedCardsToLegacy(rolledCards)}
            title=""
            searchable={true}
            onCardClick={handleCardClick}
            className="roll-page__recent-cards"
          />
        </section>
      )}

      {/* Empty state for first-time users */}
      {rolledCards.length === 0 && !isRolling && (
        <section className="roll-page__empty-section">
          <div className="roll-page__empty-content">
            <Text variant="h4" color="inherit" align="center">
              🎲 Ready to start your collection?
            </Text>
            <Text variant="body" color="muted" align="center">
              Click the Roll Card button above to discover your first meme card!
            </Text>
          </div>
        </section>
      )}
    </div>
  );
};
