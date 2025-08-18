import React, { useState, useCallback } from 'react';
import { Card as CardType } from '../../types';
import { RollPanel } from '../../organisms/RollPanel/RollPanel';
import { CardGrid } from '../../organisms/CardGrid/CardGrid';
import { Text } from '../../atoms';
import './RollPage.css';

interface RollPageProps {
  className?: string;
  testId?: string;
}

// Mock cards data for demonstration
const mockCards: CardType[] = [
  {
    id: '1',
    name: 'Doge',
    description: 'Such card, much wow!',
    imageUrl: '',
    emoji: '🐕',
    rarity: 'common',
    stats: { attack: 50, defense: 30, health: 80, speed: 60 },
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Pepe',
    description: 'Rare Pepe collectible',
    imageUrl: '',
    emoji: '🐸',
    rarity: 'rare',
    stats: { attack: 70, defense: 40, health: 90, speed: 55 },
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Galaxy Cat',
    description: 'A cosmic feline from space',
    imageUrl: '',
    emoji: '🐱',
    rarity: 'cosmic',
    stats: { attack: 120, defense: 80, health: 150, speed: 90 },
    createdAt: new Date('2024-01-03'),
  },
];

export const RollPage: React.FC<RollPageProps> = ({
  className = '',
  testId,
}) => {
  const [rolledCards, setRolledCards] = useState<CardType[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [lastRolledCard, setLastRolledCard] = useState<CardType | null>(null);

  const handleRoll = useCallback(async (): Promise<CardType> => {
    setIsRolling(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Random card selection with rarity weighting
    const rarityWeights = {
      common: 50,
      rare: 30,
      epic: 15,
      legendary: 4,
      cosmic: 1
    };
    
    const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let selectedRarity: CardType['rarity'] = 'common';
    let currentWeight = 0;
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      currentWeight += weight;
      if (random <= currentWeight) {
        selectedRarity = rarity as CardType['rarity'];
        break;
      }
    }
    
    // Find a card of the selected rarity or fallback to a random card
    const availableCards = mockCards.filter(card => card.rarity === selectedRarity);
    const selectedCard = availableCards.length > 0 
      ? availableCards[Math.floor(Math.random() * availableCards.length)]
      : mockCards[Math.floor(Math.random() * mockCards.length)];
    
    // Create a unique instance of the card
    const newCard: CardType = {
      ...selectedCard,
      id: `${selectedCard.id}-${Date.now()}`,
      createdAt: new Date(),
    };
    
    setRolledCards(prev => [newCard, ...prev]);
    setRollCount(prev => prev + 1);
    setLastRolledCard(newCard);
    setIsRolling(false);
    
    return newCard;
  }, []);

  const handleCardClick = (card: CardType) => {
    console.log('Card clicked:', card);
    // Here you could open a card detail modal or navigate to card details
  };

  return (
    <div className={`roll-page ${className}`.trim()} data-testid={testId}>
      {/* Roll Panel */}
      <section className="roll-page__roll-section">
        <RollPanel
          onRoll={handleRoll}
          rollCount={rollCount}
          isRolling={isRolling}
          lastRolledCard={lastRolledCard}
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
