// Deck Page - Deck building and management page
import React, { useState } from 'react';
import { DeckBuilder } from '../../organisms/DeckBuilder';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { useGameStore } from '../../../stores/gameStore';
import { Deck } from '../../../models/Deck';
import './DeckPage.css';

interface DeckPageProps {
  className?: string;
  testId?: string;
}

export const DeckPage: React.FC<DeckPageProps> = ({
  className = '',
  testId
}) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  
  const { decks, activeDeck, createDeck, setActiveDeck, deleteDeck } = useGameStore();

  const handleStartBuilding = () => {
    setIsBuilding(true);
    setEditingDeck(null);
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setIsBuilding(true);
  };

  const handleDeckSave = (deck: Deck) => {
    setIsBuilding(false);
    setEditingDeck(null);
    // Deck is automatically saved by DeckBuilder
  };

  const handleDeckCancel = () => {
    setIsBuilding(false);
    setEditingDeck(null);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (confirm('Delete this deck? This action cannot be undone.')) {
      deleteDeck(deckId);
    }
  };

  const handleSetActive = (deckId: string) => {
    setActiveDeck(deckId);
  };

  const handleCreateQuickDeck = () => {
    const newDeck = createDeck(`Quick Deck ${Date.now()}`);
    setEditingDeck(newDeck);
    setIsBuilding(true);
  };

  // Show deck builder when building
  if (isBuilding) {
    return (
      <div className={`deck-page deck-page--building ${className}`.trim()} data-testid={testId || 'deck-page'}>
        <DeckBuilder
          initialDeck={editingDeck}
          onDeckSave={handleDeckSave}
          onDeckCancel={handleDeckCancel}
        />
      </div>
    );
  }

  return (
    <div className={`deck-page ${className}`.trim()} data-testid={testId || 'deck-page'}>
      {/* Page Header */}
      <header className="deck-page__header">
        <div className="deck-page__title-section">
          <Text variant="h1" weight="bold">
            🃏 Deck Manager
          </Text>
          <Text variant="subtitle" color="muted">
            Build and manage your combat decks
          </Text>
        </div>
        
        <div className="deck-page__actions">
          <Button 
            onClick={handleCreateQuickDeck}
            variant="primary"
            testId="create-deck-button"
          >
            ➕ New Deck
          </Button>
          <Button 
            onClick={handleStartBuilding}
            variant="secondary"
            testId="deck-builder-button"
          >
            🔧 Deck Builder
          </Button>
        </div>
      </header>

      {/* Deck List */}
      <main className="deck-page__content">
        {decks.length === 0 ? (
          // Empty State
          <div className="deck-page__empty-state">
            <div className="deck-page__empty-icon">
              🃏
            </div>
            <Text variant="h3" color="muted" align="center">
              No Decks Created
            </Text>
            <Text variant="body" color="muted" align="center">
              Create your first deck to start battling!
            </Text>
            <div className="deck-page__empty-actions">
              <Button 
                onClick={handleCreateQuickDeck}
                variant="primary"
                size="lg"
              >
                Create First Deck
              </Button>
            </div>
          </div>
        ) : (
          // Deck Grid
          <div className="deck-page__grid">
            {decks.map((deck) => (
              <div 
                key={deck.id} 
                className={`deck-card ${activeDeck?.id === deck.id ? 'deck-card--active' : ''}`}
              >
                <div className="deck-card__header">
                  <Text variant="h4" weight="bold">
                    {deck.name}
                  </Text>
                  {activeDeck?.id === deck.id && (
                    <div className="deck-card__active-badge">
                      ⭐ Active
                    </div>
                  )}
                </div>
                
                <div className="deck-card__stats">
                  <div className="deck-stat">
                    <Text variant="caption" color="muted">Cards</Text>
                    <Text variant="body" weight="medium">{deck.cards.length}</Text>
                  </div>
                  <div className="deck-stat">
                    <Text variant="caption" color="muted">Created</Text>
                    <Text variant="body" weight="medium">
                      {new Date(deck.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>

                <div className="deck-card__actions">
                  {activeDeck?.id !== deck.id && (
                    <Button
                      onClick={() => handleSetActive(deck.id)}
                      variant="primary"
                      size="sm"
                    >
                      Set Active
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEditDeck(deck)}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteDeck(deck.id)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};