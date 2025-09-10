import React, { useState, useCallback } from 'react';
import { Card } from '../../../models';
import { RollPanel } from '../../organisms/RollPanel/RollPanel';
import { CardGrid } from '../../organisms/CardGrid/CardGrid';
import { Text } from '../../atoms/Text';
import { useCardsStore } from '../../../stores/cardsStore';
import { usePlayerStore } from '../../../stores/playerStore';
import { useCurrencyStore, useGold, useTickets } from '../../../stores/currencyStore';
import { useAudio } from '../../../hooks/useAudio';
import './RollPage.css';

interface RollPageProps {
  className?: string;
  testId?: string;
}


export const RollPage: React.FC<RollPageProps> = ({
  className = '',
  testId,
}) => {
  const [rolledCards, setRolledCards] = useState<Card[]>([]);
  
  // Store hooks - using new consolidated stores
  const { performSingleRoll, isRolling } = useCardsStore();
  const currencyStore = useCurrencyStore();
  const gold = useGold();
  const tickets = useTickets();
  const { playSFX } = useAudio();
  
  // Roll costs - balanced for early progression
  const ROLL_COST_GOLD = 75;
  const ROLL_COST_TICKETS = 1;

  const handleRoll = useCallback(async (): Promise<Card> => {
    try {
      // Check if player can afford roll
      const canAffordWithGold = gold >= ROLL_COST_GOLD;
      const canAffordWithTickets = tickets >= ROLL_COST_TICKETS;
      
      
      if (!canAffordWithGold && !canAffordWithTickets) {
        console.error('❌ Insufficient currency for roll');
        throw new Error('Insufficient currency for roll');
      }
      
      // Deduct currency - prefer tickets over gold  
      // Deduct currency - prefer tickets over gold
      if (canAffordWithTickets) {
        useCurrencyStore.getState().spendTickets(ROLL_COST_TICKETS, 'Roll');
      } else {
        useCurrencyStore.getState().spendGold(ROLL_COST_GOLD, 'Roll');
      }
      
      // Perform the roll using the roll store
      // Perform the roll
      const rollResult = await performSingleRoll();
      const newCard = rollResult.card;
      
      // Play appropriate roll sound based on rarity (rarity is a number representing 1/X probability)
      const getRollSound = (rarityNum: number) => {
        // Convert rarity number to appropriate sound
        if (rarityNum >= 1000) return 'roll_legendary'; // Cosmic/Divine/Infinity
        if (rarityNum >= 200) return 'roll_epic';       // Legendary/Mythic
        if (rarityNum >= 10) return 'roll_ten';         // Rare/Epic
        return 'roll_single';                           // Common/Uncommon
      };
      
      playSFX(getRollSound(newCard.rarity));
      
      // Update local state for display (card is automatically added to collection by cardsStore)
      // Update local state for display (card is automatically added to collection by cardsStore)
      setRolledCards(prev => [newCard, ...prev]);
      return newCard;
    } catch (error) {
      console.error('Roll failed:', error);
      playSFX('ui_error');
      throw error;
    }
  }, [performSingleRoll, playSFX, gold, tickets, ROLL_COST_GOLD, ROLL_COST_TICKETS]);

  const handleCardClick = (_card: Card) => {
    // Card clicked - could open modal or navigate to details
    // Debug log removed
  };

  // Check if player can afford roll
  const canAffordWithGold = gold >= ROLL_COST_GOLD;
  const canAffordWithTickets = tickets >= ROLL_COST_TICKETS;
  const canRoll = canAffordWithGold || canAffordWithTickets;

  return (
    <div className={`roll-page ${className}`.trim()} data-testid={testId || 'roll-page'}>
      {/* Currency Display */}
      <section className="roll-page__currency-section">
        <div className="currency-info">
          <div className="currency-item">
            <Text variant="body" weight="medium">🪙 {gold}</Text>
          </div>
          <div className="currency-item">
            <Text variant="body" weight="medium">🎫 {tickets}</Text>
          </div>
        </div>
        <div className="roll-cost-info">
          <Text variant="caption" color="muted">
            Roll cost: 🎫 {ROLL_COST_TICKETS} ticket or 🪙 {ROLL_COST_GOLD} gold
          </Text>
        </div>
      </section>

      {/* Roll Panel */}
      <section className="roll-page__roll-section">
        <RollPanel
          onRoll={canRoll ? handleRoll : undefined}
          disabled={!canRoll}
        />
        {!canRoll && (
          <div className="insufficient-funds-message">
            <Text variant="body" color="error">
              Insufficient currency! You need 🎫 {ROLL_COST_TICKETS} ticket or 🪙 {ROLL_COST_GOLD} gold to roll.
            </Text>
          </div>
        )}
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
            cards={rolledCards}
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
