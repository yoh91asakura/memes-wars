import React from 'react';
import { CardRarity } from '../../../models/unified/Card';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import './CollectionFilters.css';

interface CollectionFiltersProps {
  search: string;
  rarity: CardRarity | 'all';
  sortBy: 'name' | 'rarity' | 'power' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  onSearchChange: (search: string) => void;
  onRarityChange: (rarity: CardRarity | 'all') => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onClearFilters: () => void;
  className?: string;
  testId?: string;
}

const rarityOptions = [
  { value: 'all', label: 'All Rarities', color: '#ffffff' },
  { value: 'COMMON', label: 'Common', color: '#95a5a6' },
  { value: 'UNCOMMON', label: 'Uncommon', color: '#27ae60' },
  { value: 'RARE', label: 'Rare', color: '#3498db' },
  { value: 'EPIC', label: 'Epic', color: '#9b59b6' },
  { value: 'LEGENDARY', label: 'Legendary', color: '#f39c12' },
  { value: 'MYTHIC', label: 'Mythic', color: '#e67e22' },
  { value: 'COSMIC', label: 'Cosmic', color: '#e74c3c' },
  { value: 'DIVINE', label: 'Divine', color: '#9b59b6' },
  { value: 'INFINITY', label: 'Infinity', color: '#2c3e50' }
];

const sortOptions = [
  { value: 'dateAdded', label: 'Date Added', icon: 'calendar' },
  { value: 'name', label: 'Name', icon: 'type' },
  { value: 'rarity', label: 'Rarity', icon: 'star' },
  { value: 'power', label: 'Power', icon: 'zap' }
];

export const CollectionFilters: React.FC<CollectionFiltersProps> = ({
  search,
  rarity,
  sortBy,
  sortOrder,
  viewMode,
  onSearchChange,
  onRarityChange,
  onSortChange,
  onViewModeChange,
  onClearFilters,
  className = '',
  testId
}) => {
  const hasActiveFilters = search !== '' || rarity !== 'all';

  return (
    <div className={`collection-filters ${className}`} data-testid={testId}>
      {/* Search and View Controls */}
      <div className="collection-filters__main">
        <div className="collection-filters__search">
          <Input
            type="search"
            placeholder="Search cards..."
            value={search}
            onChange={onSearchChange}
            className="collection-filters__search-input"
            testId="collection-search"
          />
          <Icon name="search" className="collection-filters__search-icon" />
        </div>
        
        <div className="collection-filters__view-controls">
          <div className="collection-filters__view-mode">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              testId="view-grid"
            >
              <Icon name="grid" size="sm" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              testId="view-list"
            >
              <Icon name="list" size="sm" />
            </Button>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              testId="clear-filters"
            >
              <Icon name="x" size="sm" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {/* Rarity Filter */}
      <div className="collection-filters__section">
        <Text variant="caption" weight="medium" className="collection-filters__label">
          Filter by Rarity
        </Text>
        <div className="collection-filters__rarity-grid">
          {rarityOptions.map((option) => (
            <Button
              key={option.value}
              variant={rarity === option.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onRarityChange(option.value as CardRarity | 'all')}
              className="collection-filters__rarity-button"
              style={{
                '--rarity-color': option.color
              } as React.CSSProperties}
              testId={`rarity-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Sort Controls */}
      <div className="collection-filters__section">
        <Text variant="caption" weight="medium" className="collection-filters__label">
          Sort by
        </Text>
        <div className="collection-filters__sort-controls">
          <div className="collection-filters__sort-options">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onSortChange(option.value, sortOrder)}
                testId={`sort-${option.value}`}
              >
                <Icon name={option.icon as any} size="sm" />
                {option.label}
              </Button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            testId="sort-order"
          >
            <Icon 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size="sm" 
            />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </div>
    </div>
  );
};
