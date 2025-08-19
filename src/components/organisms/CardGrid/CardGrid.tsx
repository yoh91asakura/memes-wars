import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../../types';
import { UnifiedCard } from '../../../models/unified/Card';
import { TCGCard } from '../TCGCard';
import { SearchBox } from '../../molecules/SearchBox/SearchBox';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import './CardGrid.css';

interface CardGridProps {
  cards: (CardType | UnifiedCard)[];
  loading?: boolean;
  onCardClick?: (card: CardType | UnifiedCard) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  searchable?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
  testId?: string;
  variant?: 'collection' | 'battle' | 'detail';
  cardSize?: 'small' | 'medium' | 'large';
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
  variant = 'collection',
  cardSize = 'medium',
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
        default: {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
      }
    });

    return filtered;
  }, [cards, searchQuery, sortBy]);

  // Convert legacy card to UnifiedCard if needed
  const normalizeCard = (card: CardType | UnifiedCard): UnifiedCard => {
    if ('rarity' in card && typeof card.rarity === 'string') {
      return card as UnifiedCard;
    }
    
    const legacyCard = card as CardType;
    return {
      id: legacyCard.id,
      name: legacyCard.name,
      description: legacyCard.description,
      emoji: legacyCard.emoji,
      rarity: (legacyCard.rarity?.toUpperCase() || 'COMMON') as any,
      rarityProbability: 10,
      luck: 0,
      family: 'CLASSIC_INTERNET' as any,
      reference: legacyCard.flavor || 'Legacy card',
      goldReward: 10,
      type: 'CREATURE' as any,
      cost: legacyCard.cost || 1,
      attack: legacyCard.stats?.attack || 0,
      defense: legacyCard.stats?.defense || 0,
      health: legacyCard.stats?.health || 0,
      attackSpeed: 1.0,
      emojis: [],
      cardEffects: [],
      synergies: [],
      goldGeneration: 1,
      dustValue: 5,
      tradeable: true,
      level: 1,
      experience: 0,
      stackCount: 1,
      maxStacks: 1,
      stackBonus: {
        luckMultiplier: 0,
        goldMultiplier: 0,
        bonusEmojis: [],
        effectBonus: 0,
        damageBonus: 0
      },
      visual: {
        glow: '#ffffff',
        borderColor: '#e9ecef',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      },
      craftable: false,
      isActive: true,
      isLimited: false,
      effects: [],
      tags: legacyCard.tags || [],
      flavor: legacyCard.flavor,
      releaseDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as UnifiedCard;
  };

  const handleCardClick = (card: UnifiedCard) => {
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
                  <TCGCard
                    card={normalizeCard(card)}
                    variant={variant}
                    size={cardSize}
                    animated
                    onClick={handleCardClick}
                    showStats={true}
                    showEmojis={true}
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
