import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardsStore } from '../../../stores';
import { useGameStore } from '../../../stores/gameStore';
import { CollectionFilters } from '../../organisms/CollectionFilters';
import { CollectionStats } from '../../organisms/CollectionStats';
import { CollectionCard } from '../../molecules/CollectionCard';
import { CardHoverPreview } from '../../molecules/CardHoverPreview';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Card } from '../../../models/Card';
import { StackedCard } from '../../../types/StackedCard';
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
    selectedCard,
    setFilters,
    setViewMode,
    setSelectedCard,
    getFilteredCards,
    getCollectionStats,
    removeCard
  } = useCardsStore();
  
  // Game store for deck management  
  const { activeDeck, addCardToDeck } = useGameStore();
  const currentDeck = activeDeck?.cards || [];
  
  // Local state
  const [showStats, setShowStats] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Computed values
  const filteredCards = useMemo(() => getFilteredCards(), [collection, filters]);
  const stats = useMemo(() => getCollectionStats(), [collection]);
  
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
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };
  
  const handleClearFilters = () => {
    setFilters({
      search: '',
      rarity: 'all',
      sortBy: 'dateAdded',
      sortOrder: 'desc'
    });
  };
  
  const handleCardHover = useCallback((card: StackedCard | null, event?: React.MouseEvent) => {
    setHoveredCard(card);
    if (event) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  }, []);
  
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (hoveredCard) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  }, [hoveredCard]);
  
  const handleAddToDeck = (card: StackedCard) => {
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
  };
  
  const handleRemoveCard = (card: StackedCard) => {
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
      <div className={`collection-page collection-page--empty ${className}`} data-testid={testId}>
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
    <div className={`collection-page ${className}`} data-testid={testId}>
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
        {filteredCards.length === 0 ? (
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
            className={`collection-page__cards collection-page__cards--${viewMode}`}
            layout
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="popLayout">
              {filteredCards.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.02
                  }}
                  onMouseEnter={(e) => handleCardHover(card, e)}
                  onMouseLeave={() => handleCardHover(null)}
                >
                  <CollectionCard
                    card={card}
                    stackCount={card.stackCount}
                    viewMode={viewMode}
                    size="sm"
                    onAddToDeck={handleAddToDeck}
                    onRemove={handleRemoveCard}
                    testId={`collection-card-${index}`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {/* Card Hover Preview */}
      <CardHoverPreview
        card={hoveredCard}
        mousePosition={mousePosition}
        isVisible={!!hoveredCard}
      />
    </div>
  );
};
