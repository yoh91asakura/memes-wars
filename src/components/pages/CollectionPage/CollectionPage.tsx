import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardsStore } from '../../../stores';
import { useGameStore } from '../../../stores/gameStore';
import { CollectionFilters } from '../../organisms/CollectionFilters';
import { CollectionStats } from '../../organisms/CollectionStats';
import { MiniCollectionCard } from '../../molecules/MiniCollectionCard';
import { CardHoverPreview } from '../../molecules/CardHoverPreview';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Card } from '../../../models/Card';
import { CollectionCard } from '../../../types/CollectionCard';
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
    getCollectionCards,
    getCollectionStats,
    removeCard
  } = useCardsStore();
  
  // Game store for deck management  
  const { activeDeck, addCardToDeck } = useGameStore();
  const currentDeck = activeDeck?.cards || [];
  
  // Local state
  const [showStats, setShowStats] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<CollectionCard | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Computed values
  const collectionCards = useMemo(() => getCollectionCards(), [collection, filters]);
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
  
  const handleCardHover = useCallback((card: CollectionCard | null, event?: React.MouseEvent) => {
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
  
  const handleCardClick = useCallback((card: CollectionCard) => {
    // Only allow interaction with owned cards
    if (!card.isOwned) return;
    
    setSelectedCard(card);
  }, [setSelectedCard]);
  
  const handleAddToDeck = (card: CollectionCard) => {
    // Only allow adding owned cards to deck
    if (!card.isOwned) return false;
    
    const deckId = activeDeck?.id;
    if (!deckId) return false;
    const success = addCardToDeck(deckId, card);
    return success;
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
  
  // Show loading or empty state based on whether we have any cards to show
  if (collectionCards.length === 0) {
    return (
      <div className={`collection-page collection-page--empty ${className}`} data-testid={testId}>
        <div className="collection-page__empty-state">
          <div className="collection-page__empty-icon">
            <Icon emoji="📦" size="2xl" />
          </div>
          <Text variant="h3" align="center" className="collection-page__empty-title">
            Card Collection
          </Text>
          <Text variant="body" color="muted" align="center" className="collection-page__empty-description">
            Loading cards...
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
            {collectionCards.filter(card => card.isOwned).length} owned of {collectionCards.length} cards
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
        {collectionCards.length === 0 ? (
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
            className="collection-page__cards collection-page__cards--grid"
            layout
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="popLayout">
              {collectionCards.map((card, index) => (
                <motion.div
                  key={`${card.name}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.2,
                    delay: index * 0.01
                  }}
                  onMouseEnter={(e) => handleCardHover(card, e)}
                  onMouseLeave={() => handleCardHover(null)}
                >
                  <MiniCollectionCard
                    card={card}
                    size="sm"
                    onClick={handleCardClick}
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
