import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as ReactWindow from 'react-window';
import { Card, CardUtils } from '../../../models/Card';
import { TCGCard } from '../TCGCard';
import { SearchBox } from '../../molecules/SearchBox/SearchBox';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import './CardGrid.css';

interface CardGridProps {
  cards: Card[];
  loading?: boolean;
  onCardClick?: (card: Card) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  searchable?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
  testId?: string;
  variant?: 'collection' | 'battle' | 'detail';
  cardSize?: 'small' | 'medium' | 'large';
  // Virtualization options
  enableVirtualization?: boolean;
  virtualHeight?: number;
  virtualWidth?: number;
  itemsPerRow?: number;
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
  enableVirtualization = cards.length > 100, // Auto-enable for large collections
  virtualHeight = 600,
  virtualWidth = 800,
  itemsPerRow = 4,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'recent'>('recent');
  const [containerDimensions, setContainerDimensions] = useState({ width: virtualWidth, height: virtualHeight });
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<ReactWindow.FixedSizeGrid>(null);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = cards;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        CardUtils.getRarityName(card.rarity).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity': {
          // Higher rarity (lower probability) should come first
          return b.rarity - a.rarity;
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

  // Calculate grid dimensions for virtualization
  const gridConfig = useMemo(() => {
    const cardWidth = cardSize === 'small' ? 120 : cardSize === 'large' ? 220 : 180;
    const cardHeight = cardSize === 'small' ? 168 : cardSize === 'large' ? 308 : 252;
    const gap = 16;
    
    const actualItemsPerRow = Math.max(1, Math.floor((containerDimensions.width - gap) / (cardWidth + gap)));
    const rowCount = Math.ceil(filteredCards.length / actualItemsPerRow);
    
    return {
      columnCount: actualItemsPerRow,
      rowCount,
      columnWidth: cardWidth + gap,
      rowHeight: cardHeight + gap,
      cardWidth,
      cardHeight
    };
  }, [containerDimensions, filteredCards.length, cardSize]);

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width || virtualWidth,
          height: virtualHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [virtualWidth, virtualHeight]);

  const handleCardClick = (card: Card) => {
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

  // Virtualized grid item renderer
  const renderGridItem = useCallback(({ columnIndex, rowIndex, style }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const cardIndex = rowIndex * gridConfig.columnCount + columnIndex;
    const card = filteredCards[cardIndex];
    
    if (!card) {
      return <div style={style} />;
    }

    return (
      <div style={{
        ...style,
        padding: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <TCGCard
          card={card}
          variant={variant}
          size={cardSize}
          animated={!enableVirtualization} // Disable animations in virtualized mode for performance
          onClick={() => handleCardClick(card)}
          showStats={true}
          showEmojis={true}
        />
      </div>
    );
  }, [filteredCards, gridConfig.columnCount, variant, cardSize, enableVirtualization, handleCardClick]);

  // Non-virtualized grid renderer (for small collections)
  const renderStaticGrid = () => (
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
            card={card}
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
  );

  // Virtualized grid renderer (for large collections)
  const renderVirtualizedGrid = () => (
    <div className="card-grid__virtualized" ref={containerRef}>
      <ReactWindow.FixedSizeGrid
        ref={gridRef}
        columnCount={gridConfig.columnCount}
        columnWidth={gridConfig.columnWidth}
        height={Math.min(virtualHeight, gridConfig.rowCount * gridConfig.rowHeight)}
        rowCount={gridConfig.rowCount}
        rowHeight={gridConfig.rowHeight}
        width={containerDimensions.width}
        overscanRowCount={2}
        overscanColumnCount={1}
      >
        {renderGridItem}
      </ReactWindow.FixedSizeGrid>
    </div>
  );

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
            enableVirtualization ? renderVirtualizedGrid() : renderStaticGrid()
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

export default CardGrid;
