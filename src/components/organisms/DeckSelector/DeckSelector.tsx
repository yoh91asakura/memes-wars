// DeckSelector - Advanced deck selection and validation interface for combat preparation
// Combines deck building, validation, and pre-combat optimization

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card } from '../../../models';
import { useCardsStore } from '../../../stores/cardsStore';
import { useStageStore } from '../../../stores/stageStore';
import { DeckService } from '../../../services/DeckService';
import { SynergySystem } from '../../../services/SynergySystem';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Spinner } from '../../atoms/Spinner';
import { CollectionCard } from '../../molecules/CollectionCard';
import { StatBadge } from '../../atoms/StatBadge';
import './DeckSelector.css';

export interface DeckSelectorProps {
  currentDeck: Card[];
  maxDeckSize: number;
  onDeckConfirmed: (deck: Card[]) => void;
  onCancel?: () => void;
  requiredSynergies?: string[];
  stageHints?: {
    enemyType?: string;
    recommendedStrategy?: string;
    difficulty?: string;
  };
  className?: string;
}

interface DeckValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  synergyScore: number;
  powerLevel: number;
}

interface CardFilters {
  search: string;
  rarity: string | 'all';
  inDeck: boolean | 'all';
  synergy: string | 'all';
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  currentDeck,
  maxDeckSize,
  onDeckConfirmed,
  onCancel,
  requiredSynergies = [],
  stageHints,
  className = ''
}) => {
  // State
  const [selectedDeck, setSelectedDeck] = useState<Card[]>(currentDeck);
  const [validation, setValidation] = useState<DeckValidation | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeTab, setActiveTab] = useState<'deck' | 'collection'>('deck');
  const [filters, setFilters] = useState<CardFilters>({
    search: '',
    rarity: 'all',
    inDeck: 'all',
    synergy: 'all'
  });

  // Stores
  const { collection, getFilteredCards } = useCardsStore();
  const { currentStage } = useStageStore();

  // Services
  const deckService = new DeckService();
  const synergySystem = new SynergySystem();

  // Validate deck whenever it changes
  useEffect(() => {
    const validateDeck = () => {
      const validation: DeckValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        synergyScore: 0,
        powerLevel: 0
      };

      // Basic validation
      if (selectedDeck.length === 0) {
        validation.isValid = false;
        validation.errors.push('Deck cannot be empty');
      }

      if (selectedDeck.length > maxDeckSize) {
        validation.isValid = false;
        validation.errors.push(`Deck size cannot exceed ${maxDeckSize} cards`);
      }

      // Calculate synergy score
      const synergies = SynergySystem.detectSynergies(selectedDeck);
      validation.synergyScore = synergies.activeSynergies.reduce((total: number, synergy: any) => total + synergy.strength, 0);

      // Calculate power level
      validation.powerLevel = selectedDeck.reduce((total, card) => 
        total + (card.attack || 0) + (card.defense || 0) + (card.health || 0), 0
      );

      // Check required synergies
      if (requiredSynergies.length > 0) {
        const activeSynergyTypes = synergies.activeSynergies.map((s: any) => s.type.toLowerCase());
        const missingRequired = requiredSynergies.filter(req => 
          !activeSynergyTypes.includes(req.toLowerCase())
        );

        if (missingRequired.length > 0) {
          validation.warnings.push(`Missing recommended synergies: ${missingRequired.join(', ')}`);
        }
      }

      // Stage-specific suggestions
      if (stageHints) {
        if (stageHints.difficulty === 'boss' && selectedDeck.length < maxDeckSize) {
          validation.suggestions.push('Consider using maximum deck size for boss battles');
        }

        if (stageHints.recommendedStrategy === 'offensive' && validation.powerLevel < 100) {
          validation.suggestions.push('Consider adding more offensive cards for this stage');
        }
      }

      // Card balance suggestions
      const cardTypes = selectedDeck.reduce((types, card) => {
        types[card.type || 'unknown'] = (types[card.type || 'unknown'] || 0) + 1;
        return types;
      }, {} as Record<string, number>);

      if (Object.keys(cardTypes).length === 1 && selectedDeck.length > 3) {
        validation.suggestions.push('Consider diversifying card types for better synergies');
      }

      setValidation(validation);
    };

    validateDeck();
  }, [selectedDeck, maxDeckSize, requiredSynergies, stageHints]);

  // Filter available cards
  const filteredCollection = useMemo(() => {
    let filtered = [...collection];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(search) ||
        card.description?.toLowerCase().includes(search)
      );
    }

    if (filters.rarity !== 'all') {
      filtered = filtered.filter(card => String(card.rarity) === filters.rarity);
    }

    if (filters.inDeck !== 'all') {
      const isInDeck = (card: Card) => selectedDeck.some(deckCard => deckCard.id === card.id);
      filtered = filtered.filter(card => filters.inDeck ? isInDeck(card) : !isInDeck(card));
    }

    if (filters.synergy !== 'all') {
      // Filter by cards that contribute to specific synergy
      filtered = filtered.filter(card => {
        const synergies = SynergySystem.detectSynergies([...selectedDeck, card]);
        return synergies.activeSynergies.some((synergy: any) => synergy.type.toLowerCase() === filters.synergy.toLowerCase());
      });
    }

    return filtered;
  }, [collection, filters, selectedDeck]);

  // Card management
  const addCardToDeck = useCallback((card: Card) => {
    if (selectedDeck.length >= maxDeckSize) return;
    
    setSelectedDeck(prev => [...prev, card]);
  }, [selectedDeck.length, maxDeckSize]);

  const removeCardFromDeck = useCallback((cardIndex: number) => {
    setSelectedDeck(prev => prev.filter((_, index) => index !== cardIndex));
  }, []);

  const clearDeck = useCallback(() => {
    setSelectedDeck([]);
  }, []);

  // Deck optimization
  const optimizeDeck = useCallback(async (strategy: 'balance' | 'synergy' | 'power' = 'balance') => {
    setIsOptimizing(true);
    
    try {
      // Simple optimization logic
      let optimizedDeck = [...selectedDeck];
      
      if (strategy === 'synergy') {
        // Add cards that improve synergies
        const availableCards = collection.filter(card => 
          !selectedDeck.some(deckCard => deckCard.id === card.id)
        );
        
        for (const card of availableCards) {
          if (optimizedDeck.length >= maxDeckSize) break;
          
          const currentSynergies = SynergySystem.detectSynergies(optimizedDeck);
          const newSynergies = SynergySystem.detectSynergies([...optimizedDeck, card]);
          
          const currentScore = currentSynergies.activeSynergies.reduce((total: number, s: any) => total + s.strength, 0);
          const newScore = newSynergies.activeSynergies.reduce((total: number, s: any) => total + s.strength, 0);
          
          if (newScore > currentScore) {
            optimizedDeck.push(card);
          }
        }
      } else if (strategy === 'power') {
        // Add highest power cards
        const availableCards = collection
          .filter(card => !selectedDeck.some(deckCard => deckCard.id === card.id))
          .sort((a, b) => {
            const aPower = (a.attack || 0) + (a.defense || 0) + (a.health || 0);
            const bPower = (b.attack || 0) + (b.defense || 0) + (b.health || 0);
            return bPower - aPower;
          });

        optimizedDeck = [...optimizedDeck, ...availableCards.slice(0, maxDeckSize - optimizedDeck.length)];
      }
      
      setSelectedDeck(optimizedDeck);
    } catch (error) {
      console.error('Deck optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [selectedDeck, collection, maxDeckSize]);

  // Generate deck suggestions
  const getSuggestions = useMemo(() => {
    if (!validation || selectedDeck.length === 0) return [];
    
    const suggestions = [...validation.suggestions];
    
    // Add specific card suggestions
    const currentSynergies = SynergySystem.detectSynergies(selectedDeck);
    if (currentSynergies.activeSynergies.length === 0) {
      suggestions.push('Try adding cards with matching types or elements for synergy bonuses');
    }
    
    return suggestions;
  }, [validation, selectedDeck]);

  const handleConfirmDeck = () => {
    if (validation?.isValid) {
      onDeckConfirmed(selectedDeck);
    }
  };

  if (isOptimizing) {
    return (
      <div className={`deck-selector loading ${className}`}>
        <div className="optimization-overlay">
          <Spinner size="lg" />
          <h3>Optimizing Deck...</h3>
          <p>Finding the best card combinations for your strategy</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`deck-selector ${className}`}>
      {/* Header */}
      <header className="deck-selector-header">
        <div className="header-info">
          <h2>Prepare for Combat</h2>
          <div className="stage-info">
            <span className="stage-number">Stage {currentStage}</span>
            {stageHints?.difficulty && (
              <StatBadge icon="⚡" label="Difficulty" value={0} variant="default" />
            )}
            {stageHints?.enemyType && (
              <StatBadge icon="👾" label="Enemy" value={0} variant="compact" />
            )}
          </div>
        </div>

        <div className="deck-stats">
          <div className="stat-group">
            <StatBadge 
              icon="🃏"
              label="Cards" 
              value={selectedDeck.length}
              variant="default"
            />
            {validation && (
              <>
                <StatBadge 
                  icon="⚡"
                  label="Power" 
                  value={validation.powerLevel}
                  variant="default"
                />
                <StatBadge 
                  icon="🔗"
                  label="Synergy" 
                  value={Math.round(validation.synergyScore)}
                  variant="compact"
                />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="deck-selector-tabs">
        <button
          className={`tab ${activeTab === 'deck' ? 'active' : ''}`}
          onClick={() => setActiveTab('deck')}
        >
          Current Deck ({selectedDeck.length})
        </button>
        <button
          className={`tab ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          Collection ({filteredCollection.length})
        </button>
      </nav>

      {/* Main Content */}
      <div className="deck-selector-content">
        {activeTab === 'deck' ? (
          /* Deck View */
          <div className="deck-view">
            {/* Deck Actions */}
            <div className="deck-actions">
              <Button
                onClick={() => optimizeDeck('balance')}
                variant="secondary"
                size="small"
                disabled={collection.length === 0}
              >
                Auto-Optimize
              </Button>
              <Button
                onClick={() => optimizeDeck('synergy')}
                variant="secondary"
                size="small"
                disabled={collection.length === 0}
              >
                Maximize Synergy
              </Button>
              <Button
                onClick={() => optimizeDeck('power')}
                variant="secondary"
                size="small"
                disabled={collection.length === 0}
              >
                Maximize Power
              </Button>
              <Button
                onClick={clearDeck}
                variant="danger"
                size="small"
                disabled={selectedDeck.length === 0}
              >
                Clear Deck
              </Button>
            </div>

            {/* Current Deck Cards */}
            <div className="current-deck">
              {selectedDeck.length === 0 ? (
                <div className="empty-deck">
                  <p>No cards selected</p>
                  <p>Switch to Collection tab to add cards</p>
                </div>
              ) : (
                <div className="deck-cards-grid">
                  {selectedDeck.map((card, index) => (
                    <div key={`${card.id}-${index}`} className="deck-card-slot">
                      <CollectionCard
                        card={card}
                        compact
                        onClick={() => setSelectedCard(card)}
                      />
                      <button
                        className="remove-card-btn"
                        onClick={() => removeCardFromDeck(index)}
                        title="Remove from deck"
                      >
                        ✕
                      </button>
                      <div className="slot-number">{index + 1}</div>
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: maxDeckSize - selectedDeck.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="deck-card-slot empty">
                      <div className="empty-slot">
                        <span>+</span>
                      </div>
                      <div className="slot-number">{selectedDeck.length + index + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Synergy Display */}
            {selectedDeck.length > 1 && (
              <div className="synergy-display">
                <h4>Active Synergies</h4>
                {SynergySystem.detectSynergies(selectedDeck).activeSynergies.map((synergy: any, index: number) => (
                  <div key={index} className="synergy-item">
                    <span className="synergy-name">{synergy.type}</span>
                    <span className="synergy-strength">{synergy.strength.toFixed(1)}x</span>
                    <span className="synergy-description">{synergy.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Collection View */
          <div className="collection-view">
            {/* Filters */}
            <div className="collection-filters">
              <Input
                type="search"
                placeholder="Search cards..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              
              <select
                value={filters.rarity}
                onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
              >
                <option value="all">All Rarities</option>
                <option value="COMMON">Common</option>
                <option value="UNCOMMON">Uncommon</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
                <option value="MYTHIC">Mythic</option>
                <option value="COSMIC">Cosmic</option>
              </select>

              <select
                value={filters.inDeck.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  inDeck: e.target.value === 'all' ? 'all' : e.target.value === 'true'
                }))}
              >
                <option value="all">All Cards</option>
                <option value="false">Not in Deck</option>
                <option value="true">In Deck</option>
              </select>
            </div>

            {/* Collection Grid */}
            <div className="collection-grid">
              {filteredCollection.map(card => {
                const isInDeck = selectedDeck.some(deckCard => deckCard.id === card.id);
                const canAdd = selectedDeck.length < maxDeckSize;

                return (
                  <div key={card.id} className="collection-card-container">
                    <CollectionCard
                      card={card}
                      onClick={() => setSelectedCard(card)}
                      className={isInDeck ? 'in-deck' : ''}
                    />
                    
                    {!isInDeck && (
                      <button
                        className="add-to-deck-btn"
                        onClick={() => addCardToDeck(card)}
                        disabled={!canAdd}
                        title={canAdd ? 'Add to deck' : 'Deck is full'}
                      >
                        +
                      </button>
                    )}
                    
                    {isInDeck && <div className="in-deck-indicator">✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Validation Status */}
      <div className="validation-panel">
        {validation && (
          <>
            {validation.errors.length > 0 && (
              <div className="validation-errors">
                <h4>⚠️ Errors</h4>
                {validation.errors.map((error, index) => (
                  <p key={index} className="error">{error}</p>
                ))}
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="validation-warnings">
                <h4>⚡ Warnings</h4>
                {validation.warnings.map((warning, index) => (
                  <p key={index} className="warning">{warning}</p>
                ))}
              </div>
            )}

            {getSuggestions.length > 0 && (
              <div className="validation-suggestions">
                <h4>💡 Suggestions</h4>
                {getSuggestions.map((suggestion, index) => (
                  <p key={index} className="suggestion">{suggestion}</p>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions Footer */}
      <footer className="deck-selector-footer">
        <div className="footer-actions">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleConfirmDeck}
            disabled={!validation?.isValid}
            size="lg"
          >
            Start Combat with {selectedDeck.length} cards
          </Button>
        </div>

        <div className="footer-info">
          {validation && (
            <div className={`deck-status ${validation.isValid ? 'valid' : 'invalid'}`}>
              {validation.isValid ? '✅ Deck Ready' : '❌ Deck Invalid'}
            </div>
          )}
        </div>
      </footer>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="card-detail-overlay" onClick={() => setSelectedCard(null)}>
          <div className="card-detail-modal" onClick={e => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setSelectedCard(null)}
            >
              ✕
            </button>
            
            <CollectionCard
              card={selectedCard}
              showDetails
              className="modal-card"
            />

            <div className="modal-actions">
              {!selectedDeck.some(card => card.id === selectedCard.id) ? (
                <Button
                  onClick={() => {
                    addCardToDeck(selectedCard);
                    setSelectedCard(null);
                  }}
                  variant="primary"
                  disabled={selectedDeck.length >= maxDeckSize}
                >
                  Add to Deck
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Already in Deck
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};