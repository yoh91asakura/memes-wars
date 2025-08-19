import React, { useState, useCallback } from 'react';
import { UnifiedCard } from '../../../models/unified/Card';
import { convertUnifiedCardsToLegacy } from '../../../utils/typeConversions';
import { Card } from '../../../components/types';
import { RollPanel } from '../../organisms/RollPanel/RollPanel';
import { CardGrid } from '../../organisms/CardGrid/CardGrid';

import { RecentRollsList } from '../../organisms/RecentRollsList/RecentRollsList';
import { Text } from '../../atoms';

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
      // Check if player has enough coins
      const rollCost = 100; // Get from config
      const success = await spendCoins(rollCost);
      if (!success) {
        throw new Error('Not enough coins to roll!');
      }
      
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
  }, [performSingleRoll, spendCoins]);

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

      {/* Recent Rolls List - Compact View */}
      {rolledCards.length > 0 && (
        <section className="roll-page__recent-section">
          <RecentRollsList
            cards={rolledCards}
            maxCards={10}
            onCardClick={handleCardClick}
          />
        </section>
      )}
      
      {/* Card Grid - Full Collection */}
      {rolledCards.length > 5 && (
        <section className="roll-page__collection-section">
          <div className="roll-page__section-header">
            <Text variant="h3" weight="bold" color="inherit">
              Your Collection
            </Text>
            <Text variant="subtitle" color="muted">
              All your discovered cards
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
