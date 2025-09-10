import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardsStore } from '../../../stores';
import { useGameStore } from '../../../stores/gameStore';
import { CollectionFilters } from '../../organisms/CollectionFilters';
import { CollectionStats } from '../../organisms/CollectionStats';
import { CollectionCard } from '../../molecules/CollectionCard';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Card } from '../../../models/Card';
import './CollectionPage.css';

interface CollectionPageProps {
  className?: string;
  testId?: string;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  className = '',
  testId
}) => {
  // Collection store
  const {
    collection,
    filters,
    viewMode,
    showStacks,
    selectedCard,
    setFilters,
    setViewMode,
    toggleShowStacks,
    setSelectedCard,
    getFilteredCards,
    getStackedCards,
    getCollectionStats,
    removeCard
  } = useCardsStore();
  
  // Game store for deck management  
  const { activeDeck, addCardToDeck } = useGameStore();
  const currentDeck = activeDeck?.cards || [];
  
  // Local state
  const [showStats, setShowStats] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  
  // Computed values
  const filteredCards = useMemo(() => getFilteredCards(), [collection, filters]);
  const stackedCards = useMemo(() => getStackedCards(), [collection]);
  const stats = useMemo(() => getCollectionStats(), [collection]);
  
  // Display data based on view mode
  const displayData = useMemo(() => {
    if (showStacks && viewMode === 'stack') {
      return stackedCards;
    }
    return filteredCards.map(card => ({ cardData: card, count: 1, ids: [card.id] }));
  }, [filteredCards, stackedCards, showStacks, viewMode]);
  
  // Handlers
  const handleSearchChange = (search: string) => {
    setFilters({ search });
  };
  
  const handleRarityChange = (rarity: any) => {
    setFilters({ rarity });
  };
  
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters({ sortBy: sortBy as any, sortOrder });
  };
  
  const handleViewModeChange = (mode: 'grid' | 'list' | 'stack') => {
    setViewMode(mode);
    if (mode === 'stack') {
      // Auto-enable stacks when stack view is selected
      if (!showStacks) toggleShowStacks();
    }
  };
  
  const handleClearFilters = () => {
    setFilters({
      search: '',
      rarity: 'all',
      sortBy: 'dateAdded',
      sortOrder: 'desc'
    });
  };
  
  const handleCardSelect = (card: Card) => {
    setSelectedCard(selectedCard?.id === card.id ? null : card);
  };
  
  const handleAddToDeck = (card: Card) => {
    // For now, we'll need an active deck to add to. TODO: implement proper deck selection
    const deckId = activeDeck?.id;
    if (!deckId) return false;
    const success = addCardToDeck(deckId, card);
    if (success) {
      // Show success feedback
        // Success feedback removed - could integrate with toast notifications
    } else {
      // Show error feedback
        // Error feedback removed - could integrate with toast notifications
    }
    return success;
  };
  
  const handleRemoveCard = (card: Card) => {
    removeCard(card.id);
  };
  
  const handleBulkActions = (action: 'addToDeck' | 'remove') => {
    const cardsToProcess = Array.from(selectedCards)
      .map(id => collection.find(card => card.id === id))
      .filter(Boolean) as Card[];
    
    cardsToProcess.forEach(card => {
      if (action === 'addToDeck') {
        handleAddToDeck(card);
      } else if (action === 'remove') {
        handleRemoveCard(card);
      }
    });
    
    setSelectedCards(new Set());
  };
  
  // Unused function - removed
  
  // Empty state
  if (collection.length === 0) {
    return (
      <div className={`collection-page collection-page--empty ${className}`} data-testid={testId || 'collection-page'}>
        <div className="collection-page__empty-state">
          <div className="collection-page__empty-icon">
            <Icon emoji="📦" size="2xl" />
          </div>
          <Text variant="h3" align="center" className="collection-page__empty-title">
            Your Collection is Empty
          </Text>
          <Text variant="body" color="muted" align="center" className="collection-page__empty-description">
            Start rolling cards to build your collection! Every card you roll will appear here.
          </Text>
          <div className="collection-page__empty-actions">
            <Button variant="primary" size="lg">
              <Icon emoji="🎲" size="sm" />
              Start Rolling
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`collection-page ${className}`} data-testid={testId || 'collection-page'}>
      {/* Page Header */}
      <div className="collection-page__header">
        <div className="collection-page__title-section">
          <Text variant="h2" weight="bold">
            Card Collection
          </Text>
          <Text variant="body" color="muted">
            {filteredCards.length} of {collection.length} cards
          </Text>
        </div>
        
        <div className="collection-page__header-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleShowStacks}
            testId="toggle-stacks"
          >
            <Icon emoji={showStacks ? "📦" : "📑"} size="sm" />
            {showStacks ? 'Individual' : 'Stacked'} View
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            testId="toggle-stats"
          >
            <Icon name={showStats ? 'eye-off' : 'eye'} size="sm" />
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
          
          {selectedCards.size > 0 && (
            <div className="collection-page__bulk-actions">
              <Text variant="caption" color="muted">
                {selectedCards.size} selected
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkActions('addToDeck')}
                testId="bulk-add-deck"
              >
                <Icon name="plus" size="sm" />
                Add to Deck
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkActions('remove')}
                testId="bulk-remove"
              >
                <Icon name="trash" size="sm" />
                Remove
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCards(new Set())}
                testId="clear-selection"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Collection Statistics */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CollectionStats
              totalCards={stats.totalCards}
              uniqueCards={stats.uniqueCards}
              cardsByRarity={stats.cardsByRarity}
              completionPercentage={stats.completionPercentage}
              totalValue={stats.totalValue}
              testId="collection-stats"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Filters */}
      <CollectionFilters
        search={filters.search}
        rarity={filters.rarity}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onRarityChange={handleRarityChange}
        onSortChange={handleSortChange}
        onViewModeChange={handleViewModeChange}
        onClearFilters={handleClearFilters}
        testId="collection-filters"
      />
      
      {/* Cards Display */}
      <div className="collection-page__content">
        {displayData.length === 0 ? (
          <div className="collection-page__no-results">
            <div className="collection-page__no-results-icon">
              <Icon name="search" size="2xl" color="muted" />
            </div>
            <Text variant="h4" align="center" color="muted">
              No cards found
            </Text>
            <Text variant="body" align="center" color="muted">
              Try adjusting your filters or search terms.
            </Text>
            <Button 
              variant="ghost" 
              onClick={handleClearFilters}
              testId="clear-filters-no-results"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div 
            className={`collection-page__cards collection-page__cards--${showStacks ? 'stack' : viewMode}`}
            layout
          >
            <AnimatePresence mode="popLayout">
              {displayData.map((item, index) => (
                <motion.div
                  key={showStacks ? `${item.cardData.name}-${item.cardData.rarity}` : `${item.cardData.id}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.02
                  }}
                  className="collection-page__card-wrapper"
                >
                  <CollectionCard
                    card={item.cardData}
                    viewMode={showStacks ? 'stack' : viewMode}
                    onSelect={handleCardSelect}
                    onAddToDeck={handleAddToDeck}
                    onRemove={handleRemoveCard}
                    className={selectedCard?.id === item.cardData.id ? 'collection-card--selected' : ''}
                    testId={`collection-card-${index}`}
                  />
                  {showStacks && item.count > 1 && (
                    <div className="collection-page__stack-badge">
                      <Text variant="caption" weight="bold" color="primary">
                        x{item.count}
                      </Text>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {/* Selected Card Detail Panel */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="collection-page__detail-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="collection-page__detail-header">
              <Text variant="h5" weight="semibold">
                Card Details
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCard(null)}
                testId="close-detail"
              >
                <Icon name="x" size="sm" />
              </Button>
            </div>
            
            <div className="collection-page__detail-content">
              <CollectionCard
                card={selectedCard}
                viewMode="grid"
                size="lg"
                showActions={false}
                testId="detail-card"
              />
              
              <div className="collection-page__detail-info">
                <div className="collection-page__detail-section">
                  <Text variant="caption" weight="medium" color="muted">
                    GOLD VALUE
                  </Text>
                  <Text variant="h4" weight="bold">
                    {selectedCard.goldReward}
                  </Text>
                </div>
                
                <div className="collection-page__detail-section">
                  <Text variant="caption" weight="medium" color="muted">
                    LUCK STAT
                  </Text>
                  <Text variant="h4" weight="bold">
                    {selectedCard.luck}
                  </Text>
                </div>
                
                <div className="collection-page__detail-actions">
                  <Button
                    variant="primary"
                    onClick={() => handleAddToDeck(selectedCard)}
                    disabled={currentDeck.some((card: any) => card.id === selectedCard.id)}
                    testId="detail-add-deck"
                  >
                    <Icon name="plus" size="sm" />
                    {currentDeck.some((card: any) => card.id === selectedCard.id) 
                      ? 'Already in Deck' 
                      : 'Add to Deck'
                    }
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRemoveCard(selectedCard);
                      setSelectedCard(null);
                    }}
                    testId="detail-remove"
                  >
                    <Icon name="trash" size="sm" />
                    Remove from Collection
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
