// Deck Builder - Deck construction and management interface

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useGame } from '../../../hooks/useGame';
import { Deck, DeckValidation } from '../../../models/Deck';
import { Card } from '../../../models';
import { format } from '../../../utils/format';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { CollectionCard } from '../../molecules/CollectionCard';
import './DeckBuilder.css';

interface DeckBuilderProps {
  initialDeck?: Deck;
  onDeckSave?: (deck: Deck) => void;
  onDeckCancel?: () => void;
  className?: string;
}

interface DeckBuilderFilters {
  search: string;
  rarity: string[];
  type: string[];
  owned: boolean | null;
}

interface DeckBuilderSort {
  field: 'name' | 'rarity' | 'cost' | 'damage' | 'health';
  direction: 'asc' | 'desc';
}

export const DeckBuilder: React.FC<DeckBuilderProps> = ({
  initialDeck,
  onDeckSave,
  onDeckCancel,
  className = ''
}) => {
  // Game state
  const { deckService, saveDeck } = useGame();
  
  // Deck builder state
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(initialDeck || null);
  const [deckName, setDeckName] = useState(initialDeck?.name || 'New Deck');
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [validation, setValidation] = useState<DeckValidation | null>(null);

  // Filters and sorting
  const [filters, setFilters] = useState<DeckBuilderFilters>({
    search: '',
    rarity: [],
    type: [],
    owned: null
  });
  
  const [sort, setSort] = useState<DeckBuilderSort>({
    field: 'name',
    direction: 'asc'
  });

  // UI state
  const [_activeTab, _setActiveTab] = useState<'collection' | 'deck'>('collection');
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Initialize deck and load available cards
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        // Create new deck if none provided
        if (!currentDeck && deckService) {
          const newDeck = deckService.createDeck(deckName);
          setCurrentDeck(newDeck);
        }

        // Load available cards (in a real app, this would come from an API)
        // For now, we'll use a placeholder array
        setAvailableCards([]);
        
      } catch (error) {
        console.error('Failed to initialize deck builder:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [currentDeck, deckName, deckService]);

  // Validate deck whenever it changes
  useEffect(() => {
    if (currentDeck && deckService) {
      const validation = deckService.getDetailedValidation(currentDeck.cards);
      setValidation(validation);
    }
  }, [currentDeck, deckService]);

  // Filter and sort available cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = availableCards;

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(search) ||
        card.description?.toLowerCase().includes(search)
      );
    }

    // Apply rarity filter
    if (filters.rarity.length > 0) {
      filtered = filtered.filter(card => filters.rarity.includes(String(card.rarity)));
    }

    // Apply type filter  
    if (filters.type.length > 0) {
      filtered = filtered.filter(card => filters.type.includes(card.type || 'unknown'));
    }

    // Apply owned filter
    if (filters.owned !== null) {
      // In a real app, this would check if the player owns the card
      // For now, we'll assume all cards are owned
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      // Convert to comparable values
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sort.direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [availableCards, filters, sort]);

  // Deck management functions
  const addCardToDeck = useCallback((card: Card) => {
    if (!currentDeck || !deckService) return;

    const canAdd = deckService.validateDeck([...currentDeck.cards, card]);
    if (canAdd) {
      const updatedDeck = {
        ...currentDeck,
        cards: [...currentDeck.cards, card],
        updatedAt: new Date().toISOString()
      };
      
      setCurrentDeck(updatedDeck);
    }
  }, [currentDeck, deckService]);

  const removeCardFromDeck = useCallback((cardIndex: number) => {
    if (!currentDeck) return;

    const updatedDeck = {
      ...currentDeck,
      cards: currentDeck.cards.filter((_, index) => index !== cardIndex),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentDeck(updatedDeck);
  }, [currentDeck]);

  const clearDeck = useCallback(() => {
    if (!currentDeck) return;

    const updatedDeck = {
      ...currentDeck,
      cards: [],
      updatedAt: new Date().toISOString()
    };
    
    setCurrentDeck(updatedDeck);
  }, [currentDeck]);

  const optimizeDeck = useCallback((strategy: 'balance' | 'offense' | 'defense' = 'balance') => {
    if (!currentDeck || !deckService) return;

    const optimizedDeck = deckService.optimizeDeck(currentDeck, strategy);
    setCurrentDeck(optimizedDeck);
  }, [currentDeck, deckService]);

  // Handle deck save
  const handleSaveDeck = useCallback(async () => {
    if (!currentDeck || !validation?.isValid) return;

    setIsLoading(true);
    try {
      const deckToSave = {
        ...currentDeck,
        name: deckName
      };
      
      const success = await saveDeck(deckToSave);
      if (success) {
        onDeckSave?.(deckToSave);
      }
    } catch (error) {
      console.error('Failed to save deck:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDeck, deckName, validation, saveDeck, onDeckSave]);

  // Get card count in deck
  const getCardCountInDeck = useCallback((cardId: string): number => {
    if (!currentDeck) return 0;
    return currentDeck.cards.filter(card => card.id === cardId).length;
  }, [currentDeck]);

  if (isLoading) {
    return (
      <div className={`deck-builder loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading Deck Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`deck-builder ${className}`}>
      {/* Header */}
      <header className="deck-builder-header">
        <div className="deck-info">
          <Input
            value={deckName}
            onChange={(value) => setDeckName(value)}
            placeholder="Deck Name"
            className="deck-name-input"
          />
          <div className="deck-stats">
            {currentDeck && (
              <>
                <span className="stat">
                  Cards: {currentDeck.cards.length}/{currentDeck.maxSize}
                </span>
                {validation && (
                  <span className={`stat validation ${validation.isValid ? 'valid' : 'invalid'}`}>
                    {validation.isValid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="deck-actions">
          <Button onClick={clearDeck} variant="secondary" size="sm">
            Clear Deck
          </Button>
          <Button onClick={() => optimizeDeck('balance')} variant="secondary" size="sm">
            Optimize
          </Button>
          <Button
            onClick={handleSaveDeck}
            variant="primary"
            disabled={!validation?.isValid || isLoading}
          >
            Save Deck
          </Button>
          {onDeckCancel && (
            <Button onClick={onDeckCancel} variant="danger" size="sm">
              Cancel
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="deck-builder-main">
        {/* Sidebar - Deck View */}
        <aside className="deck-sidebar">
          <div className="sidebar-header">
            <h3>Current Deck</h3>
            <button
              onClick={() => setShowStats(!showStats)}
              className="toggle-stats"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>

          {/* Deck Cards */}
          <div className="deck-cards">
            {currentDeck?.cards.map((card, index) => (
              <div key={`${card.id}-${index}`} className="deck-card">
                <CollectionCard
                  card={card}
                  size="sm"
                  onSelect={() => setSelectedCard(card)}
                />
                <button
                  onClick={() => removeCardFromDeck(index)}
                  className="remove-card"
                  title="Remove from deck"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {currentDeck && currentDeck.cards.length === 0 && (
              <div className="empty-deck">
                <p>No cards in deck</p>
                <p>Add cards from your collection</p>
              </div>
            )}
          </div>

          {/* Deck Statistics */}
          {showStats && currentDeck && currentDeck.cards.length > 0 && (
            <div className="deck-statistics">
              <h4>Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="label">Total Health</span>
                  <span className="value">
                    {format.number.compact(currentDeck.stats?.totalHealth || 0)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="label">Total Damage</span>
                  <span className="value">
                    {format.number.compact(currentDeck.stats?.totalDamage || 0)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="label">Fire Rate</span>
                  <span className="value">
                    {(currentDeck.stats?.projectedFireRate || 0).toFixed(1)}/s
                  </span>
                </div>
                <div className="stat-item">
                  <span className="label">Overall Rating</span>
                  <span className="value">
                    {(currentDeck.stats?.overallRating || 0).toFixed(1)}/10
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validation && !validation.isValid && (
            <div className="validation-errors">
              <h4>Issues</h4>
              {validation.errors.map((error, index) => (
                <div key={index} className="error-item">
                  <span className="error-icon">⚠️</span>
                  <span className="error-message">{error.message}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content - Collection */}
        <main className="collection-main">
          {/* Filters */}
          <div className="collection-filters">
            <div className="filter-row">
              <Input
                value={filters.search}
                onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                placeholder="Search cards..."
                className="search-input"
                type="search"
              />
              
              <select
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                  setSort({ field: field as any, direction });
                }}
                className="sort-select"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="rarity-desc">Rarity High-Low</option>
                <option value="rarity-asc">Rarity Low-High</option>
                <option value="cost-asc">Cost Low-High</option>
                <option value="cost-desc">Cost High-Low</option>
              </select>
            </div>

            <div className="filter-tags">
              {/* Rarity filters would go here */}
              {/* Type filters would go here */}
            </div>
          </div>

          {/* Card Collection */}
          <div className="card-collection">
            {filteredAndSortedCards.length === 0 ? (
              <div className="empty-collection">
                <p>No cards found</p>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredAndSortedCards.map(card => {
                  const countInDeck = getCardCountInDeck(card.id);
                  const canAdd = currentDeck && currentDeck.cards.length < (currentDeck.maxSize || 15);

                  return (
                    <div key={card.id} className="collection-card-container">
                      <CollectionCard
                        card={card}
                        onSelect={() => setSelectedCard(card)}
                        className={countInDeck > 0 ? 'in-deck' : ''}
                      />
                      
                      {countInDeck > 0 && (
                        <div className="card-count">
                          {countInDeck}
                        </div>
                      )}
                      
                      <button
                        onClick={() => addCardToDeck(card)}
                        disabled={!canAdd}
                        className="add-to-deck"
                        title="Add to deck"
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Selected Card Detail */}
      {selectedCard && (
        <div className="card-detail-overlay" onClick={() => setSelectedCard(null)}>
          <div className="card-detail" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedCard(null)}
              className="close-detail"
            >
              ✕
            </button>
            
            <CollectionCard
              card={selectedCard}
              size="lg"
              className="detail-card"
            />
            
            <div className="card-actions">
              <Button
                onClick={() => {
                  addCardToDeck(selectedCard);
                  setSelectedCard(null);
                }}
                variant="primary"
                disabled={!currentDeck || !selectedCard || currentDeck.cards.length >= (currentDeck.maxSize || 15)}
              >
                Add to Deck
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};