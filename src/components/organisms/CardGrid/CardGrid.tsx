import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../../types';
import { Card } from '../../molecules/Card/Card';
import { SearchBox } from '../../molecules/SearchBox/SearchBox';
import { Text, Button, Icon } from '../../atoms';
import './CardGrid.css';

interface CardGridProps {
  cards: CardType[];
  loading?: boolean;
  onCardClick?: (card: CardType) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  searchable?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
  testId?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  loading = false,
  onCardClick,
  onLoadMore,
  hasMore = false,
  searchable = true,
  title = 'Card Collection',
  emptyMessage = 'No cards found',
  className = '',
  testId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'recent'>('recent');

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = cards;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.rarity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity': {
          const rarityOrder = { cosmic: 6, mythic: 5, legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 };
          return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
        }
        case 'recent':
        default:
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
      }
    });

    return filtered;
  }, [cards, searchQuery, sortBy]);

  const handleCardClick = (card: CardType) => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`card-grid ${className}`.trim()} data-testid={testId}>
      {/* Header */}
      <div className="card-grid__header">
        <div className="card-grid__title">
          <Text variant="h3" weight="bold">{title}</Text>
          <Text variant="subtitle" color="muted">
            {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
            {searchQuery && ` found for "${searchQuery}"`}
          </Text>
        </div>

        {/* Controls */}
        <div className="card-grid__controls">
          {searchable && (
            <SearchBox
              placeholder="Search cards..."
              value={searchQuery}
              onSearch={handleSearchChange}
              className="card-grid__search"
            />
          )}

          <div className="card-grid__sort">
            <Text variant="caption" color="muted">Sort by:</Text>
            <div className="card-grid__sort-buttons">
              <Button
                variant={sortBy === 'recent' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                Recent
              </Button>
              <Button
                variant={sortBy === 'name' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                Name
              </Button>
              <Button
                variant={sortBy === 'rarity' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('rarity')}
              >
                Rarity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && cards.length === 0 ? (
        <div className="card-grid__loading">
          <div className="card-grid__skeleton">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-grid__skeleton-card" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Cards */}
          {filteredCards.length > 0 ? (
            <motion.div
              className="card-grid__container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCards.map((card) => (
                <motion.div
                  key={card.id}
                  variants={cardVariants}
                  layout
                >
                  <Card
                    card={card}
                    size="md"
                    interactive
                    onClick={handleCardClick}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty state */
            <div className="card-grid__empty">
              <Icon name="cards" size="2xl" color="muted" />
              <Text variant="h5" color="muted" align="center">
                {emptyMessage}
              </Text>
              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery('')}
                >
                  <Icon name="close" size="sm" />
                  Clear search
                </Button>
              )}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="card-grid__load-more">
              <Button
                variant="secondary"
                size="lg"
                onClick={onLoadMore}
                loading={loading}
              >
                <Icon name="add" size="sm" />
                Load More Cards
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
